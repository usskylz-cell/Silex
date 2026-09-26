"use client"

import { Card } from "@/components/ui/card"

export function ProjectAnalytics() {
  return (
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up bg-gradient-to-br from-background to-muted/20"
      style={{ animationDelay: "400ms" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">مبيعات الأسبوع</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>بالدينار العراقي</span>
        </div>
      </div>

      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        لا توجد بيانات مبيعات حقيقية لعرضها بعد.
      </div>
    </Card>
  )
}
