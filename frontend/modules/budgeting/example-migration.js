/**
 * Exemple: Module Budgeting - Migration vers FCE
 * 
 * Ce fichier montre comment migrer un module legacy
 * SANS refonte, SANS logique métier côté client
 */

// ===================================================================
// AVANT: legacy/budgeting.js (❌ Ne plus faire)
// ===================================================================

/*
// OLD (FORBIDDEN)
export async function loadBudgets() {
  const response = await fetch('/api/budgets');
  return response.json();
}

export async function saveBudget(budget) {
  const response = await fetch('/api/budget/save', {
    method: 'POST',
    body: JSON.stringify(budget)
  });
  return response.json();
}

export function calculateBudgetStatus(budget) {
  // ❌ Logique métier côté client
  return budget.spent > budget.limit ? 'exceeded' : 'ok';
}
*/

// ===================================================================
// APRÈS: modules/budgeting/api.js (✅ Façon SPOFE)
// ===================================================================

import { readModel, sendCommand } from '@/core/spofe-contract';

/**
 * Charger les budgets actifs
 * @returns {Promise<Array>} Budgets avec statut fourni par le backend
 */
export async function loadActiveBudgets() {
  // Le backend fournit déjà le statut
  // Frontend ne calcule rien
  return readModel('/aggregates/active', {
    queryParams: { type: 'budget' }
  });
}

/**
 * Charger un budget spécifique
 * @param {string} budgetId
 * @returns {Promise<Object>} Budget complet avec toutes les infos
 */
export async function loadBudget(budgetId) {
  return readModel(`/aggregates/${budgetId}`);
}

/**
 * Fermer un budget
 * 
 * ⚠️ Pas d'update implicite
 * ⚠️ Une intention métier explicite
 * ⚠️ Guardian validera si c'est possible
 * 
 * @param {string} budgetId
 * @returns {Promise<Object>} Réponse du backend
 */
export async function closeBudget(budgetId) {
  return sendCommand('CloseAggregate', {
    aggregateId: budgetId
  });
}

/**
 * Créer un budget
 * 
 * @param {Object} params - { name, owner, limit }
 * @returns {Promise<Object>} Budget créé
 */
export async function createBudget(params) {
  return sendCommand('CreateAggregate', {
    name: params.name,
    owner: params.owner,
    description: params.description
  });
}

/**
 * Mettre à jour la valeur d'un budget
 * 
 * ⚠️ Frontend envoie la nouvelle valeur
 * ⚠️ Backend décide si c'est valide
 * 
 * @param {string} budgetId
 * @param {number} newValue
 * @returns {Promise<Object>}
 */
export async function updateBudgetValue(budgetId, newValue) {
  return sendCommand('UpdateAggregate', {
    aggregateId: budgetId,
    newValue: newValue
  });
}

// ===================================================================
// APRÈS: modules/budgeting/ui.js (la vue)
// ===================================================================

export class BudgetingModule {
  constructor() {
    this.budgets = [];
    this.selectedBudget = null;
  }

  /**
   * Charger et afficher les budgets
   */
  async initialize() {
    try {
      // Charger les données via FCE (gouverné)
      this.budgets = await loadActiveBudgets();

      // Afficher tel que fourni
      this.render();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Afficher la liste des budgets
   */
  render() {
    const container = document.getElementById('budgets');
    container.innerHTML = '';

    for (const budget of this.budgets) {
      const el = document.createElement('div');
      el.className = `budget-item ${budget.status}`;
      el.innerHTML = `
        <h3>${budget.name}</h3>
        <p>Status: ${budget.status}</p>
        <p>Spent: ${budget.spent}€ / ${budget.limit}€</p>
        <button data-action="select" data-id="${budget.id}">View</button>
        <button data-action="close" data-id="${budget.id}">Close</button>
      `;

      el.addEventListener('click', (e) => this.handleAction(e, budget));
      container.appendChild(el);
    }
  }

  /**
   * Gérer les actions utilisateur
   */
  async handleAction(event, budget) {
    const action = event.target.dataset.action;
    const id = event.target.dataset.id;

    try {
      switch (action) {
        case 'select':
          await this.selectBudget(id);
          break;

        case 'close':
          // ⚠️ Pas de vérification côté client
          // ⚠️ Guardian décide si c'est possible
          await this.closeBudget(id);
          break;
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Sélectionner un budget pour le voir
   */
  async selectBudget(id) {
    this.selectedBudget = await loadBudget(id);
    this.renderDetail();
  }

  /**
   * Fermer un budget
   */
  async closeBudget(id) {
    try {
      const result = await closeBudget(id);

      // Recharger la liste (le contrat invalide le cache)
      await this.initialize();

      this.showSuccess('Budget closed');
    } catch (error) {
      // Erreur backend = décision finale
      // Ne pas réessayer, ne pas corriger
      this.handleError(error);
    }
  }

  /**
   * Afficher les détails du budget
   */
  renderDetail() {
    const budget = this.selectedBudget;
    const container = document.getElementById('budget-detail');

    container.innerHTML = `
      <h2>${budget.name}</h2>
      <p>Status: <strong>${budget.status}</strong></p>
      <p>Created: ${new Date(budget.createdAt).toLocaleDateString()}</p>
      
      <!-- ⚠️ Afficher seulement ce que le backend envoie -->
      <!-- ❌ Ne pas calculer d'état -->
      <!-- ❌ Ne pas déduire de permissions -->
      
      <button id="close-btn">Close Budget</button>
    `;

    document.getElementById('close-btn')
      .addEventListener('click', () => this.closeBudget(budget.id));
  }

  /**
   * Gestion des erreurs (sans bricolage)
   */
  handleError(error) {
    console.error('Error:', error);

    if (error.code === 'COMMAND_NOT_ALLOWED') {
      this.showError('This command is not allowed by the contract');
    } else if (error.status === 409) {
      this.showError('Conflict: ' + error.details?.message);
    } else if (error.status === 403) {
      this.showError('Access denied');
    } else {
      this.showError(error.message);
    }
  }

  showSuccess(message) {
    console.log('✓', message);
    // Afficher notification
  }

  showError(message) {
    console.error('✗', message);
    // Afficher notification
  }
}

// ===================================================================
// Utilisation dans l'app
// ===================================================================

/*
// main.js
import { loadContract } from '@/core/spofe-contract';
import { BudgetingModule } from '@/modules/budgeting/ui';

async function bootstrap() {
  // Charger le contrat EN PREMIER
  await loadContract();

  // Initialiser les modules
  const budgetingModule = new BudgetingModule();
  await budgetingModule.initialize();
}

bootstrap().catch(error => {
  console.error('Bootstrap failed:', error);
  // Afficher une page d'erreur
});
*/
