import express from "express";
import cors from "cors";
import {
  getProductDetail,
  getDetailCashback,
  getDetailGift,
  getCashbackBMS1,
  getProductPromos,
} from "./src/routes/product.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint API Produk
app.get("/api/products/:plu", getProductDetail);
app.get("/api/products/:plu/promos", getProductPromos);

// Endpoint API Detail Promo
app.get("/api/promo/cashback/:kodePromosi", getDetailCashback);
app.get("/api/promo/gift/:kodePromosi", getDetailGift);

// Endpoint API Cashback BMS1
app.get("/api/cashback-bms1/:plu", getCashbackBMS1);

app.listen(port, () => {
  console.log(`API Server berjalan di http://localhost:${port}`);
});
