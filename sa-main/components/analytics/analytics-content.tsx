"use client"

import { Header } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"

const monthlySales = [
  { month: "كانون٢", value: 4200 },
  { month: "شباط", value: 3800 },
  { month: "آذار", value: 5100 },
  { month: "نيسان", value: 4700 },
  { month: "أيار", value: 6200 },
  { month: "حزيران", value: 5800 },
]

const topProducts = [
  { name: "رز عنبر", sales: 320 },
  { name: "زيت", sales: 280 },
  { name: "سكر", sales: 240 },
  { name: "شاي", sales: 190 },
  { name: "حليب", sales: 150 },
]

const categoryShare = [
  { name: "مواد غذائية", value: 55, color: "#0f172a" },
  { name: "مشروبات", value: 22, color: "#1e293b" },
  { name: "ألبان", value: 14, color: "#047857" },
  { name: "أخرى", value: 9, color: "#6ee7b7" },
]

const kpis = [
  { title: "إجمالي المبيعات", value: "٢٩٬٨٠٠ د.ع", change: "+١٢٪", up: true },
  { title: "متوسط قيمة الطلب", value: "٨٬٤٠٠ د.ع", change: "+٥٪", up: true },
  { title: "عدد الطلبات", value: "٤٨٦", change: "+٨٪", up: true },
  { title: "معدل المرتجعات", value: "٢٫١٪", change: "-٠٫٤٪", up: false },
]

function ChartTooltip({ active, payload, suffix }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-foreground text-background px-3 py-2 rounded-lg text-xs font-semibold shadow-lg">
        <p className="font-bold">
          {payload[0].value} {suffix}
        </p>
        <p className="text-[10px] opacity-80">{payload[0].payload.month || payload[0].payload.name}</p>
      </div>
    )
  }
  return null
}

export function AnalyticsContent() {
  return (
    <>
      <Header
        title="محلل بيانات المنتجات"
        description="تحليل رسومي لأداء المبيعات والمنتجات والأصناف الأكثر رواجاً. (بيانات تجريبية حالياً)"
      />

      <div className="mt-4 md:mt-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className="p-4 transition-all duration-300 hover:shadow-lg">
              <p className="text-xs text-muted-foreground mb-1">{kpi.title}</p>
              <p className="text-xl font-bold text-foreground mb-1">{kpi.value}</p>
              <div className={`flex items-center gap-1 text-xs ${kpi.up ? "text-primary" : "text-destructive"}`}>
                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{kpi.change}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-4 md:p-6 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">تطور المبيعات الشهرية</h2>
              <Badge variant="secondary" className="font-normal">
                بالدينار العراقي
              </Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySales} margin={{ top: 10, right: -20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/20" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "currentColor", fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "currentColor", fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip content={<ChartTooltip suffix="د.ع" />} cursor={{ stroke: "transparent" }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0f172a"
                    strokeWidth={3}
                    dot={{ fill: "#0f172a", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4 md:p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-lg font-semibold text-foreground mb-4">حصص الأصناف</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryShare}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {categoryShare.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip suffix="٪" />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-3">
              {categoryShare.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-muted-foreground">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{cat.value}٪</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-4 md:p-6 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-lg font-semibold text-foreground mb-4">المنتجات الأكثر مبيعاً</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/20" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", fontSize: 11 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", fontSize: 11 }}
                  className="text-muted-foreground"
                  width={70}
                />
                <Tooltip content={<ChartTooltip suffix="قطعة" />} cursor={{ fill: "transparent" }} />
                <Bar dataKey="sales" fill="#0f172a" radius={[8, 0, 0, 8]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  )
}
