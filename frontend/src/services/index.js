/**
 * Point d'entrée centralisé pour tous les services API
 * 
 * Permet d'importer tous les services depuis un seul endroit:
 * import { chartOfAccountsService, journalEntriesService } from '@/services';
 */

export { default as chartOfAccountsService } from './chartOfAccounts.service';
export { default as journalEntriesService } from './journalEntries.service';
export { default as thirdPartiesService } from './thirdParties.service';
export { default as reportsService } from './reports.service';
export * from './dashboard.api';

// Export des fonctions individuelles pour import destructuré
export * from './chartOfAccounts.service';
export * from './journalEntries.service';
export * from './thirdParties.service';
export * from './reports.service';

// Export de la configuration API
export { default as apiClient, buildQueryString, handleApiError, registerLoadingCallback } from './api.config';
