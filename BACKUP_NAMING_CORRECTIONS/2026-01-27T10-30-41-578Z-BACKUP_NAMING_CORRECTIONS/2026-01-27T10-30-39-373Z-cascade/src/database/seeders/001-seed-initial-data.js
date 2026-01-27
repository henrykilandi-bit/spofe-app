// src/database/seeders/001-seed-initial-data.js
// Seed script: Insert initial OHADA chart and test data

import { User, Company, ChartOfAccount } from '../../models/index.js';
import bcrypt from 'bcryptjs';
import ohadaChartOfAccounts from './ohada-chart-of-accounts.seeder.js';

export const seedInitialData = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // 1. Create default admin user
    console.log('📝 Creating admin user...');
    let adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@spofe_v2_1.local',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      });
      console.log('✅ Admin user created:', adminUser.username);
    } else {
      console.log('⏭️  Admin user already exists');
    }

    // 2. Create default test company
    console.log('\n📝 Creating test company...');
    let testCompany = await Company.findOne({ where: { registrationNumber: 'TEST-001' } });
    if (!testCompany) {
      testCompany = await Company.create({
        name: 'SPOFE Test Company',
        registrationNumber: 'TEST-001',
        fiscalYearStart: 1,
        currency: 'XOF',
        country: 'Benin',
        taxIdentificationNumber: 'TIN-TEST-001',
        isActive: true
      });
      console.log('✅ Test company created:', testCompany.name);
    } else {
      console.log('⏭️  Test company already exists');
    }

    // 3. Seed OHADA Chart of Accounts
    console.log('\n📝 Seeding OHADA Chart of Accounts...');
    
    // Check how many accounts already exist
    const existingAccountCount = await ChartOfAccount.count({
      where: { companyId: testCompany.id }
    });

    if (existingAccountCount === 0) {
      // Prepare data for bulk insert
      const accountsData = ohadaChartOfAccounts.map(account => ({
        ...account,
        companyId: testCompany.id
      }));

      // Bulk create with ignore duplicates
      await ChartOfAccount.bulkCreate(accountsData, {
        ignoreDuplicates: true,
        updateOnDuplicate: ['accountName', 'category', 'level']
      });

      const finalCount = await ChartOfAccount.count({
        where: { companyId: testCompany.id }
      });
      console.log(`✅ ${finalCount} OHADA accounts seeded`);
    } else {
      console.log(`⏭️  ${existingAccountCount} OHADA accounts already exist`);
    }

    console.log('\n🎉 Database seeding completed successfully!\n');
    return {
      success: true,
      adminUser,
      testCompany,
      accountsCount: await ChartOfAccount.count({ where: { companyId: testCompany.id } })
    };
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    throw error;
  }
};

module.exports = seedInitialData;
