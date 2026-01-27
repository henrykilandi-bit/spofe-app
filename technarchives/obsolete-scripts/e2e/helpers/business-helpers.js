/**
 * Helpers métier pour tests E2E
 * Encapsule les actions complexes SPOFE
 */

export class JournalEntryHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Créer une écriture comptable
   * @param {Object} entry - Données de l'écriture
   * @returns {Object} Écriture créée avec numéro et détails
   */
  async createEntry({
    journalCode = 'VE',
    date = new Date().toISOString().split('T')[0],
    description = 'Test entry',
    reference = `TEST-${Date.now()}`,
    lines = [],
  } = {}) {
    // Naviguer vers création
    await this.page.goto('/entries/new');
    
    // Remplir header
    await this.page.selectOption('[data-testid="journal-select"]', journalCode);
    await this.page.fill('[data-testid="entry-date"]', date);
    await this.page.fill('[data-testid="entry-description"]', description);
    await this.page.fill('[data-testid="entry-reference"]', reference);
    
    // Ajouter lignes
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Cliquer sur ajouter ligne si nécessaire
      if (i > 0) {
        await this.page.click('[data-testid="add-line-btn"]');
      }
      
      // Attendre la ligne
      await this.page.waitForSelector(`[data-testid="line-${i}"]`);
      
      // Remplir compte
      await this.page.selectOption(
        `[data-testid="line-${i}-account"]`,
        line.accountCode
      );
      
      // Remplir montant
      await this.page.fill(
        `[data-testid="line-${i}-debit"]`,
        line.debit ? String(line.debit) : ''
      );
      await this.page.fill(
        `[data-testid="line-${i}-credit"]`,
        line.credit ? String(line.credit) : ''
      );
      
      // Description ligne (optionnel)
      if (line.description) {
        await this.page.fill(
          `[data-testid="line-${i}-description"]`,
          line.description
        );
      }
    }
    
    // Vérifier équilibre
    await this.page.waitForFunction(() => {
      const totalDebit = document.querySelector('[data-testid="total-debit"]');
      const totalCredit = document.querySelector('[data-testid="total-credit"]');
      return totalDebit && totalCredit && 
             Math.abs(parseFloat(totalDebit.textContent) - parseFloat(totalCredit.textContent)) < 0.01;
    });
    
    // Submit
    await this.page.click('[data-testid="save-entry-btn"]');
    
    // Attendre succès
    await this.page.waitForSelector('[data-testid="success-message"]');
    
    // Récupérer numéro d'écriture
    const entryNumber = await this.page.textContent('[data-testid="entry-number"]');
    
    return {
      journalCode,
      date,
      description,
      reference,
      entryNumber: entryNumber.trim(),
      lines: lines.length,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Valider (poster) une écriture
   */
  async validateEntry(entryNumber) {
    // Naviguer vers écriture
    await this.page.goto(`/entries/${entryNumber}`);
    
    // Attendre le chargement
    await this.page.waitForSelector('[data-testid="entry-detail"]');
    
    // Cliquer bouton valider
    await this.page.click('[data-testid="validate-entry-btn"]');
    
    // Confirmer dialog
    await this.page.click('[data-testid="confirm-btn"]');
    
    // Attendre succès
    await this.page.waitForSelector('[data-testid="success-message"]');
    
    // Vérifier status
    const status = await this.page.textContent('[data-testid="entry-status"]');
    
    return {
      entryNumber,
      status: status.trim(),
      validatedAt: new Date().toISOString(),
    };
  }

  /**
   * Récupérer détails d'une écriture via API
   */
  async getEntryDetails(entryNumber) {
    const response = await this.page.request.get(
      `http://localhost:3001/api/entries/${entryNumber}`
    );
    
    if (!response.ok()) {
      throw new Error(`Impossible de récupérer l'écriture: ${response.status()}`);
    }
    
    return await response.json();
  }
}

/**
 * Helper pour la balance
 */
