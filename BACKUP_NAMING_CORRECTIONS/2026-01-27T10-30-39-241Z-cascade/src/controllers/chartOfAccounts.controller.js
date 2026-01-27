import { ChartOfAccount, Compagnie, JournalEntryLine } from '../models/index.js';
import { success, error, notFound, badRequest, forbidden } from '../utils/response.js';
import { Op } from 'sequelize';

/**
 * Récupérer tous les comptes pour une entreprise
 * @route GET /api/chart-of-accounts
 * @param {Object} req - Requête Express (query: companyId, includeInactive)
 * @param {Object} res - Réponse Express
 */
export const getAllAccounts = async (req, res) => {
  try {
    let { companyId, includeInactive = 'false' } = req.query;

    // ✅ VALIDATION companyId OBLIGATOIRE
    if (!companyId) {
      return badRequest(res, 'ID de l\'entreprise requis');
    }

    // Vérifier que l'entreprise existe
    const company = await Compagnie.findByPk(companyId);
    if (!company) {
      return notFound(res, 'Entreprise non trouvée');
    }

    // Vérifier que l'utilisateur a accès à cette entreprise
    // TODO: Vérifier les permissions utilisateur-entreprise
    // if (!req.user.companies.includes(companyId)) {
    //   return forbidden(res, 'Accès refusé à cette entreprise');
    // }

    const whereClause = { companyId };
    // Par défaut, inclure les comptes actifs et inactifs si includeInactive est 'true'
    if (includeInactive !== 'true') {
      whereClause.isActive = true;
    }

    const accounts = await ChartOfAccount.findAll({
      where: whereClause,
      include: [
        {
          model: ChartOfAccount,
          as: 'parentAccount',
          attributes: ['id', 'accountNumber', 'accountName'],
          required: false
        },
        {
          model: ChartOfAccount,
          as: 'subAccounts',
          attributes: ['id', 'accountNumber', 'accountName', 'isActive'],
          required: false
        }
      ],
      order: [['accountNumber', 'ASC']]
    });

    // Si aucun compte actif n'est trouvé, retourner tous les comptes peu importe le statut
    let finalAccounts = accounts;
    if (accounts.length === 0 && includeInactive !== 'true') {
      const allAccounts = await ChartOfAccount.findAll({
        where: { companyId },
        include: [
          {
            model: ChartOfAccount,
            as: 'parentAccount',
            attributes: ['id', 'accountNumber', 'accountName'],
            required: false
          },
          {
            model: ChartOfAccount,
            as: 'subAccounts',
            attributes: ['id', 'accountNumber', 'accountName', 'isActive'],
            required: false
          }
        ],
        order: [['accountNumber', 'ASC']]
      });
      finalAccounts = allAccounts;
    }

    success(res, {
      accounts: finalAccounts,
      total: finalAccounts.length,
      companyId: parseInt(companyId)
    }, 200, 'Plan comptable récupéré avec succès');
  
    // Note: Frontend expects response.data.data.accounts structure
    // success() utility wraps response in { success, data: {...} } format
    // So frontend receives: { success: true, data: { accounts: [...] } }
  } catch (err) {
    console.error('Erreur lors de la récupération du plan comptable:', err);
    error(res, 'Une erreur est survenue lors de la récupération du plan comptable', 500);
  }
};

