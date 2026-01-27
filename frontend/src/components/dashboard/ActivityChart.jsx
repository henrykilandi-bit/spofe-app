import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ActivityChart({ data }) {
  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-2 text-gray-900">
          Activité récente (30 jours)
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="operations"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Opérations saisies"
            />
            <Line
              type="monotone"
              dataKey="entries"
              stroke="#10b981"
              strokeWidth={2}
              name="Écritures validées"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
