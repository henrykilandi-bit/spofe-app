// frontend/src/pages/GuideInscription.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, UserPlus, Shield, CheckCircle, 
  ArrowLeft, Clock, Users, FileText,
  Mail, Phone, MessageCircle, Star
} from 'lucide-react';
import './GuideInscription.css';

const GuideInscription = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: <UserPlus size={24} />,
      title: "1. Création du compte",
      description: "Remplissez le formulaire avec vos informations personnelles",
      details: [
        "Email professionnel valide",
        "Mot de passe sécurisé (8+ caractères)",
        "Nom et prénom complets",
        "Numéro de téléphone"
      ]
    },
    {
      icon: <Users size={24} />,
      title: "2. Choix du rôle",
      description: "Sélectionnez le rôle qui correspond à votre profil",
      details: [
        "Utilisateur : Accès aux fonctionnalités de base",
        "Consultant : Services professionnels",
        "Super Consultant : Expertise avancée",
        "Super Utilisateur : Gestion d'équipe"
      ]
    },
    {
      icon: <FileText size={24} />,
      title: "3. Informations professionnelles",
      description: "Complétez les détails spécifiques à votre rôle",
      details: [
        "Spécialités et domaines d'expertise",
        "Expérience professionnelle",
        "Tarifs et disponibilités (consultants)",
        "Informations sur l'entreprise"
      ]
    },
    {
      icon: <CheckCircle size={24} />,
      title: "4. Validation",
      description: "Soumettez votre inscription et attendez la validation",
      details: [
        "Révision par l'équipe SPOFE",
        "Délai de 24-48h maximum",
        "Email de confirmation",
        "Accès immédiat après validation"
      ]
    }
  ];

  const tips = [
    {
      icon: <Shield size={20} />,
      title: "Sécurité",
      content: "Vos données sont protégées par chiffrement SSL et ne sont jamais partagées"
    },
    {
      icon: <Clock size={20} />,
      title: "Temps d'inscription",
      content: "Le processus complet prend environ 10-15 minutes"
    },
    {
      icon: <Star size={20} />,
      title: "Conseils",
      content: "Utilisez un email professionnel pour une validation plus rapide"
    }
  ];

  return (
    <div className="guide-container">
      {/* Header */}
      <header className="guide-header">
        <div className="header-content">
          <button 
            onClick={() => navigate(-1)} 
            className="back-button"
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          
          <div className="header-text">
            <div className="header-icon">
              <BookOpen size={32} />
            </div>
            <div>
              <h1>Guide d'Inscription</h1>
              <p>Suivez ce guide pour créer votre compte SPOFE facilement</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="guide-main">
        {/* Introduction */}
        <section className="intro-section">
          <div className="intro-card">
            <h2>Bienvenue sur SPOFE !</h2>
            <p>
              Ce guide vous accompagnera à travers chaque étape du processus d'inscription. 
              Suivez les instructions attentivement pour créer votre compte en toute simplicité.
            </p>
            <div className="quick-stats">
              <div className="stat">
                <span className="stat-number">4</span>
                <span className="stat-label">Étapes simples</span>
              </div>
              <div className="stat">
                <span className="stat-number">10-15</span>
                <span className="stat-label">Minutes</span>
              </div>
              <div className="stat">
                <span className="stat-number">24-48h</span>
                <span className="stat-label">Validation</span>
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="steps-section">
          <h2>Étapes d'Inscription</h2>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-header">
                  <div className="step-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                </div>
                <p className="step-description">{step.description}</p>
                <ul className="step-details">
                  {step.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="tips-section">
          <h2>Conseils Utiles</h2>
          <div className="tips-grid">
            {tips.map((tip, index) => (
              <div key={index} className="tip-card">
                <div className="tip-icon">{tip.icon}</div>
                <h3>{tip.title}</h3>
                <p>{tip.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Roles Details */}
        <section className="roles-section">
          <h2>Détails des Rôles</h2>
          <div className="roles-grid">
            <div className="role-card">
              <h3>👤 Utilisateur</h3>
              <p>Accès aux fonctionnalités de base de SPOFE</p>
              <ul>
                <li>Gestion de profil</li>
                <li>Accès aux tableaux de bord</li>
                <li>Participation aux groupes</li>
              </ul>
            </div>
            
            <div className="role-card">
              <h3>💼 Consultant</h3>
              <p>Proposition de services professionnels</p>
              <ul>
                <li>Création de profil consultant</li>
                <li>Définition des tarifs</li>
                <li>Gestion des missions</li>
              </ul>
            </div>
            
            <div className="role-card">
              <h3>⭐ Super Consultant</h3>
              <p>Expertise avancée et mentorat</p>
              <ul>
                <li>Toutes les fonctionnalités consultant</li>
                <li>Mentorat d'autres consultants</li>
                <li>Accès prioritaire</li>
              </ul>
            </div>
            
            <div className="role-card">
              <h3>👥 Super Utilisateur</h3>
              <p>Gestion d'équipe et administration</p>
              <ul>
                <li>Gestion d'équipe</li>
                <li>Validation d'inscriptions</li>
                <li>Accès administratifs</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-card">
            <h2>Prêt à commencer ?</h2>
            <p>Maintenant que vous comprenez le processus, créons votre compte !</p>
            <div className="cta-buttons">
              <Link to="/register-extended" className="btn btn-primary">
                <UserPlus size={20} />
                Commencer l'inscription
              </Link>
              <Link to="/faq" className="btn btn-secondary">
                <MessageCircle size={20} />
                Questions fréquentes
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="guide-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Besoin d'aide ?</h3>
            <div className="contact-links">
              <a href="mailto:support@spofe.sn" className="contact-link">
                <Mail size={16} />
                support@spofe.sn
              </a>
              <a href="tel:+243815170980" className="contact-link">
                <Phone size={16} />
                +243 81 517 09 80
              </a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Liens utiles</h3>
            <div className="footer-links">
              <Link to="/faq">FAQ</Link>
              <Link to="/support">Support</Link>
              <Link to="/about">À propos</Link>
            </div>
          </div>
          
          <div className="footer-section">
            <p className="copyright">
              © 2026 SPOFE v2.1 - Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GuideInscription;
