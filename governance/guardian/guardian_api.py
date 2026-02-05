#!/usr/bin/env python3
"""
🛡️ Guardian API - Endpoint Flask pour le Guardian de gouvernance
Mode "la légitimité devient un état système exécutable"

API REST minimaliste pour le Guardian de gouvernance.
Interface contractuelle pour les systèmes CI/CD et les applications.
"""

from flask import Flask, request, jsonify
import os
import sys
import json
import logging
from datetime import datetime
from governance_guardian import GovernanceGuardian, GuardianAPI

# Configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configuration de la base de données
DB_CONFIG = {
    'host': os.getenv('SPOFE_DB_HOST', 'localhost'),
    'port': os.getenv('SPOFE_DB_PORT', '5432'),
    'database': os.getenv('SPOFE_DB_NAME', 'spofe'),
    'user': os.getenv('SPOFE_DB_USER', 'spofe_user'),
    'password': os.getenv('SPOFE_DB_PASSWORD', '')
}

# Initialiser le Guardian
guardian = GovernanceGuardian(DB_CONFIG)
api = GuardianAPI(guardian)

@app.before_first_request
def initialize_guardian():
    """Initialiser le Guardian au démarrage"""
    if not guardian.connect():
        logger.error("❌ Impossible de se connecter à la base de données")
        sys.exit(1)
    logger.info("✅ Guardian de gouvernance initialisé")

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de santé"""
    try:
        # Vérification basique de la connexion
        is_broken, _ = guardian.check_constitution_broken()
        
        return jsonify({
            'status': 'healthy',
            'guardian_initialized': True,
            'constitution_broken': is_broken,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        logger.error(f"❌ Erreur de santé: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@app.route('/governance/authorize', methods=['POST'])
def authorize():
    """
    Endpoint principal d'autorisation
    
    POST /governance/authorize
    
    Payload:
    {
      "action": "DEPLOY",
      "environment": "production",
      "domain_event_id": "uuid",
      "requested_by": "ci"
    }
    """
    try:
        # Valider le content-type
        if not request.is_json:
            return jsonify({
                'decision': 'DENY',
                'reason': 'INVALID_CONTENT_TYPE: Content-Type doit être application/json',
                'timestamp': datetime.utcnow().isoformat(),
                'request_id': None
            }), 400
        
        # Récupérer et valider les données
        request_data = request.get_json()
        
        if not request_data:
            return jsonify({
                'decision': 'DENY',
                'reason': 'EMPTY_PAYLOAD: Le corps de la requête est vide',
                'timestamp': datetime.utcnow().isoformat(),
                'request_id': None
            }), 400
        
        # Traiter la requête
        response = api.handle_authorize(request_data)
        
        # Retourner la réponse avec le code HTTP approprié
        status_code = 200 if response['decision'] == 'ALLOW' else 403
        
        return jsonify(response), status_code
        
    except Exception as e:
        logger.error(f"❌ Erreur lors du traitement de la requête: {e}")
        return jsonify({
            'decision': 'DENY',
            'reason': f'INTERNAL_ERROR: {str(e)}',
            'timestamp': datetime.utcnow().isoformat(),
            'request_id': None
        }), 500

@app.route('/governance/status', methods=['GET'])
def governance_status():
    """
    Endpoint de statut de gouvernance
    
    GET /governance/status
    """
    try:
        # Vérifier l'état du système
        is_broken, broken_reason = guardian.check_constitution_broken()
        chain_broken, chain_reason = guardian.check_proof_chain_continuity()
        latest_anchor = guardian.get_latest_anchor_hash()
        
        status = {
            'system_status': 'HEALTHY' if not (is_broken or chain_broken) else 'COMPROMISED',
            'checks': {
                'constitution_broken': {
                    'result': is_broken,
                    'reason': broken_reason if is_broken else "OK"
                },
                'proof_chain_broken': {
                    'result': chain_broken,
                    'reason': chain_reason if chain_broken else "OK"
                }
            },
            'latest_anchor_hash': latest_anchor,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return jsonify(status), 200
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération du statut: {e}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@app.route('/governance/verify/<domain_event_id>', methods=['GET'])
def verify_domain_event(domain_event_id):
    """
    Endpoint de vérification d'un événement spécifique
    
    GET /governance/verify/<domain_event_id>
    """
    try:
        # Vérifier si l'événement a une preuve P0
        missing_proof, proof_reason = guardian.check_p0_proof_exists(domain_event_id)
        
        verification = {
            'domain_event_id': domain_event_id,
            'has_p0_proof': not missing_proof,
            'reason': proof_reason if missing_proof else "P0 proof found",
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return jsonify(verification), 200
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la vérification de l'événement: {e}")
        return jsonify({
            'error': str(e),
            'domain_event_id': domain_event_id,
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Gestionnaire 404"""
    return jsonify({
        'decision': 'DENY',
        'reason': 'ENDPOINT_NOT_FOUND: L\'endpoint demandé n\'existe pas',
        'timestamp': datetime.utcnow().isoformat(),
        'request_id': None
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """Gestionnaire 405"""
    return jsonify({
        'decision': 'DENY',
        'reason': 'METHOD_NOT_ALLOWED: Méthode HTTP non autorisée',
        'timestamp': datetime.utcnow().isoformat(),
        'request_id': None
    }), 405

@app.errorhandler(500)
def internal_error(error):
    """Gestionnaire 500"""
    logger.error(f"❌ Erreur interne du serveur: {error}")
    return jsonify({
        'decision': 'DENY',
        'reason': 'INTERNAL_SERVER_ERROR: Erreur interne du serveur',
        'timestamp': datetime.utcnow().isoformat(),
        'request_id': None
    }), 500

def create_app():
    """Factory pour créer l'application Flask"""
    return app

if __name__ == '__main__':
    # Configuration du serveur
    host = os.getenv('GUARDIAN_HOST', '0.0.0.0')
    port = int(os.getenv('GUARDIAN_PORT', 8080))
    debug = os.getenv('GUARDIAN_DEBUG', 'false').lower() == 'true'
    
    logger.info(f"🛡️ Démarrage du Guardian de gouvernance sur {host}:{port}")
    logger.info(f"🔧 Mode debug: {debug}")
    
    try:
        app.run(host=host, port=port, debug=debug)
    except KeyboardInterrupt:
        logger.info("🛡️ Arrêt du Guardian de gouvernance")
    finally:
        guardian.disconnect()
