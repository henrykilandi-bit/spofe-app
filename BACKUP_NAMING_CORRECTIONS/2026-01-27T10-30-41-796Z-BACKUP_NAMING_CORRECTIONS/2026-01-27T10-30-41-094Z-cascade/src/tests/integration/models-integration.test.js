/**
 * Integration Tests for SPOFE Database Models
 * Tests CRUD operations and relationships for all 6 tables
 */

import sequelize from '../config/database.js';
import User from './user.model.js';
import Company from './company.model.js';
import ChartOfAccount from './chartOfAccount.model.js';
import JournalEntry from './journalEntry.model.js';
import JournalEntryLine from './journalEntryLine.model.js';
import AccountBalance from './accountBalance.model.js';

// Setup relationships
Company.hasMany(ChartOfAccount, { foreignKey: 'companyId' });
ChartOfAccount.belongsTo(Company, { foreignKey: 'companyId' });

ChartOfAccount.hasMany(ChartOfAccount, { foreignKey: 'parentAccountId', as: 'subAccounts' });
ChartOfAccount.belongsTo(ChartOfAccount, { foreignKey: 'parentAccountId', as: 'parentAccount' });

Company.hasMany(JournalEntry, { foreignKey: 'companyId' });
JournalEntry.belongsTo(Company, { foreignKey: 'companyId' });

User.hasMany(JournalEntry, { foreignKey: 'userId' });
JournalEntry.belongsTo(User, { foreignKey: 'userId' });

JournalEntry.hasMany(JournalEntryLine, { foreignKey: 'journalEntryId' });
JournalEntryLine.belongsTo(JournalEntry, { foreignKey: 'journalEntryId' });

ChartOfAccount.hasMany(JournalEntryLine, { foreignKey: 'accountId' });
JournalEntryLine.belongsTo(ChartOfAccount, { foreignKey: 'accountId' });

Company.hasMany(AccountBalance, { foreignKey: 'companyId' });
AccountBalance.belongsTo(Company, { foreignKey: 'companyId' });