/**
 * Récupérer un compte par son ID
 * @route GET /api/chart-of-accounts/:id
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await ChartOfAccount.findByPk(id, {
      include: [
        {
          model: ChartOfAccount,
          as: 'parentAccount',
          attributes: ['id', 'accountNumber', 'accountName']
        },
        {
          model: ChartOfAccount,
          as: 'subAccounts',
          attributes: ['id', 'accountNumber', 'accountName', 'isActive']
        },
        {
          model: Compagnie,
          attributes: ['id', 'name']
        }
      ]
    });

    if (!account) {
      return notFound(res, 'Compte non trouvé');
    }

    // TODO: Vérifier permissions utilisateur-entreprise

    success(res, account, 200, 'Compte récupéré avec succès');
  } catch (err) {
    console.error('Erreur lors de la récupération du compte:', err);
    error(res, 'Une erreur est survenue lors de la récupération du compte', 500);
  }
};

/**
 * Créer un nouveau compte
 * @route POST /api/chart-of-accounts
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const createAccount = async (req, res) => {
  try {
    const {
      companyId,
      accountNumber,
      accountName,
      accountType,
      subAccountType,
      description,
      parentAccountId,
      isActive = true,
      isTaxable = false,
      allowSubAccounts = true
    } = req.body;

    // Vérifier que l'entreprise existe
    const company = await Compagnie.findByPk(companyId);
    if (!company) {
      return notFound(res, 'Entreprise non trouvée');
    }

    // Vérifier que le numéro de compte n'existe pas déjà pour cette entreprise
    const existingAccount = await ChartOfAccount.findOne({
      where: {
        companyId,
        accountNumber
      }
    });

    if (existingAccount) {
      return badRequest(res, 'Ce numéro de compte existe déjà pour cette entreprise', {
        field: 'accountNumber',
        value: accountNumber
      });
    }

    // Validation OHADA du numéro de compte
    if (!isValidOHADAAccountNumber(accountNumber)) {
      return badRequest(res, 'Numéro de compte OHADA invalide (doit commencer par 1-8 et contenir des chiffres)', {
        field: 'accountNumber',
        value: accountNumber
      });
    }

    // Si parent account spécifié, vérifier qu'il existe et permet les sous-comptes
    let level = 1;
    if (parentAccountId) {
      const parentAccount = await ChartOfAccount.findByPk(parentAccountId);
      if (!parentAccount) {
        return notFound(res, 'Compte parent non trouvé');
      }
      if (!parentAccount.allowSubAccounts) {
        return badRequest(res, 'Le compte parent n\'autorise pas les sous-comptes');
      }
      if (parentAccount.companyId !== companyId) {
        return badRequest(res, 'Le compte parent doit appartenir à la même entreprise');
      }
      level = parentAccount.level + 1;
    }

    // Créer le compte
    const newAccount = await ChartOfAccount.create({
      companyId,
      accountNumber,
      accountName,
      accountType,
      subAccountType,
      description,
      parentAccountId,
      isActive,
      isTaxable,
      allowSubAccounts,
      level
    });

    // Récupérer le compte créé avec les relations
    const createdAccount = await ChartOfAccount.findByPk(newAccount.id, {
      include: [
        {
          model: ChartOfAccount,
          as: 'parentAccount',
          attributes: ['id', 'accountNumber', 'accountName']
        }
      ]
    });

    success(res, createdAccount, 201, 'Compte créé avec succès');
  } catch (err) {
    console.error('Erreur lors de la création du compte:', err);
    error(res, 'Une erreur est survenue lors de la création du compte', 500);
  }
};

/**
 * Mettre à jour un compte existant
 * @route PUT /api/chart-of-accounts/:id
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      accountName,
      accountType,
      subAccountType,
      description,
      isActive,
      isTaxable,
      allowSubAccounts
    } = req.body;

    const account = await ChartOfAccount.findByPk(id);
    if (!account) {
      return notFound(res, 'Compte non trouvé');
    }

    // TODO: Vérifier permissions utilisateur-entreprise

    // Ne pas permettre de désactiver allowSubAccounts si le compte a déjà des sous-comptes
    if (allowSubAccounts === false) {
      const subAccountsCount = await ChartOfAccount.count({
        where: { parentAccountId: id }
      });
      if (subAccountsCount > 0) {
        return badRequest(res, 'Impossible de désactiver les sous-comptes: ce compte a déjà des sous-comptes');
      }
    }

    // Mettre à jour les champs autorisés (on ne permet pas de changer le numéro de compte ou companyId)
    await account.update({
      accountName: accountName || account.accountName,
      accountType: accountType || account.accountType,
      subAccountType: subAccountType !== undefined ? subAccountType : account.subAccountType,
      description: description !== undefined ? description : account.description,
      isActive: isActive !== undefined ? isActive : account.isActive,
      isTaxable: isTaxable !== undefined ? isTaxable : account.isTaxable,
      allowSubAccounts: allowSubAccounts !== undefined ? allowSubAccounts : account.allowSubAccounts
    });

    // Récupérer le compte mis à jour avec les relations
    const updatedAccount = await ChartOfAccount.findByPk(id, {
      include: [
        {
          model: ChartOfAccount,
          as: 'parentAccount',
          attributes: ['id', 'accountNumber', 'accountName']
        },
        {
          model: ChartOfAccount,
          as: 'subAccounts',
          attributes: ['id', 'accountNumber', 'accountName', 'isActive']
        }
      ]
    });

    success(res, updatedAccount, 200, 'Compte mis à jour avec succès');
  } catch (err) {
    console.error('Erreur lors de la mise à jour du compte:', err);
    error(res, 'Une erreur est survenue lors de la mise à jour du compte', 500);
  }
};

/**
 * Supprimer un compte (soft delete - désactivation)
 * @route DELETE /api/chart-of-accounts/:id
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    const account = await ChartOfAccount.findByPk(id);
    if (!account) {
      return notFound(res, 'Compte non trouvé');
    }

    // TODO: Vérifier permissions admin uniquement pour suppression permanente

    // Vérifier qu'il n'y a pas d'écritures comptables associées
    // TODO: Vérifier dans JournalEntryLine
    // const entriesCount = await JournalEntryLine.count({ where: { accountId: id } });
    // if (entriesCount > 0) {
    //   return badRequest(res, 'Impossible de supprimer ce compte: des écritures comptables y sont associées');
    // }

    // Vérifier qu'il n'y a pas de sous-comptes
    const subAccountsCount = await ChartOfAccount.count({
      where: { parentAccountId: id }
    });
    if (subAccountsCount > 0) {
      return badRequest(res, 'Impossible de supprimer ce compte: il possède des sous-comptes');
    }

    if (permanent === 'true') {
      // Suppression permanente (base de données)
      await account.destroy();
      success(res, null, 200, 'Compte supprimé définitivement');
    } else {
      // Soft delete (désactivation)
      await account.update({ isActive: false });
      success(res, account, 200, 'Compte désactivé avec succès');
    }
  } catch (err) {
    console.error('Erreur lors de la suppression du compte:', err);
    error(res, 'Une erreur est survenue lors de la suppression du compte', 500);
  }
};

/**
 * Rechercher des comptes par critères
 * @route GET /api/chart-of-accounts/search
 * @param {Object} req - Requête Express (query: companyId, search, accountType)
 * @param {Object} res - Réponse Express
 */
