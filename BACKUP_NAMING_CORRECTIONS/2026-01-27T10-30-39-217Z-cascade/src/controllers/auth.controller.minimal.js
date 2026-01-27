// src/controllers/auth.controller.js - VERSION MINIMALE POUR TEST
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';

// Configuration simple
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-minimal-for-testing';
const JWT_EXPIRES_IN = '1h';

// Générer un token JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// Enregistrement d'un nouvel utilisateur
export const register = async (req, res) => {
    try {
        const { 
            username, 
            email, 
            password, 
            prenom, 
            nom, 
            telephone,
            role = 'utilisateur',
            adresse,
            pays,
            specialites,
            tarif_horaire,
            experience_years,
            type_consultant,
            groupeId,
            invitationToken
        } = req.body;

        console.log('📝 Tentative d\'inscription:', { email, username, role });

        // Vérifier si l'email existe déjà
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Cet email est déjà utilisé'
            });
        }

        // Vérifier si le nom d'utilisateur existe déjà
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'Ce nom d\'utilisateur est déjà pris'
            });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur avec tous les champs
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            prenom,
            nom,
            telephone,
            role,
            isActive: true,
            // Champs additionnels pour consultants
            ...(adresse && { adresse }),
            ...(pays && { pays }),
            ...(specialites && { specialites }),
            ...(tarif_horaire && { tarif_horaire: parseFloat(tarif_horaire) }),
            ...(experience_years && { experience_years: parseInt(experience_years) }),
            ...(type_consultant && { type_consultant }),
            ...(groupeId && { groupeId: parseInt(groupeId) }),
            ...(invitationToken && { invitationToken })
        });

        // Générer le token
        const token = generateToken(user);

        // Ne pas renvoyer le mot de passe dans la réponse
        const userResponse = user.get({ plain: true });
        delete userResponse.password;

        console.log('✅ Utilisateur créé avec succès:', { id: user.id, email, role });

        return res.status(201).json({
            success: true,
            data: {
                user: userResponse,
                token,
                requiresApproval: false
            },
            message: 'Utilisateur enregistré avec succès'
        });

    } catch (error) {
        console.error('❌ Erreur lors de l\'inscription:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'inscription',
            error: error.message
        });
    }
};

// Connexion de l'utilisateur
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('🔐 Tentative de connexion:', { email });

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ where: { email } });
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Générer les tokens
        const token = generateToken(user);

        // Ne pas renvoyer le mot de passe dans la réponse
        const userResponse = user.get({ plain: true });
        delete userResponse.password;

        console.log('✅ Connexion réussie:', { id: user.id, email, role });

        return res.status(200).json({
            success: true,
            data: {
                user: userResponse,
                token
            },
            message: 'Connexion réussie'
        });

    } catch (error) {
        console.error('❌ Erreur lors de la connexion:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion',
            error: error.message
        });
    }
};