ChartOfAccount.hasMany(AccountBalance, { foreignKey: 'accountId' });
AccountBalance.belongsTo(ChartOfAccount, { foreignKey: 'accountId' });

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message) {
  testResults.tests.push({ name, passed, message });
  if (passed) {
    testResults.passed++;
    console.log(`  ✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`  ❌ ${name}: ${message}`);
  }
}

async function testUserModel() {
  console.log('\n📋 TEST 1: User Model (CRUD Operations)\n');

  try {
    // CREATE
    const user = await User.create({
      username: 'testuser',
      email: 'testuser@spofe.local',
      password: 'hashed_password_123',
      role: 'admin',
      isActive: true
    });
    logTest('User CREATE', !!user?.id, 'User created successfully');

    // READ
    const foundUser = await User.findByPk(user.id);
    logTest('User READ', foundUser?.username === 'testuser', 'User retrieved by ID');

    // UPDATE
    await foundUser.update({ isActive: false });
    const updatedUser = await User.findByPk(user.id);
    logTest('User UPDATE', updatedUser.isActive === false, 'User updated successfully');

    // FIND by email
    const userByEmail = await User.findOne({ where: { email: 'testuser@spofe.local' } });
    logTest('User FIND_BY_EMAIL', userByEmail?.id === user.id, 'User found by email');

    // DELETE
    await foundUser.destroy();
    const deletedUser = await User.findByPk(user.id);
    logTest('User DELETE', deletedUser === null, 'User deleted successfully');

    return true;
  } catch (error) {
    logTest('User Model Tests', false, error.message);
    return false;
  }
}

async function testCompanyModel() {
  console.log('\n📋 TEST 2: Company Model (CRUD Operations)\n');

  try {
    // CREATE
    const company = await Company.create({
      name: 'Test Company SARL',
      registrationNumber: 'CI/RCCM/2024/12345',
      taxId: 'CI12345678901',
      address: '123 Avenue de la Paix',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      currency: 'XOF',
      fiscalYearStart: '01-01',
      accountingStandard: 'OHADA',
      isActive: true
    });
    logTest('Company CREATE', !!company?.id, 'Company created successfully');

    // READ
    const foundCompany = await Company.findByPk(company.id);
    logTest('Company READ', foundCompany?.name === 'Test Company SARL', 'Company retrieved by ID');

    // FIND by registration
    const companyByReg = await Company.findOne({
      where: { registrationNumber: 'CI/RCCM/2024/12345' }
    });
    logTest('Company FIND_BY_REGISTRATION', companyByReg?.id === company.id, 'Company found by registration');

    // UPDATE
    await foundCompany.update({ isActive: false });
    const updatedCompany = await Company.findByPk(company.id);
    logTest('Company UPDATE', updatedCompany.isActive === false, 'Company updated successfully');

    // DELETE
    await foundCompany.destroy();
    const deletedCompany = await Company.findByPk(company.id);
    logTest('Company DELETE', deletedCompany === null, 'Company deleted successfully');

    return true;
  } catch (error) {
    logTest('Company Model Tests', false, error.message);
    return false;
  }
}

async function testChartOfAccountModel() {
  console.log('\n📋 TEST 3: Chart of Account Model (Hierarchy & CRUD)\n');

  try {
    // Create a company first
    const company = await Company.create({
      name: 'Test Company 2',
      registrationNumber: 'CI/RCCM/2024/99999',
      currency: 'XOF',
      fiscalYearStart: '01-01',
      accountingStandard: 'OHADA'
    });

    // CREATE parent account
    const parentAccount = await ChartOfAccount.create({
      companyId: company.id,
      accountNumber: '1',
      accountName: 'Actif',
      class: 1,
      accountType: 'ASSET',
      level: 1,
      isActive: true
    });
    logTest('ChartOfAccount CREATE (Parent)', !!parentAccount?.id, 'Parent account created');

    // CREATE child account
    const childAccount = await ChartOfAccount.create({
      companyId: company.id,
      accountNumber: '101',
      accountName: 'Caisse',
      class: 1,
      accountType: 'ASSET',
      parentAccountId: parentAccount.id,
      level: 2,
      isActive: true
    });
    logTest('ChartOfAccount CREATE (Child)', !!childAccount?.id, 'Child account created');

    // READ and test hierarchy
    const foundChild = await ChartOfAccount.findByPk(childAccount.id, {
      include: { association: 'parentAccount' }
    });
    logTest('ChartOfAccount HIERARCHY', foundChild?.parentAccount?.id === parentAccount.id, 'Parent-child relationship works');

    // FIND by company and account number
    const accountByNumber = await ChartOfAccount.findOne({
      where: { companyId: company.id, accountNumber: '101' }
    });
    logTest('ChartOfAccount FIND_BY_NUMBER', accountByNumber?.id === childAccount.id, 'Account found by number');

    // UPDATE
    await foundChild.update({ isActive: false });
    const updatedAccount = await ChartOfAccount.findByPk(childAccount.id);
    logTest('ChartOfAccount UPDATE', updatedAccount.isActive === false, 'Account updated successfully');

    // CLEANUP
    await childAccount.destroy();
    await parentAccount.destroy();
    await company.destroy();

    return true;
  } catch (error) {
    logTest('ChartOfAccount Model Tests', false, error.message);
    return false;
  }
}

async function testJournalEntryModel() {
  console.log('\n📋 TEST 4: Journal Entry Model (Workflow & CRUD)\n');

  try {
    // Create dependencies
    const user = await User.create({
      username: 'journaluser',
      email: 'journal@spofe.local',
      password: 'hashed'
    });

    const company = await Company.create({
      name: 'Journal Test Co',
      registrationNumber: 'CI/RCCM/2024/88888',
      currency: 'XOF',
      fiscalYearStart: '01-01',
      accountingStandard: 'OHADA'
    });

    // CREATE journal entry
    const entry = await JournalEntry.create({
      companyId: company.id,
      userId: user.id,
      entryNumber: 'JE/2024/001',
      entryDate: new Date('2024-01-15'),
      description: 'Test journal entry',
      status: 'DRAFT',
      fiscalYear: 2024,
      fiscalPeriod: 1
    });
    logTest('JournalEntry CREATE', !!entry?.id, 'Journal entry created');

    // READ
    const foundEntry = await JournalEntry.findByPk(entry.id, {
      include: [
        { association: 'User' },
        { association: 'Company' }
      ]
    });
    logTest('JournalEntry READ', foundEntry?.entryNumber === 'JE/2024/001', 'Entry retrieved with associations');

    // FIND by company and number
    const entryByNumber = await JournalEntry.findOne({
      where: { companyId: company.id, entryNumber: 'JE/2024/001' }
    });
    logTest('JournalEntry FIND_BY_NUMBER', entryByNumber?.id === entry.id, 'Entry found by number');

    // UPDATE status workflow
    await foundEntry.update({
      status: 'SUBMITTED',
      submittedAt: new Date(),
      submittedBy: user.id
    });
    const submittedEntry = await JournalEntry.findByPk(entry.id);
    logTest('JournalEntry UPDATE_STATUS', submittedEntry.status === 'SUBMITTED', 'Entry status updated (DRAFT→SUBMITTED)');

    // APPROVE entry
    await submittedEntry.update({
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: user.id
    });
    const approvedEntry = await JournalEntry.findByPk(entry.id);
    logTest('JournalEntry APPROVE', approvedEntry.status === 'APPROVED', 'Entry approved (SUBMITTED→APPROVED)');

    // POST entry
    await approvedEntry.update({
      status: 'POSTED',
      postedAt: new Date()
    });
    const postedEntry = await JournalEntry.findByPk(entry.id);
    logTest('JournalEntry POST', postedEntry.status === 'POSTED', 'Entry posted (APPROVED→POSTED)');

    // CLEANUP
    await entry.destroy();
    await user.destroy();
    await company.destroy();

    return true;
  } catch (error) {
    logTest('JournalEntry Model Tests', false, error.message);
    return false;
  }
}

async function testJournalEntryLineModel() {
  console.log('\n📋 TEST 5: Journal Entry Line Model (CRUD & Debit/Credit)\n');

  try {
    // Create dependencies
    const user = await User.create({
      username: 'lineuser',
      email: 'line@spofe.local',
      password: 'hashed'
    });

    const company = await Company.create({
      name: 'Line Test Co',
      registrationNumber: 'CI/RCCM/2024/77777',
      currency: 'XOF',
      fiscalYearStart: '01-01',
      accountingStandard: 'OHADA'
    });

    const account = await ChartOfAccount.create({
      companyId: company.id,
      accountNumber: '512',
      accountName: 'Banque',
      class: 5,
      accountType: 'ASSET',
      isActive: true
    });

    const entry = await JournalEntry.create({
      companyId: company.id,
      userId: user.id,
      entryNumber: 'JE/2024/002',
      entryDate: new Date('2024-01-15'),
      description: 'Test entry with lines',
      status: 'DRAFT',
      fiscalYear: 2024,
      fiscalPeriod: 1
    });

    // CREATE debit line
    const debitLine = await JournalEntryLine.create({
      journalEntryId: entry.id,
      accountId: account.id,
      amount: 500000.00,
      type: 'DEBIT',
      lineOrder: 1
    });
    logTest('JournalEntryLine CREATE_DEBIT', !!debitLine?.id, 'Debit line created');

    // CREATE credit line
    const creditLine = await JournalEntryLine.create({
      journalEntryId: entry.id,
      accountId: account.id,
      amount: 500000.00,
      type: 'CREDIT',
      lineOrder: 2
    });
    logTest('JournalEntryLine CREATE_CREDIT', !!creditLine?.id, 'Credit line created');

    // READ
    const foundLine = await JournalEntryLine.findByPk(debitLine.id, {
      include: [
        { association: 'JournalEntry' },
        { association: 'Account' }
      ]
    });
    logTest('JournalEntryLine READ', foundLine?.type === 'DEBIT' && foundLine?.amount === 500000, 'Line retrieved with associations');

    // FIND all lines for entry
    const entryLines = await JournalEntryLine.findAll({
      where: { journalEntryId: entry.id }
    });
    logTest('JournalEntryLine FIND_ALL', entryLines.length === 2, 'All entry lines found (2 lines)');

    // Verify balance (Debit = Credit)
    const totalDebit = entryLines
      .filter(l => l.type === 'DEBIT')
      .reduce((sum, l) => sum + parseFloat(l.amount), 0);
    const totalCredit = entryLines
      .filter(l => l.type === 'CREDIT')
      .reduce((sum, l) => sum + parseFloat(l.amount), 0);
    logTest('JournalEntryLine BALANCE_CHECK', totalDebit === totalCredit, 'Debit equals Credit (balanced)');

    // UPDATE
    await foundLine.update({ isReconciled: true, reconciledAt: new Date() });
    const reconciledLine = await JournalEntryLine.findByPk(debitLine.id);
    logTest('JournalEntryLine UPDATE_RECONCILED', reconciledLine.isReconciled === true, 'Line marked as reconciled');

    // CLEANUP
    await debitLine.destroy();
    await creditLine.destroy();
    await entry.destroy();
    await account.destroy();
    await company.destroy();
    await user.destroy();

    return true;
  } catch (error) {
    logTest('JournalEntryLine Model Tests', false, error.message);
    return false;
  }
}

async function testAccountBalanceModel() {
  console.log('\n📋 TEST 6: Account Balance Model (Period Tracking)\n');

  try {
    // Create dependencies
    const company = await Company.create({
      name: 'Balance Test Co',
      registrationNumber: 'CI/RCCM/2024/66666',
      currency: 'XOF',
      fiscalYearStart: '01-01',
      accountingStandard: 'OHADA'
    });

    const account = await ChartOfAccount.create({
      companyId: company.id,
      accountNumber: '512',
      accountName: 'Banque',
      class: 5,
      accountType: 'ASSET',
      isActive: true
    });

    // CREATE opening balance
    const openingBalance = await AccountBalance.create({
      accountId: account.id,
      companyId: company.id,
      fiscalYear: 2024,
      fiscalPeriod: 0, // Opening
      periodStartDate: new Date('2024-01-01'),
      periodEndDate: new Date('2024-01-31'),
      openingBalance: 1000000.00,
      debitBalance: 0,
      creditBalance: 0,
      closingBalance: 1000000.00,
      isClosed: true
    });
    logTest('AccountBalance CREATE_OPENING', !!openingBalance?.id, 'Opening balance created');

    // CREATE period balance
    const periodBalance = await AccountBalance.create({
      accountId: account.id,
      companyId: company.id,
      fiscalYear: 2024,
      fiscalPeriod: 1, // January
      periodStartDate: new Date('2024-01-01'),
      periodEndDate: new Date('2024-01-31'),
      openingBalance: 1000000.00,
      debitBalance: 500000.00,
      creditBalance: 300000.00,
      closingBalance: 1200000.00,
      isClosed: false
    });
    logTest('AccountBalance CREATE_PERIOD', !!periodBalance?.id, 'Period balance created');

    // READ
    const foundBalance = await AccountBalance.findByPk(periodBalance.id, {
      include: [
        { association: 'Account' },
        { association: 'Company' }
      ]
    });
    logTest('AccountBalance READ', foundBalance?.fiscalPeriod === 1, 'Balance retrieved with associations');

    // FIND by unique constraint
    const uniqueBalance = await AccountBalance.findOne({
      where: {
        accountId: account.id,
        companyId: company.id,
        fiscalYear: 2024,
        fiscalPeriod: 1
      }
    });
    logTest('AccountBalance FIND_UNIQUE', uniqueBalance?.id === periodBalance.id, 'Balance found by unique key');

    // Verify calculation
    const expectedClosing = 1000000 + 500000 - 300000;
    logTest('AccountBalance CALCULATION', foundBalance.closingBalance === expectedClosing, `Closing balance calculated correctly (${expectedClosing})`);

    // UPDATE (close period)
    await foundBalance.update({
      isClosed: true,
      closedAt: new Date()
    });
    const closedBalance = await AccountBalance.findByPk(periodBalance.id);
    logTest('AccountBalance CLOSE_PERIOD', closedBalance.isClosed === true, 'Period marked as closed');

    // CLEANUP
    await periodBalance.destroy();
    await openingBalance.destroy();
    await account.destroy();
    await company.destroy();

    return true;
  } catch (error) {
    logTest('AccountBalance Model Tests', false, error.message);
    return false;
  }
}

async function testForeignKeyConstraints() {
  console.log('\n📋 TEST 7: Foreign Key Constraints & Cascades\n');

  try {
    // Create a company
    const company = await Company.create({
      name: 'FK Test Co',
      registrationNumber: 'CI/RCCM/2024/55555',
      currency: 'XOF',
      fiscalYearStart: '01-01',
      accountingStandard: 'OHADA'
    });

    // Create account under company
    const account = await ChartOfAccount.create({
      companyId: company.id,
      accountNumber: '100',
      accountName: 'Immobilisations',
      class: 1,
      accountType: 'ASSET'
    });
    logTest('FK_COMPANY_ACCOUNT', !!account?.id && account.companyId === company.id, 'Account FK to Company works');

    // Create balance under account and company
    const balance = await AccountBalance.create({
      accountId: account.id,
      companyId: company.id,
      fiscalYear: 2024,
      fiscalPeriod: 1,
      periodStartDate: new Date('2024-01-01'),
      periodEndDate: new Date('2024-01-31'),
      openingBalance: 500000,
      closingBalance: 500000
    });
    logTest('FK_ACCOUNT_BALANCE', !!balance?.id && balance.accountId === account.id, 'Balance FK to Account works');

    // Test CASCADE delete - delete company should delete all related data
    const accountIdBefore = account.id;
    const balanceIdBefore = balance.id;
    
    await company.destroy();
    
    const accountAfter = await ChartOfAccount.findByPk(accountIdBefore);
    const balanceAfter = await AccountBalance.findByPk(balanceIdBefore);
    
    logTest('FK_CASCADE_DELETE', accountAfter === null && balanceAfter === null, 'CASCADE delete works (accounts and balances deleted with company)');

    return true;
  } catch (error) {
    logTest('Foreign Key Constraint Tests', false, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 SPOFE DATABASE INTEGRATION TESTS');
  console.log('='.repeat(70));

  try {
    // Test each model
    await testUserModel();
    await testCompanyModel();
    await testChartOfAccountModel();
    await testJournalEntryModel();
    await testJournalEntryLineModel();
    await testAccountBalanceModel();
    await testForeignKeyConstraints();

    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70) + '\n');
    console.log(`  ✅ PASSED: ${testResults.passed}`);
    console.log(`  ❌ FAILED: ${testResults.failed}`);
    console.log(`  📈 TOTAL:  ${testResults.passed + testResults.failed}\n`);

    if (testResults.failed === 0) {
      console.log('🎉 ALL TESTS PASSED - Models working correctly with database!\n');
    } else {
      console.log(`⚠️  ${testResults.failed} test(s) failed\n`);
    }

    return testResults.failed === 0;
  } catch (error) {
    console.error('❌ Test suite error:', error.message);
    return false;
  } finally {
    await sequelize.close();
  }
}

// Run tests
const success = await runAllTests();
process.exit(success ? 0 : 1);
