/**
 * Feature Flags Configuration
 * Permet d'activer/désactiver les features progressivement
 * sans déploiement de code
 */

const featureFlags = {
  // ===== SUPER UTILISATEUR GROUPE =====
  superUserGroupApproval: {
    enabled: process.env.FEATURE_SUPER_USER_APPROVAL === 'true' || false,
    rolloutPercentage: parseInt(process.env.FEATURE_ROLLOUT_PERCENTAGE || '0'),
    targetGroups: (process.env.FEATURE_TARGET_GROUPS || '').split(',').filter(Boolean),
    description: 'Activation du workflow d\'approbation par super user groupe',
    launchDate: '2026-01-24',
    owner: 'Product Team'
  },

  // ===== AUTO-INSCRIPTION =====
  autoRegistration: {
    enabled: process.env.FEATURE_AUTO_REGISTRATION === 'true' || false,
    requireEmailVerification: true,
    description: 'Permettre l\'auto-inscription utilisateurs',
    launchDate: '2026-01-24'
  },

  // ===== DASHBOARD GROUPE =====
  groupDashboard: {
    enabled: process.env.FEATURE_GROUP_DASHBOARD === 'true' || false,
    description: 'Dashboard pour super users groupe',
    launchDate: '2026-01-24'
  }
};

/**
 * Vérifier si une feature est activée pour un groupe
 * @param {string} featureName - Nom de la feature
 * @param {number} groupeId - ID du groupe
 * @returns {boolean}
 */
const isFeatureEnabledForGroup = (featureName, groupeId) => {
  const feature = featureFlags[featureName];
  
  if (!feature) {
    console.warn(`⚠️  Feature "${featureName}" non trouvée`);
    return false;
  }

  if (!feature.enabled) {
    return false;
  }

  // Si des groupes cibles sont spécifiés, vérifier inclusion
  if (feature.targetGroups && feature.targetGroups.length > 0) {
    return feature.targetGroups.includes(String(groupeId));
  }

  // Sinon, appliquer rollout percentage
  if (feature.rolloutPercentage < 100) {
    const hash = Math.abs(groupeId.toString().charCodeAt(0)) % 100;
    return hash < feature.rolloutPercentage;
  }

  return true;
};

/**
 * Vérifier si une feature est activée globalement
 * @param {string} featureName - Nom de la feature
 * @returns {boolean}
 */
const isFeatureEnabled = (featureName) => {
  const feature = featureFlags[featureName];
  return feature && feature.enabled;
};

/**
 * Mettre à jour un feature flag en runtime
 * (utile pour A/B testing sans redéploiement)
 */
const updateFeatureFlag = (featureName, updates) => {
  if (featureFlags[featureName]) {
    featureFlags[featureName] = {
      ...featureFlags[featureName],
      ...updates
    };
    console.log(`✅ Feature flag "${featureName}" mis à jour`, featureFlags[featureName]);
  }
};

module.exports = {
  featureFlags,
  isFeatureEnabled,
  isFeatureEnabledForGroup,
  updateFeatureFlag
};
