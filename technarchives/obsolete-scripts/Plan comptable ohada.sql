/* =========================================================
   INTÉGRATION PLAN COMPTABLE SYSCOHADA SIMPLIFIÉ
   Version compatible avec SPOFE v2.1
   ========================================================= */

-- Suppression des comptes existants (si nécessaire)
-- TRUNCATE TABLE comptes;

-- Variables pour stocker les IDs des comptes parents
SET @classe1 = NULL, @classe2 = NULL, @classe3 = NULL, @classe4 = NULL;
SET @classe5 = NULL, @classe6 = NULL, @classe7 = NULL, @classe8 = NULL, @classe9 = NULL;

-- Désactivation temporaire des contraintes
SET FOREIGN_KEY_CHECKS = 0;

/* =========================================================
   1. COMPTES DE RESSOURCES DURABLES (simplifié)
   ========================================================= */

-- CLASSE 1 : CAPITAUX (ressources durables)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) 
VALUES ('1', 'COMPTES DE RESSOURCES DURABLES', 'PASSIF', NULL, 1, TRUE);
SET @classe1 = LAST_INSERT_ID();

-- Capital
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) VALUES
    ('10', 'Capital', 'PASSIF', @classe1, 2, TRUE);
SET @c10 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('101', 'Capital social', 'PASSIF', @c10, 3),
    ('104', 'Compte de l\'exploitant', 'PASSIF', @c10, 3),
    ('105', 'Primes liées au capital', 'PASSIF', @c10, 3);

-- Réserves
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) VALUES
    ('11', 'Réserves', 'PASSIF', @classe1, 2, TRUE);
SET @c11 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('111', 'Réserve légale', 'PASSIF', @c11, 3),
    ('118', 'Autres réserves', 'PASSIF', @c11, 3);

-- Report à nouveau
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('12', 'Report à nouveau', 'PASSIF', @classe1, 2);

-- Résultat net
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) VALUES
    ('13', 'Résultat net', 'PASSIF', @classe1, 2, TRUE);
SET @c13 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('131', 'Résultat net : Bénéfice', 'PASSIF', @c13, 3),
    ('139', 'Résultat net : Perte', 'ACTIF', @c13, 3);

-- Subventions d'investissement
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('14', 'Subventions d\'investissement', 'PASSIF', @classe1, 2);

-- Emprunts et dettes
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) VALUES
    ('16', 'Emprunts et dettes', 'PASSIF', @classe1, 2, TRUE);
SET @c16 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('162', 'Emprunts auprès des établissements de crédit', 'PASSIF', @c16, 3),
    ('164', 'Comptes courants bloqués', 'PASSIF', @c16, 3),
    ('168', 'Autres emprunts et dettes', 'PASSIF', @c16, 3);

-- Provisions pour risques et charges
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('19', 'Provisions pour risques et charges', 'PASSIF', @classe1, 2);

/* =========================================================
   2. COMPTES D'ACTIF IMMOBILISE (simplifié)
   ========================================================= */

-- CLASSE 2 : IMMOBILISATIONS
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) 
VALUES ('2', 'ACTIF IMMOBILISE', 'ACTIF', NULL, 1, TRUE);
SET @classe2 = LAST_INSERT_ID();

-- Immobilisations incorporelles
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) VALUES
    ('21', 'Immobilisations incorporelles', 'ACTIF', @classe2, 2, TRUE);
SET @c21 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('211', 'Frais de développement', 'ACTIF', @c21, 3),
    ('212', 'Brevet, licences, concessions', 'ACTIF', @c21, 3),
    ('213', 'Logiciels et sites internet', 'ACTIF', @c21, 3),
    ('215', 'Fonds commercial', 'ACTIF', @c21, 3);

-- Terrains
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('22', 'Terrains', 'ACTIF', @classe2, 2);

-- Bâtiments
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) VALUES
    ('23', 'Bâtiments et installations', 'ACTIF', @classe2, 2, TRUE);
SET @c23 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('231', 'Bâtiments industriels, commerciaux', 'ACTIF', @c23, 3),
    ('234', 'Aménagements et installations techniques', 'ACTIF', @c23, 3);

-- Matériel
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) VALUES
    ('24', 'Matériel et mobilier', 'ACTIF', @classe2, 2, TRUE);
SET @c24 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('241', 'Matériel industriel et commercial', 'ACTIF', @c24, 3),
    ('244', 'Matériel et mobilier de bureau', 'ACTIF', @c24, 3),
    ('245', 'Matériel de transport', 'ACTIF', @c24, 3);

-- Titres de participation
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('26', 'Titres de participation', 'ACTIF', @classe2, 2);

-- Autres immobilisations financières
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('27', 'Autres immobilisations financières', 'ACTIF', @classe2, 2);

-- Amortissements (simplifié)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) VALUES
    ('28', 'Amortissements', 'ACTIF', @classe2, 2, TRUE);
