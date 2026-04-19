/**
 * 📄 DocumentsCatalog - Catalogue des Types de Documents
 * 
 * Aucune dépendance entre documents.
 */

export type DocumentCategory = 'COMMERCIAL' | 'LOGISTIC' | 'FINANCIAL' | 'ADMIN';

export interface DocumentType {
  /** Code du type de document */
  documentTypeCode: string;
  
  /** Libellé */
  label: string;
  
  /** Catégorie */
  category: DocumentCategory;
  
  /** Modules autorisés à consommer ce type */
  allowedModules: string[];
  
  /** État générique initial */
  initialState: string;
  
  /** Statut d'activation */
  active: boolean;
}

export interface DocumentsCatalog {
  /** Types de documents définis */
  documentTypes: DocumentType[];
}
