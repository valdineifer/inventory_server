import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(4000, () => {
   // eslint-disable-next-line no-console
   console.log(`🚀 Server ready at: http://${process.env.SERVER_URL}:${PORT}`);
});
