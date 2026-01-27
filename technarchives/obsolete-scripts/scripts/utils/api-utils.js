// ===============================================
// 🧠 FILE: scripts/utils/api-utils.js
// ===============================================
const axios = require('axios');
require('dotenv').config();

async function checkAPIHealth() {
  try {
    const res = await axios.get(`${process.env.API_URL || 'http://localhost:3001'}/api/health`, { timeout: 4000 });
    if (res.status === 200) {
      console.log('✅ API en ligne');
      return true;
    }
    return false;
  } catch (err) {
    console.error('❌ API injoignable:', err.message);
    return false;
  }
}

module.exports = { checkAPIHealth };
