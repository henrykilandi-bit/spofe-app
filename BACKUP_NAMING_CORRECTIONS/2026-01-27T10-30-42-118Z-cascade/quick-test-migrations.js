// quick-test-migrations.js
// Quick migration and seeding test

import 'dotenv/config';
import sequelize from './src/config/database.js';
import migrationScript from './src/database/migrations/001-create-tables.js';
import { seedInitialData } from './src/database/seeders/001-seed-initial-data.js';
import { User, Company, ChartOfAccount } from './src/models/index.js';

const main = async () => {
  try {
    console.log('🔄 Starting quick migration test...\n');

    // 1. Test database connection
    console.log('1️⃣  Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // 2. Run migration
    console.log('2️⃣  Running migration up...');
    await migrationScript.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    console.log('✅ Migration completed\n');

    // 3. Run seeding
    console.log('3️⃣  Running seeder...');
    const seedResult = await seedInitialData();
    console.log('✅ Seeding completed\n');

    // 4. Verify data
    console.log('4️⃣  Verifying seeded data...');
    const userCount = await User.count();
    const companyCount = await Company.count();
    const accountCount = await ChartOfAccount.count();

    console.log(`   Users: ${userCount}`);
    console.log(`   Companies: ${companyCount}`);
    console.log(`   OHADA Accounts: ${accountCount}\n`);

    // 5. Check OHADA structure
    console.log('5️⃣  Checking OHADA structure...');
    const assetAccounts = await ChartOfAccount.count({
      where: { accountType: 'ASSET' }
    });
    const liabilityAccounts = await ChartOfAccount.count({
      where: { accountType: 'LIABILITY' }
    });
    const revenueAccounts = await ChartOfAccount.count({
      where: { accountType: 'REVENUE' }
    });

    console.log(`   Assets: ${assetAccounts}`);
    console.log(`   Liabilities: ${liabilityAccounts}`);
    console.log(`   Revenues: ${revenueAccounts}\n`);

    // 6. Test one account
    console.log('6️⃣  Testing account retrieval...');
    const testAccount = await ChartOfAccount.findOne({
      where: { accountNumber: '1' }
    });
    if (testAccount) {
      console.log(`   Found: ${testAccount.accountNumber} - ${testAccount.accountName}`);
    }

    console.log('\n🎉 All tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

main();
