import { Card, CardContent } from "@/components/ui/card";

export default function KpiCard({ title, value, subtitle, color }) {
  return (
    <Card className={`border-l-4 border-spofe-${color} rounded-xl bg-white shadow-sm transition hover:shadow-md`}>
      <CardContent className="p-4 space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
