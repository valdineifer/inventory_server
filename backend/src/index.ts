import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(4000, () => {
  console.log(`🚀 Server ready at port ${PORT}`);
});
