import express from 'express';
import inventory from './controllers/inventory';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({}));

app.post('/inventory', inventory);

export default app;
