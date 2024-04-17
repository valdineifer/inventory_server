import express from 'express';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({}));

app.post('/inventory');

export default app;
