/**
 * 🛡️ ComptabiliteGuardian - Autorité Unique de Validation Comptable
 * 
 * Le Guardian Comptabilité est l'autorité unique et exclusive de validation 
 * des écritures comptables dans SPOFE.
 */

import { AccountingEntry, AccountingPeriod } from '../domain/AccountingPeriod.js';
import { 
  ContexteValidation, 
  ResultatValidation, 
  ResultatValidationLot, 
  ResultatPeriode,
  CommandeCloturePeriode,
  ResultatCloturePeriode 
} from './types/GuardianTypes.js';
import { validerTousInvariants } from './invariants/InvariantsP0.js';

/**
 * 🛡️ Guardian Comptabilité - Autorité Unique
 */
export class ComptabiliteGuardian {
  
  /**
   * Valider une nouvelle écriture comptable
   * 
   * @param ecriture L'écriture à valider
   * @param contexte Le contexte de validation
   * @returns Le résultat de la validation
   */
  static validerNouvelleEcriture(
    ecriture: AccountingEntry,
    contexte: ContexteValidation
  ): ResultatValidation {
    try {
      // 1️⃣ Récupérer la période cible (via repository)
      const periodeCible = this.recupererPeriode(contexte.periodId);
      
      // 2️⃣ Récupérer les données externes (via repositories)
      const donneesExternes = this.recupererDonneesExternes(ecriture, contexte);
      
      // 3️⃣ Valider tous les invariants P0
      const validationInvariants = validerTousInvariants(
        periodeCible,
        ecriture,
        contexte,
        donneesExternes
      );
      
      // 4️⃣ Construire le résultat
      if (validationInvariants.estValide) {
        return {
          statut: 'VALIDÉ',
          referenceEcriture: ecriture.entryId,
          timestamp: new Date()
        };
      } else {
        return {
          statut: 'REFUSÉ',
          motif: `Invariants violés: ${validationInvariants.invariantsViolés.join(', ')}`,
          invariantsViolés: validationInvariants.invariantsViolés,
          timestamp: new Date()
        };
      }
      
    } catch (error) {
      return {
        statut: 'REFUSÉ',
        motif: `Erreur système: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        timestamp: new Date()
      };
    }
  }
  
  /**
   * Valider un lot d'écritures comptables
   * 
   * @param ecritures Le lot d'écritures à valider
   * @param contexte Le contexte de validation
   * @returns Le résultat de validation du lot
   */
  static validerLotEcritures(
    ecritures: AccountingEntry[],
    contexte: ContexteValidation
  ): ResultatValidationLot {
    const resultats: ResultatValidation[] = [];
    
    // Valider chaque écriture individuellement
    for (const ecriture of ecritures) {
      const resultat = this.validerNouvelleEcriture(ecriture, contexte);
      resultats.push(resultat);
    }
    
    // Calculer le résumé
    const resume = {
      total: resultats.length,
      valides: resultats.filter(r => r.statut === 'VALIDÉ').length,
      refusees: resultats.filter(r => r.statut === 'REFUSÉ').length,
      attente: resultats.filter(r => r.statut === 'ATTENTE').length
    };
    
    // Déterminer le statut global
    let statutGlobal: 'VALIDÉ' | 'REFUSÉ_PARTIEL' | 'REFUSÉ_TOTAL';
    if (resume.refusees === 0) {
      statutGlobal = 'VALIDÉ';
    } else if (resume.valides === 0) {
      statutGlobal = 'REFUSÉ_TOTAL';
    } else {
      statutGlobal = 'REFUSÉ_PARTIEL';
    }
    
    return {
      statutGlobal,
      resultats,
      resume,
      timestamp: new Date()
    };
  }
  
  /**
   * Vérifier la conformité d'une période
   * 
   * @param periodeId L'identifiant de la période
   * @returns Le résultat de vérification
   */
  static verifierConformitePeriode(periodeId: string): ResultatPeriode {
    try {
      const periode = this.recupererPeriode(periodeId);
      
      // Déterminer le statut
      let statut: 'OUVERTE' | 'FERMABLE' | 'DÉJÀ_FERMÉE' | 'BLOQUÉE';
      let actionsPossibles: ('VALIDER_ENTREE' | 'CLOTURER' | 'BLOQUER' | 'CONSULTER_SEULEMENT')[];
      
      switch (periode.status) {
        case 'OPEN':
          statut = 'OUVERTE';
          actionsPossibles = ['VALIDER_ENTREE', 'CLOTURER', 'CONSULTER_SEULEMENT'];
          break;
        case 'CLOSED':
          statut = 'DÉJÀ_FERMÉE';
          actionsPossibles = ['CONSULTER_SEULEMENT'];
          break;
        case 'LOCKED':
          statut = 'BLOQUÉE';
          actionsPossibles = ['CONSULTER_SEULEMENT'];
          break;
        default:
          statut = 'OUVERTE';
          actionsPossibles = ['VALIDER_ENTREE', 'CLOTURER', 'CONSULTER_SEULEMENT'];
      }
      
      // Vérifier si la période est fermable
      if (periode.status === 'OPEN' && periode.balance.isBalanced) {
        statut = 'FERMABLE';
        actionsPossibles = ['VALIDER_ENTREE', 'CLOTURER', 'BLOQUER', 'CONSULTER_SEULEMENT'];
      }
      
      return {
        statut,
        equilibre: {
          totalDebit: periode.balance.totalDebit,
          totalCredit: periode.balance.totalCredit,
          estEquilibré: periode.balance.isBalanced
        },
        nombreEcritures: periode.journalSet.reduce((total, journal) => total + journal.entries.length, 0),
        actionsPossibles,
        timestamp: new Date()
      };
      
    } catch (error) {
      throw new Error(`Erreur vérification période ${periodeId}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
  
  /**
   * Clôturer une période comptable
   * 
   * @param commande La commande de clôture
   * @returns Le résultat de la clôture
   */
  static clôturerPeriode(commande: CommandeCloturePeriode): ResultatCloturePeriode {
    try {
      const periode = this.recupererPeriode(commande.periodId);
      
      // Vérifier que la période est bien OPEN
      if (periode.status !== 'OPEN') {
        return {
          statut: 'DÉJÀ_CLOTURÉE',
          nouveauStatut: undefined,
          referenceCloture: undefined,
          equilibreFinal: undefined,
          erreurs: [`La période est déjà ${periode.status}`],
          timestamp: new Date()
        };
      }
      
      // Vérifier l'équilibre si requis
      if (commande.verifierEquilibre && !periode.balance.isBalanced) {
        return {
          statut: 'ERREUR_ÉQUILIBRE',
          nouveauStatut: undefined,
          referenceCloture: undefined,
          equilibreFinal: {
            totalDebit: periode.balance.totalDebit,
            totalCredit: periode.balance.totalCredit,
            estEquilibré: false
          },
          erreurs: ['La période n\'est pas équilibrée'],
          timestamp: new Date()
        };
      }
      
      // Simuler la clôture (logique à implémenter dans le repository)
      const referenceCloture = `CLOTURE_${commande.periodId}_${Date.now()}`;
      
      return {
        statut: 'CLOTURÉE',
        nouveauStatut: 'CLOSED',
        referenceCloture,
        equilibreFinal: {
          totalDebit: periode.balance.totalDebit,
          totalCredit: periode.balance.totalCredit,
          estEquilibré: true
        },
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        statut: 'NON_AUTORISÉE',
        erreurs: [`Erreur lors de la clôture: ${error instanceof Error ? error.message : 'Erreur inconnue'}`],
        timestamp: new Date()
      };
    }
  }
  
  /**
   * Méthodes privées (à implémenter avec les repositories)
   */
  
  /**
   * Récupérer une période depuis le repository
   */
  private static recupererPeriode(periodId: string): AccountingPeriod {
    // TODO: Implémenter avec le repository des périodes
    throw new Error('Repository non implémenté');
  }
  
  /**
   * Récupérer les données externes nécessaires à la validation
   */
  private static recupererDonneesExternes(
    ecriture: AccountingEntry, 
    contexte: ContexteValidation
  ): {
    planComptaireActif: string[];
    natureComptes: Record<string, 'DEBIT' | 'CREDIT' | 'BOTH'>;
    tiersValides: string[];
    journauxAutorises: Record<string, string[]>;
  } {
    // TODO: Implémenter avec les repositories externes
    throw new Error('Repositories externes non implémentés');
  }
}
