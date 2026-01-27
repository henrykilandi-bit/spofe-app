// frontend/src/pages/FAQPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HelpCircle, ChevronDown, ChevronUp, Search, 
  Mail, Phone, MessageCircle, ArrowLeft, BookOpen,
  UserPlus, Shield, Clock, Star, CheckCircle
} from 'lucide-react';
import './FAQPage.css';

const FAQPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const categories = [
    {
      id: 'inscription',
      title: 'Inscription & Compte',
      icon: <UserPlus size={20} />,
      questions: [
        {
          q: 'Comment créer un compte SPOFE ?',
          a: 'Cliquez sur "Créer un compte" et remplissez le formulaire avec vos informations professionnelles. Le processus prend environ 10-15 minutes.'
        },
        {
          q: 'Quels documents sont nécessaires pour l\'inscription ?',
          a: 'Vous aurez besoin de votre email professionnel, informations personnelles, et selon votre rôle, de détails sur vos services ou entreprise.'
        },
        {
          q: 'Combien de temps prend la validation du compte ?',
          a: 'La validation prend généralement 24-48 heures maximum. Vous recevrez un email dès que votre compte sera validé.'
        },
        {
          q: 'Puis-je changer mon rôle après inscription ?',
          a: 'Oui, vous pouvez demander un changement de rôle en contactant le support. Cela nécessitera une nouvelle validation.'
        }
      ]
    },
    {
      id: 'roles',
      title: 'Rôles & Permissions',
      icon: <Shield size={20} />,
      questions: [
        {
          q: 'Quelle est la différence entre Consultant et Super Consultant ?',
          a: 'Le Super Consultant a accès à des fonctionnalités avancées, peut mentorner d\'autres consultants et bénéficie d\'une visibilité prioritaire.'
        },
        {
          q: 'Qui peut devenir Super Utilisateur ?',
          a: 'Les Super Utilisateurs sont généralement des responsables d\'équipe ou des administrateurs ayant besoin de gérer plusieurs comptes.'
        },
        {
          q: 'Puis-je avoir plusieurs rôles ?',
          a: 'Non, chaque utilisateur a un rôle principal. Cependant, vous pouvez évoluer vers un rôle supérieur avec l\'expérience.'
        },
        {
          q: 'Comment devenir consultant certifié ?',
          a: 'Après inscription en tant que consultant, vous devez compléter votre profil, ajouter vos spécialités et passer par le processus de certification.'
        }
      ]
    },
    {
      id: 'technique',
      title: 'Support Technique',
      icon: <HelpCircle size={20} />,
      questions: [
        {
          q: 'J\'ai oublié mon mot de passe, comment faire ?',
          a: 'Cliquez sur "Mot de passe oublié" sur la page de connexion. Vous recevrez un email pour réinitialiser votre mot de passe.'
        },
        {
          q: 'Pourquoi ne puis-je pas me connecter ?',
          a: 'Vérifiez que votre email et mot de passe sont corrects. Assurez-vous que votre compte est validé. Si le problème persiste, contactez le support.'
        },
        {
          q: 'Comment mettre à jour mes informations personnelles ?',
          a: 'Connectez-vous à votre compte, allez dans "Mon Profil" et cliquez sur "Modifier". Sauvegardez vos changements.'
        },
        {
          q: 'Le site est lent, que faire ?',
          a: 'Essayez de vider le cache de votre navigateur, vérifiez votre connexion internet, ou essayez un autre navigateur.'
        }
      ]
    },
    {
      id: 'facturation',
      title: 'Tarifs & Facturation',
      icon: <Star size={20} />,
      questions: [
        {
          q: 'Combien coûte l\'inscription ?',
          a: 'L\'inscription est gratuite. Vous ne payez que lorsque vous utilisez des services premium ou selon votre abonnement.'
        },
        {
          q: 'Comment les consultants sont-ils payés ?',
          a: 'Les consultants définissent leurs tarifs horaires et reçoivent 80% du montant, les 20% restants couvrent les frais de plateforme.'
        },
        {
          q: 'Quels modes de paiement sont acceptés ?',
          a: 'Nous acceptons les cartes bancaires, virements bancaires, et mobile money selon votre pays.'
        },
        {
          q: 'Puis-je obtenir un remboursement ?',
          a: 'Les remboursements sont possibles sous conditions. Contactez le support dans les 14 jours suivant la transaction.'
        }
      ]
    },
    {
      id: 'securite',
      title: 'Sécurité & Confidentialité',
      icon: <Shield size={20} />,
      questions: [
        {
          q: 'Mes données sont-elles sécurisées ?',
          a: 'Oui, toutes vos données sont chiffrées avec SSL et stockées sur des serveurs sécurisés conformes au RGPD.'
        },
        {
          q: 'Qui peut voir mes informations ?',
          a: 'Seules les personnes autorisées peuvent voir vos informations. Vous contrôlez la visibilité de votre profil.'
        },
        {
          q: 'Comment supprimer mon compte ?',
          a: 'Contactez le support pour demander la suppression de votre compte. Vos données seront supprimées dans les 30 jours.'
        },
        {
          q: 'SPOFE partage-t-il mes données avec des tiers ?',
          a: 'Non, nous ne partageons jamais vos données personnelles avec des tiers sans votre consentement explicite.'
        }
      ]
    }
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const getQuestionId = (categoryIndex, questionIndex) => `${categoryIndex}-${questionIndex}`;

  return (
    <div className="faq-container">
      {/* Header */}
      <header className="faq-header">
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
              <HelpCircle size={32} />
            </div>
            <div>
              <h1>Questions Fréquentes</h1>
              <p>Trouvez des réponses à vos questions sur SPOFE</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="faq-main">
        {/* Quick Links */}
        <section className="quick-links-section">
          <div className="quick-links-grid">
            <Link to="/guide" className="quick-link-card">
              <BookOpen size={24} />
              <h3>Guide d'inscription</h3>
              <p>Guide complet pour créer votre compte</p>
            </Link>
            
            <Link to="/register-extended" className="quick-link-card">
              <UserPlus size={24} />
              <h3>S'inscrire</h3>
              <p>Commencer votre inscription maintenant</p>
            </Link>
            
            <a href="mailto:support@spofe.sn" className="quick-link-card">
              <Mail size={24} />
              <h3>Contact support</h3>
              <p>support@spofe.sn</p>
            </a>
            
            <a href="tel:+243815170980" className="quick-link-card">
              <Phone size={24} />
              <h3>Appel téléphonique</h3>
              <p>+243 81 517 09 80</p>
            </a>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="faq-categories">
          <h2>Questions par Catégorie</h2>
          <div className="categories-list">
            {filteredCategories.map((category, categoryIndex) => (
              <div key={category.id} className="category-card">
                <button
                  className="category-header"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="category-title">
                    <span className="category-icon">{category.icon}</span>
                    <h3>{category.title}</h3>
                    <span className="question-count">
                      ({category.questions.length} questions)
                    </span>
                  </div>
                  {expandedCategory === category.id ? 
                    <ChevronUp size={20} /> : 
                    <ChevronDown size={20} />
                  }
                </button>
                
                {expandedCategory === category.id && (
                  <div className="category-questions">
                    {category.questions.map((question, questionIndex) => {
                      const questionId = getQuestionId(categoryIndex, questionIndex);
                      return (
                        <div key={questionId} className="question-item">
                          <button
                            className="question-button"
                            onClick={() => toggleQuestion(questionId)}
                          >
                            <h4>{question.q}</h4>
                            {expandedQuestion === questionId ? 
                              <ChevronUp size={18} /> : 
                              <ChevronDown size={18} />
                            }
                          </button>
                          
                          {expandedQuestion === questionId && (
                            <div className="answer-content">
                              <p>{question.a}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* No Results */}
        {filteredCategories.length === 0 && (
          <section className="no-results">
            <div className="no-results-card">
              <HelpCircle size={48} />
              <h3>Aucun résultat trouvé</h3>
              <p>Essayez avec d'autres mots-clés ou contactez notre support.</p>
              <div className="no-results-actions">
                <button 
                  onClick={() => setSearchTerm('')}
                  className="btn btn-secondary"
                >
                  Effacer la recherche
                </button>
                <a href="mailto:support@spofe.sn" className="btn btn-primary">
                  <MessageCircle size={16} />
                  Contacter le support
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Popular Questions */}
        <section className="popular-questions">
          <h2>Questions Populaires</h2>
          <div className="popular-grid">
            <div className="popular-card">
              <CheckCircle size={20} className="popular-icon" />
              <h3>Comment créer un compte ?</h3>
              <p>Le processus d'inscription simple en 4 étapes</p>
              <Link to="/guide" className="popular-link">Voir le guide →</Link>
            </div>
            
            <div className="popular-card">
              <Clock size={20} className="popular-icon" />
              <h3>Temps de validation ?</h3>
              <p>Généralement 24-48 heures maximum</p>
              <button className="popular-link">En savoir plus →</button>
            </div>
            
            <div className="popular-card">
              <Shield size={20} className="popular-icon" />
              <h3>Sécurité des données ?</h3>
              <p>Chiffrement SSL et conformité RGPD</p>
              <button className="popular-link">En savoir plus →</button>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="contact-section">
          <div className="contact-card">
            <h2>Toujours besoin d'aide ?</h2>
            <p>Notre équipe de support est disponible pour vous aider</p>
            <div className="contact-methods">
              <a href="mailto:support@spofe.sn" className="contact-method">
                <Mail size={24} />
                <div>
                  <h3>Email</h3>
                  <p>support@spofe.sn</p>
                  <span>Réponse sous 24h</span>
                </div>
              </a>
              
              <a href="tel:+243815170980" className="contact-method">
                <Phone size={24} />
                <div>
                  <h3>Téléphone</h3>
                  <p>+243 81 517 09 80</p>
                  <span>Lun-Ven 9h-18h</span>
                </div>
              </a>
              
              <a href="#" className="contact-method">
                <MessageCircle size={24} />
                <div>
                  <h3>Chat en direct</h3>
                  <p>Disponible maintenant</p>
                  <span>Réponse immédiate</span>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="faq-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Liens utiles</h3>
            <div className="footer-links">
              <Link to="/guide">Guide d'inscription</Link>
              <Link to="/register-extended">S'inscrire</Link>
              <Link to="/about">À propos</Link>
              <Link to="/support">Support</Link>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Contact</h3>
            <div className="contact-info">
              <a href="mailto:support@spofe.sn">support@spofe.sn</a>
              <a href="tel:+243815170980">+243 81 517 09 80</a>
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

export default FAQPage;
