/**
 * 📝 EXEMPLE D'INTÉGRATION AVEC MODÈLES EXISTANTS
 * ===============================================
 * 
 * Comment appliquer les traits à vos modèles Sequelize
 * Copier-coller et adapter à vos besoins
 */

// ============================================
// EXEMPLE 1: USER MODEL (DONNÉES MÉTIER)
// ============================================

// models/user.model.example.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { applyTraits } from './traits/traitApplier.js';

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'user', 'viewer', 'accountant'),
      defaultValue: 'user'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // 🎨 Appliquer les traits pour cette table
    ...applyTraits(User, 'users', sequelize),
    // Les traits vont auto-ajouter:
    // - paranoid: true
    // - deletedAt: 'deleted_at'
    // - defaultScope: { where: { deleted_at: null } }
    // - scopes: { withDeleted, onlyDeleted }
    // - indexes sur deleted_at
  }
);

export default User;

// ============================================
// EXEMPLE 2: AUDIT TRAIL MODEL (IMMUABLE)
// ============================================

// models/auditTrail.example.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { applyTraits } from './traits/traitApplier.js';

const AuditTrail = sequelize.define(
  'AuditTrail',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    table_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      index: true
    },
    record_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    operation: {
      type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
      allowNull: false
    },
    old_values: {
      type: DataTypes.JSON,
      allowNull: true
    },
    new_values: {
      type: DataTypes.JSON,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  },
  {
    tableName: 'audit_trails',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // 🎨 Appliquer les traits pour cette table AUDIT
    ...applyTraits(AuditTrail, 'audit_trails', sequelize),
    // Les traits vont auto-ajouter:
    // - paranoid: false
    // - hooks: beforeUpdate, beforeDestroy → Error
    // - protection absolue contre modifications
  }
);

export default AuditTrail;

// ============================================
// EXEMPLE 3: PASSWORD RESET TOKEN (TEMPORAIRE)
// ============================================

// models/passwordResetToken.example.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { applyTraits } from './traits/traitApplier.js';
import { TemporaryDataHelpers } from './traits/temporaryTrait.js';

const PasswordResetToken = sequelize.define(
  'PasswordResetToken',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        len: [32, 255]
      }
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Token expiration timestamp - hard delete after this'
    }
  },
  {
    tableName: 'password_reset_tokens',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // 🎨 Appliquer les traits pour cette table TEMPORAIRE
    ...applyTraits(PasswordResetToken, 'password_reset_tokens', sequelize),
    // Les traits vont auto-ajouter:
    // - paranoid: false
    // - scope: { notExpired, expired }
    // - validation expires_at obligatoire
    // - hooks: empêcher modification expires_at
  }
);

// 🔧 Ajouter des méthodes utiles
PasswordResetToken.prototype.isExpired = function() {
  return TemporaryDataHelpers.isExpired(this);
};

PasswordResetToken.prototype.getTTL = function() {
  return TemporaryDataHelpers.getTTL(this);
};

PasswordResetToken.prototype.getExpiryStatus = function() {
  return TemporaryDataHelpers.getExpiryStatus(this);
};

export default PasswordResetToken;

// ============================================
// UTILISATION DANS LES CONTRÔLEURS
// ============================================

// controllers/auth.controller.example.js

import User from '../models/user.model.js';
import PasswordResetToken from '../models/passwordResetToken.model.js';

