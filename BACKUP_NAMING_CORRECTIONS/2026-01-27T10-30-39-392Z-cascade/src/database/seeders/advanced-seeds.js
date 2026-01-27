/**
 * Seeds Avancées - Données Comptables OHADA Réalistes
 * Génère données de test complètes pour développement et tests
 */

import bcryptjs from 'bcryptjs';
import db from '../../models/index.js';
import logger from '../../utils/logger.js';

const { User, Compagnie, ChartOfAccount, JournalEntry, JournalEntryLine, AccountBalance } = db;

/**
 * Plan comptable OHADA standard
 * Structure des comptes selon normes OHADA
 */
const OHADA_CHART_OF_ACCOUNTS = [
  // CLASSE 1: ACTIF (Assets)
  { number: '101', name: 'Capital Social', type: 'EQUITY', sub: 'EQUITY_CAPITAL' },
  { number: '106', name: 'Réserves légales', type: 'EQUITY', sub: 'RETAINED_EARNINGS' },
  { number: '1200', name: 'Banque - Compte Chèques', type: 'ASSETS', sub: 'BANK' },
  { number: '1300', name: 'Caisse - Monnaie', type: 'ASSETS', sub: 'CASH' },
  { number: '1400', name: 'Clients', type: 'ASSETS', sub: 'RECEIVABLE' },
  { number: '1420', name: 'Créances douteuses', type: 'ASSETS', sub: 'RECEIVABLE' },
  { number: '1440', name: 'Créances litigieuses', type: 'ASSETS', sub: 'RECEIVABLE' },

  // Stocks
  { number: '3100', name: 'Matières premières', type: 'ASSETS', sub: 'INVENTORY' },
  { number: '3200', name: 'Produits finis', type: 'ASSETS', sub: 'INVENTORY' },
  { number: '3400', name: 'Marchandises', type: 'ASSETS', sub: 'INVENTORY' },

  // Immobilisations
  { number: '2100', name: 'Terrains et bâtiments', type: 'ASSETS', sub: 'FIXED_ASSET' },
  { number: '2200', name: 'Machines et outillage', type: 'ASSETS', sub: 'FIXED_ASSET' },
  { number: '2810', name: 'Amortissements bâtiments', type: 'ASSETS', sub: 'DEPRECIATION' },
  { number: '2820', name: 'Amortissements machines', type: 'ASSETS', sub: 'DEPRECIATION' },

  // CLASSE 2: PASSIF (Liabilities)
  { number: '401', name: 'Fournisseurs', type: 'LIABILITIES', sub: 'PAYABLE' },
  { number: '4010', name: 'Factures non reçues', type: 'LIABILITIES', sub: 'PAYABLE' },
  { number: '421', name: 'Personnel - Salaires à payer', type: 'LIABILITIES', sub: 'PAYABLE' },
  { number: '441', name: 'Cotisations sociales', type: 'LIABILITIES', sub: 'PAYABLE' },
  { number: '451', name: 'État - TVA à payer', type: 'LIABILITIES', sub: 'PAYABLE' },
  { number: '455', name: 'État - Impôts à payer', type: 'LIABILITIES', sub: 'PAYABLE' },
  { number: '501', name: 'Emprunts bancaires', type: 'LIABILITIES', sub: 'PAYABLE' },

  // CLASSE 3: CAPITAUX PROPRES (Equity)
  { number: '601', name: 'Résultat de l\'exercice', type: 'EQUITY', sub: 'RETAINED_EARNINGS' },

  // CLASSE 4: COMPTES DE GESTION - REVENUS (Revenues)
  { number: '701', name: 'Ventes de marchandises', type: 'REVENUES', sub: 'REVENUE_OPERATING' },
  { number: '702', name: 'Ventes de produits finis', type: 'REVENUES', sub: 'REVENUE_OPERATING' },
  { number: '703', name: 'Ventes de matières premières', type: 'REVENUES', sub: 'REVENUE_OPERATING' },
  { number: '706', name: 'Prestations de services', type: 'REVENUES', sub: 'REVENUE_OPERATING' },
  { number: '707', name: 'Travaux facturés', type: 'REVENUES', sub: 'REVENUE_OPERATING' },
  { number: '708', name: 'Études et conseils', type: 'REVENUES', sub: 'REVENUE_OPERATING' },
  { number: '751', name: 'Revenus des immeubles', type: 'REVENUES', sub: 'REVENUE_OTHER' },
  { number: '761', name: 'Intérêts perçus', type: 'REVENUES', sub: 'REVENUE_OTHER' },

  // CLASSE 5: COMPTES DE GESTION - CHARGES (Expenses)
  { number: '601', name: 'Achats de marchandises', type: 'EXPENSES', sub: 'EXPENSE_OPERATING' },
  { number: '602', name: 'Achats de matières premières', type: 'EXPENSES', sub: 'EXPENSE_OPERATING' },
  { number: '606', name: 'Fournitures consommables', type: 'EXPENSES', sub: 'EXPENSE_OPERATING' },
  { number: '611', name: 'Transports et manutention', type: 'EXPENSES', sub: 'EXPENSE_OPERATING' },
  { number: '612', name: 'Frais de déplacement', type: 'EXPENSES', sub: 'EXPENSE_OPERATING' },
  { number: '613', name: 'Carburants et lubrifiants', type: 'EXPENSES', sub: 'EXPENSE_OPERATING' },
  { number: '615', name: 'Locations et charges locatives', type: 'EXPENSES', sub: 'EXPENSE_OPERATING' },
  { number: '616', name: 'Entretien et réparations', type: 'EXPENSES', sub: 'EXPENSE_OPERATING' },
  { number: '618', name: 'Primes d\'assurance', type: 'EXPENSES', sub: 'EXPENSE_OPERATING' },
  { number: '622', name: 'Rémunérations du personnel', type: 'EXPENSES', sub: 'EXPENSE_OPERATING' },
  { number: '627', name: 'Services bancaires', type: 'EXPENSES', sub: 'EXPENSE_OPERATING' },
  { number: '628', name: 'Services externes', type: 'EXPENSES', sub: 'EXPENSE_OPERATING' },
  { number: '631', name: 'Impôts et taxes', type: 'EXPENSES', sub: 'EXPENSE_OPERATING' },
  { number: '634', name: 'Cotisations sociales', type: 'EXPENSES', sub: 'EXPENSE_OPERATING' },
  { number: '639', name: 'Autres charges', type: 'EXPENSES', sub: 'EXPENSE_OPERATING' },
  { number: '651', name: 'Intérêts payés', type: 'EXPENSES', sub: 'EXPENSE_OTHER' },
  { number: '661', name: 'Pénalités et amendes', type: 'EXPENSES', sub: 'EXPENSE_OTHER' },
];

