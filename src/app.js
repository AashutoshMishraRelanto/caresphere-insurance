const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const { errorHandler, notFound } = require('./middleware/errorHandler');
const auditLogger = require('./middleware/audit');

const authRoutes = require('./routes/authRoutes');
const insuranceRoutes = require('./routes/insuranceRoutes');
const providerRoutes = require('./routes/providerRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Apply Audit Logger (Log all requests)
app.use(auditLogger);

// Swagger setup
try {
  const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.log('Swagger document not found. Skipping swagger setup.');
}

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/insurance', insuranceRoutes);
app.use('/api/v1/providers', providerRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

// Temporary Seed Route
app.get('/seed-database-1234', async (req, res) => {
  try {
    const { seedDB } = require('./utils/seed');
    const result = await seedDB();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
