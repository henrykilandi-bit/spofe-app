/**
 * 📝 EXEMPLES D'INTÉGRATION HTTP - Module Paramètres
 * 
 * ⚠️ IMPORTANT : Ce fichier est purement illustratif.
 * Le module Paramètres ne dépend d'aucun framework HTTP.
 * Les adaptateurs HTTP sont implémentés par les applications consommatrices.
 * 
 * Principe SPOFE : Séparation stricte module / transport
 */

/*

// Exemple Express.js (dans l'application, PAS dans le module)

import express from 'express';
import { ParametersReadController } from '@spofe/parametres';

const app = express();
const parametersController = new ParametersReadController(parametersRepository);

// GET /api/parameters/active
app.get('/api/parameters/active', async (req, res) => {
  try {
    const result = await parametersController.getActiveFrame();
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'No active parameters frame found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/parameters/:version  
app.get('/api/parameters/:version', async (req, res) => {
  try {
    const { version } = req.params;
    const result = await parametersController.getFrameByVersion(version);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: `Parameters frame version ${version} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/parameters
app.get('/api/parameters', async (req, res) => {
  try {
    const result = await parametersController.listFrames();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

*/

/*

// Exemple Fastify (dans l'application, PAS dans le module)

import fastify from 'fastify';
import { ParametersReadController } from '@spofe/parametres';

const server = fastify();
const parametersController = new ParametersReadController(parametersRepository);

// GET /api/parameters/active
server.get('/api/parameters/active', async (request, reply) => {
  const result = await parametersController.getActiveFrame();
  return result || reply.status(404).send({ error: 'Not found' });
});

// GET /api/parameters/:version
server.get<{ Params: { version: string } }>('/api/parameters/:version', async (request, reply) => {
  const { version } = request.params;
  const result = await parametersController.getFrameByVersion(version);
  return result || reply.status(404).send({ error: 'Not found' });
});

// GET /api/parameters
server.get('/api/parameters', async (request, reply) => {
  const result = await parametersController.listFrames();
  return result;
});

*/

export const HTTP_INTEGRATION_EXAMPLES = {
  note: 'Ces exemples sont purement illustratifs et ne font PAS partie du module Paramètres',
  principle: 'SPOFE sépare strictement les modules métier des frameworks de transport',
  usage: 'Les applications implémentent leurs propres adaptateurs HTTP'
};