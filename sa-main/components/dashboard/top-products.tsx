"use client"

import { Card } from "@/components/ui/card"

export function TopProducts() {
  return (
    <Card className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-foreground">المنتجات الأكثر مبيعاً</h2>
        <span className="text-xs text-muted-foreground">هذا الشهر</span>
      </div>
      <div className="py-8 text-center text-sm text-muted-foreground">لا توجد بيانات مبيعات حقيقية بعد.</div>
    </Card>
  )
}
