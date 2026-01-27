/**
 * 🔐 IMMUTABLE TRAIT - POUR DONNÉES D'AUDIT
 * ==========================================
 * Mixin pour tables audit/sécurité immuables
 * - Interdit toute suppression (hard + soft)
 * - Interdit toute modification
 * - Permet lecture uniquement
 * 
 * Audit trails et security_events DOIVENT rester intacts
 */

export const ImmutableTrait = (sequelize) => ({
  paranoid: false, // ❌ Pas de soft delete
  timestamps: true, // created_at/updated_at seulement
  createdAt: 'created_at',
  updatedAt: 'updated_at',

  // Hooks pour protection absolue
  hooks: {
    // ❌ Interdit toute mise à jour
    beforeUpdate: (instance, options) => {
      throw new Error(
        `❌ IMMUTABLE_TABLE: "${instance.constructor.tableName}" ne peut pas être modifiée. ` +
        `Les données d'audit et sécurité sont immuables par conception. ` +
        `ID: ${instance.id}`
      );
    },

    // ❌ Interdit hard delete
    beforeDestroy: (instance, options) => {
      throw new Error(
        `❌ IMMUTABLE_TABLE: "${instance.constructor.tableName}" ne peut pas être supprimée. ` +
        `Les données d'audit et sécurité doivent être conservées indéfiniment. ` +
        `ID: ${instance.id}`
      );
    },

    // ❌ Interdit bulk update
    beforeBulkUpdate: (options) => {
      throw new Error(
        `❌ BULK_UPDATE_FORBIDDEN: Les opérations de mise à jour en masse sont interdites ` +
        `sur les tables immuables (audit_trails, security_events)`
      );
    },

    // ❌ Interdit bulk delete
    beforeBulkDestroy: (options) => {
      throw new Error(
        `❌ BULK_DELETE_FORBIDDEN: Les opérations de suppression en masse sont interdites ` +
        `sur les tables immuables (audit_trails, security_events)`
      );
    }
  },

  // Indexes pour recherche audit rapide
  indexes: [
    {
      fields: ['created_at'],
      name: 'idx_created_at',
      type: 'BTREE'
    },
    {
      fields: ['user_id', 'created_at'],
      name: 'idx_user_created'
    }
  ]
});

/**
 * Méthodes read-only sûres pour audit trails
 * À utiliser à la place de update/destroy
 */
export const ImmutableHelpers = {
  /**
   * Marquer un enregistrement comme archivé (sans le modifier)
   * Crée un nouvel enregistrement pour suivre l'archivage
   */
  async markAsArchived(auditRecord, reason = '') {
    // Créer un nouvel audit trail pour tracer l'archivage
    return auditRecord.constructor.create({
      ...auditRecord.toJSON(),
      _archived_at: new Date(),
      _archived_reason: reason,
      _original_id: auditRecord.id
    });
  },

  /**
   * Lire les enregistrements avec filtres (lecture seule)
   */
  async findAuditRecords(model, filters = {}) {
    return model.findAll({
      where: filters,
      order: [['created_at', 'DESC']],
      attributes: { exclude: [] }
    });
  },

  /**
   * Valider qu'un enregistrement n'a pas été modifié
   */
  async validateIntegrity(auditRecord) {
    const original = await auditRecord.constructor.findByPk(auditRecord.id, {
      raw: true,
      attributes: { exclude: ['updated_at'] } // created_at ne devrait pas changer
    });
    
    if (!original) {
      throw new Error(`Audit record ${auditRecord.id} not found`);
    }

    // Les dates de création doivent être identiques
    if (original.created_at.getTime() !== auditRecord.created_at.getTime()) {
      throw new Error(`⚠️ INTEGRITY_ALERT: Audit record was modified. Timestamp mismatch.`);
    }

    return true;
  }
};

export default ImmutableTrait;
