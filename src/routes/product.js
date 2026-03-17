// src/api/product.js
import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// Prisma client 7.5.0 butuh argumen object non-empty
const prisma = new PrismaClient({ log: ['error', 'warn'] });

export const getProductDetail = async (req, res) => {
  let { plu } = req.params;
  
  try {
    // 1. Cek apakah yang diinput itu Barcode (kalau bukan PLU)
    // Sesuai logika: SELECT SUBSTR(brc_prdcd,1,6) || '0' FROM tbmaster_barcode
    if (plu.length > 7) { 
      const barcodeData = await prisma.tbmaster_barcode.findFirst({
        where: { brc_barcode: plu },
        select: { brc_prdcd: true }
      });
      if (barcodeData) plu = barcodeData.brc_prdcd;
    }

    // Normalisasi PLU (SUBSTR(kodePLU, 0, 6) + '0')
    const normalizedPlu = plu.substring(0, 6) + '0';

    // 2. Tarik data dari tbmaster_prodmast
    // Catatan: Pastikan nama tabel dan relasi sesuai dengan schema.prisma lo
    const product = await prisma.tbmaster_prodmast.findFirst({
      where: { prd_prdcd: normalizedPlu },
      select: {
        prd_prdcd: true,
        prd_deskripsipanjang: true,
        prd_kodedivisi: true,
        prd_kodedepartement: true,
        prd_kodekategoribarang: true,
        prd_unit: true,
        // Tambahin field lain sesuai kebutuhan dari query lama lo
      }
    });

    if (!product) {
      return res.status(404).json({ message: "Data Produk tidak ditemukan!" });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database Server Error" });
  }
};