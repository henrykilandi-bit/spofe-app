#!/usr/bin/env node

/**
 * Seed script pour charger les comptes OHADA dans la base de données
 * Usage: node seedOhadaAccounts.js
 */

const sequelize = require('../config/database');
const ChartOfAccount = require('../models/chartOfAccount.model');
const Compagnie = require('../models/compagnie.model');

const ohadaAccounts = [
  // CLASSE 1: COMPTES DE RESSOURCES DURABLES (PASSIF/EQUITY)
  { accountNumber: '1', accountName: 'COMPTES DE RESSOURCES DURABLES', accountType: 'LIABILITIES', subAccountType: 'EQUITY', description: 'Ressources durables', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '10', accountName: 'Capital', accountType: 'EQUITY', subAccountType: null, description: 'Capital social', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '101', accountName: 'Capital social', accountType: 'EQUITY', subAccountType: 'CAPITAL', description: 'Capital social versé', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '104', accountName: 'Compte de l\'exploitant', accountType: 'EQUITY', subAccountType: 'CAPITAL', description: 'Compte de l\'exploitant', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '105', accountName: 'Primes liées au capital', accountType: 'EQUITY', subAccountType: 'CAPITAL', description: 'Primes liées au capital', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '11', accountName: 'Réserves', accountType: 'EQUITY', subAccountType: null, description: 'Réserves', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '111', accountName: 'Réserve légale', accountType: 'EQUITY', subAccountType: 'RESERVES', description: 'Réserve légale', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '118', accountName: 'Autres réserves', accountType: 'EQUITY', subAccountType: 'RESERVES', description: 'Autres réserves', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '12', accountName: 'Report à nouveau', accountType: 'EQUITY', subAccountType: null, description: 'Résultats reportés', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '13', accountName: 'Résultat net', accountType: 'EQUITY', subAccountType: null, description: 'Résultat de l\'exercice', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '131', accountName: 'Résultat : Bénéfice', accountType: 'EQUITY', subAccountType: 'PROFIT', description: 'Bénéfice de l\'exercice', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '139', accountName: 'Résultat : Perte', accountType: 'LIABILITIES', subAccountType: 'LOSS', description: 'Perte de l\'exercice', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '14', accountName: 'Subventions d\'investissement', accountType: 'LIABILITIES', subAccountType: null, description: 'Subventions reçues', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '16', accountName: 'Emprunts et dettes financières', accountType: 'LIABILITIES', subAccountType: null, description: 'Dettes à long terme', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '162', accountName: 'Emprunts auprès des établissements de crédit', accountType: 'LIABILITIES', subAccountType: 'BANK_LOANS', description: 'Emprunts bancaires', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '164', accountName: 'Comptes courants bloqués', accountType: 'LIABILITIES', subAccountType: 'BLOCKED_ACCOUNTS', description: 'Comptes courants bloqués', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '168', accountName: 'Autres emprunts et dettes', accountType: 'LIABILITIES', subAccountType: 'OTHER_DEBTS', description: 'Autres emprunts', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '19', accountName: 'Provisions pour risques et charges', accountType: 'LIABILITIES', subAccountType: null, description: 'Provisions', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },

  // CLASSE 2: ACTIF IMMOBILISE
  { accountNumber: '2', accountName: 'ACTIF IMMOBILISE', accountType: 'ASSETS', subAccountType: 'FIXED_ASSETS', description: 'Immobilisations', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '21', accountName: 'Immobilisations incorporelles', accountType: 'ASSETS', subAccountType: null, description: 'Actifs incorporels', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '211', accountName: 'Frais de développement', accountType: 'ASSETS', subAccountType: 'INTANGIBLE', description: 'Frais de développement', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '212', accountName: 'Brevets, licences, concessions', accountType: 'ASSETS', subAccountType: 'INTANGIBLE', description: 'Brevets et licences', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '213', accountName: 'Logiciels et sites internet', accountType: 'ASSETS', subAccountType: 'INTANGIBLE', description: 'Logiciels', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '215', accountName: 'Fonds commercial', accountType: 'ASSETS', subAccountType: 'INTANGIBLE', description: 'Fonds commercial', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '22', accountName: 'Terrains', accountType: 'ASSETS', subAccountType: 'PROPERTY', description: 'Terrains et terrains de gisement', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '23', accountName: 'Constructions', accountType: 'ASSETS', subAccountType: 'PROPERTY', description: 'Bâtiments et constructions', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '24', accountName: 'Installations, agencements, aménagements', accountType: 'ASSETS', subAccountType: 'PROPERTY', description: 'Installations et agencements', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '25', accountName: 'Matériel, mobilier et outillage', accountType: 'ASSETS', subAccountType: 'EQUIPMENT', description: 'Matériel et équipements', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '251', accountName: 'Matériel de transport', accountType: 'ASSETS', subAccountType: 'EQUIPMENT', description: 'Matériel de transport', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '252', accountName: 'Matériel informatique', accountType: 'ASSETS', subAccountType: 'EQUIPMENT', description: 'Équipements informatiques', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '253', accountName: 'Mobilier de bureau', accountType: 'ASSETS', subAccountType: 'EQUIPMENT', description: 'Mobilier de bureau', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '26', accountName: 'Participations et créances assimilées', accountType: 'ASSETS', subAccountType: 'FINANCIAL', description: 'Participations longue durée', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '27', accountName: 'Autres immobilisations financières', accountType: 'ASSETS', subAccountType: 'FINANCIAL', description: 'Placements financiers', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '28', accountName: 'Amortissements', accountType: 'ASSETS', subAccountType: 'DEPRECIATION', description: 'Amortissements cumulés', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '29', accountName: 'Provisions pour dépréciation', accountType: 'ASSETS', subAccountType: 'PROVISIONS', description: 'Provisions sur immobilisations', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },

  // CLASSE 3: STOCKS ET EN-COURS
  { accountNumber: '3', accountName: 'STOCKS ET EN-COURS', accountType: 'ASSETS', subAccountType: 'INVENTORY', description: 'Stocks et produits en cours', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '31', accountName: 'Matières premières', accountType: 'ASSETS', subAccountType: 'INVENTORY', description: 'Matières premières', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '32', accountName: 'Autres approvisionnements', accountType: 'ASSETS', subAccountType: 'INVENTORY', description: 'Fournitures et matériaux', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '33', accountName: 'En-cours de production', accountType: 'ASSETS', subAccountType: 'INVENTORY', description: 'Produits en cours de fabrication', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '34', accountName: 'Produits finis', accountType: 'ASSETS', subAccountType: 'INVENTORY', description: 'Produits finis stockés', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '37', accountName: 'Stocks en transit', accountType: 'ASSETS', subAccountType: 'INVENTORY', description: 'Stocks en transit ou magasins', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '39', accountName: 'Provisions pour dépréciation des stocks', accountType: 'ASSETS', subAccountType: 'PROVISIONS', description: 'Provisions sur stocks', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },

  // CLASSE 4: CRÉANCES ET DETTES
  { accountNumber: '4', accountName: 'CRÉANCES ET DETTES', accountType: 'MIXED', subAccountType: 'RECEIVABLES', description: 'Créances et dettes à court terme', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '41', accountName: 'Clients', accountType: 'ASSETS', subAccountType: 'RECEIVABLES', description: 'Créances clients', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '411', accountName: 'Créances clients - Factures à établir', accountType: 'ASSETS', subAccountType: 'RECEIVABLES', description: 'Factures à établir', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '412', accountName: 'Créances clients - Factures établies', accountType: 'ASSETS', subAccountType: 'RECEIVABLES', description: 'Factures établies', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '42', accountName: 'Fournisseurs', accountType: 'LIABILITIES', subAccountType: 'PAYABLES', description: 'Dettes fournisseurs', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '421', accountName: 'Dettes fournisseurs - Factures non reçues', accountType: 'LIABILITIES', subAccountType: 'PAYABLES', description: 'Factures non reçues', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '422', accountName: 'Dettes fournisseurs - Factures reçues', accountType: 'LIABILITIES', subAccountType: 'PAYABLES', description: 'Factures reçues', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '43', accountName: 'Personnel - Salaires à payer', accountType: 'LIABILITIES', subAccountType: 'PAYROLL', description: 'Dettes de paie', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '44', accountName: 'État - Impôts et taxes', accountType: 'LIABILITIES', subAccountType: 'TAXES', description: 'Dettes fiscales et sociales', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '441', accountName: 'Impôt sur le revenu (IR)', accountType: 'LIABILITIES', subAccountType: 'TAXES', description: 'Impôt sur le revenu', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '442', accountName: 'Impôt sur les sociétés (IS)', accountType: 'LIABILITIES', subAccountType: 'TAXES', description: 'Impôt sur les sociétés', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '45', accountName: 'Associés - Capital à verser', accountType: 'MIXED', subAccountType: 'CAPITAL', description: 'Apports d\'associés en attente', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '46', accountName: 'Débiteurs et créditeurs divers', accountType: 'MIXED', subAccountType: 'OTHER', description: 'Autres débiteurs/créditeurs', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '47', accountName: 'Comptes de liaison', accountType: 'MIXED', subAccountType: 'OTHER', description: 'Comptes de liaison', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '48', accountName: 'Comptes d\'attente', accountType: 'MIXED', subAccountType: 'OTHER', description: 'Comptes transitoires', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '49', accountName: 'Provisions pour dépréciations', accountType: 'ASSETS', subAccountType: 'PROVISIONS', description: 'Provisions sur créances', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },

  // CLASSE 5: TRÉSORERIE
  { accountNumber: '5', accountName: 'TRÉSORERIE', accountType: 'ASSETS', subAccountType: 'CASH', description: 'Comptes de trésorerie', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '50', accountName: 'Valeurs en portefeuille', accountType: 'ASSETS', subAccountType: 'SECURITIES', description: 'Titres et placements', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '51', accountName: 'Comptes en banque', accountType: 'ASSETS', subAccountType: 'BANK', description: 'Comptes bancaires', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '512', accountName: 'Compte courant', accountType: 'ASSETS', subAccountType: 'BANK', description: 'Compte courant bancaire', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '513', accountName: 'Compte sur carnet de chèques', accountType: 'ASSETS', subAccountType: 'BANK', description: 'Compte de chèques', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '52', accountName: 'Caisse', accountType: 'ASSETS', subAccountType: 'CASH', description: 'Caisse (espèces)', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '53', accountName: 'Comptes de chèques postaux', accountType: 'ASSETS', subAccountType: 'BANK', description: 'Comptes postaux', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },

  // CLASSE 6: CHARGES
  { accountNumber: '6', accountName: 'COMPTES DE CHARGES', accountType: 'EXPENSES', subAccountType: null, description: 'Charges d\'exploitation', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '60', accountName: 'Achats', accountType: 'EXPENSES', subAccountType: 'PURCHASES', description: 'Achats de matières', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: true, level: 1 },
  { accountNumber: '601', accountName: 'Achats de matières premières', accountType: 'EXPENSES', subAccountType: 'PURCHASES', description: 'Matières premières', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 2 },
  { accountNumber: '602', accountName: 'Achats de fournitures', accountType: 'EXPENSES', subAccountType: 'PURCHASES', description: 'Fournitures et consommables', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 2 },
  { accountNumber: '608', accountName: 'Remises et rabais obtenus', accountType: 'EXPENSES', subAccountType: 'RETURNS', description: 'Remises et rabais', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '61', accountName: 'Services extérieurs', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Services d\'exploitation', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: true, level: 1 },
  { accountNumber: '611', accountName: 'Transports', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Frais de transport', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 2 },
  { accountNumber: '612', accountName: 'Frais de télécommunications', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Télécommunications', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 2 },
  { accountNumber: '613', accountName: 'Frais d\'énergie', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Électricité, gaz, eau', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 2 },
  { accountNumber: '614', accountName: 'Frais d\'honoraires et prestations de services', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Honoraires professionnels', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 2 },
  { accountNumber: '615', accountName: 'Loyers', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Loyers et locations', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 2 },
  { accountNumber: '616', accountName: 'Assurances', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Cotisations d\'assurance', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 2 },
  { accountNumber: '617', accountName: 'Rémunérations de tiers', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Services et conseils', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 2 },
  { accountNumber: '618', accountName: 'Frais de travaux et études', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Études et recherches', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 2 },
  { accountNumber: '619', accountName: 'Rabais et remises accordés', accountType: 'EXPENSES', subAccountType: 'RETURNS', description: 'Rabais et remises', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '62', accountName: 'Autres services extérieurs', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Autres services', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 1 },
  { accountNumber: '63', accountName: 'Impôts et taxes', accountType: 'EXPENSES', subAccountType: 'TAXES', description: 'Impôts et cotisations sociales', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '631', accountName: 'Impôts sur salaires', accountType: 'EXPENSES', subAccountType: 'TAXES', description: 'Charges sociales sur salaires', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '632', accountName: 'Impôts et taxes d\'exploitation', accountType: 'EXPENSES', subAccountType: 'TAXES', description: 'Patente, licence, taxe professionnelle', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '64', accountName: 'Charges de personnel', accountType: 'EXPENSES', subAccountType: 'PAYROLL', description: 'Salaires et charges sociales', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '641', accountName: 'Salaires et traitements', accountType: 'EXPENSES', subAccountType: 'PAYROLL', description: 'Salaires bruts', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '642', accountName: 'Cotisations sociales', accountType: 'EXPENSES', subAccountType: 'PAYROLL', description: 'Cotisations patronales', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '65', accountName: 'Charges d\'exploitation connexes', accountType: 'EXPENSES', subAccountType: 'OTHER', description: 'Autres charges opérationnelles', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '66', accountName: 'Charges financières', accountType: 'EXPENSES', subAccountType: 'FINANCIAL', description: 'Intérêts et charges financières', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: true, level: 1 },
  { accountNumber: '661', accountName: 'Intérêts des emprunts', accountType: 'EXPENSES', subAccountType: 'FINANCIAL', description: 'Intérêts bancaires', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 2 },
  { accountNumber: '668', accountName: 'Autres charges financières', accountType: 'EXPENSES', subAccountType: 'FINANCIAL', description: 'Autres intérêts et frais', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 2 },
  { accountNumber: '67', accountName: 'Charges exceptionnelles', accountType: 'EXPENSES', subAccountType: 'EXCEPTIONAL', description: 'Charges non récurrentes', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '671', accountName: 'Amendes et pénalités', accountType: 'EXPENSES', subAccountType: 'EXCEPTIONAL', description: 'Amendes et pénalités', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '672', accountName: 'Charges liées aux sinistres', accountType: 'EXPENSES', subAccountType: 'EXCEPTIONAL', description: 'Pertes et sinistres', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '673', accountName: 'Pertes de change', accountType: 'EXPENSES', subAccountType: 'EXCEPTIONAL', description: 'Différences de change', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '674', accountName: 'Pertes sur ventes d\'actifs', accountType: 'EXPENSES', subAccountType: 'EXCEPTIONAL', description: 'Moins-value sur cessions', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '68', accountName: 'Provisions et dépréciations', accountType: 'EXPENSES', subAccountType: 'PROVISIONS', description: 'Charges de provisions', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '69', accountName: 'Impôts sur le résultat', accountType: 'EXPENSES', subAccountType: 'TAXES', description: 'Impôt sur les bénéfices', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },

  // CLASSE 7: PRODUITS
  { accountNumber: '7', accountName: 'COMPTES DE PRODUITS', accountType: 'REVENUES', subAccountType: null, description: 'Produits d\'exploitation', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '70', accountName: 'Ventes de produits finis', accountType: 'REVENUES', subAccountType: 'SALES', description: 'Ventes de marchandises', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: true, level: 1 },
  { accountNumber: '701', accountName: 'Ventes de produits finis', accountType: 'REVENUES', subAccountType: 'SALES', description: 'Produits manufacturés', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 2 },
  { accountNumber: '708', accountName: 'Rabais et remises sur ventes', accountType: 'REVENUES', subAccountType: 'RETURNS', description: 'Rabais et remises', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '71', accountName: 'Services rendus', accountType: 'REVENUES', subAccountType: 'SERVICES', description: 'Revenus de services', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 1 },
  { accountNumber: '72', accountName: 'Produits annexes', accountType: 'REVENUES', subAccountType: 'OTHER', description: 'Produits accessoires', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 1 },
  { accountNumber: '73', accountName: 'Produits d\'activités', accountType: 'REVENUES', subAccountType: 'ACTIVITIES', description: 'Autres revenus opérationnels', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 1 },
  { accountNumber: '74', accountName: 'Production immobilisée', accountType: 'REVENUES', subAccountType: 'CAPITALIZED', description: 'Production capitalisée', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '75', accountName: 'Produits financiers', accountType: 'REVENUES', subAccountType: 'FINANCIAL', description: 'Revenus financiers', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: true, level: 1 },
  { accountNumber: '751', accountName: 'Revenus de placements', accountType: 'REVENUES', subAccountType: 'FINANCIAL', description: 'Intérêts et dividendes', parentAccountId: null, is_active: true, isTaxable: true, allowSubAccounts: false, level: 2 },
  { accountNumber: '756', accountName: 'Gains de change', accountType: 'REVENUES', subAccountType: 'FINANCIAL', description: 'Gains de change', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '76', accountName: 'Produits exceptionnels', accountType: 'REVENUES', subAccountType: 'EXCEPTIONAL', description: 'Produits non récurrents', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: true, level: 1 },
  { accountNumber: '761', accountName: 'Produits liés aux sinistres', accountType: 'REVENUES', subAccountType: 'EXCEPTIONAL', description: 'Récupérations et indemnités', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '762', accountName: 'Gains sur ventes d\'actifs', accountType: 'REVENUES', subAccountType: 'EXCEPTIONAL', description: 'Plus-value sur cessions', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 2 },
  { accountNumber: '78', accountName: 'Reversement de provisions', accountType: 'REVENUES', subAccountType: 'PROVISIONS', description: 'Reprises de provisions', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '79', accountName: 'Transferts de charges', accountType: 'REVENUES', subAccountType: 'TRANSFERS', description: 'Transferts analytiques', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },

  // CLASSE 8-9: COMPTES D'ORDRE
  { accountNumber: '8', accountName: 'COMPTES D\'ORDRE', accountType: 'OTHER', subAccountType: null, description: 'Comptes d\'ordre - Engagement', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
  { accountNumber: '9', accountName: 'COMPTES D\'ORDRE - CONTREPARTIE', accountType: 'OTHER', subAccountType: null, description: 'Comptes d\'ordre - Contrepartie', parentAccountId: null, is_active: true, isTaxable: false, allowSubAccounts: false, level: 1 },
];

async function seedData() {
  try {
    console.log('🔄 Démarrage de la synchronisation et du seed des comptes OHADA...');
    
    // Synchroniser les modèles
    await sequelize.sync({ alter: true });
    console.log('✅ Synchronisation de la base de données complétée');

    // Vérifier que l'entreprise existe
    const company = await Company.findOne({ where: { id: 1 } });
    if (!company) {
      console.error('❌ Erreur: Aucune entreprise trouvée avec l\'ID 1');
      process.exit(1);
    }
    console.log(`✅ Entreprise trouvée: ${company.name}`);

    // Nettoyer les anciens comptes
    const deletedCount = await ChartOfAccount.destroy({ 
      where: { company_id: 1 } 
    });
    console.log(`🗑️  ${deletedCount} anciens comptes supprimés`);

    // Insérer les nouveaux comptes
    const createdAccounts = await ChartOfAccount.bulkCreate(
      ohadaAccounts.map(acc => ({
        ...acc,
        company_id: 1
      })),
      { validate: false }
    );

    console.log(`✅ ${createdAccounts.length} comptes OHADA insérés avec succès!`);
    console.log('🎉 Seed complété avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedData();
