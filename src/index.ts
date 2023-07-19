import express from 'express';
import { createClient } from '@supabase/supabase-js'
import cors from 'cors';
import supabase from './supabase';
import wallet_controller from './controllers/wallet_controller';

const app = express();

app.use(express.json());
app.use(cors());

// Add your routes here

wallet_controller.createRow('errir');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});