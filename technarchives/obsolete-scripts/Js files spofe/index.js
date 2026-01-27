const { sequelize } = require('../config/database');
const User = require('./user.model')(sequelize);

// Initialisation des modèles
const db = {
  sequelize,
  User
  // Ajoutez d'autres modèles ici
};

// Définir les associations entre les modèles ici
// Exemple : db.User.hasMany(db.OtherModel);

module.exports = db;
