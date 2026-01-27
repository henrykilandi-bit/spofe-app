// Traductions des types de comptes OHADA
export const typeLabels = {
  EQUITY: 'Ressources',
  ASSET: 'Actif',
  LIABILITY: 'Dette',
  EXPENSE: 'Charge',
  INCOME: 'Produit'
}

export const translateAccountType = (type) => {
  return typeLabels[type] || type
}

// Traductions des statuts
export const statusLabels = {
  VALIDATED: 'Validée',
  DRAFT: 'Brouillon',
  CANCELLED: 'Annulée',
  PENDING: 'En attente'
}

export const translateStatus = (status) => {
  return statusLabels[status] || status
}

// Traductions des types de journal
export const journalTypeLabels = {
  OD: 'Opérations Diverses',
  AC: 'Achats',
  VE: 'Ventes',
  BQ: 'Banque',
  CA: 'Caisse',
  TR: 'Trésorerie'
}

export const translateJournalType = (type) => {
  return journalTypeLabels[type] || type
}

// Couleurs de statut
export const statusColors = {
  VALIDATED: 'bg-green-100 text-green-800',
  DRAFT: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
  PENDING: 'bg-blue-100 text-blue-800'
}

// Couleurs de type
export const typeColors = {
  EQUITY: 'bg-purple-100 text-purple-800',
  ASSET: 'bg-blue-100 text-blue-800',
  LIABILITY: 'bg-orange-100 text-orange-800',
  EXPENSE: 'bg-red-100 text-red-800',
  INCOME: 'bg-green-100 text-green-800'
}
