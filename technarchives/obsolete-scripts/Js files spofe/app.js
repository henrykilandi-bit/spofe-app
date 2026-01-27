const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');
const { errorHandler, notFound } = require('./middlewares/validate');

// Initialisation de l'application Express
const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging en développement
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api', require('./routes'));

// Route de base
app.get('/api', (req, res) => {
  res.json({
    message: 'API SPOFE-APP',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// Gestion des erreurs 404
app.use(notFound);

// Gestion des erreurs globales
app.use(errorHandler);

module.exports = app;