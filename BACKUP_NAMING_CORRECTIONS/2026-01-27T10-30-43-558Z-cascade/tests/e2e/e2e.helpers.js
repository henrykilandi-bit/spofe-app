/**
 * 🧪 E2E Test Configuration & Helpers
 * 
 * Provides utilities for E2E testing:
 * - Test data factories
 * - API client helpers
 * - Cleanup utilities
 * - Assertion helpers
 */

import request from 'supertest';
import app from '../../src/app.js';
import logger from '../../src/utils/logger.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏭 TEST DATA FACTORIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const createTestUser = (overrides = {}) => ({
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@spofe.test`,
  password: 'TestPassword123!@',
  ...overrides
});

export const createTestCompagnie = (overrides = {}) => ({
  sigle: `TEST_${Date.now()}`,
  nom: `Test Company ${Date.now()}`,
  siret: '12345678901234',
  devise: 'XOF',
  ...overrides
});

export const createTestJournalEntry = (overrides = {}) => ({
  type: 'GENERAL',
  description: 'Test Entry',
  reference: `REF-${Date.now()}`,
  date: new Date().toISOString().split('T')[0],
  lines: [
    { lineNumber: 1, accountCode: '101', type: 'DEBIT', amount: 1000.00 },
    { lineNumber: 2, accountCode: '401', type: 'CREDIT', amount: 1000.00 }
  ],
  ...overrides
});

export const createTestThirdParty = (type = 'CUSTOMER', overrides = {}) => ({
  type,
  nom: `Third Party ${Date.now()}`,
  email: `tp_${Date.now()}@spofe.test`,
  siret: Math.random().toString().substring(2, 16).padEnd(14, '0'),
  ...overrides
});

export const createTestAccount = (code = '101', overrides = {}) => ({
  code,
  label: `Test Account ${code}`,
  type: 'ASSETS',
  ...overrides
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔌 API CLIENT HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Register a user and return token
 * @param {Object} userData - User data to register
 * @returns {Promise<{token: string, refreshToken: string, user: Object}>}
 */
export const registerUser = async (userData = {}) => {
  const user = createTestUser(userData);
  
  const res = await request(app)
    .post('/api/auth/register')
    .send(user)
    .expect(201);

  return {
    token: res.body.data.token,
    refreshToken: res.body.data.refreshToken,
    user: res.body.data.user
  };
};

/**
 * Login user and return token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{token: string, refreshToken: string}>}
 */
export const loginUser = async (email, password) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  return {
    token: res.body.data.token,
    refreshToken: res.body.data.refreshToken
  };
};

/**
 * Create a company with auth
 * @param {string} token - Auth token
 * @param {Object} compagnieData - Company data
 * @returns {Promise<Object>} Created company with ID
 */
export const createCompagnie = async (token, compagnieData = {}) => {
  const data = createTestCompagnie(compagnieData);
  
  const res = await request(app)
    .post('/api/compagnies')
    .set('Authorization', `Bearer ${token}`)
    .send(data)
    .expect(201);

  return res.body.data;
};

/**
 * Create a journal entry
 * @param {string} token - Auth token
 * @param {string} compagnieId - Company ID
 * @param {Object} entryData - Entry data
 * @returns {Promise<Object>} Created entry with ID
 */
export const createJournalEntry = async (token, compagnieId, entryData = {}) => {
  const data = createTestJournalEntry(entryData);
  
  const res = await request(app)
    .post(`/api/compagnies/${compagnieId}/journal-entries`)
    .set('Authorization', `Bearer ${token}`)
    .send(data)
    .expect(201);

  return res.body.data;
};

/**
 * Submit a journal entry
 * @param {string} token - Auth token
 * @param {string} compagnieId - Company ID
 * @param {string} entryId - Entry ID
 * @returns {Promise<Object>} Updated entry
 */
export const submitJournalEntry = async (token, compagnieId, entryId) => {
  const res = await request(app)
    .post(`/api/compagnies/${compagnieId}/journal-entries/${entryId}/submit`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  return res.body.data;
};

/**
 * Approve a journal entry
 * @param {string} token - Auth token
 * @param {string} compagnieId - Company ID
 * @param {string} entryId - Entry ID
 * @returns {Promise<Object>} Updated entry
 */
export const approveJournalEntry = async (token, compagnieId, entryId) => {
  const res = await request(app)
    .post(`/api/compagnies/${compagnieId}/journal-entries/${entryId}/approve`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  return res.body.data;
};

/**
 * Post a journal entry
 * @param {string} token - Auth token
 * @param {string} compagnieId - Company ID
 * @param {string} entryId - Entry ID
 * @returns {Promise<Object>} Updated entry
 */
export const postJournalEntry = async (token, compagnieId, entryId) => {
  const res = await request(app)
    .post(`/api/compagnies/${compagnieId}/journal-entries/${entryId}/post`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  return res.body.data;
};

/**
 * Create a chart of account
 * @param {string} token - Auth token
 * @param {string} compagnieId - Company ID
 * @param {Object} accountData - Account data
 * @returns {Promise<Object>} Created account
 */
export const createAccount = async (token, compagnieId, accountData = {}) => {
  const data = createTestAccount('101', accountData);
  
  const res = await request(app)
    .post(`/api/compagnies/${compagnieId}/chart-of-accounts`)
    .set('Authorization', `Bearer ${token}`)
    .send(data)
    .expect(201);

  return res.body.data;
};

/**
 * Create a third party
 * @param {string} token - Auth token
 * @param {string} compagnieId - Company ID
 * @param {string} type - Type (CUSTOMER, SUPPLIER, EMPLOYEE)
 * @param {Object} tpData - Third party data
 * @returns {Promise<Object>} Created third party
 */
export const createThirdParty = async (token, compagnieId, type = 'CUSTOMER', tpData = {}) => {
  const data = createTestThirdParty(type, tpData);
  
  const res = await request(app)
    .post(`/api/compagnies/${compagnieId}/third-parties`)
    .set('Authorization', `Bearer ${token}`)
    .send(data)
    .expect(201);

  return res.body.data;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧹 CLEANUP UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { User, Compagnie, JournalEntry, ChartOfAccount, ThirdParty } from '../../src/models/index.js';
import { Op } from 'sequelize';

/**
 * Clean up all test data
 */
export const cleanupTestData = async () => {
  try {
    await Promise.all([
      User.destroy({ where: { email: { [Op.like]: '%@spofe.test' } } }),
      Compagnie.destroy({ where: { sigle: { [Op.like]: '%TEST%' } } }),
    ]);
    logger.info('✅ Test data cleaned up');
  } catch (error) {
    logger.warn('⚠️  Cleanup error:', error.message);
  }
};

/**
 * Clean up users by email pattern
 */
export const cleanupUsers = async (emailPattern = '%@spofe.test') => {
  try {
    await User.destroy({ where: { email: { [Op.like]: emailPattern } } });
  } catch (error) {
    logger.warn('⚠️  User cleanup error:', error.message);
  }
};

/**
 * Clean up companies by sigle pattern
 */
export const cleanupCompagnies = async (siglePattern = '%TEST%') => {
  try {
    await Compagnie.destroy({ where: { sigle: { [Op.like]: siglePattern } } });
  } catch (error) {
    logger.warn('⚠️  Compagnie cleanup error:', error.message);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧪 ASSERTION HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Assert response has standard success structure
 * @param {Object} body - Response body
 */
export const assertSuccessResponse = (body) => {
  expect(body).toHaveProperty('success', true);
  expect(body).toHaveProperty('data');
  expect(body).toHaveProperty('message');
};

/**
 * Assert response has standard error structure
 * @param {Object} body - Response body
 */
export const assertErrorResponse = (body, statusCode = 400) => {
  expect(body).toHaveProperty('success', false);
  expect(body).toHaveProperty('message');
  expect(body).toHaveProperty('statusCode', statusCode);
};

/**
 * Assert user object structure
 * @param {Object} user - User object
 */
export const assertUserStructure = (user) => {
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('username');
  expect(user).toHaveProperty('email');
  expect(user).not.toHaveProperty('password');
  expect(user).not.toHaveProperty('passwordHash');
};

/**
 * Assert journal entry has auto-generated number
 * @param {Object} entry - Journal entry
 */
export const assertEntryNumber = (entry) => {
  expect(entry.entryNumber).toMatch(/^JCO-\d{4}-\d{5}$/);
};

/**
 * Assert third party has auto-generated code
 * @param {Object} thirdParty - Third party object
 */
export const assertThirdPartyCode = (thirdParty) => {
  const type = thirdParty.type;
  const codePrefix = type === 'CUSTOMER' ? 'CUST' : 'SUPP';
  expect(thirdParty.code).toMatch(new RegExp(`^${codePrefix}-\\d{5}$`));
};

/**
 * Assert account code is OHADA format
 * @param {Object} account - Chart of account
 */
export const assertOHADAFormat = (account) => {
  expect(account.code).toMatch(/^\d{1,3}$/); // XXX format
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 SECURITY HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Assert no sensitive data in response
 * @param {Object} data - Response data
 */
export const assertNoSensitiveData = (data) => {
  const sensitiveKeys = ['password', 'passwordHash', 'secret', 'token', 'refreshToken'];
  const keys = Object.keys(data);
  
  for (const key of keys) {
    expect(sensitiveKeys).not.toContain(key.toLowerCase());
  }
};

/**
 * Assert token format
 * @param {string} token - JWT token
 */
export const assertValidToken = (token) => {
  expect(typeof token).toBe('string');
  expect(token.length).toBeGreaterThan(10);
  expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
};

export default {
  // Factories
  createTestUser,
  createTestCompagnie,
  createTestJournalEntry,
  createTestThirdParty,
  createTestAccount,

  // API Helpers
  registerUser,
  loginUser,
  createCompagnie,
  createJournalEntry,
  submitJournalEntry,
  approveJournalEntry,
  postJournalEntry,
  createAccount,
  createThirdParty,

  // Cleanup
  cleanupTestData,
  cleanupUsers,
  cleanupCompagnies,

  // Assertions
  assertSuccessResponse,
  assertErrorResponse,
  assertUserStructure,
  assertEntryNumber,
  assertThirdPartyCode,
  assertOHADAFormat,
  assertNoSensitiveData,
  assertValidToken
};
