"use client"

import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useStore } from "@/components/store/store-context"

export function SettingsContent() {
  const { settings, updateSetting } = useStore()

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

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6">الإشعارات</h3>
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
