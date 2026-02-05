#!/usr/bin/env python3
"""
🛡️ Guardian de Gouvernance - Implémentation concrète et intégrée
Mode "la légitimité devient un état système exécutable"

Le Guardian de gouvernance devient un vrai composant, pas un concept.
Il décide si le système a le droit d'évoluer, en se basant uniquement
sur les faits ancrés dans le ledger.
"""

import os
import sys
import json
import uuid
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple
from dataclasses import dataclass
import psycopg2
from psycopg2 import sql
from psycopg2.extras import Json

# Configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class GovernanceRequest:
    """Requête de gouvernance"""
    action: str
    environment: str
    domain_event_id: str
    requested_by: str
    timestamp: datetime

@dataclass
class GovernanceDecision:
    """Décision de gouvernance"""
    decision: str  # ALLOW ou DENY
    reason: str
    based_on_facts: Dict[str, Any]
    decision_timestamp: datetime

class GovernanceGuardian:
    """
    Guardian de Gouvernance - Implémentation principale
    
    Rôle exact:
    - Décider si le système a le droit d'évoluer
    - Il ne modifie rien
    - Il ne fait confiance à personne
    - Il lit uniquement le ledger
    - Il répond : ALLOW ou DENY
    """
    
    def __init__(self, db_config: Dict[str, str]):
        self.db_config = db_config
        self.connection = None
        
    def connect(self) -> bool:
        """Établir la connexion à la base de données"""
        try:
            self.connection = psycopg2.connect(**self.db_config)
            self.connection.autocommit = False
            logger.info("✅ Connexion à la base de données établie")
            return True
        except Exception as e:
            logger.error(f"❌ Erreur de connexion à la base de données: {e}")
            return False
    
    def disconnect(self):
        """Fermer la connexion à la base de données"""
        if self.connection:
            self.connection.close()
            logger.info("🔌 Connexion à la base de données fermée")
    
    def execute_query(self, query: str, params: Dict[str, Any] = None) -> Optional[Tuple]:
        """Exécuter une requête SQL en lecture seule"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params)
                return cursor.fetchall()
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'exécution de la requête: {e}")
            return None
    
    def check_constitution_broken(self) -> Tuple[bool, str]:
        """
        Étape A — Vérifier l'état global du système
        
        Le système est-il en constitution broken ?
        """
        query = """
        SELECT 1
        FROM domain_events
        WHERE event_type = 'CONSTITUTION_BROKEN_ENTERED'
          AND NOT EXISTS (
            SELECT 1 FROM domain_events
            WHERE event_type = 'CONSTITUTION_RESTORED'
              AND sequence >
                  (SELECT MAX(sequence)
                   FROM domain_events
                   WHERE event_type = 'CONSTITUTION_BROKEN_ENTERED')
          )
        LIMIT 1;
        """
        
        result = self.execute_query(query)
        
        if result and len(result) > 0:
            logger.warning("🚨 Système en mode CONSTITUTION BROKEN")
            return True, "CONSTITUTION_BROKEN: Le système est dans un état constitutionnel brisé"
        
        logger.info("✅ Système constitutionnellement sain")
        return False, ""
    
    def check_p0_proof_exists(self, domain_event_id: str) -> Tuple[bool, str]:
        """
        Étape B — Vérifier les preuves P0 liées au fait
        """
        query = """
        SELECT COUNT(*) = 0 AS missing_proof
        FROM build_proof_anchors
        WHERE domain_event_id = %s
          AND level = 'P0_CONSTITUTIONAL';
        """
        
        result = self.execute_query(query, (domain_event_id,))
        
        if result and len(result) > 0:
            missing_proof = result[0][0]
            if missing_proof:
                reason = f"MISSING_P0_PROOF: Aucune preuve P0 trouvée pour l'événement {domain_event_id}"
                logger.warning(f"🚨 {reason}")
                return True, reason
        
        logger.info(f"✅ Preuve P0 trouvée pour l'événement {domain_event_id}")
        return False, ""
    
    def check_proof_chain_continuity(self) -> Tuple[bool, str]:
        """
        Étape C — Vérifier la continuité des preuves
        """
        query = """
        WITH ordered AS (
          SELECT
            sequence,
            current_anchor_hash,
            lag(current_anchor_hash) OVER (ORDER BY sequence) AS prev
          FROM build_proof_anchors
        )
        SELECT 1
        FROM ordered
        WHERE prev IS NOT NULL
          AND prev IS DISTINCT FROM (
            SELECT previous_anchor_hash
            FROM build_proof_anchors b
            WHERE b.sequence = ordered.sequence
          )
        LIMIT 1;
        """
        
        result = self.execute_query(query)
        
        if result and len(result) > 0:
            logger.warning("🚨 Chaîne de preuves brisée détectée")
            return True, "PROOF_CHAIN_BROKEN: La continuité des preuves est compromise"
        
        logger.info("✅ Chaîne de preuves continue")
        return False, ""
    
    def check_environmental_policy(self, environment: str) -> Tuple[bool, str]:
        """
        Étape D — Règles environnementales
        """
        if environment.lower() == "production":
            # Exemple prod : audit récent obligatoire
            query = """
            SELECT now() - MAX(timestamp) < interval '60 minutes' as audit_recent
            FROM build_proof_anchors
            WHERE build_proof_type = 'AUDIT_REPORT';
            """
            
            result = self.execute_query(query)
            
            if result and len(result) > 0:
                audit_recent = result[0][0]
                if not audit_recent:
                    reason = "ENV_POLICY_FAILED: Aucun audit récent (< 60min) trouvé pour la production"
                    logger.warning(f"🚨 {reason}")
                    return True, reason
        
        logger.info(f"✅ Politique environnementale respectée pour {environment}")
        return False, ""
    
    def check_ci_legitimacy_report(self, ci_report: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Étape CI - Vérifier le rapport de légitimité CI
        """
        try:
            overall_status = ci_report.get('claims', {}).get('overall_status', 'ILLEGITIMATE')
            
            if overall_status != 'LEGITIMATE':
                reason = f"CI_REPORT_ILLEGITIMATE: Le rapport CI déclare {overall_status}"
                logger.warning(f"🚨 {reason}")
                return True, reason
            
            # Vérifier la fraîcheur du rapport
            generated_at = ci_report.get('environment', {}).get('generated_at_db')
            if generated_at:
                try:
                    from datetime import datetime
                    report_time = datetime.fromisoformat(generated_at.replace('Z', '+00:00'))
                    current_time = datetime.utcnow()
                    age_minutes = (current_time - report_time).total_seconds() / 60
                    
                    if age_minutes > 30:  # TTL de 30 minutes
                        reason = f"CI_REPORT_EXPIRED: Rapport trop ancien ({age_minutes:.1f} minutes)"
                        logger.warning(f"🚨 {reason}")
                        return True, reason
                except Exception as e:
                    logger.warning(f"Impossible de parser la date du rapport CI: {e}")
            
            logger.info("✅ Rapport de légitimité CI valide")
            return False, ""
            
        except Exception as e:
            reason = f"CI_REPORT_ERROR: Erreur lors de la validation du rapport CI: {str(e)}"
            logger.error(f"❌ {reason}")
            return True, reason
    
    def write_ci_state_to_ledger(self, request: GovernanceRequest, decision: GovernanceDecision, ci_report: Dict[str, Any]) -> bool:
        """
        Écrire l'état CI dans le ledger comme fait immuable
        
        La décision du Guardian devient un fait officiel.
        """
        query = """
        INSERT INTO domain_events (
            id,
            aggregate_id,
            aggregate_type,
            event_type,
            event_data,
            current_hash,
            sequence,
            timestamp,
            source
        ) VALUES (
            %s,
            %s,
            'GOVERNANCE',
            'GOVERNANCE_CI_STATE_SET',
            %s,
            %s,
            COALESCE((SELECT MAX(sequence) FROM domain_events), 0) + 1,
            %s,
            'GOVERNANCE_GUARDIAN'
        );
        """
        
        try:
            event_id = str(uuid.uuid4())
            
            # Calculer l'expiration
            from datetime import datetime, timedelta
            ttl_minutes = ci_report.get('validity', {}).get('ttl_minutes', 30)
            expires_at = decision.decision_timestamp + timedelta(minutes=ttl_minutes)
            
            # Construire les données de l'événement
            event_data = Json({
                'ci_event_id': request.domain_event_id,
                'pipeline_run_id': ci_report.get('pipeline', {}).get('run_id', ''),
                'commit': ci_report.get('pipeline', {}).get('commit', ''),
                'environment': ci_report.get('environment', {}).get('target', ''),
                'state': 'CI_LEGITIMATE' if decision.decision == 'ALLOW' else 'CI_ILLEGITIMATE',
                'expires_at': expires_at.isoformat(),
                'based_on': {
                    'ci_report_overall_status': ci_report.get('claims', {}).get('overall_status'),
                    'guardian_decision': decision.decision,
                    'guardian_reason': decision.reason
                },
                'metadata': {
                    'ci_provider': ci_report.get('pipeline', {}).get('provider', ''),
                    'branch': ci_report.get('pipeline', {}).get('branch', ''),
                    'repository': ci_report.get('pipeline', {}).get('repository', ''),
                    'requested_by': request.requested_by
                }
            })
            
            # Calculer le hash de l'événement
            event_content = f"{event_id}{request.domain_event_id}GOVERNANCE_CI_STATE_SET{decision.decision}{expires_at}"
            import hashlib
            event_hash = hashlib.sha256(event_content.encode()).hexdigest()
            
            with self.connection.cursor() as cursor:
                cursor.execute(query, (
                    event_id,
                    request.domain_event_id,
                    event_data,
                    event_hash,
                    decision.decision_timestamp
                ))
            
            self.connection.commit()
            logger.info(f"✅ État CI écrit dans le ledger: {decision.decision} pour {request.domain_event_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'écriture de l'état CI: {e}")
            self.connection.rollback()
            return False
    
    def check_ci_state_validity(self, environment: str) -> Tuple[bool, str]:
        """
        Vérifier si un état CI valide existe pour l'environnement
        
        REQUIRES:
          CI_STATE == CI_LEGITIMATE
          AND expires_at > now()
        """
        query = """
        SELECT 
            payload->>'state' as state,
            payload->>'expires_at' as expires_at,
            payload->>'environment' as env
        FROM domain_events
        WHERE event_type = 'GOVERNANCE_CI_STATE_SET'
          AND payload->>'environment' = %s
          AND payload->>'state' = 'CI_LEGITIMATE'
        ORDER BY sequence DESC
        LIMIT 1;
        """
        
        try:
            result = self.execute_query(query, (environment,))
            
            if not result or len(result) == 0:
                return True, "NO_VALID_CI_STATE: Aucun état CI légitime trouvé"
            
            state, expires_at, env = result[0]
            
            # Vérifier l'expiration
            if expires_at:
                from datetime import datetime
                expiry_time = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
                current_time = datetime.utcnow()
                
                if current_time > expiry_time:
                    return True, f"CI_STATE_EXPIRED: L'état CI a expiré à {expires_at}"
            
            logger.info(f"✅ État CI valide trouvé pour {environment}")
            return False, ""
            
        except Exception as e:
            reason = f"CI_STATE_CHECK_ERROR: Erreur lors de la vérification de l'état CI: {str(e)}"
            logger.error(f"❌ {reason}")
            return True, reason
    
    def record_decision(self, request: GovernanceRequest, decision: GovernanceDecision) -> bool:
        """
        Écrire la décision comme fait immuable
        
        Même la décision du Guardian est auditée.
        """
        query = """
        INSERT INTO domain_events (
            id,
            aggregate_id,
            aggregate_type,
            event_type,
            event_data,
            current_hash,
            sequence,
            timestamp,
            source
        ) VALUES (
            %s,
            %s,
            'GOVERNANCE',
            'GOVERNANCE_DECISION',
            %s,
            %s,
            COALESCE((SELECT MAX(sequence) FROM domain_events), 0) + 1,
            %s,
            'GOVERNANCE_GUARDIAN'
        );
        """
        
        try:
            event_id = str(uuid.uuid4())
            event_data = Json({
                'decision': decision.decision,
                'reason': decision.reason,
                'environment': request.environment,
                'action': request.action,
                'requested_by': request.requested_by,
                'based_on_facts': decision.based_on_facts,
                'domain_event_id': request.domain_event_id
            })
            
            # Calculer le hash de l'événement
            event_content = f"{event_id}{request.domain_event_id}GOVERNANCE{decision.decision}{decision.decision_timestamp}"
            import hashlib
            event_hash = hashlib.sha256(event_content.encode()).hexdigest()
            
            with self.connection.cursor() as cursor:
                cursor.execute(query, (
                    event_id,
                    request.domain_event_id,
                    event_data,
                    event_hash,
                    decision.decision_timestamp
                ))
            
            self.connection.commit()
            logger.info(f"✅ Décision enregistrée: {decision.decision} pour {request.domain_event_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'enregistrement de la décision: {e}")
            self.connection.rollback()
            return False
    
    def make_decision(self, request: GovernanceRequest, ci_report: Dict[str, Any] = None) -> GovernanceDecision:
        """
        Prendre une décision de gouvernance
        
        Logique:
        IF constitution_broken → DENY
        ELSE IF missing_p0_proof → DENY
        ELSE IF proof_chain_broken → DENY
        ELSE IF env_policy_failed → DENY
        ELSE IF ci_report_invalid → DENY
        ELSE IF ci_state_invalid → DENY
        ELSE → ALLOW
        """
        logger.info(f"🛡️ Évaluation de la requête de gouvernance: {request.action} pour {request.environment}")
        
        decision_timestamp = datetime.utcnow()
        based_on_facts = {
            'request': {
                'action': request.action,
                'environment': request.environment,
                'domain_event_id': request.domain_event_id,
                'requested_by': request.requested_by,
                'timestamp': request.timestamp.isoformat()
            },
            'checks': {}
        }
        
        # Étape A: Vérifier l'état constitutionnel
        is_broken, broken_reason = self.check_constitution_broken()
        based_on_facts['checks']['constitution_broken'] = {
            'result': is_broken,
            'reason': broken_reason if is_broken else "OK"
        }
        
        if is_broken:
            return GovernanceDecision(
                decision="DENY",
                reason=broken_reason,
                based_on_facts=based_on_facts,
                decision_timestamp=decision_timestamp
            )
        
        # Étape B: Vérifier les preuves P0
        missing_proof, proof_reason = self.check_p0_proof_exists(request.domain_event_id)
        based_on_facts['checks']['p0_proof_exists'] = {
            'result': missing_proof,
            'reason': proof_reason if missing_proof else "OK"
        }
        
        if missing_proof:
            return GovernanceDecision(
                decision="DENY",
                reason=proof_reason,
                based_on_facts=based_on_facts,
                decision_timestamp=decision_timestamp
            )
        
        # Étape C: Vérifier la continuité des preuves
        chain_broken, chain_reason = self.check_proof_chain_continuity()
        based_on_facts['checks']['proof_chain_continuity'] = {
            'result': chain_broken,
            'reason': chain_reason if chain_broken else "OK"
        }
        
        if chain_broken:
            return GovernanceDecision(
                decision="DENY",
                reason=chain_reason,
                based_on_facts=based_on_facts,
                decision_timestamp=decision_timestamp
            )
        
        # Étape D: Vérifier les politiques environnementales
        env_policy_failed, env_reason = self.check_environmental_policy(request.environment)
        based_on_facts['checks']['environmental_policy'] = {
            'result': env_policy_failed,
            'reason': env_reason if env_policy_failed else "OK"
        }
        
        if env_policy_failed:
            return GovernanceDecision(
                decision="DENY",
                reason=env_reason,
                based_on_facts=based_on_facts,
                decision_timestamp=decision_timestamp
            )
        
        # Étape E: Vérifier le rapport de légitimité CI (si présent)
        if ci_report:
            ci_invalid, ci_reason = self.check_ci_legitimacy_report(ci_report)
            based_on_facts['checks']['ci_legitimacy_report'] = {
                'result': ci_invalid,
                'reason': ci_reason if ci_invalid else "OK"
            }
            
            if ci_invalid:
                return GovernanceDecision(
                    decision="DENY",
                    reason=ci_reason,
                    based_on_facts=based_on_facts,
                    decision_timestamp=decision_timestamp
                )
        else:
            # Si pas de rapport CI, vérifier l'état CI existant
            ci_state_invalid, ci_state_reason = self.check_ci_state_validity(request.environment)
            based_on_facts['checks']['ci_state_validity'] = {
                'result': ci_state_invalid,
                'reason': ci_state_reason if ci_state_invalid else "OK"
            }
            
            if ci_state_invalid:
                return GovernanceDecision(
                    decision="DENY",
                    reason=ci_state_reason,
                    based_on_facts=based_on_facts,
                    decision_timestamp=decision_timestamp
                )
        
        # Si toutes les vérifications passent
        latest_anchor = self.get_latest_anchor_hash()
        based_on_facts['latest_anchor_hash'] = latest_anchor
        
        return GovernanceDecision(
            decision="ALLOW",
            reason="ALL_CHECKS_PASSED: Toutes les vérifications constitutionnelles sont réussies",
            based_on_facts=based_on_facts,
            decision_timestamp=decision_timestamp
        )
    
    def authorize(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Endpoint principal d'autorisation
        
        POST /governance/authorize
        
        Supporte maintenant les requêtes CI avec rapport de légitimité
        """
        try:
            # Valider et créer la requête
            request = GovernanceRequest(
                action=request_data.get('action', ''),
                environment=request_data.get('environment', ''),
                domain_event_id=request_data.get('domain_event_id', ''),
                requested_by=request_data.get('requested_by', ''),
                timestamp=datetime.utcnow()
            )
            
            # Validation basique
            if not all([request.action, request.environment, request.domain_event_id, request.requested_by]):
                return {
                    'decision': 'DENY',
                    'reason': 'INVALID_REQUEST: Champs requis manquants',
                    'timestamp': datetime.utcnow().isoformat(),
                    'request_id': str(uuid.uuid4())
                }
            
            # Extraire le rapport CI si présent
            ci_report = request_data.get('ci_report', None)
            
            # Prendre la décision
            decision = self.make_decision(request, ci_report)
            
            # Enregistrer la décision standard
            if not self.record_decision(request, decision):
                logger.error("❌ Impossible d'enregistrer la décision")
            
            # Écrire l'état CI dans le ledger si rapport CI présent
            if ci_report and decision.decision == 'ALLOW':
                if not self.write_ci_state_to_ledger(request, decision, ci_report):
                    logger.warning("⚠️ Impossible d'écrire l'état CI dans le ledger")
            
            # Construire la réponse
            response = {
                'decision': decision.decision,
                'reason': decision.reason,
                'timestamp': decision.decision_timestamp.isoformat(),
                'request_id': str(uuid.uuid4()),
                'based_on_facts': decision.based_on_facts
            }
            
            # Ajouter les informations CI si pertinent
            if ci_report:
                response['ci_state'] = 'WRITTEN' if decision.decision == 'ALLOW' else 'REJECTED'
                response['ci_report_validated'] = True
            
            logger.info(f"🛡️ Décision finale: {decision.decision} - {decision.reason}")
            return response
            
        except Exception as e:
            logger.error(f"❌ Erreur lors du traitement de la requête: {e}")
            return {
                'decision': 'DENY',
                'reason': f'INTERNAL_ERROR: {str(e)}',
                'timestamp': datetime.utcnow().isoformat(),
                'request_id': str(uuid.uuid4())
            }

class GuardianAPI:
    """
    API REST minimaliste pour le Guardian de gouvernance
    """
    
    def __init__(self, guardian: GovernanceGuardian):
        self.guardian = guardian
    
    def handle_authorize(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handler pour l'endpoint /governance/authorize"""
        return self.guardian.authorize(request_data)

def main():
    """Point d'entrée principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Guardian de Gouvernance SPOFE')
    parser.add_argument('--action', choices=['authorize', 'check'], required=True, help='Action à exécuter')
    parser.add_argument('--data', help='Données JSON en entrée (pour authorize)')
    parser.add_argument('--db-host', default=os.getenv('SPOFE_DB_HOST', 'localhost'), help='Hôte de la base de données')
    parser.add_argument('--db-port', default=os.getenv('SPOFE_DB_PORT', '5432'), help='Port de la base de données')
    parser.add_argument('--db-name', default=os.getenv('SPOFE_DB_NAME', 'spofe'), help='Nom de la base de données')
    parser.add_argument('--db-user', default=os.getenv('SPOFE_DB_USER', 'spofe_user'), help='Utilisateur de la base de données')
    parser.add_argument('--db-password', default=os.getenv('SPOFE_DB_PASSWORD', ''), help='Mot de passe de la base de données')
    
    args = parser.parse_args()
    
    # Configuration de la base de données
    db_config = {
        'host': args.db_host,
        'port': args.db_port,
        'database': args.db_name,
        'user': args.db_user,
        'password': args.db_password
    }
    
    # Initialiser le Guardian
    guardian = GovernanceGuardian(db_config)
    
    if not guardian.connect():
        logger.error("❌ Impossible de se connecter à la base de données")
        sys.exit(1)
    
    try:
        if args.action == 'authorize':
            if not args.data:
                logger.error("❌ --data requis pour l'action authorize")
                sys.exit(1)
            
            try:
                request_data = json.loads(args.data)
            except json.JSONDecodeError as e:
                logger.error(f"❌ JSON invalide: {e}")
                sys.exit(1)
            
            api = GuardianAPI(guardian)
            response = api.handle_authorize(request_data)
            print(json.dumps(response, indent=2))
            
        elif args.action == 'check':
            # Vérification de l'état du système
            logger.info("🔍 Vérification de l'état du système...")
            
            is_broken, _ = guardian.check_constitution_broken()
            chain_broken, _ = guardian.check_proof_chain_continuity()
            
            status = {
                'constitution_broken': is_broken,
                'proof_chain_broken': chain_broken,
                'system_status': 'HEALTHY' if not (is_broken or chain_broken) else 'COMPROMISED',
                'timestamp': datetime.utcnow().isoformat()
            }
            
            print(json.dumps(status, indent=2))
    
    finally:
        guardian.disconnect()

if __name__ == '__main__':
    main()
