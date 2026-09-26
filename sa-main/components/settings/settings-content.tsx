"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
        <h3 className="font-semibold text-lg mb-6">معلومات المتجر</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/profile.jpg" alt="التاجر" />
              <AvatarFallback>تج</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline">تغيير الصورة</Button>
              <p className="text-xs text-muted-foreground mt-2">JPG أو PNG أو GIF. الحجم الأقصى ٢ ميغابايت</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم التاجر</Label>
              <Input id="name" placeholder="اسم التاجر" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store">اسم المتجر</Label>
              <Input id="store" placeholder="اسم المتجر" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" type="tel" dir="ltr" className="text-right" placeholder="٠٧٧٠ ١٢٣ ٤٥٦٧" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">المدينة</Label>
              <Input id="city" placeholder="بغداد" />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            تحديث هذي البيانات (الاسم، المتجر، الهاتف، المدينة) غير مفعّل بعد — ميزة قادمة.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6">الإشعارات</h3>
        <div className="space-y-4">
          {notificationItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
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
