/**
 * Contract Enforcer
 * 
 * Classe utilitaire pour gérer le contrat et ses validations
 */

import { loadContract, getLoadedContract, isContractLoaded } from './contractLoader.js';
import { ContractViolation } from './violations.js';

/**
 * Principal point d'accès pour la gestion du contrat
 * 
 * @example
 *   const enforcer = ContractEnforcer.getInstance();
 *   await enforcer.initialize();
 *   
 *   const isAllowed = enforcer.isCommandAllowed('CreateAggregate');
 *   const version = enforcer.getVersion();
 */
export class ContractEnforcer {
  static _instance = null;

  /**
   * Récupère l'instance singleton
   */
  static getInstance() {
    if (!ContractEnforcer._instance) {
      ContractEnforcer._instance = new ContractEnforcer();
    }
    return ContractEnforcer._instance;
  }

  /**
   * Initialise le contrat (à appeler au startup)
   */
  async initialize() {
    try {
      await loadContract();
    } catch (error) {
      throw new Error(
        `Failed to initialize SPOFE Contract Enforcer: ${error.message}`
      );
    }
  }

  /**
   * Vérifie si une Command est autorisée
   */
  isCommandAllowed(commandName) {
    const contract = getLoadedContract();
    if (!contract) {
      throw new ContractViolation(
        'CONTRACT_NOT_LOADED',
        'Contract not loaded. Call initialize() first.'
      );
    }
    return contract.commands.includes(commandName);
  }

  /**
   * Vérifie si un read-model est autorisé
   */
  isReadModelAllowed(endpoint) {
    const contract = getLoadedContract();
    if (!contract) {
      throw new ContractViolation(
        'CONTRACT_NOT_LOADED',
        'Contract not loaded. Call initialize() first.'
      );
    }
    return contract.readModels.some(pattern =>
      this._matchesPattern(endpoint, pattern)
    );
  }

  /**
   * Retourne la version du contrat
   */
  getVersion() {
    const contract = getLoadedContract();
    return contract?.version || null;
  }

  /**
   * Retourne la liste de toutes les Commands autorisées
   */
  getAllowedCommands() {
    const contract = getLoadedContract();
    return contract?.commands || [];
  }

  /**
   * Retourne la liste de tous les read-models autorisés
   */
  getAllowedReadModels() {
    const contract = getLoadedContract();
    return contract?.readModels || [];
  }

  /**
   * Retourne le contrat complet (pour inspection)
   */
  getContract() {
    return getLoadedContract();
  }

  /**
   * Vérifie si le contrat est chargé
   */
  isInitialized() {
    return isContractLoaded();
  }

  /**
   * Affiche le statut du contrat dans la console
   */
  printStatus() {
    const contract = getLoadedContract();

    if (!contract) {
      console.log('[SPOFE Contract] NOT LOADED');
      return;
    }

    console.group('[SPOFE Contract Status]');
    console.log(`Version: ${contract.version}`);
    console.log(`Status: ${contract.status}`);
    console.log(`Last Updated: ${contract.lastUpdated}`);
    console.log(`Commands: ${contract.commands.length}`);
    console.log(`Read-models: ${contract.readModels.length}`);
    console.groupEnd();
  }

  /**
   * Teste si un endpoint correspond à un pattern
   * @private
   */
  _matchesPattern(endpoint, pattern) {
    const regexPattern = pattern
      .replace(/\{[^}]+\}/g, '[^/]+')
      .replace(/\//g, '\\/')
      .replace(/\*/g, '.*');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(endpoint);
  }
}

// Export de la méthode statique pour facilité
export const enforcer = ContractEnforcer.getInstance();
