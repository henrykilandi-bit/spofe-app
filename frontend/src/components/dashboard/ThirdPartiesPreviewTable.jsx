import { Card, CardContent } from "@/components/ui/card";

export default function ThirdPartiesPreviewTable({ rows }) {
  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-3 text-gray-900">Top tiers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="pb-2">Tiers</th>
                <th className="pb-2 text-right">Solde</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-4 text-center text-muted-foreground">
                    Aucun tiers disponible
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={`${row.name}-${index}`} className="border-t">
                    <td className="py-2 pr-4">{row.name}</td>
                    <td className="py-2 text-right font-medium">
                      {row.balance.toLocaleString("fr-FR")} XOF
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
