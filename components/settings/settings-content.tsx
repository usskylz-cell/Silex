"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useStore } from "@/components/store/store-context"
import { useProfile } from "@/lib/useProfile"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export function SettingsContent() {
  const { settings, updateSetting } = useStore()
  const { profile, setProfile } = useProfile()
  const [assistantEnabled, setAssistantEnabled] = useState(profile?.assistant_enabled ?? false)
  const [instructions, setInstructions] = useState(profile?.assistant_instructions ?? "")
  const [saving, setSaving] = useState(false)

  const notificationItems = [
    {
      key: "debt_notifications" as const,
      label: "إشعارات الديون المستحقة",
      description: "تنبيه عند اقتراب موعد استحقاق دين",
    },
    {
      key: "inventory_notifications" as const,
      label: "تنبيهات نفاد المخزون",
      description: "تنبيه عند قرب نفاد أحد المنتجات",
    },
    {
      key: "order_notifications" as const,
      label: "طلبات الزبائن الجديدة",
      description: "إشعار عند وصول طلب جديد",
    },
    {
      key: "weekly_reports" as const,
      label: "تقارير المبيعات الأسبوعية",
      description: "ملخص أسبوعي لأداء المتجر",
    },
  ]

  async function toggleAssistant(checked: boolean) {
    if (!profile) return
    setAssistantEnabled(checked)
    const { error } = await supabase.from("profiles").update({ assistant_enabled: checked }).eq("id", profile.id)
    if (error) {
      toast.error("تعذر تحديث حالة المساعد")
      setAssistantEnabled(!checked)
    } else {
      setProfile({ ...profile, assistant_enabled: checked } as any)
      toast.success(checked ? "تم تفعيل المساعد الذكي" : "تم إيقاف المساعد الذكي")
    }
  }

  async function saveInstructions() {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({ assistant_instructions: instructions.trim() || null })
      .eq("id", profile.id)
    setSaving(false)
    if (error) {
      toast.error("تعذر حفظ التعليمات")
    } else {
      setProfile({ ...profile, assistant_instructions: instructions.trim() } as any)
      toast.success("تم حفظ أسلوب المساعد")
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-ink">المساعد الذكي</h3>
            <p className="text-sm text-muted mt-1">
              يرد تلقائيًا على رسائل الزبائن باسمك، بناءً على منتجاتك الحقيقية وأسلوبك المحدد.
            </p>
          </div>
          <Switch checked={assistantEnabled} onCheckedChange={toggleAssistant} />
        </div>

        {assistantEnabled && (
          <div className="space-y-3 pt-4 border-t border-line">
            <div>
              <label className="text-sm font-medium text-ink">أسلوب الرد (اختياري)</label>
              <p className="text-xs text-muted mb-2">
                مثال: رد بأسلوب ودود ومختصر، واذكر إن التوصيل خلال يومين. اتركه فارغًا لأسلوب افتراضي مهني.
              </p>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="اكتب كيف تريد أن يرد المساعد على زبائنك..."
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </div>
            <Button onClick={saveInstructions} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? "جارٍ الحفظ..." : "حفظ الأسلوب"}
            </Button>
            <p className="text-xs text-muted">
              ملاحظة: إذا رددت أنت بنفسك يدويًا على أي زبون، يتوقف المساعد تلقائيًا في تلك المحادثة فقط، حتى تفعّله لها من جديد من داخل الشات.
            </p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6 text-ink">الإشعارات</h3>
        <div className="space-y-4">
          {notificationItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-3 border-b border-line last:border-0"
            >
              <div>
                <p className="font-medium text-ink">{item.label}</p>
                <p className="text-sm text-muted">{item.description}</p>
              </div>
              <Switch
                checked={settings[item.key]}
                onCheckedChange={(checked) => void updateSetting(item.key, checked)}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
