// cascade/src/database/migrations/001-create-users.js
/**
 * Migration: Création de la table users
 */

export async function up(queryInterface, Sequelize, { transaction }) {
  await queryInterface.createTable('Users', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: Sequelize.STRING(30),
      allowNull: false,
      unique: true
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    role: {
      type: Sequelize.ENUM('ADMIN', 'USER', 'ACCOUNTANT', 'AUDITOR'),
      defaultValue: 'USER',
      allowNull: false
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    resetPasswordToken: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    resetPasswordExpires: {
      type: Sequelize.DATE,
      allowNull: true
    },
    lastLogin: {
      type: Sequelize.DATE,
      allowNull: true
    },
    loginAttempts: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    lockedUntil: {
      type: Sequelize.DATE,
      allowNull: true
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    }
  }, { transaction });

  await queryInterface.addIndex('Users', ['email'], {
    name: 'idx_users_email',
    unique: true,
    transaction
  });

  await queryInterface.addIndex('Users', ['username'], {
    name: 'idx_users_username',
    unique: true,
    transaction
  });
}

export async function down(queryInterface, Sequelize, { transaction }) {
  await queryInterface.dropTable('Users', { transaction });
}