/**
 * Écritures d'exemple réalistes
 */
const SAMPLE_TRANSACTIONS = [
  {
    date: '2024-01-02',
    journal: 'BQ',
    description: 'Dépôt capital initial',
    lines: [
      { account: '1200', debit: 5000000, description: 'Dépôt bancaire' },
      { account: '101', credit: 5000000, description: 'Capital apporté' }
    ]
  },
  {
    date: '2024-01-03',
    journal: 'AC',
    description: 'Achat de marchandises à SARL Commerce CI',
    lines: [
      { account: '3400', debit: 2000000, description: 'Marchandises reçues' },
      { account: '451', debit: 360000, description: 'TVA déductible 18%' },
      { account: '401', credit: 2360000, description: 'Dette fournisseur' }
    ]
  },
  {
    date: '2024-01-05',
    journal: 'VT',
    description: 'Vente de marchandises à Client ABC Ltd',
    lines: [
      { account: '1200', debit: 2950000, description: 'Paiement reçu' },
      { account: '701', credit: 2500000, description: 'Ventes réalisées' },
      { account: '451', credit: 450000, description: 'TVA collectée 18%' }
    ]
  },
  {
    date: '2024-01-08',
    journal: 'BQ',
    description: 'Paiement fournisseur SARL Commerce CI',
    lines: [
      { account: '401', debit: 2360000, description: 'Paiement de la dette' },
      { account: '1200', credit: 2360000, description: 'Chèque 001523' }
    ]
  },
  {
    date: '2024-01-10',
    journal: 'OD',
    description: 'Ajustement de stock (inventaire physique)',
    lines: [
      { account: '3400', debit: 150000, description: 'Stock ajusté' },
      { account: '639', credit: 150000, description: 'Différence inventaire' }
    ]
  },
  {
    date: '2024-01-12',
    journal: 'CA',
    description: 'Retrait en caisse pour petites dépenses',
    lines: [
      { account: '1300', debit: 500000, description: 'Retrait caisse' },
      { account: '1200', credit: 500000, description: 'Prélèvement bancaire' }
    ]
  },
  {
    date: '2024-01-15',
    journal: 'CA',
    description: 'Paiement fournitures de bureau',
    lines: [
      { account: '606', debit: 150000, description: 'Fournitures achetées' },
      { account: '1300', credit: 150000, description: 'Paiement caisse' }
    ]
  },
  {
    date: '2024-01-20',
    journal: 'PAY',
    description: 'Paie du personnel janvier 2024',
    lines: [
      { account: '622', debit: 3000000, description: 'Salaires bruts' },
      { account: '421', credit: 2100000, description: 'Salaires nets à payer' },
      { account: '441', credit: 900000, description: 'Cotisations retenues' }
    ]
  },
  {
    date: '2024-01-22',
    journal: 'BQ',
    description: 'Paiement loyer bureaux',
    lines: [
      { account: '615', debit: 500000, description: 'Loyer janvier' },
      { account: '451', debit: 90000, description: 'TVA déductible 18%' },
      { account: '1200', credit: 590000, description: 'Virement bancaire' }
    ]
  },
  {
    date: '2024-01-25',
    journal: 'BQ',
    description: 'Paiement salaires personnels',
    lines: [
      { account: '421', debit: 2100000, description: 'Versement salaires' },
      { account: '1200', credit: 2100000, description: 'Virement bancaire' }
    ]
  }
];

