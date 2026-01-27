import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock auth routes for testing
app.post('/api/auth/register', (req, res) => {
  console.log('🔴 Register endpoint called:', req.body);
  res.json({
    success: true,
    message: 'Utilisateur enregistré avec succès (mode test)',
    user: {
      id: Date.now(), // Ajout d'un ID réel
      userId: Date.now(),
      ...req.body
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('🔴 Login endpoint called:', req.body.email);
  res.json({
    success: true,
    data: {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: Date.now(),
        userId: Date.now(),
        email: req.body.email,
        role: 'super_utilisateur'
      }
    }
  });
});

app.get('/api/auth/check-email/:email', (req, res) => {
  console.log('🔴 Check email endpoint called:', req.params.email);
  res.json({
    available: true,
    message: 'Email disponible (mode test)'
  });
});

app.get('/api/auth/check-username/:username', (req, res) => {
  console.log('🔴 Check username endpoint called:', req.params.username);
  res.json({
    available: true,
    message: 'Username disponible (mode test)'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SPOFE v2.2 API Server Running (Minimal Test Mode)',
    version: '2.2.0',
    port: PORT
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur SPOFE minimal démarré sur http://127.0.0.1:${PORT}`);
  console.log(`🏥 Health check: http://127.0.0.1:${PORT}/health`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
});
