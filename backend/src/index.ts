import 'dotenv/config';
import express from 'express';
import router from './routes';

const PORT = process.env.PORT || 4000;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({}));

app.use(router);

app.listen(4000, () => {
  console.log(`🚀 Server ready at port ${PORT}`);
});
