import express, { type Request, type Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { InMemoryDB } from './db.js';

import path from 'path';
import { fileURLToPath } from 'url';

// ESM helpers to get current directory ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

const db = new InMemoryDB();

// Serve the React Static Files ---
app.use(express.static(path.join(__dirname, '../public')));

// Swagger Configuration ---
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wallet API',
      version: '1.0.0',
      description: 'Wallet Management System API',
    },
    paths: {
      '/setup': {
        post: {
          summary: 'Initialize a new wallet',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { balance: { type: 'number' }, name: { type: 'string' } } } } }
          },
          responses: { 200: { description: 'Success' } }
        }
      },
      '/transact/{walletId}': {
        post: {
          summary: 'Execute a transaction',
          parameters: [{ in: 'path', name: 'walletId', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { amount: { type: 'number' }, description: { type: 'string' } } } } }
          },
          responses: { 200: { description: 'Success' } }
        }
      },
      '/transactions': {
        get: {
          summary: 'Fetch transactions',
          parameters: [{ in: 'query', name: 'walletId', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Success' } }
        }
      },
      '/wallet/{id}': {
        get: {
          summary: 'Get wallet details',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Success' } }
        }
      }
    }
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes ---

app.post('/setup', (req: Request, res: Response) => {
  const { balance, name } = req.body;
  const wallet = db.createWallet(name, balance);
  res.status(200).json(wallet);
});

app.post('/transact/:walletId', (req: Request, res: Response) => {
  const { amount, description } = req.body;
  const walletId = req.params.walletId;
  if (!walletId) return res.status(400).json({ error: "Required" });
  try {
    const transaction = db.addTransaction(walletId, amount, description);
    if (!transaction) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ balance: transaction.balance, transactionId: transaction.id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/transactions', (req: Request, res: Response) => {
  const { walletId, skip, limit } = req.query;
  const logs = db.getTransactions(
    walletId as string, 
    parseInt(skip as string) || 0, 
    parseInt(limit as string) || 10
  );
  res.status(200).json(logs);
});

app.get('/wallet/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "Required" });
  const wallet = db.getWallet(id);
  if (wallet) res.json(wallet);
  else res.status(404).json({ error: "Not found" });
});

app.get('*any', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(3000, '0.0.0.0', () => {
  console.log('🚀 Server: http://localhost:3000');
  console.log('📖 API Docs: http://localhost:3000/api-docs');
});