SET @c28 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('281', 'Amortissements immobilisations incorporelles', 'ACTIF', @c28, 3),
    ('283', 'Amortissements bâtiments', 'ACTIF', @c28, 3),
    ('284', 'Amortissements matériel', 'ACTIF', @c28, 3);

-- Dépréciations (simplifié)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('29', 'Dépréciations', 'ACTIF', @classe2, 2);

/* =========================================================
   3. COMPTES DE STOCKS (simplifié)
   ========================================================= */

-- CLASSE 3 : STOCKS
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) 
VALUES ('3', 'STOCKS', 'ACTIF', NULL, 1, TRUE);
SET @classe3 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('31', 'Marchandises', 'ACTIF', @classe3, 2),
    ('32', 'Matières premières', 'ACTIF', @classe3, 2),
    ('33', 'Autres approvisionnements', 'ACTIF', @classe3, 2),
    ('35', 'Services en cours', 'ACTIF', @classe3, 2),
    ('36', 'Produits finis', 'ACTIF', @classe3, 2),
    ('37', 'Produits intermédiaires et résiduels', 'ACTIF', @classe3, 2);

/* =========================================================
   4. COMPTES DE TIERS (enrichi)
   ========================================================= */

-- CLASSE 4 : TIERS
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) 
VALUES ('4', 'COMPTES DE TIERS', 'ACTIF', NULL, 1, TRUE);
SET @classe4 = LAST_INSERT_ID();

-- Fournisseurs (enrichi)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur, est_lettrable) VALUES
    ('40', 'Fournisseurs', 'PASSIF', @classe4, 2, TRUE, TRUE);
SET @c40 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_lettrable) VALUES
    ('401', 'Fournisseurs - achats courants', 'PASSIF', @c40, 3, TRUE),
    ('4012', 'Fournisseurs - Groupe', 'PASSIF', @c40, 4, TRUE),
    ('408', 'Fournisseurs - factures non parvenues', 'PASSIF', @c40, 3, FALSE);

-- Clients (enrichi)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur, est_lettrable) VALUES
    ('41', 'Clients', 'ACTIF', @classe4, 2, TRUE, TRUE);
SET @c41 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_lettrable) VALUES
    ('411', 'Clients - ventes courantes', 'ACTIF', @c41, 3, TRUE),
    ('4112', 'Clients - Groupe', 'ACTIF', @c41, 4, TRUE),
    ('4114', 'Clients - État et collectivités', 'ACTIF', @c41, 4, TRUE),
    ('416', 'Clients douteux', 'ACTIF', @c41, 3, TRUE),
    ('418', 'Clients - produits à recevoir', 'ACTIF', @c41, 3, FALSE);

-- Personnel
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('42', 'Personnel', 'PASSIF', @classe4, 2);

-- Organismes sociaux
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('43', 'Organismes sociaux', 'PASSIF', @classe4, 2);

-- État et collectivités (TVA enrichie)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) VALUES
    ('44', 'État et collectivités', 'PASSIF', @classe4, 2, TRUE);
SET @c44 = LAST_INSERT_ID();

-- TVA détaillée selon SYSCOHADA
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('443', 'TVA facturée', 'PASSIF', @c44, 3),
    ('444', 'TVA due / crédit TVA', 'PASSIF', @c44, 3);

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) VALUES
    ('445', 'TVA récupérable', 'ACTIF', @c44, 3, TRUE);
SET @c445 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('4451', 'TVA récupérable sur immobilisations', 'ACTIF', @c445, 4),
    ('4452', 'TVA récupérable sur achats', 'ACTIF', @c445, 4),
    ('4453', 'TVA récupérable sur transport', 'ACTIF', @c445, 4),
    ('4454', 'TVA récupérable sur services extérieurs', 'ACTIF', @c445, 4);

-- Comptes de régularisation (ajoutés)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('47', 'Comptes de régularisation', 'ACTIF', @classe4, 2);

/* =========================================================
   5. COMPTES DE TRÉSORERIE (simplifié)
   ========================================================= */

-- CLASSE 5 : TRÉSORERIE
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) 
VALUES ('5', 'TRÉSORERIE', 'ACTIF', NULL, 1, TRUE);
SET @classe5 = LAST_INSERT_ID();

-- Banques
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) VALUES
    ('52', 'Banques', 'ACTIF', @classe5, 2, TRUE);
SET @c52 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('521', 'Banques locales', 'ACTIF', @c52, 3),
    ('525', 'Dépôts à terme', 'ACTIF', @c52, 3);

-- Caisse
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('57', 'Caisse', 'ACTIF', @classe5, 2);

/* =========================================================
   6. COMPTES DE CHARGES (enrichi)
   ========================================================= */

-- CLASSE 6 : CHARGES
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) 
VALUES ('6', 'CHARGES', 'CHARGES', NULL, 1, TRUE);
SET @classe6 = LAST_INSERT_ID();

-- Achats (enrichi)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) VALUES
    ('60', 'Achats', 'CHARGES', @classe6, 2, TRUE);
