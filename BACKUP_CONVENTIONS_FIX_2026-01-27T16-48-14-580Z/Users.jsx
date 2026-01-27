import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

export default function Users() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">👥 Utilisateurs</h1>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">Module Gestion des Utilisateurs - En développement</p>
        </CardContent>
      </Card>
    </div>
  )
}