// 👤 Récupérer tous les users ACTIFS (scope par défaut)
export async function getAllUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    return res.json({ data: users });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// 👤 Récupérer TOUS les users (y compris supprimés)
export async function getAllUsersWithDeleted(req, res) {
  try {
    const users = await User.scope('withDeleted').findAll({
      attributes: { exclude: ['password'] }
    });
    return res.json({ data: users });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// 👤 Récupérer UNIQUEMENT les users supprimés (pour récupération)
export async function getDeletedUsers(req, res) {
  try {
    const users = await User.scope('onlyDeleted').findAll({
      attributes: { exclude: ['password'] }
    });
    return res.json({ data: users });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// 👤 Supprimer un user (soft delete)
export async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Soft delete - marque comme supprimé
    await user.destroy();
    
    return res.json({ 
      message: 'User soft deleted',
      user_id: userId,
      deleted_at: user.deleted_at
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// 👤 Récupérer un user supprimé
export async function restoreUser(req, res) {
  try {
    const userId = req.params.id;
    
    // Récupérer avec le scope qui inclut les softdeleted
    const user = await User.scope('withDeleted').findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.deleted_at) {
      return res.json({ message: 'User is not deleted' });
    }
    
    // Restaurer (marquer comme actif)
    await user.update({ deleted_at: null });
    
    return res.json({ 
      message: 'User restored',
      user
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// 🔐 Créer password reset token (TEMPORAIRE)
export async function createPasswordResetToken(req, res) {
  try {
    const { email } = req.body;
    
    // Générer token sécurisé
    const token = require('crypto').randomBytes(32).toString('hex');
    
    // Expiration: 1 heure
    const expires_at = new Date(Date.now() + 3600000);
    
    // Créer token
    const resetToken = await PasswordResetToken.create({
      email,
      token,
      expires_at
    });
    
    return res.json({
      message: 'Password reset token created',
      token: resetToken.token,
      expiresIn: resetToken.getTTL() + ' seconds'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// 🔐 Valider password reset token
export async function validatePasswordResetToken(req, res) {
  try {
    const { token } = req.body;
    
    // Chercher token VALIDE (non expiré)
    const resetToken = await PasswordResetToken.scope('notExpired').findOne({
      where: { token }
    });
    
    if (!resetToken) {
      return res.status(400).json({ error: 'Token invalid or expired' });
    }
    
    return res.json({
      valid: true,
      email: resetToken.email,
      expiresIn: resetToken.getTTL() + ' seconds',
      status: resetToken.getExpiryStatus()
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// MIGRATION VERS LES TRAITS
// ============================================

/*
CHECKLIST pour migrer un modèle existant:

1. ✅ Ajouter import TraitApplier
2. ✅ Identifier la catégorie de la table (BUSINESS/AUDIT/TEMPORARY/CONFIG)
3. ✅ Remplacer les options model.init() par ...applyTraits()
4. ✅ Tester: 
   - Soft delete fonctionne
   - Scopes withDeleted/onlyDeleted travaillent
   - Aucune régression
5. ✅ Exécuter migration pour ajouter deleted_at/expires_at
6. ✅ Mettre à jour les tests

*/

// ============================================
// TESTING
// ============================================

/*

describe('User Model with Soft Delete', () => {
  it('should soft delete a user', async () => {
    const user = await User.create({ 
      username: 'test', 
      email: 'test@test.com',
      password: 'hash'
    });
    
    await user.destroy();
    
    // ✅ Pas trouvé dans requête normale
    let found = await User.findByPk(user.id);
    expect(found).toBeNull();
    
    // ✅ Trouvé avec scope
    found = await User.scope('withDeleted').findByPk(user.id);
    expect(found).not.toBeNull();
    expect(found.deleted_at).not.toBeNull();
  });
  
  it('should restore a user', async () => {
    const user = await User.create({ 
      username: 'test2', 
      email: 'test2@test.com',
      password: 'hash'
    });
    
    await user.destroy();
    await user.update({ deleted_at: null });
    
    // ✅ Trouvé après restauration
    const found = await User.findByPk(user.id);
    expect(found).not.toBeNull();
  });
});

describe('AuditTrail Model with Immutable Trait', () => {
  it('should prevent update', async () => {
    const audit = await AuditTrail.create({
      table_name: 'users',
      record_id: 1,
      operation: 'UPDATE',
      old_values: { email: 'old@test.com' },
      new_values: { email: 'new@test.com' }
    });
    
    // ❌ Essayer de modifier
    expect(() => {
      audit.update({ old_values: {} });
    }).toThrow('IMMUTABLE_TABLE');
  });
  
  it('should prevent delete', async () => {
    const audit = await AuditTrail.create({
      table_name: 'users',
      record_id: 1,
      operation: 'CREATE'
    });
    
    // ❌ Essayer de supprimer
    expect(() => {
      audit.destroy();
    }).toThrow('IMMUTABLE_TABLE');
  });
});

*/

export default {
  // Patterns à utiliser
};
