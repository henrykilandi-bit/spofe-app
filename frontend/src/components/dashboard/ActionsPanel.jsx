import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ActionsPanel({ role }) {
  const isCoach = role === "COACH" || role === "ADMIN";

  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardContent className="p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Actions rapides</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            Nouvelle opération
          </Button>
          <Button variant="outline" size="sm">
            Voir les rapports
          </Button>
          {isCoach && (
            <Button variant="outline" size="sm">
              Validation comptable
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
