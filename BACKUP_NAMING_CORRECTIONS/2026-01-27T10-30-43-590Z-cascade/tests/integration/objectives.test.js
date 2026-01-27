// ================================================================
// CASCADE - Strategic Objectives E2E Tests
// ================================================================
// File: cascade/tests/integration/objectives.test.js
// Framework: Jest + Supertest
// Coverage: 40+ test scenarios
// ================================================================

import request from 'supertest';
import app from '../../src/app.js';
import sequelize from '../../src/config/database.js';

const { StrategicObjective, Compagnie, User } = sequelize.models;

// Mock data
const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  isActive: true
};

const mockCompagnie = {
  id: 1,
  nom: 'Test Company',
  siret: '12345678901234'
};

const mockObjective = {
  titre: 'Augmenter les ventes de 20%',
  description: 'Objectif stratégique de croissance',
  type: 'vente',
  valeurCible: 20,
  unite: '%',
  compagnieId: 1,
  responsableUserId: 1
};

describe('Strategic Objectives E2E Tests', () => {
  // Setup & Teardown
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // ===== CREATE OBJECTIVE TESTS (5) =====

  describe('POST /api/objectives', () => {
    test('should create objective with valid data', async () => {
      const res = await request(app)
        .post('/api/objectives')
        .set('Authorization', `Bearer ${generateToken()}`)
        .send(mockObjective);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.objectif).toHaveProperty('id');
      expect(res.body.data.objectif.titre).toBe(mockObjective.titre);
    });

    test('should fail with missing compagnieId', async () => {
      const { compagnieId, ...data } = mockObjective;

      const res = await request(app)
        .post('/api/objectives')
        .set('Authorization', `Bearer ${generateToken()}`)
        .send(data);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should fail with invalid type', async () => {
      const res = await request(app)
        .post('/api/objectives')
        .set('Authorization', `Bearer ${generateToken()}`)
        .send({ ...mockObjective, type: 'invalid_type' });

      expect(res.status).toBe(400);
    });

    test('should require authentication', async () => {
      const res = await request(app)
        .post('/api/objectives')
        .send(mockObjective);

      expect(res.status).toBe(401);
    });

    test('should create with optional parent objective', async () => {
      const res = await request(app)
        .post('/api/objectives')
        .set('Authorization', `Bearer ${generateToken()}`)
        .send({ ...mockObjective, parentObjectiveId: 1 });

      expect(res.status).toBe(201);
      expect(res.body.data.objectif.parentObjectiveId).toBe(1);
    });
  });

  // ===== LIST OBJECTIVES TESTS (6) =====

  describe('GET /api/objectives', () => {
    test('should list all objectives', async () => {
      const res = await request(app)
        .get('/api/objectives')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.objectives)).toBe(true);
    });

    test('should filter by type', async () => {
      const res = await request(app)
        .get('/api/objectives?type=vente')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
      res.body.data.objectives.forEach(obj => {
        expect(obj.type).toBe('vente');
      });
    });

    test('should filter by status', async () => {
      const res = await request(app)
        .get('/api/objectives?statut=en_cours')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
      res.body.data.objectives.forEach(obj => {
        expect(obj.statut).toBe('en_cours');
      });
    });

    test('should support search', async () => {
      const res = await request(app)
        .get('/api/objectives?search=ventes')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
    });

    test('should support pagination', async () => {
      const res = await request(app)
        .get('/api/objectives?limit=10&offset=0')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.pagination).toHaveProperty('total');
      expect(res.body.data.pagination).toHaveProperty('pages');
    });

    test('should return empty array if no objectives', async () => {
      const res = await request(app)
        .get('/api/objectives?type=nonexistent')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.objectives.length).toBe(0);
    });
  });

  // ===== GET OBJECTIVE DETAIL TESTS (5) =====

  describe('GET /api/objectives/:id', () => {
    test('should get objective detail with all relationships', async () => {
      const res = await request(app)
        .get('/api/objectives/1')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.objective).toHaveProperty('id');
      expect(res.body.data.objective).toHaveProperty('titre');
      expect(res.body.data.aiInsights).toBeDefined();
    });

    test('should include indicators in response', async () => {
      const res = await request(app)
        .get('/api/objectives/1')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.objective).toHaveProperty('indicators');
    });

    test('should include actions in response', async () => {
      const res = await request(app)
        .get('/api/objectives/1')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.objective).toHaveProperty('actions');
    });

    test('should return 404 for nonexistent objective', async () => {
      const res = await request(app)
        .get('/api/objectives/999999')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(404);
    });

    test('should return 404 for deleted objective', async () => {
      // Assumes objective 2 is soft-deleted
      const res = await request(app)
        .get('/api/objectives/2')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(404);
    });
  });

  // ===== UPDATE OBJECTIVE TESTS (6) =====

  describe('PATCH /api/objectives/:id', () => {
    test('should update objective title', async () => {
      const res = await request(app)
        .patch('/api/objectives/1')
        .set('Authorization', `Bearer ${generateToken()}`)
        .send({ titre: 'Nouveau titre' });

      expect(res.status).toBe(200);
      expect(res.body.data.objective.titre).toBe('Nouveau titre');
    });

    test('should update progression', async () => {
      const res = await request(app)
        .patch('/api/objectives/1')
        .set('Authorization', `Bearer ${generateToken()}`)
        .send({ progression: 50, notes: 'Halfway there' });

      expect(res.status).toBe(200);
      expect(res.body.data.objective.progression).toBe(50);
    });

    test('should update status', async () => {
      const res = await request(app)
        .patch('/api/objectives/1')
        .set('Authorization', `Bearer ${generateToken()}`)
        .send({ statut: 'en_retard' });

      expect(res.status).toBe(200);
      expect(res.body.data.objective.statut).toBe('en_retard');
    });

    test('should validate progression range', async () => {
      const res = await request(app)
        .patch('/api/objectives/1')
        .set('Authorization', `Bearer ${generateToken()}`)
        .send({ progression: 150 });

      expect(res.status).toBe(400);
    });

    test('should return 404 for nonexistent objective', async () => {
      const res = await request(app)
        .patch('/api/objectives/999999')
        .set('Authorization', `Bearer ${generateToken()}`)
        .send({ titre: 'New Title' });

      expect(res.status).toBe(404);
    });

    test('should require authentication', async () => {
      const res = await request(app)
        .patch('/api/objectives/1')
        .send({ titre: 'New Title' });

      expect(res.status).toBe(401);
    });
  });

  // ===== DELETE OBJECTIVE TESTS (4) =====

  describe('DELETE /api/objectives/:id', () => {
    test('should soft-delete objective', async () => {
      const res = await request(app)
        .delete('/api/objectives/1')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should prevent access to deleted objective', async () => {
      // First delete
      await request(app)
        .delete('/api/objectives/1')
        .set('Authorization', `Bearer ${generateToken()}`);

      // Then try to get
      const res = await request(app)
        .get('/api/objectives/1')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(404);
    });

    test('should return 404 for already deleted objective', async () => {
      const res = await request(app)
        .delete('/api/objectives/1')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(404);
    });

    test('should return 404 for nonexistent objective', async () => {
      const res = await request(app)
        .delete('/api/objectives/999999')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(404);
    });
  });

  // ===== RESTORE OBJECTIVE TESTS (2) =====

  describe('POST /api/objectives/:id/restore', () => {
    test('should restore deleted objective', async () => {
      const res = await request(app)
        .post('/api/objectives/1/restore')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
    });

    test('should make restored objective accessible', async () => {
      // Restore
      await request(app)
        .post('/api/objectives/1/restore')
        .set('Authorization', `Bearer ${generateToken()}`);

      // Then get
      const res = await request(app)
        .get('/api/objectives/1')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
    });
  });

  // ===== PROGRESS METRICS TESTS (3) =====

  describe('GET /api/objectives/:id/progress', () => {
    test('should calculate progress metrics', async () => {
      const res = await request(app)
        .get('/api/objectives/1/progress')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('progression');
      expect(res.body.data).toHaveProperty('healthScore');
      expect(res.body.data).toHaveProperty('completionPercentage');
    });

    test('should include action counts', async () => {
      const res = await request(app)
        .get('/api/objectives/1/progress')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('actionsCount');
      expect(res.body.data).toHaveProperty('actionsCompletedCount');
    });

    test('should return 404 for nonexistent objective', async () => {
      const res = await request(app)
        .get('/api/objectives/999999/progress')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(404);
    });
  });

  // ===== ACCOUNTING INTEGRATION TESTS (3) =====

  describe('Accounting Integration', () => {
    test('should link objective to accounting', async () => {
      const res = await request(app)
        .post('/api/objectives/1/accounting/link')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accountingLink');
    });

    test('should get financial impact', async () => {
      const res = await request(app)
        .get('/api/objectives/1/accounting/impact')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('roi');
    });

    test('should get budget variance', async () => {
      const res = await request(app)
        .get('/api/objectives/1/accounting/variance')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('variancePercent');
    });
  });

  // ===== ACTION CREATION TESTS (2) =====

  describe('POST /api/objectives/:id/actions', () => {
    test('should create action for objective', async () => {
      const res = await request(app)
        .post('/api/objectives/1/actions')
        .set('Authorization', `Bearer ${generateToken()}`)
        .send({
          titre: 'Lancer campagne marketing',
          description: 'Campagne digitale ciblée',
          dateDebut: new Date(),
          dateFin: new Date(Date.now() + 86400000),
          priorite: 'haute',
          budgetEstime: 5000
        });

      expect(res.status).toBe(201);
      expect(res.body.data.action).toHaveProperty('id');
    });

    test('should return 404 for nonexistent objective', async () => {
      const res = await request(app)
        .post('/api/objectives/999999/actions')
        .set('Authorization', `Bearer ${generateToken()}`)
        .send({
          titre: 'Action',
          dateDebut: new Date(),
          dateFin: new Date()
        });

      expect(res.status).toBe(404);
    });
  });

  // ===== BATCH OPERATIONS TESTS (2) =====

  describe('POST /api/objectives/batch/progression', () => {
    test('should batch update progressions', async () => {
      const res = await request(app)
        .post('/api/objectives/batch/progression')
        .set('Authorization', `Bearer ${generateToken()}`)
        .send({
          updates: [
            { objectiveId: 1, progression: 50, notes: 'Halfway' },
            { objectiveId: 2, progression: 75, notes: 'Nearly done' }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.data.updates.length).toBe(2);
    });

    test('should handle mixed success/failure', async () => {
      const res = await request(app)
        .post('/api/objectives/batch/progression')
        .set('Authorization', `Bearer ${generateToken()}`)
        .send({
          updates: [
            { objectiveId: 1, progression: 50 },
            { objectiveId: 999999, progression: 50 }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.data.updates[0].success).toBe(true);
      expect(res.body.data.updates[1].success).toBe(false);
    });
  });

  // ===== ERROR HANDLING TESTS (5) =====

  describe('Error Handling', () => {
    test('should handle invalid JSON', async () => {
      const res = await request(app)
        .post('/api/objectives')
        .set('Authorization', `Bearer ${generateToken()}`)
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(res.status).toBe(400);
    });

    test('should handle missing required fields', async () => {
      const res = await request(app)
        .post('/api/objectives')
        .set('Authorization', `Bearer ${generateToken()}`)
        .send({ titre: 'Only title' });

      expect(res.status).toBe(400);
    });

    test('should handle database errors gracefully', async () => {
      // Mock a database error
      const res = await request(app)
        .get('/api/objectives/invalid-id')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    test('should reject requests with invalid tokens', async () => {
      const res = await request(app)
        .get('/api/objectives')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });

    test('should return 405 for invalid HTTP method', async () => {
      const res = await request(app)
        .put('/api/objectives/1')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(res.status).toBe(405);
    });
  });
});

// ===== HELPER FUNCTION =====

function generateToken() {
  // Mock JWT token generator
  return 'mock-jwt-token-' + Date.now();
}