export const searchAccounts = async (req, res) => {
  try {
    const { companyId, search, accountType } = req.query;

    if (!companyId) {
      return badRequest(res, 'ID de l\'entreprise requis', { field: 'companyId' });
    }

    const whereClause = {
      companyId,
      isActive: true
    };

    // Recherche textuelle
    if (search) {
      whereClause[Op.or] = [
        { accountNumber: { [Op.like]: `%${search}%` } },
        { accountName: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filtre par type
    if (accountType) {
      whereClause.accountType = accountType;
    }

    const accounts = await ChartOfAccount.findAll({
      where: whereClause,
      attributes: ['id', 'accountNumber', 'accountName', 'accountType', 'subAccountType'],
      order: [['accountNumber', 'ASC']],
      limit: 50
    });

    success(res, {
      accounts,
      total: accounts.length
    }, 200, 'Recherche effectuée avec succès');
  } catch (err) {
    console.error('Erreur lors de la recherche de comptes:', err);
    error(res, 'Une erreur est survenue lors de la recherche', 500);
  }
};

/**
 * Valider un numéro de compte OHADA
 * Les comptes OHADA commencent par un chiffre de 1 à 8 (classes)
 * Format: 1-8 chiffres, exemple: 101, 201, 4011, 60112
 * @param {string} accountNumber - Numéro de compte à valider
 * @returns {boolean}
 */
function isValidOHADAAccountNumber(accountNumber) {
  if (!accountNumber || typeof accountNumber !== 'string') {
    return false;
  }

  // Doit commencer par un chiffre de 1 à 8 (classes OHADA)
  const ohadaPattern = /^[1-8]\d{0,7}$/;
  return ohadaPattern.test(accountNumber);
}

/**
 * Seed OHADA comptes pour une entreprise
 * @route POST /api/chart-of-accounts/seed
 */
export const seedOHADAAccounts = async (req, res) => {
  try {
    const ohadaAccounts = [
      { accountNumber: '1', accountName: 'COMPTES DE RESSOURCES DURABLES', accountType: 'LIABILITIES', subAccountType: 'EQUITY', description: 'Ressources durables', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '10', accountName: 'Capital', accountType: 'EQUITY', subAccountType: null, description: 'Capital social', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '101', accountName: 'Capital social', accountType: 'EQUITY', subAccountType: 'CAPITAL', description: 'Capital social versé', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '104', accountName: 'Compte de l\'exploitant', accountType: 'EQUITY', subAccountType: 'CAPITAL', description: 'Compte de l\'exploitant', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '105', accountName: 'Primes liées au capital', accountType: 'EQUITY', subAccountType: 'CAPITAL', description: 'Primes liées au capital', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '11', accountName: 'Réserves', accountType: 'EQUITY', subAccountType: null, description: 'Réserves', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '111', accountName: 'Réserve légale', accountType: 'EQUITY', subAccountType: 'RESERVES', description: 'Réserve légale', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '118', accountName: 'Autres réserves', accountType: 'EQUITY', subAccountType: 'RESERVES', description: 'Autres réserves', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '12', accountName: 'Report à nouveau', accountType: 'EQUITY', subAccountType: null, description: 'Résultats reportés', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '13', accountName: 'Résultat net', accountType: 'EQUITY', subAccountType: null, description: 'Résultat de l\'exercice', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '131', accountName: 'Résultat : Bénéfice', accountType: 'EQUITY', subAccountType: 'PROFIT', description: 'Bénéfice de l\'exercice', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '139', accountName: 'Résultat : Perte', accountType: 'LIABILITIES', subAccountType: 'LOSS', description: 'Perte de l\'exercice', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '14', accountName: 'Subventions d\'investissement', accountType: 'LIABILITIES', subAccountType: null, description: 'Subventions reçues', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '16', accountName: 'Emprunts et dettes financières', accountType: 'LIABILITIES', subAccountType: null, description: 'Dettes à long terme', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '162', accountName: 'Emprunts auprès des établissements de crédit', accountType: 'LIABILITIES', subAccountType: 'BANK_LOANS', description: 'Emprunts bancaires', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '164', accountName: 'Comptes courants bloqués', accountType: 'LIABILITIES', subAccountType: 'BLOCKED_ACCOUNTS', description: 'Comptes courants bloqués', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '168', accountName: 'Autres emprunts et dettes', accountType: 'LIABILITIES', subAccountType: 'OTHER_DEBTS', description: 'Autres emprunts', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '19', accountName: 'Provisions pour risques et charges', accountType: 'LIABILITIES', subAccountType: null, description: 'Provisions', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '2', accountName: 'ACTIF IMMOBILISE', accountType: 'ASSETS', subAccountType: 'FIXED_ASSETS', description: 'Immobilisations', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '21', accountName: 'Immobilisations incorporelles', accountType: 'ASSETS', subAccountType: null, description: 'Actifs incorporels', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '211', accountName: 'Frais de développement', accountType: 'ASSETS', subAccountType: 'INTANGIBLE', description: 'Frais de développement', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '212', accountName: 'Brevets, licences, concessions', accountType: 'ASSETS', subAccountType: 'INTANGIBLE', description: 'Brevets et licences', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '213', accountName: 'Logiciels et sites internet', accountType: 'ASSETS', subAccountType: 'INTANGIBLE', description: 'Logiciels', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '215', accountName: 'Fonds commercial', accountType: 'ASSETS', subAccountType: 'INTANGIBLE', description: 'Fonds commercial', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '22', accountName: 'Terrains', accountType: 'ASSETS', subAccountType: 'PROPERTY', description: 'Terrains et terrains de gisement', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '23', accountName: 'Constructions', accountType: 'ASSETS', subAccountType: 'PROPERTY', description: 'Bâtiments et constructions', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '24', accountName: 'Installations, agencements, aménagements', accountType: 'ASSETS', subAccountType: 'PROPERTY', description: 'Installations et agencements', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '25', accountName: 'Matériel, mobilier et outillage', accountType: 'ASSETS', subAccountType: 'EQUIPMENT', description: 'Matériel et équipements', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '251', accountName: 'Matériel de transport', accountType: 'ASSETS', subAccountType: 'EQUIPMENT', description: 'Matériel de transport', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '252', accountName: 'Matériel informatique', accountType: 'ASSETS', subAccountType: 'EQUIPMENT', description: 'Équipements informatiques', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '253', accountName: 'Mobilier de bureau', accountType: 'ASSETS', subAccountType: 'EQUIPMENT', description: 'Mobilier de bureau', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '26', accountName: 'Participations et créances assimilées', accountType: 'ASSETS', subAccountType: 'FINANCIAL', description: 'Participations longue durée', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '27', accountName: 'Autres immobilisations financières', accountType: 'ASSETS', subAccountType: 'FINANCIAL', description: 'Placements financiers', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '28', accountName: 'Amortissements', accountType: 'ASSETS', subAccountType: 'DEPRECIATION', description: 'Amortissements cumulés', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '29', accountName: 'Provisions pour dépréciation', accountType: 'ASSETS', subAccountType: 'PROVISIONS', description: 'Provisions sur immobilisations', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '3', accountName: 'STOCKS ET EN-COURS', accountType: 'ASSETS', subAccountType: 'INVENTORY', description: 'Stocks et produits en cours', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '31', accountName: 'Matières premières', accountType: 'ASSETS', subAccountType: 'INVENTORY', description: 'Matières premières', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '32', accountName: 'Autres approvisionnements', accountType: 'ASSETS', subAccountType: 'INVENTORY', description: 'Fournitures et matériaux', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '33', accountName: 'En-cours de production', accountType: 'ASSETS', subAccountType: 'INVENTORY', description: 'Produits en cours de fabrication', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '34', accountName: 'Produits finis', accountType: 'ASSETS', subAccountType: 'INVENTORY', description: 'Produits finis stockés', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '37', accountName: 'Stocks en transit', accountType: 'ASSETS', subAccountType: 'INVENTORY', description: 'Stocks en transit ou magasins', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '39', accountName: 'Provisions pour dépréciation des stocks', accountType: 'ASSETS', subAccountType: 'PROVISIONS', description: 'Provisions sur stocks', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '4', accountName: 'CRÉANCES ET DETTES', accountType: 'MIXED', subAccountType: 'RECEIVABLES', description: 'Créances et dettes à court terme', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '41', accountName: 'Clients', accountType: 'ASSETS', subAccountType: 'RECEIVABLES', description: 'Créances clients', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '411', accountName: 'Créances clients - Factures à établir', accountType: 'ASSETS', subAccountType: 'RECEIVABLES', description: 'Factures à établir', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '412', accountName: 'Créances clients - Factures établies', accountType: 'ASSETS', subAccountType: 'RECEIVABLES', description: 'Factures établies', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '42', accountName: 'Fournisseurs', accountType: 'LIABILITIES', subAccountType: 'PAYABLES', description: 'Dettes fournisseurs', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '421', accountName: 'Dettes fournisseurs - Factures non reçues', accountType: 'LIABILITIES', subAccountType: 'PAYABLES', description: 'Factures non reçues', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '422', accountName: 'Dettes fournisseurs - Factures reçues', accountType: 'LIABILITIES', subAccountType: 'PAYABLES', description: 'Factures reçues', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '43', accountName: 'Personnel - Salaires à payer', accountType: 'LIABILITIES', subAccountType: 'PAYROLL', description: 'Dettes de paie', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '44', accountName: 'État - Impôts et taxes', accountType: 'LIABILITIES', subAccountType: 'TAXES', description: 'Dettes fiscales et sociales', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '441', accountName: 'Impôt sur le revenu (IR)', accountType: 'LIABILITIES', subAccountType: 'TAXES', description: 'Impôt sur le revenu', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '442', accountName: 'Impôt sur les sociétés (IS)', accountType: 'LIABILITIES', subAccountType: 'TAXES', description: 'Impôt sur les sociétés', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '45', accountName: 'Associés - Capital à verser', accountType: 'MIXED', subAccountType: 'CAPITAL', description: 'Apports d\'associés en attente', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '46', accountName: 'Débiteurs et créditeurs divers', accountType: 'MIXED', subAccountType: 'OTHER', description: 'Autres débiteurs/créditeurs', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '47', accountName: 'Comptes de liaison', accountType: 'MIXED', subAccountType: 'OTHER', description: 'Comptes de liaison', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '48', accountName: 'Comptes d\'attente', accountType: 'MIXED', subAccountType: 'OTHER', description: 'Comptes transitoires', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '49', accountName: 'Provisions pour dépréciations', accountType: 'ASSETS', subAccountType: 'PROVISIONS', description: 'Provisions sur créances', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '5', accountName: 'TRÉSORERIE', accountType: 'ASSETS', subAccountType: 'CASH', description: 'Comptes de trésorerie', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '50', accountName: 'Valeurs en portefeuille', accountType: 'ASSETS', subAccountType: 'SECURITIES', description: 'Titres et placements', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '51', accountName: 'Comptes en banque', accountType: 'ASSETS', subAccountType: 'BANK', description: 'Comptes bancaires', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '512', accountName: 'Compte courant', accountType: 'ASSETS', subAccountType: 'BANK', description: 'Compte courant bancaire', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '513', accountName: 'Compte sur carnet de chèques', accountType: 'ASSETS', subAccountType: 'BANK', description: 'Compte de chèques', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '52', accountName: 'Caisse', accountType: 'ASSETS', subAccountType: 'CASH', description: 'Caisse (espèces)', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '53', accountName: 'Comptes de chèques postaux', accountType: 'ASSETS', subAccountType: 'BANK', description: 'Comptes postaux', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '6', accountName: 'COMPTES DE CHARGES', accountType: 'EXPENSES', subAccountType: null, description: 'Charges d\'exploitation', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '60', accountName: 'Achats', accountType: 'EXPENSES', subAccountType: 'PURCHASES', description: 'Achats de matières', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: true, level: 1 },
      { accountNumber: '601', accountName: 'Achats de matières premières', accountType: 'EXPENSES', subAccountType: 'PURCHASES', description: 'Matières premières', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 2 },
      { accountNumber: '602', accountName: 'Achats de fournitures', accountType: 'EXPENSES', subAccountType: 'PURCHASES', description: 'Fournitures et consommables', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 2 },
      { accountNumber: '608', accountName: 'Remises et rabais obtenus', accountType: 'EXPENSES', subAccountType: 'RETURNS', description: 'Remises et rabais', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '61', accountName: 'Services extérieurs', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Services d\'exploitation', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: true, level: 1 },
      { accountNumber: '611', accountName: 'Transports', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Frais de transport', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 2 },
      { accountNumber: '612', accountName: 'Frais de télécommunications', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Télécommunications', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 2 },
      { accountNumber: '613', accountName: 'Frais d\'énergie', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Électricité, gaz, eau', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 2 },
      { accountNumber: '614', accountName: 'Frais d\'honoraires et prestations de services', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Honoraires professionnels', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 2 },
      { accountNumber: '615', accountName: 'Loyers', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Loyers et locations', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 2 },
      { accountNumber: '616', accountName: 'Assurances', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Cotisations d\'assurance', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 2 },
      { accountNumber: '617', accountName: 'Rémunérations de tiers', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Services et conseils', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 2 },
      { accountNumber: '618', accountName: 'Frais de travaux et études', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Études et recherches', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 2 },
      { accountNumber: '619', accountName: 'Rabais et remises accordés', accountType: 'EXPENSES', subAccountType: 'RETURNS', description: 'Rabais et remises', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '62', accountName: 'Autres services extérieurs', accountType: 'EXPENSES', subAccountType: 'SERVICES', description: 'Autres services', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 1 },
      { accountNumber: '63', accountName: 'Impôts et taxes', accountType: 'EXPENSES', subAccountType: 'TAXES', description: 'Impôts et cotisations sociales', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '631', accountName: 'Impôts sur salaires', accountType: 'EXPENSES', subAccountType: 'TAXES', description: 'Charges sociales sur salaires', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '632', accountName: 'Impôts et taxes d\'exploitation', accountType: 'EXPENSES', subAccountType: 'TAXES', description: 'Patente, licence, taxe professionnelle', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '64', accountName: 'Charges de personnel', accountType: 'EXPENSES', subAccountType: 'PAYROLL', description: 'Salaires et charges sociales', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '641', accountName: 'Salaires et traitements', accountType: 'EXPENSES', subAccountType: 'PAYROLL', description: 'Salaires bruts', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '642', accountName: 'Cotisations sociales', accountType: 'EXPENSES', subAccountType: 'PAYROLL', description: 'Cotisations patronales', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '65', accountName: 'Charges d\'exploitation connexes', accountType: 'EXPENSES', subAccountType: 'OTHER', description: 'Autres charges opérationnelles', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '66', accountName: 'Charges financières', accountType: 'EXPENSES', subAccountType: 'FINANCIAL', description: 'Intérêts et charges financières', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: true, level: 1 },
      { accountNumber: '661', accountName: 'Intérêts des emprunts', accountType: 'EXPENSES', subAccountType: 'FINANCIAL', description: 'Intérêts bancaires', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 2 },
      { accountNumber: '668', accountName: 'Autres charges financières', accountType: 'EXPENSES', subAccountType: 'FINANCIAL', description: 'Autres intérêts et frais', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 2 },
      { accountNumber: '67', accountName: 'Charges exceptionnelles', accountType: 'EXPENSES', subAccountType: 'EXCEPTIONAL', description: 'Charges non récurrentes', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '671', accountName: 'Amendes et pénalités', accountType: 'EXPENSES', subAccountType: 'EXCEPTIONAL', description: 'Amendes et pénalités', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '672', accountName: 'Charges liées aux sinistres', accountType: 'EXPENSES', subAccountType: 'EXCEPTIONAL', description: 'Pertes et sinistres', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '673', accountName: 'Pertes de change', accountType: 'EXPENSES', subAccountType: 'EXCEPTIONAL', description: 'Différences de change', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '674', accountName: 'Pertes sur ventes d\'actifs', accountType: 'EXPENSES', subAccountType: 'EXCEPTIONAL', description: 'Moins-value sur cessions', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '68', accountName: 'Provisions et dépréciations', accountType: 'EXPENSES', subAccountType: 'PROVISIONS', description: 'Charges de provisions', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '69', accountName: 'Impôts sur le résultat', accountType: 'EXPENSES', subAccountType: 'TAXES', description: 'Impôt sur les bénéfices', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '7', accountName: 'COMPTES DE PRODUITS', accountType: 'REVENUES', subAccountType: null, description: 'Produits d\'exploitation', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '70', accountName: 'Ventes de produits finis', accountType: 'REVENUES', subAccountType: 'SALES', description: 'Ventes de marchandises', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: true, level: 1 },
      { accountNumber: '701', accountName: 'Ventes de produits finis', accountType: 'REVENUES', subAccountType: 'SALES', description: 'Produits manufacturés', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 2 },
      { accountNumber: '708', accountName: 'Rabais et remises sur ventes', accountType: 'REVENUES', subAccountType: 'RETURNS', description: 'Rabais et remises', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '71', accountName: 'Services rendus', accountType: 'REVENUES', subAccountType: 'SERVICES', description: 'Revenus de services', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 1 },
      { accountNumber: '72', accountName: 'Produits annexes', accountType: 'REVENUES', subAccountType: 'OTHER', description: 'Produits accessoires', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 1 },
      { accountNumber: '73', accountName: 'Produits d\'activités', accountType: 'REVENUES', subAccountType: 'ACTIVITIES', description: 'Autres revenus opérationnels', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 1 },
      { accountNumber: '74', accountName: 'Production immobilisée', accountType: 'REVENUES', subAccountType: 'CAPITALIZED', description: 'Production capitalisée', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '75', accountName: 'Produits financiers', accountType: 'REVENUES', subAccountType: 'FINANCIAL', description: 'Revenus financiers', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: true, level: 1 },
      { accountNumber: '751', accountName: 'Revenus de placements', accountType: 'REVENUES', subAccountType: 'FINANCIAL', description: 'Intérêts et dividendes', parentAccountId: null, isActive: true, isTaxable: true, allowSubAccounts: false, level: 2 },
      { accountNumber: '756', accountName: 'Gains de change', accountType: 'REVENUES', subAccountType: 'FINANCIAL', description: 'Gains de change', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '76', accountName: 'Produits exceptionnels', accountType: 'REVENUES', subAccountType: 'EXCEPTIONAL', description: 'Produits non récurrents', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: true, level: 1 },
      { accountNumber: '761', accountName: 'Produits liés aux sinistres', accountType: 'REVENUES', subAccountType: 'EXCEPTIONAL', description: 'Récupérations et indemnités', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '762', accountName: 'Gains sur ventes d\'actifs', accountType: 'REVENUES', subAccountType: 'EXCEPTIONAL', description: 'Plus-value sur cessions', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 2 },
      { accountNumber: '78', accountName: 'Reversement de provisions', accountType: 'REVENUES', subAccountType: 'PROVISIONS', description: 'Reprises de provisions', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '79', accountName: 'Transferts de charges', accountType: 'REVENUES', subAccountType: 'TRANSFERS', description: 'Transferts analytiques', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '8', accountName: 'COMPTES D\'ORDRE', accountType: 'OTHER', subAccountType: null, description: 'Comptes d\'ordre - Engagement', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 },
      { accountNumber: '9', accountName: 'COMPTES D\'ORDRE - CONTREPARTIE', accountType: 'OTHER', subAccountType: null, description: 'Comptes d\'ordre - Contrepartie', parentAccountId: null, isActive: true, isTaxable: false, allowSubAccounts: false, level: 1 }
    ];

    // Récupérer la compagnie
    const company = await Compagnie.findOne({ where: { isActive: true } });
    if (!company) {
      return notFound(res, 'Aucune entreprise active trouvée');
    }

    // Supprimer les journal entry lines qui référencent ces comptes (pour éviter les FK)
    const accountIds = await ChartOfAccount.findAll(
      { where: { companyId: company.id }, attributes: ['id'] }
    );
    if (accountIds.length > 0) {
      const accountIdArray = accountIds.map(a => a.id);
      await JournalEntryLine.destroy({ where: { accountId: accountIdArray } });
    }

    // Supprimer les anciens comptes
    await ChartOfAccount.destroy({ where: { companyId: company.id } });

    // Insérer les nouveaux comptes
    const createdAccounts = await ChartOfAccount.bulkCreate(
      ohadaAccounts.map(acc => ({
        ...acc,
        companyId: company.id
      }))
    );

    return success(res, {
      message: `${createdAccounts.length} comptes OHADA ont été insérés`,
      count: createdAccounts.length,
      companyId: company.id
    }, 201);
  } catch (err) {
    return error(res, err.message, 500, err);
  }
}
