/**
 * Contract Loader
 * 
 * Charge le contrat versionné depuis le backend au startup
 * Singleton pattern pour éviter les chargements multiples
 */

let cachedContract = null;
let contractPromise = null;
let contractBootstrapped = false;

/**
 * Structure du contrat
 * @typedef {Object} SPOFEContract
 * @property {string} version - Version du contrat (ex: 1.0.0)
 * @property {Array<string>} commands - Commandes autorisées
 * @property {Array<Object>} readModels - Read-models autorisées
 * @property {string} status - Statut du contrat (ACTIVE, DEPRECATED, etc)
 */

/**
 * Charge le contrat depuis le backend - VERSION BLOQUANTE
 * 
 * ⛔ PRÉ-CONDITION ABSOLUE - Aucun fallback, aucune valeur par défaut
 * 
 * Si le contrat ne peut pas être chargé, l'application s'arrête.
 * C'est une dépendance vitale du frontend.
 * 
 * @returns {Promise<SPOFEContract>}
 * @throws {Error} TOUJOURS si le chargement échoue - jamais de fallback
 * 
 * @example
 *   // Bootstrap (main.js)
 *   try {
 *     await loadContractOrFail();
 *     await initApp();
 *   } catch (err) {
 *     renderFatalError(err);
 *   }
 */
export async function loadContractOrFail() {
  // Déjà chargé en mémoire
  if (cachedContract) {
    contractBootstrapped = true;
    return cachedContract;
  }

  // Déjà en cours de chargement
  if (contractPromise) {
    return contractPromise;
  }

  // Charger le contrat - BLOQUANT
  contractPromise = _fetchAndValidateContract();

  try {
    cachedContract = await contractPromise;
    contractBootstrapped = true;
    return cachedContract;
  } finally {
    contractPromise = null;
  }
}

/**
 * Charge le contrat depuis le backend
 * Le contrat est mis en cache et réutilisé
 * 
 * @returns {Promise<SPOFEContract>}
 * @throws {Error} Si le chargement du contrat échoue
 * 
 * @example
 *   const contract = await loadContract();
 *   console.log(contract.version); // "1.0.0"
 */
export async function loadContract() {
  // Déjà chargé en mémoire
  if (cachedContract) {
    return cachedContract;
  }

  // Déjà en cours de chargement
  if (contractPromise) {
    return contractPromise;
  }

  // Charger le contrat
  contractPromise = _fetchAndValidateContract();

  try {
    cachedContract = await contractPromise;
    return cachedContract;
  } finally {
    contractPromise = null;
  }
}

/**
 * Retourne le contrat déjà chargé sans le recharger
 * 
 * @returns {SPOFEContract|null} Contrat ou null si pas encore chargé
 */
export function getLoadedContract() {
  return cachedContract;
}

/**
 * Réinitialise le contrat en cache (pour tests)
 */
export function resetContract() {
  cachedContract = null;
  contractPromise = null;
}

/**
 * Récupère et valide le contrat depuis le backend
 * @private
 */
async function _fetchAndValidateContract() {
  try {
    const [commandsResponse, readModelsResponse] = await Promise.all([
      fetch('/contracts/frontend-backend/allowed-commands.v1.json'),
      fetch('/contracts/frontend-backend/allowed-read-models.v1.json')
    ]);

    if (!commandsResponse.ok) {
      throw new Error(
        `Failed to load commands contract: ${commandsResponse.status} ${commandsResponse.statusText}`
      );
    }

    if (!readModelsResponse.ok) {
      throw new Error(
        `Failed to load read-models contract: ${readModelsResponse.status} ${readModelsResponse.statusText}`
      );
    }

    const commands = await commandsResponse.json();
    const readModels = await readModelsResponse.json();

    // Valider la structure du contrat
    _validateContractStructure(commands, readModels);

    // Construire le contrat unifié
    const contract = {
      version: commands.version,
      status: commands.status || 'ACTIVE',
      lastUpdated: commands.lastUpdated,
      
      // Extraire les noms de commands
      commands: commands.commands.map(cmd => cmd.name),
      commandDetails: commands.commands, // Détails pour logs/debug
      
      // Extraire les paths de read-models
      readModels: readModels.readModels.map(rm => rm.path),
      readModelDetails: readModels.readModels // Détails pour logs/debug
    };

    console.log(
      `[SPOFE] Contract loaded successfully (v${contract.version})`
    );

    return contract;
  } catch (error) {
    console.error('[SPOFE] Failed to load contract:', error);
    throw new Error(
      `SPOFE Contract Enforcer: Unable to load contract. ${error.message}`
    );
  }
}

/**
 * Valide la structure du contrat chargé
 * @private
 */
function _validateContractStructure(commands, readModels) {
  if (!Array.isArray(commands.commands)) {
    throw new Error('Invalid contract: commands must be an array');
  }

  if (!Array.isArray(readModels.readModels)) {
    throw new Error('Invalid contract: readModels must be an array');
  }

  if (!commands.version || !readModels.version) {
    throw new Error('Invalid contract: version missing');
  }

  if (commands.version !== readModels.version) {
    throw new Error(
      `Contract version mismatch: commands (${commands.version}) !== readModels (${readModels.version})`
    );
  }
}

/**
 * Récupère la version du contrat chargé
 * 
 * @returns {string|null} Version du contrat ou null
 */
export function getContractVersion() {
  return cachedContract?.version || null;
}

/**
 * Vérifie si le contrat est chargé
 * 
 * @returns {boolean}
 */
export function isContractLoaded() {
  return cachedContract !== null;
}

/**
 * Vérifie si le bootstrap a été completé avec succès
 * 
 * ⚠️ Cette vérification est REQUISE avant d'utiliser sendCommand/readModel
 * 
 * @returns {boolean}
 */
export function isContractBootstrapped() {
  return contractBootstrapped && cachedContract !== null;
}
