const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    mot_de_passe: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prenom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user'
    },
    actif: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    derniere_connexion: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'utilisateurs',
    timestamps: true,
    createdAt: 'date_creation',
    updatedAt: 'date_modification',
    defaultScope: {
      attributes: { exclude: ['mot_de_passe'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['mot_de_passe'] }
      }
    }
  });

  // Hachage du mot de passe avant la création
  User.beforeCreate(async (user) => {
    if (user.mot_de_passe) {
      user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, 10);
    }
  });

  // Hachage du mot de passe avant la mise à jour si modifié
  User.beforeUpdate(async (user) => {
    if (user.changed('mot_de_passe')) {
      user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, 10);
    }
  });

  // Méthode pour comparer les mots de passe
  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.mot_de_passe);
  };

  return User;
};
