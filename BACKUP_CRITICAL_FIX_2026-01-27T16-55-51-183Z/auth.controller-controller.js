// src/controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config/config.js';
import { User, GroupeEntreprise, Compagnie } from '../models/index.js';
import logger from '../utils/logger.js';
import redisClient from '../config/redis.js';
import { resetLoginAttempts } from '../middleware/rateLimit.middleware.js';
import { success, error, unauthorized, badRequest, notFound } from '../utils/response.js';
import RoleApprovalService from '../services/roleApprovalService.js';

// Générer un token JWT
const generateToken = (user) => {
    console.log('🔐 Génération token avec secret:', config.jwt.secret);
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );
    console.log('✅ Token généré:', token.substring(0, 50) + '...');
    return token;
};

// Générer un refresh token
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn }
    );
};

// Enregistrement d'un nouvel utilisateur avec workflow multi-groupes
export const register = async (req, res, next) => {
    try {
        const { 
            username, 
            email, 
            password, 
            prenom, 
            nom, 
            telephone,
            role = 'utilisateur',
            // Champs pour Super Utilisateur
            groupeName,
            groupeDescription,
            groupeSiret,
            groupeAdresse,
            groupeEmail,
            groupeTelephone,
            groupeWebsite,
            // Champs pour Utilisateur
            groupe_id,
            compagnieName,
            compagnieSiret,
            compagnieDescription,
            compagnieEmail,
            compagnieTelephone,
            compagnieAdresse,
            compagnieWebsite,
            // Champs pour Consultant
            specialites,
            tarifHoraire,
            experienceYears,
            siret,
            contractTypes,
            registrationType,
            firmType,
            firmName,
            firmSiret,
            firmDescription,
            // Invitation
            invitationToken
        } = req.body;

        // Vérifier si l'email existe déjà
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return badRequest(res, 'Inscription échouée', { 
                email: 'Cet email est déjà utilisé' 
            });
        }

        // Vérifier si le nom d'utilisateur existe déjà
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return badRequest(res, 'Inscription échouée', { 
                username: 'Ce nom d\'utilisateur est déjà pris' 
            });
        }

        // Vérifier si une approbation est requise pour ce rôle
        const approvalResult = await RoleApprovalService.createApprovalRequest(
            {
                email,
                username,
                prenom,
                nom,
                telephone,
                role
            },
            {
                // Données supplémentaires selon le rôle
                groupeName,
                groupeDescription,
                groupeSiret,
                groupeAdresse,
                groupeEmail,
                groupeTelephone,
                groupeWebsite,
                groupe_id,
                compagnieName,
                compagnieSiret,
                compagnieDescription,
                compagnieEmail,
                compagnieTelephone,
                compagnieAdresse,
                compagnieWebsite,
                specialites,
                tarifHoraire,
                experienceYears,
                siret,
                contractTypes,
                registrationType,
                firmType,
                firmName,
                firmSiret,
                firmDescription,
                invitationToken,
                password // Inclure le mot de passe pour la création après approbation
            }
        );

        if (!approvalResult.success) {
            return badRequest(res, approvalResult.message || 'Erreur lors de la création de la demande d\'approbation');
        }

        // Si aucune approbation n'est requise, créer l'utilisateur directement
        if (!approvalResult.requiresApproval) {
            // Hacher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            // Déterminer le rôle final : utiliser le rôle demandé ou par défaut 'utilisateur'
            // Ce rôle ne s'applique que si aucune approbation n'est requise
            const finalRole = role || 'utilisateur';

            // Créer l'utilisateur
            const user = await User.create({
                username,
                email,
                password: hashedPassword,
                prenom,
                nom,
                telephone,
                role: finalRole,
                is_active: true,
                // Champs consultant si fournis
                ...(specialites && { specialites }),
                ...(tarifHoraire && { tarif_horaire: tarifHoraire }),
                ...(experienceYears && { experience_years: experienceYears }),
                ...(siret && { siret }),
                // Champ groupe si fourni
                ...(groupe_id && { groupe_id: groupe_id })
            });

            // Générer les tokens
            const token = generateToken(user);
            const refreshToken = generateRefreshToken(user);
            
            // Ne pas renvoyer le mot de passe dans la réponse
            const userResponse = user.get({ plain: true });
            delete userResponse.password;

            logger.logInfo('Nouvel utilisateur enregistré sans approbation', { user_id: user.id, email, role });

            return success(res, {
                user: userResponse,
                token,
                refreshToken,
                requiresApproval: false
            }, 201, 'Utilisateur enregistré avec succès');
        }

        // Si une approbation est requise
        logger.logInfo('Demande d\'approbation créée', { 
            email, 
            role, 
            requestId: approvalResult.requestId 
        });

        return success(res, {
            requiresApproval: true,
            requestId: approvalResult.requestId,
            message: 'Votre demande d\'inscription a été soumise pour approbation'
        }, 201, 'Demande d\'inscription soumise avec succès');

    } catch (error) {
        logger.logError('Erreur lors de l\'inscription', { error: error.message });
        next(error);
    }
};