export class BalanceHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Générer et consulter la balance
   */
  async generateBalance({
    asOfDate = new Date().toISOString().split('T')[0],
    accountRange = null,
  } = {}) {
    // Naviguer
    await this.page.goto('/reports/balance');
    
    // Remplir paramètres
    await this.page.fill('[data-testid="balance-date"]', asOfDate);
    
    if (accountRange) {
      await this.page.fill('[data-testid="from-account"]', accountRange.from);
      await this.page.fill('[data-testid="to-account"]', accountRange.to);
    }
    
    // Générer
    await this.page.click('[data-testid="generate-balance-btn"]');
    
    // Attendre résultats
    await this.page.waitForSelector('[data-testid="balance-table"]');
    await this.page.waitForLoadState('networkidle');
    
    // Récupérer données
    const lines = await this.page.locator('[data-testid="balance-row"]').count();
    const totalDebit = await this.page.textContent('[data-testid="balance-total-debit"]');
    const totalCredit = await this.page.textContent('[data-testid="balance-total-credit"]');
    
    return {
      asOfDate,
      lines,
      totalDebit: parseFloat(totalDebit),
      totalCredit: parseFloat(totalCredit),
      isBalanced: Math.abs(parseFloat(totalDebit) - parseFloat(totalCredit)) < 0.01,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Exporter balance en PDF
   */
  async exportBalance() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.click('[data-testid="export-pdf-btn"]'),
    ]);
    
    const filename = await download.suggestedFilename();
    
    return {
      filename,
      path: await download.path(),
      downloadedAt: new Date().toISOString(),
    };
  }

  /**
   * Récupérer balance via API
   */
  async getBalanceAPI(asOfDate) {
    const response = await this.page.request.get(
      `http://localhost:3001/api/balance?asOfDate=${asOfDate}`
    );
    
    if (!response.ok()) {
      throw new Error(`Erreur balance API: ${response.status()}`);
    }
    
    return await response.json();
  }
}

/**
 * Helper pour les audits
 */
export class AuditHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Vérifier les logs d'audit pour une écriture
   */
  async getEntryAuditLog(entryNumber) {
    // Via API (plus fiable)
    const response = await this.page.request.get(
      `http://localhost:3001/api/audit/entries/${entryNumber}`
    );
    
    if (!response.ok()) {
      throw new Error(`Impossible de récupérer audit log: ${response.status()}`);
    }
    
    const logs = await response.json();
    
    return {
      entryNumber,
      totalEvents: logs.length,
      events: logs.map(log => ({
        action: log.action,
        user: log.userId,
        timestamp: log.createdAt,
        changes: log.changes,
      })),
    };
  }

  /**
   * Vérifier les logs de la balance
   */
  async getBalanceAuditLog(balanceId) {
    const response = await this.page.request.get(
      `http://localhost:3001/api/audit/balance/${balanceId}`
    );
    
    if (!response.ok()) {
      throw new Error(`Impossible de récupérer audit balance: ${response.status()}`);
    }
    
    return await response.json();
  }

  /**
   * Générer rapport d'audit complet
   */
  async generateAuditReport({
    startDate = null,
    endDate = null,
    entityType = 'entry',
  } = {}) {
    await this.page.goto('/audit');
    
    if (startDate) {
      await this.page.fill('[data-testid="audit-start-date"]', startDate);
    }
    if (endDate) {
      await this.page.fill('[data-testid="audit-end-date"]', endDate);
    }
    
    await this.page.selectOption('[data-testid="entity-type"]', entityType);
    
    // Générer
    await this.page.click('[data-testid="generate-audit-btn"]');
    
    // Attendre résultats
    await this.page.waitForSelector('[data-testid="audit-results"]');
    
    const recordCount = await this.page.textContent('[data-testid="audit-record-count"]');
    
    return {
      startDate,
      endDate,
      entityType,
      recordCount: parseInt(recordCount),
      generatedAt: new Date().toISOString(),
    };
  }
}
