import express from 'express';
import cors from 'cors';
import { getProductDetail } from './src/routes/product.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint API Produk
app.get('/api/products/:plu', getProductDetail);

app.listen(port, () => {
  console.log(`API Server berjalan di http://localhost:${port}`);
});
