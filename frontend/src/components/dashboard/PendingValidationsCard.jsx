import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PendingValidationsCard({ count }) {
  const color = count === 0 ? "success" : count < 5 ? "warning" : "danger";

  return (
    <Card className={`border-l-4 border-spofe-${color} rounded-xl bg-white shadow-sm transition hover:shadow-md`}>
      <CardContent className="p-4 space-y-2">
        <p className="text-sm font-medium text-gray-900">Écritures en attente</p>
        <p className="text-3xl font-bold text-gray-900">{count}</p>
        <p className="text-xs text-muted-foreground">
          Opérations nécessitant validation comptable
        </p>
        <Button variant="outline" size="sm">
          Voir la file de validation
        </Button>
      </CardContent>
    </Card>
  );
}
