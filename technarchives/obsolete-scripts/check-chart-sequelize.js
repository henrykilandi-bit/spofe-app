import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration Sequelize identique au backend
const sequelize = new Sequelize({
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'spofeapp',
  dialect: 'mysql',
  logging: false,
  timezone: '+00:00',
});

// Importer le modèle ChartOfAccount
const modelsPath = path.join(__dirname, 'cascade', 'src', 'models');
const modelFiles = fs.readdirSync(modelsPath).filter(f => f.endsWith('.js'));

async function checkDatabase() {
  try {
    // Test connexion
    await sequelize.authenticate();
    console.log('\n✅ Connexion à la base de données établie');

    // Import du modèle ChartOfAccount
    const { default: ChartOfAccount } = await import('./cascade/src/models/chartOfAccount.model.js');

    // Count total
    const totalCount = await ChartOfAccount.count();
    console.log(`\n📊 STATISTIQUES DU PLAN COMPTABLE`);
    console.log('==================================');
    console.log(`Total de comptes: ${totalCount}`);

    // Get first 20
    const accounts = await ChartOfAccount.findAll({
      limit: 20,
      order: [['accountNumber', 'ASC']],
      attributes: ['accountNumber', 'accountName', 'accountType', 'isActive']
    });

    console.log(`\n📋 PREMIERS 20 COMPTES:`);
    console.log('==================================');
    accounts.forEach((acc, idx) => {
      const status = acc.isActive ? '✓' : '✗';
      console.log(`${idx + 1}. ${acc.accountNumber} - ${acc.accountName} (${acc.accountType}) ${status}`);
    });

    // Group by type
    const byType = await sequelize.query(`
      SELECT account_type, COUNT(*) as count 
      FROM chartsOfAccounts 
      GROUP BY account_type 
      ORDER BY count DESC
    `, { type: 'SELECT' });

    console.log(`\n📊 RÉPARTITION PAR TYPE:`);
    console.log('==================================');
    byType.forEach((type) => {
      console.log(`${type.account_type}: ${type.count} comptes`);
    });

    // Check if active accounts
    const activeCount = await ChartOfAccount.count({ where: { isActive: true } });
    console.log(`\n✅ Comptes actifs: ${activeCount}`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkDatabase();
