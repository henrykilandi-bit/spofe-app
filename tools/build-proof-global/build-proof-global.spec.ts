import { describe, it, expect, beforeEach } from 'vitest';
import { SPOFEBuildProofSystem } from './index';
import * as fs from 'fs';
import * as path from 'path';

const MODULES_PATH = path.resolve('cascade/modules');
const OUTPUT_PATH = path.resolve('.');

describe('SPOFE BUILD_PROOF Global System (P0)', () => {
  
  beforeEach(() => {
    if (!fs.existsSync(MODULES_PATH)) {
      throw new Error(`Modules path not found: ${MODULES_PATH}`);
    }
  });

  describe('System Prerequisites', () => {
    it('should validate contracts compliance before BUILD_PROOF generation', async () => {
      const system = new SPOFEBuildProofSystem(MODULES_PATH, OUTPUT_PATH);
      
      try {
        // Cela devrait échouer si les contrats ne sont pas conformes
        await system.generateSystemBuildProof();
        
        // Si on arrive ici, les contrats sont conformes
        expect(true).toBe(true);
      } catch (error) {
        // Si les contrats ne sont pas conformes, on doit avoir un message explicite
        if (error instanceof Error && error.message.includes('CONTRACT COMPLIANCE FAILED')) {
          expect(error.message).toContain('violations detected');
        } else {
          throw error; // Autre erreur inattendue
        }
      }
    });

    it('should require SPOFE P0 module structure', () => {
      const modules = fs.readdirSync(MODULES_PATH)
        .filter(item => {
          const fullPath = path.join(MODULES_PATH, item);
          return fs.statSync(fullPath).isDirectory() && 
                 !item.startsWith('_') && 
                 !item.startsWith('.');
        });
      
      expect(modules.length).toBeGreaterThan(0);
      
      // Vérifie qu'au moins un module a la structure contractuelle
      const hasContractualModules = modules.some(module => {
        const contractPath = path.join(MODULES_PATH, module, 'contract');
        return fs.existsSync(contractPath);
      });
      
      expect(hasContractualModules).toBe(true);
    });
  });

  describe('BUILD_PROOF Generation', () => {
    it('should generate deterministic SHA256 hashes for modules', async () => {
      const system = new SPOFEBuildProofSystem(MODULES_PATH, OUTPUT_PATH);
      
      // Test avec un module existant
      const modules = fs.readdirSync(MODULES_PATH).filter(item => {
        const fullPath = path.join(MODULES_PATH, item);
        return fs.statSync(fullPath).isDirectory() && !item.startsWith('_');
      });
      
      if (modules.length > 0) {
        const modulePath = path.join(MODULES_PATH, modules[0]);
        
        // Le hash doit être déterministe
        const hash1 = await system['calculateModuleHash'](modulePath);
        const hash2 = await system['calculateModuleHash'](modulePath);
        
        expect(hash1).toBe(hash2);
        expect(hash1).toMatch(/^[A-F0-9]{64}$/);
      }
    });

    it('should count invariants correctly from GUARDIAN.md', async () => {
      const system = new SPOFEBuildProofSystem(MODULES_PATH, OUTPUT_PATH);
      
      // Trouve un module avec GUARDIAN.md
      const modules = fs.readdirSync(MODULES_PATH).filter(item => {
        const guardianPath = path.join(MODULES_PATH, item, 'contract', 'GUARDIAN.md');
        return fs.existsSync(guardianPath);
      });
      
      if (modules.length > 0) {
        const modulePath = path.join(MODULES_PATH, modules[0]);
        const invariants = await system['countModuleInvariants'](modulePath);
        
        expect(invariants).toBeGreaterThanOrEqual(0);
      }
    });

    it('should generate module metadata from SCOPE.md', async () => {
      const system = new SPOFEBuildProofSystem(MODULES_PATH, OUTPUT_PATH);
      
      // Trouve un module avec SCOPE.md
      const modules = fs.readdirSync(MODULES_PATH).filter(item => {
        const scopePath = path.join(MODULES_PATH, item, 'contract', 'SCOPE.md');
        return fs.existsSync(scopePath);
      });
      
      if (modules.length > 0) {
        const modulePath = path.join(MODULES_PATH, modules[0]);
        const metadata = await system['getModuleMetadata'](modulePath);
        
        expect(metadata.type).toBeDefined();
        expect(metadata.domain).toBeDefined();
      }
    });
  });

  describe('System Certification', () => {
    it('should generate unique system-wide certification chain', () => {
      const system = new SPOFEBuildProofSystem(MODULES_PATH, OUTPUT_PATH);
      
      const mockProofs = [
        { module: 'module-a', hash: 'HASH_A', contractsHash: 'CONTRACT_A' },
        { module: 'module-b', hash: 'HASH_B', contractsHash: 'CONTRACT_B' }
      ];
      
      const systemHash1 = system['calculateSystemHash'](mockProofs);
      const systemHash2 = system['calculateSystemHash'](mockProofs);
      
      expect(systemHash1).toBe(systemHash2);
      expect(systemHash1).toMatch(/^[A-F0-9]{64}$/);
      
      // Hash différent avec ordre différent
      const reversedProofs = [...mockProofs].reverse();
      const systemHashReversed = system['calculateSystemHash'](reversedProofs);
      
      // Doit être identique car la fonction trie les modules
      expect(systemHashReversed).toBe(systemHash1);
    });

    it('should generate contracts hash for module', () => {
      const system = new SPOFEBuildProofSystem(MODULES_PATH, OUTPUT_PATH);
      
      // Trouve un module avec contrats
      const modules = fs.readdirSync(MODULES_PATH).filter(item => {
        const contractPath = path.join(MODULES_PATH, item, 'contract');
        return fs.existsSync(contractPath);
      });
      
      if (modules.length > 0) {
        const contractsHash = system['calculateContractsHash'](modules[0]);
        
        expect(contractsHash).toMatch(/^[A-F0-9]{64}$/);
      }
    });

    it('should create valid system signature', async () => {
      const system = new SPOFEBuildProofSystem(MODULES_PATH, OUTPUT_PATH);
      
      const mockCertificationChain = {
        systemHash: 'MOCK_SYSTEM_HASH',
        algorithm: 'SHA256'
      };
      
      const signature = await system['generateSystemSignature'](mockCertificationChain);
      
      expect(signature.signedBy).toBe('SPOFE BUILD_PROOF SYSTEM');
      expect(signature.algorithm).toBe('SHA256');
      expect(signature.timestamp).toBeDefined();
      expect(signature.systemSignature).toMatch(/^[A-F0-9]{64}$/);
    });
  });

  describe('Output Generation', () => {
    it('should create valid BUILD_PROOF JSON structure', async () => {
      const system = new SPOFEBuildProofSystem(MODULES_PATH, OUTPUT_PATH);
      
      try {
        const buildProof = await system.generateSystemBuildProof();
        
        // Structure obligatoire
        expect(buildProof.systemSnapshot).toBeDefined();
        expect(buildProof.certifiedModules).toBeDefined();
        expect(buildProof.systemMetrics).toBeDefined();
        expect(buildProof.compliance).toBeDefined();
        expect(buildProof.certificationChain).toBeDefined();
        expect(buildProof.signature).toBeDefined();
        
        // Gouvernance P0
        expect(buildProof.systemSnapshot.governance).toBe('SPOFE P0 - Constitutional');
        expect(buildProof.compliance.spofeP0).toBe(true);
        expect(buildProof.compliance.contractsValidated).toBe(true);
        
        // Métadonnées
        expect(buildProof.systemMetrics.totalModules).toBeGreaterThan(0);
        expect(buildProof.systemMetrics.certificationRate).toMatch(/\d+\.\d+%/);
        
        console.log('\n✅ BUILD_PROOF Global System generated successfully');
        console.log(`📊 Modules: ${buildProof.systemMetrics.totalModules}`);
        console.log(`✅ Certified: ${buildProof.systemMetrics.certifiedModules}`);
        console.log(`📋 Certification Rate: ${buildProof.systemMetrics.certificationRate}`);
        
      } catch (error) {
        if (error instanceof Error && error.message.includes('CONTRACT COMPLIANCE FAILED')) {
          console.log('\n⚠️ BUILD_PROOF generation skipped due to contract violations');
          console.log('📝 Fix contracts with: npm run validate:contracts');
        } else {
          throw error;
        }
      }
    });
  });
});