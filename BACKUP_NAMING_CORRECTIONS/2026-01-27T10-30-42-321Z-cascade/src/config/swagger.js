import swaggerJsdoc from 'swagger-jsdoc';
import config from './config.js';
import swaggerSchemas from './swagger-schemas.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SPOFE API Documentation',
      version: '1.0.0',
      description: `
        Documentation complète de l'API SPOFE - Système de Production OHADA
        
        ## Modules disponibles
        
        ### 1. Authentification
        - Inscription, connexion, déconnexion
        - Gestion des tokens JWT
        - Réinitialisation de mot de passe
        
        ### 2. Plan Comptable (Chart of Accounts)
        - Gestion des comptes OHADA (classes 1-8)
        - Hiérarchie des comptes
        - Comptes auxiliaires
        
        ### 3. Écritures Comptables (Journal Entries)
        - Saisie des écritures
        - Validation et clôture
        - Journaux multiples (AC, VE, BQ, CA, OD)
        
        ### 4. Grand Livre (General Ledger)
        - Consultation par compte
        - Lettrage des écritures
        - Historique des mouvements
        
        ### 5. Balance (Trial Balance)
        - Balance générale et auxiliaire
        - Balance âgée
        - Balance comparative
        
        ### 6. États Financiers (Financial Statements)
        - Bilan (Balance Sheet)
        - Compte de résultat (Income Statement)
        - Tableau de flux de trésorerie
        
        ### 7. Tiers (Third Parties)
        - Clients et fournisseurs
        - Comptes auxiliaires
        - Suivi des créances/dettes
        
        ### 8. Société & Exercices (Company & Fiscal Years)
        - Multi-société
        - Gestion des exercices comptables
        - Paramètres comptables
      `,
      contact: {
        name: 'Support SPOFE',
        email: 'support@spofe.app'
      },
      license: {
        name: 'Proprietary',
        url: 'https://spofe.app/license'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api`,
        description: 'Serveur de développement'
      },
      {
        url: `${config.apiBaseUrl}/api`,
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez votre token JWT obtenu via /auth/login'
        }
      },
      schemas: swaggerSchemas
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      { name: 'Authentication', description: 'Gestion de l\'authentification' },
      { name: 'Chart of Accounts', description: 'Plan comptable OHADA' },
      { name: 'Journal Entries', description: 'Écritures comptables' },
      { name: 'General Ledger', description: 'Grand livre' },
      { name: 'Trial Balance', description: 'Balance générale' },
      { name: 'Financial Statements', description: 'États financiers' },
      { name: 'Third Parties', description: 'Clients et fournisseurs' },
      { name: 'Companies', description: 'Gestion des sociétés' },
      { name: 'Fiscal Years', description: 'Exercices comptables' },
      { name: 'Security', description: 'Audit de sécurité' },
      { name: 'Metrics', description: 'Métriques et monitoring' }
    ]
  },
  apis: ['./src/routes/*.js', './src/docs/*.yaml']
};

const specs = swaggerJsdoc(options);
export default specs;
