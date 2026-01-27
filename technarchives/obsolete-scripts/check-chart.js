import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'spofeapp',
  waitForConnections: true,
  connectionLimit: 10,
});

async function checkChartOfAccounts() {
  const connection = await pool.getConnection();
  
  try {
    const [countResult] = await connection.query(
      'SELECT COUNT(*) as total FROM chartsOfAccounts'
    );
    
    console.log('\n📊 STATISTIQUES DU PLAN COMPTABLE');
    console.log('==================================');
    console.log(`Total de comptes: ${countResult[0].total}`);
    
    const [accounts] = await connection.query(
      'SELECT account_number, account_name, account_type, is_active FROM chartsOfAccounts ORDER BY account_number LIMIT 20'
    );
    
    console.log('\n📋 PREMIERS COMPTES:');
    console.log('==================================');
    accounts.forEach((acc, idx) => {
      console.log(`${idx + 1}. ${acc.account_number} - ${acc.account_name} (${acc.account_type}) ${acc.is_active ? '✓' : '✗'}`);
    });
    
    const [byType] = await connection.query(
      `SELECT account_type, COUNT(*) as count FROM chartsOfAccounts GROUP BY account_type`
    );
    
    console.log('\n📊 RÉPARTITION PAR TYPE:');
    console.log('==================================');
    byType.forEach((type) => {
      console.log(`${type.account_type}: ${type.count} comptes`);
    });
    
  } finally {
    await connection.release();
    await pool.end();
  }
}

checkChartOfAccounts().catch(console.error);