// Connexion de l'utilisateur
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe (en incluant le mot de passe qui est normalement exclu par défaut)
        const user = await User.scope('withPassword').findOne({ where: { email } });
        if (!user || !user.is_active) {
            logger.logSecurity('Tentative de connexion avec email inexistant', { email });
            return unauthorized(res, 'Email ou mot de passe incorrect');
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.logSecurity('Tentative de connexion avec mauvais mot de passe', { email });
            return unauthorized(res, 'Email ou mot de passe incorrect');
        }

        // Réinitialiser les tentatives de connexion réussies
        try {
            await resetLoginAttempts(email);
        } catch (err) {
            logger.logError('Erreur lors de la réinitialisation des tentatives', { email });
            // Continuer même si le reset échoue
        }

        // Générer les tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        // Ne pas renvoyer le mot de passe dans la réponse
        const userResponse = user.get({ plain: true });
        delete userResponse.password;

        logger.logInfo('Utilisateur connecté avec succès', { user_id: user.id, email });

        success(res, {
            user: userResponse,
            token,
            refreshToken
        }, 200, 'Connexion réussie');

    } catch (error) {
        logger.logError('Erreur lors de la connexion', { error: error.message });
        next(error);
    }
};

// Rafraîchir le token
export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return unauthorized(res, 'Refresh token requis');
        }

        // Vérifier le refresh token
        const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

        // Récupérer l'utilisateur
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return unauthorized(res, 'Utilisateur non trouvé');
        }

        // Générer un nouveau token
        const token = generateToken(user);

        success(res, { token }, 200, 'Token rafraîchi avec succès');

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return unauthorized(res, 'Refresh token invalide');
        }
        logger.logError('Erreur lors du rafraîchissement du token', { error: error.message });
        next(error);
    }
};

// Déconnexion
export const logout = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            try {
                const decoded = jwt.decode(token);
                if (decoded && decoded.exp) {
                    const expiresAt = new Date(decoded.exp * 1000);
                    const now = new Date();
                    const ttl = Math.ceil((expiresAt - now) / 1000);

                    if (ttl > 0) {
                        // Ajouter le token à la liste noire avec une expiration
                        await redisClient.set(`blacklist_${token}`, 'true', 'EX', ttl);
                        logger.info('Token ajouté à la liste noire');
                    }
                }
            } catch (error) {
                logger.warn('Erreur lors du décodage du token:', error);
            }
        }

        success(res, null, 200, 'Déconnexion réussie');
    } catch (error) {
        logger.error('Erreur lors de la déconnexion:', error);
        next(error);
    }
};

