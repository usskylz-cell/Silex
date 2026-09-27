import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function isWithinBotHours(start: string, end: string): boolean {
  const now = new Date()
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em
  if (startMin <= endMin) return nowMin >= startMin && nowMin <= endMin
  return nowMin >= startMin || nowMin <= endMin // يغطي حالة عبور منتصف الليل
}

export async function POST(req: NextRequest) {
  try {
    const { conversationId, customerMessage } = await req.json()
    if (!conversationId || !customerMessage) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 })
    }

    const { data: conv } = await supabaseAdmin
      .from("conversations")
      .select("merchant_id, ai_muted")
      .eq("id", conversationId)
      .maybeSingle()

    if (!conv) return NextResponse.json({ error: "المحادثة غير موجودة" }, { status: 404 })
    if (conv.ai_muted) return NextResponse.json({ skipped: "ai_muted" })

    const { data: merchant } = await supabaseAdmin
      .from("profiles")
      .select("store_name, assistant_enabled, assistant_instructions, bot_hours_enabled, bot_hours_start, bot_hours_end")
      .eq("id", conv.merchant_id)
      .maybeSingle()

    if (!merchant || !merchant.assistant_enabled) {
      return NextResponse.json({ skipped: "assistant_disabled" })
    }

    if (merchant.bot_hours_enabled && !isWithinBotHours(merchant.bot_hours_start, merchant.bot_hours_end)) {
      return NextResponse.json({ skipped: "outside_hours" })
    }

    const { data: products } = await supabaseAdmin
      .from("products")
      .select("title, price, stock, category")
      .eq("merchant_id", conv.merchant_id)
      .gt("stock", 0)
      .limit(50)

    const systemPrompt = `أنت موظف مبيعات حقيقي تعمل لدى متجر "${merchant.store_name || "المتجر"}"، ولست نموذج ذكاء اصطناعي عام.

${merchant.assistant_instructions ? `# قواعد إلزامية من صاحب المتجر (يجب اتباعها حرفيًا مهما كان السؤال):
${merchant.assistant_instructions}
` : "تحدث بأسلوب ودود ومحترف."}

قائمة المنتجات المتوفرة حالياً (اعتمد عليها حصراً، لا تخترع منتجات أو أسعار غير موجودة هنا):
${JSON.stringify(products ?? [])}

قواعد صارمة إضافية:
- أجب فقط بناءً على البيانات أعلاه.
- لو سُئلت عن منتج غير موجود بالقائمة، اعتذر بلباقة وقل إنه غير متوفر حالياً.
- لو الزبون طلب التحدث مع شخص حقيقي، أو كان الطلب معقداً جداً، أو غاضباً، قل بالضبط: "سأحول محادثتك الآن لأحد ممثلي المتجر."
- لا تكتب أكواد برمجية ولا تخرج عن نطاق خدمة هذا المتجر.
- اجعل ردودك مختصرة ومباشرة.`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: customerMessage }] }],
        }),
      }
    )

    const geminiData = await geminiRes.json()
    const replyText: string | undefined = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!replyText) {
      console.error("Gemini response error:", JSON.stringify(geminiData))
      return NextResponse.json({ error: "تعذر توليد رد" }, { status: 500 })
    }

    const handover = replyText.includes("سأحول محادثتك الآن لأحد ممثلي المتجر")

    await supabaseAdmin.from("messages").insert({
      conversation_id: conversationId,
      sender_id: conv.merchant_id,
      content: replyText,
      meta: { from_bot: true },
    })

    if (handover) {
      await supabaseAdmin.from("conversations").update({ ai_muted: true }).eq("id", conversationId)
    }

    return NextResponse.json({ ok: true, handover })
  } catch (err) {
    console.error("assistant-reply error:", err)
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 })
  }
}
