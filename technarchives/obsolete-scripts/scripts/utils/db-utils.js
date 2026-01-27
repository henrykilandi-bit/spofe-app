// ===============================================
// 🧠 FILE: scripts/utils/db-utils.js
// ===============================================
const { Sequelize } = require('sequelize');
require('dotenv').config();

async function checkDatabaseConnection() {
  const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connexion MySQL OK');
    await sequelize.close();
    return true;
  } catch (err) {
    console.error('❌ Connexion MySQL échouée:', err.message);
    return false;
  }
}

async function fixMissingUser(email) {
  const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  });

  const [result] = await sequelize.query(
    'SELECT COUNT(*) AS c FROM users WHERE email = ?',
    { replacements: [email] }
  );

  if (result[0].c > 0) {
    console.log('🧩 Utilisateur déjà présent');
    return true;
  }

  const hash = '$2a$10$ajvL4h5vFQJpY1Mxo4uh8u8ZzU16kjYxdT6BgJq3GfEfdgDzfLhqG'; // "Admin123!"
  await sequelize.query(
    'INSERT INTO users (email, password, is_active, role_id) VALUES (?, ?, 1, 1)',
    { replacements: [email, hash] }
  );

  console.log(`✅ Utilisateur ${email} créé`);
  await sequelize.close();
  return true;
}

module.exports = { checkDatabaseConnection, fixMissingUser };
