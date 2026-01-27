/**
 * Database Seeds - Données initiales de test
 * Crée les données par défaut pour le développement et les tests
 */

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const ADMIN_PASSWORD = 'AdminPassword123!';
const USER_PASSWORD = 'UserPassword123!';

export const seedAdminUser = async (User) => {
  try {
    const existingAdmin = await User.findOne({
      where: { email: 'admin@spofe.local' }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
      
      await User.create({
        id: uuidv4(),
        username: 'admin',
        email: 'admin@spofe.local',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'SPOFE',
        role: 'admin',
        isActive: true,
        isVerified: true,
        loginAttempts: 0
      });

      console.log('✅ Admin user created');
      console.log('   Email: admin@spofe.local');
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  }
};

export const seedTestUsers = async (User) => {
  try {
    const testUsers = [
      {
        username: 'manager1',
        email: 'manager1@spofe.local',
        firstName: 'Manager',
        lastName: 'One',
        role: 'manager'
      },
      {
        username: 'accountant1',
        email: 'accountant1@spofe.local',
        firstName: 'Accountant',
        lastName: 'One',
        role: 'accountant'
      },
      {
        username: 'user1',
        email: 'user1@spofe.local',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      }
    ];

    for (const userData of testUsers) {
      const existing = await User.findOne({
        where: { email: userData.email }
      });

      if (!existing) {
        const hashedPassword = await bcrypt.hash(USER_PASSWORD, 12);

        await User.create({
          id: uuidv4(),
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          isActive: true,
          isVerified: true,
          loginAttempts: 0
        });

        console.log(`✅ Test user created: ${userData.email}`);
      }
    }

    console.log(`✅ All test users seeded`);
    console.log(`   Test password: ${USER_PASSWORD}`);

  } catch (error) {
    console.error('❌ Error seeding test users:', error);
  }
};

export const seedCompanies = async (Company) => {
  try {
    const companies = [
      {
        name: 'ACME Corporation SARL',
        registrationNumber: 'RC001234567',
        email: 'info@acme.sn',
        phone: '+221 33 123 45 67',
        address: '123 Rue de Commerce',
        city: 'Dakar',
        country: 'Sénégal',
        currency: 'XOF'
      },
      {
        name: 'Tech Solutions Ltd',
        registrationNumber: 'RC001234568',
        email: 'info@techsolutions.sn',
        phone: '+221 33 987 65 43',
        address: '456 Avenue Tech',
        city: 'Dakar',
        country: 'Sénégal',
        currency: 'XOF'
      }
    ];

    for (const companyData of companies) {
      const existing = await Company.findOne({
        where: { registrationNumber: companyData.registrationNumber }
      });

      if (!existing) {
        await Company.create({
          id: uuidv4(),
          ...companyData,
          fiscalYearStartDate: new Date('2024-01-01'),
          isActive: true
        });

        console.log(`✅ Company created: ${companyData.name}`);
      }
    }

  } catch (error) {
    console.error('❌ Error seeding companies:', error);
  }
};

export const seedChartOfAccounts = async (ChartOfAccount, Company) => {
  try {
    // OHADA Chart of Accounts - Classe 1 à 8
    const ohadaAccounts = [
      // Classe 1: Comptes de Capitaux
      { number: '1010', name: 'Capital', type: 'EQUITY' },
      { number: '1040', name: 'Réserves', type: 'EQUITY' },
      { number: '1080', name: 'Résultats reportés', type: 'EQUITY' },

      // Classe 2: Comptes d\'Immobilisations
      { number: '2100', name: 'Terrains', type: 'ASSET' },
      { number: '2110', name: 'Constructions', type: 'ASSET' },
      { number: '2200', name: 'Installations techniques', type: 'ASSET' },
      { number: '2800', name: 'Amortissements', type: 'ASSET' },

      // Classe 3: Comptes de Stocks
      { number: '3100', name: 'Matières premières', type: 'ASSET' },
      { number: '3200', name: 'Produits finis', type: 'ASSET' },

      // Classe 4: Comptes de Tiers
      { number: '4010', name: 'Fournisseurs', type: 'LIABILITY' },
      { number: '4020', name: 'Clients', type: 'ASSET' },
      { number: '4080', name: 'Autres créditeurs', type: 'LIABILITY' },

      // Classe 5: Comptes Financiers
      { number: '5010', name: 'Titres de placement', type: 'ASSET' },
      { number: '5100', name: 'Banques', type: 'ASSET' },
      { number: '5200', name: 'Caisse', type: 'ASSET' },

      // Classe 6: Comptes de Charges
      { number: '6010', name: 'Matières premières', type: 'EXPENSE' },
      { number: '6100', name: 'Personnel', type: 'EXPENSE' },
      { number: '6200', name: 'Services extérieurs', type: 'EXPENSE' },
      { number: '6300', name: 'Impôts et taxes', type: 'EXPENSE' },

      // Classe 7: Comptes de Produits
      { number: '7010', name: 'Ventes de produits', type: 'REVENUE' },
      { number: '7100', name: 'Ventes de services', type: 'REVENUE' },
      { number: '7500', name: 'Autres produits', type: 'REVENUE' }
    ];

    // Récupérer la première compagnie
    const company = await Company.findOne();

    if (company) {
      for (const accountData of ohadaAccounts) {
        const existing = await ChartOfAccount.findOne({
          where: {
            companyId: company.id,
            accountNumber: accountData.number
          }
        });

        if (!existing) {
          await ChartOfAccount.create({
            id: uuidv4(),
            companyId: company.id,
            accountNumber: accountData.number,
            accountName: accountData.name,
            accountType: accountData.type,
            isActive: true
          });
        }
      }

      console.log(`✅ OHADA Chart of Accounts seeded for ${company.name}`);
    }

  } catch (error) {
    console.error('❌ Error seeding chart of accounts:', error);
  }
};

/**
 * Fonction principale pour exécuter tous les seeds
 */
export const runAllSeeds = async (sequelize) => {
  try {
    const { User, Company, ChartOfAccount } = sequelize.models;

    console.log('🌱 Starting database seeds...\n');

    await seedAdminUser(User);
    await seedTestUsers(User);
    await seedCompanies(Company);
    await seedChartOfAccounts(ChartOfAccount, Company);

    console.log('\n✅ All seeds completed successfully!\n');

  } catch (error) {
    console.error('❌ Error running seeds:', error);
    throw error;
  }
};

export default runAllSeeds;
