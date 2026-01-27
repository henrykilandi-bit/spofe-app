import { DataTypes, Op } from 'sequelize';
import sequelize from '../config/database.js';
import { logInfo, logError, logSecurity } from '../utils/logger.js';

const ThirdParty = sequelize.define('ThirdParty', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'compagnies',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('CUSTOMER', 'SUPPLIER', 'EMPLOYEE', 'OTHER'),
        allowNull: false,
        comment: 'Type de tiers: Client, Fournisseur, Employé, Autre'
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Code unique du tiers (ex: CLI-001, FOUR-002)'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nom ou raison sociale'
    },
    legalForm: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Forme juridique (SARL, SAS, SA, EI...)'
    },
    siret: {
        type: DataTypes.STRING(14),
        allowNull: true,
        comment: 'Numéro SIRET (14 chiffres)'
    },
    vatNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Numéro TVA intracommunautaire'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    mobile: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    fax: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Adresse
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    addressComplement: {
        type: DataTypes.STRING,
        allowNull: true
    },
    postalCode: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    country: {
        type: DataTypes.STRING(100),
        defaultValue: 'France'
    },
    // Coordonnées bancaires
    bankName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    iban: {
        type: DataTypes.STRING(34),
        allowNull: true,
        comment: 'IBAN (max 34 caractères)'
    },
    bic: {
        type: DataTypes.STRING(11),
        allowNull: true,
        comment: 'BIC/SWIFT (8 ou 11 caractères)'
    },
    // RIB France (optionnel si IBAN fourni)
    bankCode: {
        type: DataTypes.STRING(5),
        allowNull: true,
        comment: 'Code banque (5 chiffres)'
    },
    branchCode: {
        type: DataTypes.STRING(5),
        allowNull: true,
        comment: 'Code guichet (5 chiffres)'
    },
    accountNumber: {
        type: DataTypes.STRING(11),
        allowNull: true,
        comment: 'Numéro de compte (11 caractères)'
    },
    ribKey: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: 'Clé RIB (2 chiffres)'
    },
    // Conditions commerciales
    paymentTerms: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
        comment: 'Délai de paiement en jours'
    },
    paymentMethod: {
        type: DataTypes.ENUM('CASH', 'CHECK', 'TRANSFER', 'CARD', 'DIRECT_DEBIT', 'OTHER'),
        defaultValue: 'TRANSFER'
    },
    discountRate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        comment: 'Taux de remise en %'
    },
    creditLimit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Encours maximum autorisé'
    },
    // Informations complémentaires
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Tiers bloqué (dépassement encours, litige...)'
    },
    contactPerson: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nom du contact principal'
    },
    contactEmail: {
        type: DataTypes.STRING,
        allowNull: true
    },
    contactPhone: {
        type: DataTypes.STRING(20),
        allowNull: true
    }
}, {
    tableName: 'third_parties',
    timestamps: true,
    underscored: true,
    created_at: 'created_at',
    updated_at: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
        { fields: ['company_id'] },
        { fields: ['type'] },
        { fields: ['code', 'company_id'], unique: true },
        { fields: ['siret'], unique: true, where: { siret: { [Op.ne]: null } } },
        { fields: ['email'] },
        { fields: ['name'] }
    ],
    hooks: {
        beforeCreate: async (thirdParty, options) => {
            try {
                // 1️⃣ TYPE VALIDATION
                const validTypes = ['CUSTOMER', 'SUPPLIER', 'EMPLOYEE', 'OTHER'];
                if (!validTypes.includes(thirdParty.type)) {
                    throw new Error(`Invalid third-party type: ${thirdParty.type}`);
                }

                // 2️⃣ CODE GENERATION (if not provided)
                if (!thirdParty.code) {
                    const count = await ThirdParty.count({ where: { company_id: thirdParty.company_id } });
                    const typePrefix = thirdParty.type.substring(0, 3).toUpperCase();
                    thirdParty.code = `${typePrefix}-${String(count + 1).padStart(5, '0')}`;
                }

                // 3️⃣ NORMALIZATION
                thirdParty.code = thirdParty.code.toUpperCase().trim();
                thirdParty.name = thirdParty.name.trim();
                if (thirdParty.email) thirdParty.email = thirdParty.email.toLowerCase().trim();
                if (thirdParty.contactEmail) thirdParty.contactEmail = thirdParty.contactEmail.toLowerCase().trim();
                if (thirdParty.address) thirdParty.address = thirdParty.address.trim();
                if (thirdParty.city) thirdParty.city = thirdParty.city.trim();

                // 4️⃣ SIRET VALIDATION (14 digits if provided)
                if (thirdParty.siret) {
                    const cleanSiret = thirdParty.siret.replace(/\D/g, '');
                    if (cleanSiret.length !== 14) {
                        throw new Error('SIRET must be 14 digits');
                    }
                    thirdParty.siret = cleanSiret;
                }

                // 5️⃣ IBAN/BIC VALIDATION (if provided)
                if (thirdParty.iban) {
                    thirdParty.iban = thirdParty.iban.replace(/\s+/g, '').toUpperCase();
                    if (thirdParty.iban.length > 34) {
                        throw new Error('IBAN too long (max 34 characters)');
                    }
                }
                if (thirdParty.bic) {
                    thirdParty.bic = thirdParty.bic.replace(/\s+/g, '').toUpperCase();
                    if (![8, 11].includes(thirdParty.bic.length)) {
                        throw new Error('BIC must be 8 or 11 characters');
                    }
                }

                // 6️⃣ PAYMENT TERMS DEFAULT
                if (!thirdParty.paymentTerms || thirdParty.paymentTerms <= 0) {
                    thirdParty.paymentTerms = 30;
                }

                // 7️⃣ CREDIT LIMIT VALIDATION
                if (thirdParty.creditLimit && thirdParty.creditLimit < 0) {
                    throw new Error('Credit limit cannot be negative');
                }

                logInfo(`ThirdParty.beforeCreate: ${thirdParty.code} (${thirdParty.name}) prepared`);
                logSecurity(`Third party created: ${thirdParty.code} - ${thirdParty.name} (${thirdParty.type})`);
            } catch (error) {
                logError(`ThirdParty.beforeCreate error: ${error.message}`);
                throw error;
            }
        },

        beforeUpdate: async (thirdParty, options) => {
            try {
                // 1️⃣ PREVENT TYPE CHANGE
                if (thirdParty.changed('type')) {
                    throw new Error('Cannot change third-party type. Create a new record instead.');
                }

                // 2️⃣ NORMALIZATION (if changed)
                if (thirdParty.changed('name')) {
                    thirdParty.name = thirdParty.name.trim();
                }
                if (thirdParty.changed('email')) {
                    thirdParty.email = thirdParty.email.toLowerCase().trim();
                }
                if (thirdParty.changed('address')) {
                    thirdParty.address = thirdParty.address.trim();
                }

                // 3️⃣ SIRET VALIDATION (if changed)
                if (thirdParty.changed('siret') && thirdParty.siret) {
                    const cleanSiret = thirdParty.siret.replace(/\D/g, '');
                    if (cleanSiret.length !== 14) {
                        throw new Error('SIRET must be 14 digits');
                    }
                    thirdParty.siret = cleanSiret;
                }

                // 4️⃣ BLOCKED STATUS LOGGING
                if (thirdParty.changed('isBlocked')) {
                    const status = thirdParty.isBlocked ? 'BLOCKED' : 'UNBLOCKED';
                    logSecurity(`Third party ${status}: ${thirdParty.code}`);
                }

                logInfo(`ThirdParty.beforeUpdate: ${thirdParty.code} prepared for update`);
            } catch (error) {
                logError(`ThirdParty.beforeUpdate error: ${error.message}`);
                throw error;
            }
        },

        afterCreate: async (thirdParty, options) => {
            try {
                // AUDIT TRAIL
                if (options.sequelize) {
                    const { AuditTrail } = options.sequelize.models;
                    if (AuditTrail) {
                        await AuditTrail.create({
                            entityType: 'ThirdParty',
                            entityId: thirdParty.id,
                            action: 'CREATE',
                            changes: {
                                code: thirdParty.code,
                                type: thirdParty.type,
                                name: thirdParty.name
                            },
                            user_id: options.user_id,
                            ipAddress: options.ipAddress
                        });
                        logInfo(`ThirdParty.afterCreate: Audit trail for ${thirdParty.code}`);
                    }
                }
            } catch (error) {
                logError(`ThirdParty.afterCreate error: ${error.message}`);
            }
        }
    }
});

export default ThirdParty;