SET @c60 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('601', 'Achats de marchandises', 'CHARGES', @c60, 3),
    ('602', 'Achats de matières premières', 'CHARGES', @c60, 3),
    ('605', 'Autres achats', 'CHARGES', @c60, 3);

-- Services extérieurs (enrichi)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) VALUES
    ('62', 'Services extérieurs', 'CHARGES', @classe6, 2, TRUE);
SET @c62 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('621', 'Sous-traitance', 'CHARGES', @c62, 3),
    ('622', 'Locations', 'CHARGES', @c62, 3),
    ('625', 'Assurances', 'CHARGES', @c62, 3),
    ('626', 'Études et recherche', 'CHARGES', @c62, 3),
    ('627', 'Publicité', 'CHARGES', @c62, 3),
    ('628', 'Télécommunications', 'CHARGES', @c62, 3);

-- Autres services (ajoutés)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('63', 'Autres services extérieurs', 'CHARGES', @classe6, 2);

-- Impôts et taxes (enrichi)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('64', 'Impôts et taxes', 'CHARGES', @classe6, 2);

-- Charges de personnel (enrichi)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) VALUES
    ('66', 'Charges de personnel', 'CHARGES', @classe6, 2, TRUE);
SET @c66 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('661', 'Rémunérations directes', 'CHARGES', @c66, 3),
    ('664', 'Charges sociales', 'CHARGES', @c66, 3);

-- Frais financiers (ajoutés)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('67', 'Frais financiers', 'CHARGES', @classe6, 2);

-- Dotations
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('68', 'Dotations aux amortissements', 'CHARGES', @classe6, 2),
    ('69', 'Dotations aux provisions', 'CHARGES', @classe6, 2);

/* =========================================================
   7. COMPTES DE PRODUITS (enrichi)
   ========================================================= */

-- CLASSE 7 : PRODUITS
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) 
VALUES ('7', 'PRODUITS', 'PRODUITS', NULL, 1, TRUE);
SET @classe7 = LAST_INSERT_ID();

-- Ventes (enrichi)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) VALUES
    ('70', 'Ventes', 'PRODUITS', @classe7, 2, TRUE);
SET @c70 = LAST_INSERT_ID();

INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('701', 'Ventes de marchandises', 'PRODUITS', @c70, 3),
    ('702', 'Ventes de produits finis', 'PRODUITS', @c70, 3),
    ('705', 'Travaux facturés', 'PRODUITS', @c70, 3),
    ('706', 'Services vendus', 'PRODUITS', @c70, 3),
    ('707', 'Produits accessoires', 'PRODUITS', @c70, 3);

-- Subventions (ajoutées)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('71', 'Subventions d\'exploitation', 'PRODUITS', @classe7, 2);

-- Production immobilisée (ajoutée)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('72', 'Production immobilisée', 'PRODUITS', @classe7, 2);

-- Autres produits
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('75', 'Autres produits', 'PRODUITS', @classe7, 2);

-- Revenus financiers
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('77', 'Revenus financiers', 'PRODUITS', @classe7, 2);

-- Reprises
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('78', 'Transferts de charges', 'PRODUITS', @classe7, 2),
    ('79', 'Reprises de provisions', 'PRODUITS', @classe7, 2);

/* =========================================================
   8. AUTRES CHARGES/PRODUITS (ajoutés pour compatibilité)
   ========================================================= */

-- CLASSE 8 : AUTRES (simplifiée)
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau, est_totalisateur) 
VALUES ('8', 'AUTRES CHARGES ET PRODUITS', 'CHARGES', NULL, 1, TRUE);
SET @classe8 = LAST_INSERT_ID();

-- Simples comptes de niveau 2 pour H.A.O.
INSERT INTO comptes (code, libelle, type_compte, compte_parent_id, niveau) VALUES
    ('83', 'Charges hors activités ordinaires', 'CHARGES', @classe8, 2),
    ('84', 'Produits hors activités ordinaires', 'PRODUITS', @classe8, 2);

-- Réactivation des contraintes
SET FOREIGN_KEY_CHECKS = 1;

/* =========================================================
   VÉRIFICATION ET SYNTHÈSE
   ========================================================= */

-- Comptage des comptes créés
SELECT COUNT(*) AS total_comptes_crees FROM comptes;

-- Vue synthétique par classe
SELECT 
    SUBSTRING(code, 1, 1) AS classe,
    COUNT(*) AS nombre_comptes,
    GROUP_CONCAT(DISTINCT type_compte ORDER BY type_compte) AS types_presents
FROM comptes
GROUP BY SUBSTRING(code, 1, 1)
ORDER BY classe;

-- Liste des comptes lettrables (clients/fournisseurs)
SELECT code, libelle, type_compte
FROM comptes 
WHERE est_lettrable = TRUE
ORDER BY code;

-- Liste des comptes totalisateurs
SELECT code, libelle, type_compte, niveau
FROM comptes 
WHERE est_totalisateur = TRUE
ORDER BY code;