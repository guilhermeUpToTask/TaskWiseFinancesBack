import express from 'express';
import cors from 'cors';
import wallet_router from './routes/wallet_router';
import wallet_operation_router from './routes/wallet_operation_router';

const app = express();

app.use(express.json());
app.use(cors({credentials: true, origin: true}));

// Add your routes here
app.use('/wallet', wallet_router);
app.use('/wallet_operation', wallet_operation_router);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});