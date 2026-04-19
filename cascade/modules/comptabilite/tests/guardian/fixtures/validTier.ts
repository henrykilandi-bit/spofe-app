/**
 * 🧰 ValidTierFixture - Tiers Valides pour Tests
 */

export interface TierFixture {
  tierId: string;
  name: string;
  type: 'CLIENT' | 'FOURNISSEUR' | 'SALARIE' | 'AUTRE';
  isActive: boolean;
  accountClass: string;
}

export class ValidTierFixture {
  
  /**
   * Crée un tiers client valide
   */
  static createClient(): TierFixture {
    return {
      tierId: 'TIER_CLI_001',
      name: 'CLIENT ALPHA',
      type: 'CLIENT',
      isActive: true,
      accountClass: '411' // Classe 4 - Clients
    };
  }
  
  /**
   * Crée un deuxième client valide
   */
  static createSecondClient(): TierFixture {
    return {
      tierId: 'TIER_CLI_002',
      name: 'CLIENT BETA',
      type: 'CLIENT',
      isActive: true,
      accountClass: '411'
    };
  }
  
  /**
   * Crée un tiers fournisseur valide
   */
  static createSupplier(): TierFixture {
    return {
      tierId: 'TIER_FOU_001',
      name: 'FOURNISSEUR GAMMA',
      type: 'FOURNISSEUR',
      isActive: true,
      accountClass: '401' // Classe 4 - Fournisseurs
    };
  }
  
  /**
   * Crée un deuxième fournisseur valide
   */
  static createSecondSupplier(): TierFixture {
    return {
      tierId: 'TIER_FOU_002',
      name: 'FOURNISSEUR DELTA',
      type: 'FOURNISSEUR',
      isActive: true,
      accountClass: '401'
    };
  }
  
  /**
   * Crée un tiers salarié valide
   */
  static createEmployee(): TierFixture {
    return {
      tierId: 'TIER_SAL_001',
      name: 'SALARIE EPSILON',
      type: 'SALARIE',
      isActive: true,
      accountClass: '421' // Classe 4 - Personnel
    };
  }
  
  /**
   * Crée un tiers inactif (pour tests négatifs)
   */
  static createInactiveTier(): TierFixture {
    return {
      tierId: 'TIER_INACTIF',
      name: 'TIERS INACTIF',
      type: 'CLIENT',
      isActive: false,
      accountClass: '411'
    };
  }
  
  /**
   * Crée tous les tiers valides pour les tests
   */
  static createAllValidTiers(): TierFixture[] {
    return [
      this.createClient(),
      this.createSecondClient(),
      this.createSupplier(),
      this.createSecondSupplier(),
      this.createEmployee()
    ];
  }
  
  /**
   * Retourne uniquement les IDs des tiers valides
   */
  static getValidTierIds(): string[] {
    return this.createAllValidTiers()
      .filter(tier => tier.isActive)
      .map(tier => tier.tierId);
  }
  
  /**
   * Retourne les IDs des tiers de classe 4 (clients, fournisseurs, salariés)
   */
  static getClass4TierIds(): string[] {
    return this.createAllValidTiers()
      .filter(tier => tier.isActive && tier.accountClass.startsWith('4'))
      .map(tier => tier.tierId);
  }
  
  /**
   * Vérifie si un tier ID est valide et actif
   */
  static isValidTier(tierId: string): boolean {
    return this.getValidTierIds().includes(tierId);
  }
  
  /**
   * Vérifie si un tier ID est de classe 4 et valide
   */
  static isValidClass4Tier(tierId: string): boolean {
    return this.getClass4TierIds().includes(tierId);
  }
}
