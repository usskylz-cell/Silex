import { NextResponse } from "next/server"

const defaultModel = "gemini-2.0-flash"

export async function POST(request: Request) {
  let body: { name?: string; category?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "بيانات الطلب غير صالحة" }, { status: 400 })
  }

  const name = body.name?.trim()
  const category = body.category?.trim()

  if (!name || name.length > 200) {
    return NextResponse.json({ error: "اسم المنتج مطلوب" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "لم يتم إعداد مفتاح الذكاء الاصطناعي على الخادم" }, { status: 503 })
  }

  const prompt = [
    "اكتب وصفًا تسويقيًا قصيرًا لمنتج يُباع في متجر عراقي على منصة تسوق.",
    `اسم المنتج: ${name}`,
    category ? `الصنف: ${category}` : "",
    "",
    "الشروط:",
    "- لا تخترع مواصفات أو أرقامًا أو ادعاءات غير مؤكدة (لا تذكر مكونات، مقاسات، أو أسعارًا لم تُذكر لك).",
    "- اكتب بالعربية الفصحى البسيطة المفهومة، بدون أي أخطاء إملائية أو نحوية.",
    "- الطول: جملتان إلى ثلاث جمل، لا أكثر.",
    "- أسلوب جذاب وودود يناسب متجرًا صغيرًا، بدون مبالغة أو وعود غير واقعية.",
    "- لا تضف عنوانًا ولا علامات اقتباس، اكتب النص مباشرة.",
  ]
    .filter(Boolean)
    .join("\n")

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${defaultModel}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 200 },
        }),
      },
    )

    const result = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
      error?: { message?: string }
    }

    if (!response.ok) {
      console.error("Gemini API error:", result.error?.message ?? response.statusText)
      return NextResponse.json({ error: "تعذر توليد الوصف حاليًا" }, { status: 502 })
    }

    const description = result.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim()
    if (!description) {
      return NextResponse.json({ error: "لم ينتج وصفًا صالحًا" }, { status: 502 })
    }

    return NextResponse.json({ description })
  } catch (error) {
    console.error("Gemini request failed:", error)
    return NextResponse.json({ error: "تعذر الاتصال بخدمة الذكاء الاصطناعي" }, { status: 502 })
  }
}
