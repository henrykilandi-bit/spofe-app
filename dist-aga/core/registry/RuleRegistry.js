/**
 * Registre central des règles AGA
 * Point unique de vérité pour toutes les règles
 */
export class RuleRegistry {
    rules = new Map();
    /* ---------------------------
       Enregistrement d'une règle
       --------------------------- */
    register(rule) {
        if (this.rules.has(rule.id)) {
            throw new Error(`AGA RuleRegistry: règle déjà enregistrée (${rule.id})`);
        }
        this.rules.set(rule.id, rule);
    }
    /* ---------------------------
       Enregistrement multiple
       --------------------------- */
    registerMany(rules) {
        rules.forEach(rule => this.register(rule));
    }
    /* ---------------------------
       Récupération globale
       --------------------------- */
    getAll() {
        return Array.from(this.rules.values());
    }
    /* ---------------------------
       Sélection par type de fichier
       --------------------------- */
    getForFileType(fileType) {
        return this.getAll().filter(rule => rule.targetFileTypes.includes(fileType));
    }
    /* ---------------------------
       Vérification d'existence
       --------------------------- */
    hasRule(id) {
        return this.rules.has(id);
    }
    /* ---------------------------
       Accès direct (debug / test)
       --------------------------- */
    getById(id) {
        return this.rules.get(id);
    }
    /* ---------------------------
       Compteur
       --------------------------- */
    count() {
        return this.rules.size;
    }
}
//# sourceMappingURL=RuleRegistry.js.map