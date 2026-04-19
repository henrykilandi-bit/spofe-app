/**
 * 🏷️ Shared Identifiers - Identifiants du Module Paramètres
 */

export class FrameId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('FrameId ne peut pas être vide');
    }
  }
  
  getValue(): string {
    return this.value;
  }
  
  equals(other: FrameId): boolean {
    return this.value === other.getValue();
  }
  
  toString(): string {
    return this.value;
  }
}

export class DocumentTypeCode {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('DocumentTypeCode ne peut pas être vide');
    }
  }
  
  getValue(): string {
    return this.value;
  }
  
  equals(other: DocumentTypeCode): boolean {
    return this.value === other.getValue();
  }
  
  toString(): string {
    return this.value;
  }
}

export class RoleCode {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('RoleCode ne peut pas être vide');
    }
  }
  
  getValue(): string {
    return this.value;
  }
  
  equals(other: RoleCode): boolean {
    return this.value === other.getValue();
  }
  
  toString(): string {
    return this.value;
  }
}