/**
 * Exécuter les seeds
 */
async function seed() {
  try {
    logger.logInfo('🌱 Démarrage des seeds avancées...');

    // 1. Créer compagnies si n'existe pas
    let company = await Compagnie.findOne({ where: { registrationNumber: 'CI-001-2024' } });
    
    if (!company) {
      company = await Compagnie.create({
        name: 'SARL SPOFE Commerce',
        registrationNumber: 'CI-001-2024',
        email: 'contact@spofe_v2_1.local',
        phone: '+225 27 XX XX XX XX',
        address: 'Plateau, Abidjan',
        city: 'Abidjan',
        country: 'Côte d\'Ivoire',
        fiscalYearStartMonth: 1,
        fiscalYearEndMonth: 12,
        currency: 'XOF',
        status: 'ACTIVE'
      });
      logger.logInfo(`✅ Compagnie créée: ${company.name}`);
    }

    // 2. Créer plan comptable OHADA
    for (const account of OHADA_CHART_OF_ACCOUNTS) {
      const existingAccount = await ChartOfAccount.findOne({
        where: {
          companyId: company.id,
          accountNumber: account.number
        }
      });

      if (!existingAccount) {
        await ChartOfAccount.create({
          companyId: company.id,
          accountNumber: account.number,
          accountName: account.name,
          accountType: account.type,
          subAccountType: account.sub,
          isControlAccount: false,
          isPrintable: true,
          debit: 0,
          credit: 0,
          balance: 0
        });
      }
    }
    logger.logInfo(`✅ Plan comptable créé: ${OHADA_CHART_OF_ACCOUNTS.length} comptes`);

    // 3. Récupérer utilisateur créateur
    let creator = await User.findOne({ where: { email: 'accountant@spofe_v2_1.local' } });
    if (!creator) {
      creator = await User.findOne({ where: { email: 'admin@spofe_v2_1.local' } });
    }

    if (!creator) {
      const hashedPassword = await bcryptjs.hash('DefaultPass123!', 12);
      creator = await User.create({
        username: 'accountant',
        email: 'accountant@spofe_v2_1.local',
        password: hashedPassword,
        firstName: 'Jean',
        lastName: 'Comptable',
        role: 'ACCOUNTANT',
        isActive: true
      });
      logger.logInfo(`✅ Utilisateur comptable créé: ${creator.email}`);
    }

    // 4. Créer écritures d'exemple
    for (const transaction of SAMPLE_TRANSACTIONS) {
      const entryDate = new Date(transaction.date);
      
      // Chercher si écriture existe déjà
      const existingEntry = await JournalEntry.findOne({
        where: {
          companyId: company.id,
          journalCode: transaction.journal,
          entryDate: entryDate,
          description: transaction.description
        }
      });

      if (!existingEntry) {
        // Calculer totaux
        let totalDebit = 0;
        let totalCredit = 0;

        for (const line of transaction.lines) {
          if (line.debit) totalDebit += line.debit;
          if (line.credit) totalCredit += line.credit;
        }

        // Créer l'écriture
        const entry = await JournalEntry.create({
          companyId: company.id,
          journalCode: transaction.journal,
          entryDate: entryDate,
          description: transaction.description,
          totalDebit: totalDebit,
          totalCredit: totalCredit,
          status: 'POSTED',
          createdBy: creator.id,
          approvedBy: creator.id,
          approvalDate: new Date()
        });

        // Créer les lignes
        for (const line of transaction.lines) {
          const account = await ChartOfAccount.findOne({
            where: {
              companyId: company.id,
              accountNumber: line.account
            }
          });

          if (account) {
            await JournalEntryLine.create({
              journalEntryId: entry.id,
              accountId: account.id,
              debit: line.debit || 0,
              credit: line.credit || 0,
              description: line.description
            });

            // Mettre à jour solde compte
            if (line.debit) {
              account.debit += line.debit;
            }
            if (line.credit) {
              account.credit += line.credit;
            }
            account.balance = account.debit - account.credit;
            await account.save();
          }
        }
      }
    }
    logger.logInfo(`✅ Écritures créées: ${SAMPLE_TRANSACTIONS.length} transactions`);

    // 5. Créer soldes de compte par période
    const periodDate = new Date('2024-01-31');
    const accounts = await ChartOfAccount.findAll({ where: { companyId: company.id } });

    for (const account of accounts) {
      const existingBalance = await AccountBalance.findOne({
        where: {
          companyId: company.id,
          accountId: account.id,
          periodDate: periodDate
        }
      });

      if (!existingBalance) {
        await AccountBalance.create({
          companyId: company.id,
          accountId: account.id,
          periodDate: periodDate,
          periodOpening: 0,
          debit: account.debit,
          credit: account.credit,
          balance: account.balance,
          closingBalance: account.balance
        });
      }
    }
    logger.logInfo(`✅ Soldes de période créés pour ${accounts.length} comptes`);

    logger.logInfo('🌱 Seeds avancées complétées avec succès!');
    return {
      success: true,
      company: company.id,
      accountsCreated: OHADA_CHART_OF_ACCOUNTS.length,
      entriesCreated: SAMPLE_TRANSACTIONS.length
    };

  } catch (error) {
    logger.logError(`❌ Erreur lors des seeds: ${error.message}`);
    throw error;
  }
}

module.exports = seed;