// Demander la réinitialisation du mot de passe
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Pour la sécurité, ne pas révéler si l'email existe ou non
        const user = await User.findOne({ where: { email } });

        if (user) {
            // Générer un token de réinitialisation (2 heures d'expiration)
            const resetToken = jwt.sign(
                { id: user.id, email: user.email, type: 'password-reset' },
                config.jwt.secret,
                { expiresIn: '2h' }
            );

            // Stocker le token dans Redis avec une expiration
            const resetKey = `password_reset_${user.id}`;
            await redisClient.set(resetKey, resetToken, 'EX', 7200); // 2 heures

            // Log pour audit (en production, envoyer un email)
            logger.info(`Reset password token generated for user ${user.id}`);
            
            // TODO: Envoyer l'email avec le lien de réinitialisation
            // const resetLink = `${config.apiBaseUrl}/reset-password?token=${resetToken}`;
            // await sendEmail(user.email, 'Réinitialisation du mot de passe', ...);
        }

        // Toujours retourner le même message pour la sécurité
        success(res, null, 200, 'Si cet email est enregistré, vous recevrez les instructions de réinitialisation du mot de passe.');

    } catch (error) {
        logger.error('Erreur lors de la demande de réinitialisation:', error);
        next(error);
    }
};

// Réinitialiser le mot de passe
export const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return badRequest(res, 'Le token et le nouveau mot de passe sont requis');
        }

        // Vérifier le token JWT
        let decoded;
        try {
            decoded = jwt.verify(token, config.jwt.secret);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return badRequest(res, 'Le lien de réinitialisation a expiré. Demandez une nouvelle réinitialisation.');
            }
            return badRequest(res, 'Token invalide');
        }

        // Vérifier que c'est bien un token de réinitialisation
        if (decoded.type !== 'password-reset') {
            return badRequest(res, 'Token invalide');
        }

        // Vérifier le token dans Redis (pour s'assurer qu'il n'a pas été révoqué)
        const resetKey = `password_reset_${decoded.id}`;
        const storedToken = await redisClient.get(resetKey);
        
        if (storedToken !== token) {
            return badRequest(res, 'Token invalide ou expiré');
        }

        // Récupérer l'utilisateur
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return notFound(res, 'Utilisateur non trouvé');
        }

        // Hacher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe
        await user.update({ password: hashedPassword });

        // Supprimer le token de Redis
        await redisClient.del(resetKey);

        // Blacklister tous les tokens actifs de l'utilisateur pour le reconnecter
        logger.logInfo('Mot de passe réinitialisé', { user_id: user.id });

        success(res, null, 200, 'Mot de passe réinitialisé avec succès. Veuillez vous reconnecter.');

    } catch (error) {
        logger.error('Erreur lors de la réinitialisation du mot de passe:', error);
        next(error);
    }
};

/**
 * Vérifier si un email est disponible (pour RegisterPage)
 * GET /api/auth/check-email/:email
 */
export const checkEmailAvailability = async (req, res, next) => {
    try {
        const { email } = req.params;

        if (!email || !email.includes('@')) {
            return badRequest(res, 'Email invalide');
        }

        // Use raw query to avoid model attribute mapping issues
        const result = await User.sequelize.query(
            'SELECT COUNT(*) as count FROM users WHERE email = ? AND deleted_at IS NULL',
            { replacements: [email.toLowerCase()], type: 'SELECT' }
        );

        const count = result[0].count;
        success(res, { available: count === 0 }, 200);
    } catch (error) {
        logger.error('Erreur vérification email:', error);
        next(error);
    }
};

/**
 * Vérifier si un username est disponible (pour RegisterPage)
 * GET /api/auth/check-username/:username
 */
export const checkUsernameAvailability = async (req, res, next) => {
    try {
        const { username } = req.params;

        if (!username || username.length < 3) {
            return badRequest(res, 'Nom d\'utilisateur invalide (minimum 3 caractères)');
        }

        // Use raw query to avoid model attribute mapping issues
        const result = await User.sequelize.query(
            'SELECT COUNT(*) as count FROM users WHERE username = ? AND deleted_at IS NULL',
            { replacements: [username.toLowerCase()], type: 'SELECT' }
        );

        const count = result[0].count;
        success(res, { available: count === 0 }, 200);
    } catch (error) {
        logger.error('Erreur vérification username:', error);
        next(error);
    }
};
