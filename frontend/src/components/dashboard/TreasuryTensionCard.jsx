import { Card, CardContent } from "@/components/ui/card";

const LEVEL_COLOR = {
  low: "success",
  moderate: "warning",
  high: "danger",
};

export default function TreasuryTensionCard({ level, explanation }) {
  const color = LEVEL_COLOR[level];

  return (
    <Card className={`border-l-4 border-spofe-${color} rounded-xl bg-white shadow-sm transition hover:shadow-md`}>
      <CardContent className="p-4 space-y-2">
        <p className="text-sm font-medium text-gray-900">Tension de trésorerie</p>
        <p className="font-semibold capitalize text-gray-900">{level}</p>
        <p className="text-xs text-muted-foreground">{explanation}</p>
      </CardContent>
    </Card>
  );
}
