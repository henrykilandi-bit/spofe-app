import axios from 'axios';
import mysql from 'mysql2/promise';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';

const CREDENTIALS = {
  email: 'comptable@spofe-demo.local',
  password: 'Test@2024'
};

async function getDbIds() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'spofeapp'
  });

  const [[company]] = await conn.query('SELECT id FROM companies LIMIT 1');
  const [[account]] = await conn.query(
    'SELECT account_id AS id FROM journal_entry_lines WHERE third_party_id IS NOT NULL LIMIT 1'
  );
  const [[fallbackAccount]] = await conn.query(
    "SELECT id FROM chartsofaccounts WHERE account_number LIKE '411%' ORDER BY account_number LIMIT 1"
  );
  const [[thirdPartyLines]] = await conn.query(
    'SELECT COUNT(*) AS count FROM journal_entry_lines WHERE third_party_id IS NOT NULL'
  );
  const [[allLines]] = await conn.query(
    'SELECT COUNT(*) AS count FROM journal_entry_lines'
  );
  const [[postedEntries]] = await conn.query(
    "SELECT COUNT(*) AS count FROM journal_entries WHERE status = 'POSTED'"
  );
  const [[thirdParties]] = await conn.query(
    'SELECT COUNT(*) AS count FROM third_parties'
  );
  const [[joinCount]] = await conn.query(
    'SELECT COUNT(*) AS count FROM journal_entry_lines jel JOIN third_parties tp ON tp.id = jel.third_party_id'
  );
  const [[postedJoinCount]] = await conn.query(
    "SELECT COUNT(*) AS count FROM journal_entry_lines jel JOIN journal_entries je ON je.id = jel.journal_entry_id WHERE je.status = 'POSTED' AND jel.third_party_id IS NOT NULL"
  );
  const [directAux] = await conn.query(
    "SELECT jel.third_party_id, SUM(jel.debit) AS totalDebit, SUM(jel.credit) AS totalCredit FROM journal_entry_lines jel JOIN journal_entries je ON je.id = jel.journal_entry_id WHERE je.status = 'POSTED' AND jel.third_party_id IS NOT NULL GROUP BY jel.third_party_id"
  );
  const [directAuxWithFilters] = await conn.query(
    "SELECT tp.id AS thirdPartyId, tp.code, SUM(jel.debit) AS totalDebit, SUM(jel.credit) AS totalCredit FROM journal_entry_lines jel JOIN journal_entries je ON je.id = jel.journal_entry_id JOIN third_parties tp ON tp.id = jel.third_party_id WHERE je.status = 'POSTED' AND je.company_id = ? AND tp.company_id = ? AND tp.is_active = 1 AND jel.third_party_id IS NOT NULL GROUP BY tp.id, tp.code",
    [company?.id, company?.id]
  );
  const [thirdPartySample] = await conn.query(
    'SELECT id, company_id, is_active FROM third_parties ORDER BY id LIMIT 3'
  );
  const [companySample] = await conn.query(
    'SELECT id, name FROM companies ORDER BY id LIMIT 3'
  );
  await conn.end();

  return {
    companyId: company?.id,
    accountId: account?.id || fallbackAccount?.id,
    thirdPartyLineCount: thirdPartyLines?.count || 0,
    postedEntryCount: postedEntries?.count || 0,
    thirdPartiesCount: thirdParties?.count || 0,
    allLinesCount: allLines?.count || 0,
    joinCount: joinCount?.count || 0,
    postedJoinCount: postedJoinCount?.count || 0,
    directAux,
    directAuxWithFilters,
    thirdPartySample,
    companySample
  };
}

async function login() {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, CREDENTIALS);
  return response.data.data.token;
}

async function testReports() {
  const token = await login();
  const { companyId, accountId, thirdPartyLineCount, postedEntryCount, thirdPartiesCount, allLinesCount, joinCount, postedJoinCount, directAux, directAuxWithFilters, thirdPartySample, companySample } = await getDbIds();

  if (!companyId) {
    throw new Error('companyId introuvable en base');
  }

  if (!accountId) {
    throw new Error('accountId introuvable avec third_party_id');
  }

  const headers = { Authorization: `Bearer ${token}` };

  const balanceAux = await axios.get(
    `${API_BASE_URL}/reports/balance-auxiliary?companyId=${companyId}`,
    { headers }
  );

  const ledger = await axios.get(
    `${API_BASE_URL}/reports/general-ledger?companyId=${companyId}&accountId=${accountId}`,
    { headers }
  );

  console.log('✅ Balance auxiliaire OK');
  console.log(`   Tiers en base: ${thirdPartiesCount}`);
  console.log(`   Lignes totales en base: ${allLinesCount}`);
  console.log(`   Lignes tiers en base: ${thirdPartyLineCount}`);
  console.log(`   Jointures tiers en base: ${joinCount}`);
  console.log(`   Jointures tiers POSTED en base: ${postedJoinCount}`);
  if (directAux?.length) {
    console.log(`   Diagnostic SQL direct (rows): ${directAux.length}`);
  }
  console.log(`   Diagnostic SQL filtres API (rows): ${directAuxWithFilters?.length ?? 0}`);
  if (thirdPartySample?.length) {
    console.log(`   Échantillon tiers: ${JSON.stringify(thirdPartySample)}`);
  }
  if (companySample?.length) {
    console.log(`   Échantillon entreprises: ${JSON.stringify(companySample)}`);
  }
  console.log(`   Écritures POSTED en base: ${postedEntryCount}`);
  console.log(`   Tiers retournés: ${balanceAux.data.data?.count ?? 0}`);
  if ((balanceAux.data.data?.count ?? 0) === 0) {
    console.log('   Extrait réponse balance auxiliaire:', JSON.stringify(balanceAux.data.data, null, 2));
  }

  console.log('✅ Grand livre OK');
  console.log(`   Mouvements retournés: ${ledger.data.data?.count ?? 0}`);
}

testReports().catch((err) => {
  console.error('❌ Test rapports échoué:', err.response?.data?.message || err.message);
  process.exit(1);
});
