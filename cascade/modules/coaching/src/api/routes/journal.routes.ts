import { Router } from 'express';
import { JournalController } from '../controllers/JournalController';

export const journalRoutes = Router();

journalRoutes.get(
  '/coaching/journal',
  JournalController.list
);
