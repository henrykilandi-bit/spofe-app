// src/models/user.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';
import { logInfo, logError, logSecurity } from '../utils/logger.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 30]
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'super_utilisateur', 'utilisateur', 'super_consultant', 'consultant', 'viewer', 'accountant'),
        defaultValue: 'utilisateur'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    
    // 🆕 Champs Hiérarchie et Permissions
    hierarchy_level: {
        type: DataTypes.INTEGER,
        defaultValue: 99,
        comment: 'Niveau hiérarchique: 1=admin, 2=super_utilisateur, 3=utilisateur, 4=super_consultant, 5=consultant'
    },
    can_grant_permissions: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Peut accorder des permissions à d\'autres utilisateurs'
    },
    
    // 🆕 Champs Profil Étendu
    prenom: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            len: [0, 100]
        }
    },
    nom: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            len: [0, 100]
        }
    },
    telephone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            is: /^[+]?[\d\s\-()]+$/
        }
    },
    siret: {
        type: DataTypes.STRING(14),
        allowNull: true,
        validate: {
            len: [0, 14],
            is: /^[\d]{14}$/
        }
    },
    
    // 🆕 Champs Consultant
    specialites: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Liste des spécialités du consultant (ex: ["audit", "fiscalité", "comptabilité"])'
    },
    tarif_horaire: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: true,
        validate: {
            min: 0,
            max: 999999.99
        },
        comment: 'Tarif horaire du consultant en FCFA'
    },
    experience_years: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0,
            max: 50
        },
        comment: 'Nombre d\'années d\'expérience'
    },
    
    // 🆕 Champs additionnels pour alignement frontend
    adresse: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Adresse du consultant'
    },
    pays: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Pays du consultant'
    },
    type_consultant: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Type de consultant (coach, mentor, etc.)'
    },
    groupe_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Référence vers le groupe d\'entreprises'
    },
    invitationToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Token d\'invitation pour l\'inscription'
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    created_at: 'created_at',
    updated_at: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    defaultScope: {
        attributes: { exclude: ['password'] }
    },
    scopes: {
        withPassword: {
            attributes: { include: ['password'] }
        },
        withProfile: {
            attributes: { include: ['prenom', 'nom', 'telephone', 'specialites', 'tarif_horaire', 'experience_years'] }
        },
        consultants: {
            where: {
                role: ['super_consultant', 'consultant']
            }
        },
        active: {
            where: {
                is_active: true
            }
        }
    },
    
    // 🆕 Hooks pour la gestion automatique du niveau hiérarchique
    hooks: {
        beforeCreate: async (user) => {
            try {
                // 1️⃣ PASSWORD HASHING - Sécurité critique
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                    logInfo(`User.beforeCreate: Password hashed for ${user.email}`);
                }

                // 2️⃣ EMAIL NORMALIZATION
                user.email = user.email.toLowerCase().trim();
                user.username = user.username.toLowerCase().trim();

                // 3️⃣ HIERARCHICAL LEVEL SETUP
                const hierarchyLevels = {
                    'admin': 1,
                    'super_utilisateur': 2,
                    'utilisateur': 3,
                    'super_consultant': 4,
                    'consultant': 5,
                    'viewer': 6,
                    'accountant': 7
                };
                user.hierarchy_level = hierarchyLevels[user.role] || 99;
                user.can_grant_permissions = ['admin', 'super_utilisateur', 'utilisateur'].includes(user.role);

                // 4️⃣ PROFILE NORMALIZATION
                if (user.prenom) user.prenom = user.prenom.trim();
                if (user.nom) user.nom = user.nom.trim();
                if (user.telephone) user.telephone = user.telephone.replace(/\s+/g, '');

                // 5️⃣ SECURITY AUDIT LOG
                logSecurity(`User created: ${user.email} with role ${user.role}`);

                logInfo('User.beforeCreate: User prepared for insertion');
            } catch (error) {
                logError(`User.beforeCreate error: ${error.message}`);
                throw new Error(`User creation preparation failed: ${error.message}`);
            }
        },

        beforeUpdate: async (user) => {
            try {
                // 1️⃣ PASSWORD UPDATE HANDLING
                if (user.changed('password') && user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                    logInfo(`User.beforeUpdate: Password updated for ${user.email}`);
                }

                // 2️⃣ EMAIL NORMALIZATION (if changed)
                if (user.changed('email')) {
                    user.email = user.email.toLowerCase().trim();
                }
                if (user.changed('username')) {
                    user.username = user.username.toLowerCase().trim();
                }

                // 3️⃣ HIERARCHICAL LEVEL UPDATE
                if (user.changed('role')) {
                    const hierarchyLevels = {
                        'admin': 1,
                        'super_utilisateur': 2,
                        'utilisateur': 3,
                        'super_consultant': 4,
                        'consultant': 5,
                        'viewer': 6,
                        'accountant': 7
                    };
                    user.hierarchy_level = hierarchyLevels[user.role] || 99;
                    user.can_grant_permissions = ['admin', 'super_utilisateur', 'utilisateur'].includes(user.role);
                    logSecurity(`User role changed: ${user.email} → ${user.role}`);
                }

                // 4️⃣ STATUS CHANGE TRACKING
                if (user.changed('is_active')) {
                    const newStatus = user.is_active ? 'ACTIVATED' : 'DEACTIVATED';
                    logSecurity(`User status changed: ${user.email} → ${newStatus}`);
                }

                // 5️⃣ PROFILE NORMALIZATION
                if (user.changed('prenom') && user.prenom) user.prenom = user.prenom.trim();
                if (user.changed('nom') && user.nom) user.nom = user.nom.trim();
                if (user.changed('telephone') && user.telephone) user.telephone = user.telephone.replace(/\s+/g, '');

                logInfo('User.beforeUpdate: User prepared for update');
            } catch (error) {
                logError(`User.beforeUpdate error: ${error.message}`);
                throw new Error(`User update preparation failed: ${error.message}`);
            }
        },

        afterCreate: async (user, options) => {
            try {
                // 1️⃣ AUDIT TRAIL LOGGING
                if (options.sequelize) {
                    const { AuditTrail } = options.sequelize.models;
                    if (AuditTrail) {
                        await AuditTrail.create({
                            entityType: 'User',
                            entityId: user.id,
                            action: 'CREATE',
                            changes: {
                                email: user.email,
                                role: user.role,
                                is_active: user.is_active
                            },
                            user_id: options.user_id || user.id,
                            ipAddress: options.ipAddress,
                            userAgent: options.userAgent
                        });
                        logInfo(`User.afterCreate: Audit trail created for ${user.email}`);
                    }
                }

                // 2️⃣ SECURITY EVENT LOGGING
                if (options.sequelize) {
                    const { SecurityEvent } = options.sequelize.models;
                    if (SecurityEvent) {
                        await SecurityEvent.create({
                            eventType: 'USER_CREATED',
                            severity: 'info',
                            details: {
                                user_id: user.id,
                                email: user.email,
                                role: user.role
                            },
                            user_id: user.id,
                            ipAddress: options.ipAddress
                        });
                        logInfo(`User.afterCreate: Security event created for ${user.email}`);
                    }
                }

                logInfo(`User.afterCreate: Post-creation tasks completed for ${user.email}`);
            } catch (error) {
                logError(`User.afterCreate error: ${error.message}`);
                // Don't throw - audit logging failure shouldn't rollback user creation
                logError(`WARNING: User audit trail creation failed for ${user.email}`);
            }
        }
    }
});

export default User;
