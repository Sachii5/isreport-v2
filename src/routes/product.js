// src/routes/product.js
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

import pkg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
const { Pool } = pkg;

// Load connection string dari environment
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Inisialisasi Prisma
const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"], // Reduce 'query' logs to keep terminal clean
});

// Simple in-memory cache (60 seconds TTL)
const cache = new Map();
const CACHE_TTL = 60000; // 60 seconds

const getFromCache = (key) => {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * Helper function to serialize BigInt values for JSON response.
 * Prisma's $queryRaw often returns BigInt which cannot be directly JSON.stringify'd.
 * @param {any} data - The data potentially containing BigInts.
 * @returns {any} - The data with BigInts converted to strings.
 */
const serializeBigInt = (data) =>
  JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );

export const getProductDetail = async (req, res) => {
  let { plu } = req.params; // Product Lookup Unit (PLU) or Barcode

  try {
    // 1. Strict Input Validation (Alphanumeric only, Max 20 characters)
    if (
      !plu ||
      typeof plu !== "string" ||
      plu.length > 20 ||
      !/^[a-zA-Z0-9]+$/.test(plu)
    ) {
      return res.status(400).json({ message: "Invalid PLU/Barcode format!" });
    }

    // 2. Check for Barcode (Bypass ORM using Raw SQL for performance/flexibility)
    // Prisma $queryRaw with tagged template literals is safe from SQL Injection.
    if (plu.length > 7) {
      // Assuming barcodes are typically longer than PLUs
      const barcodeData = await prisma.$queryRaw`
        SELECT brc_prdcd 
        FROM tbmaster_barcode 
        WHERE brc_barcode = ${plu} 
        LIMIT 1
      `;

      // If barcode found, update plu to its corresponding product code
      if (barcodeData && barcodeData.length > 0) {
        plu = barcodeData[0].brc_prdcd;
      }
    }

    // Derive normalized PLU and prefix for related data queries
    // Example: If plu is "1234567", normalizedPlu becomes "1234560" and pluPrefix "123456%"
    const normalizedPlu = plu.substring(0, 6) + "0";
    const pluPrefix = plu.substring(0, 6) + "%";

    // 3. Fetch all related product details in parallel for vertical expansion
    // Check cache first
    const cacheKey = `product_${plu}`;
    const cachedProduct = getFromCache(cacheKey);
    if (cachedProduct) {
      console.log(`[PERF] Cache hit for product: ${plu}`);
      return res.json(cachedProduct);
    }

    const startTime = Date.now();
    console.log(`[PERF] Starting queries for PLU: ${plu}`);

    const [
      productData,
      stockData,
      locationData,
      salesUnitData,
      pembatasanData,
      penjualanData,
      penerimaanData,
      trendSalesData,
    ] = await Promise.all([
      // Main Product Information
      prisma.$queryRaw`
        SELECT 
          prd_prdcd, 
          prd_deskripsipanjang, 
          prd_kodedivisi, 
          prd_kodedepartement, 
          prd_kodekategoribarang, 
          prd_unit 
        FROM tbmaster_prodmast 
        WHERE prd_prdcd = ${normalizedPlu} 
        LIMIT 1
      `,
      // Stock Information across different locations
      prisma.$queryRaw`
        SELECT 
          CASE
            WHEN st_lokasi = '01' THEN 'BK'
            WHEN st_lokasi = '02' THEN 'RT'
            WHEN st_lokasi = '03' THEN 'RS'
            ELSE st_lokasi -- Handle other locations if any
          END AS location_code,
          st_lokasi, 
          st_saldoawal, 
          st_trfin, 
          st_trfout, 
          st_sales, 
          st_retur, 
          st_adj, 
          st_intransit, 
          st_saldoakhir, 
          st_avgcost
        FROM tbmaster_stock
        WHERE st_prdcd LIKE ${pluPrefix}
        ORDER BY location_code
      `,
      // Location (Rack) Details
      prisma.$queryRaw`
        SELECT
          lks_koderak, 
          lks_kodesubrak, 
          lks_tiperak, 
          lks_shelvingrak, 
          lks_nourut, 
          lks_qty, 
          lks_expdate
        FROM tbmaster_lokasi
        WHERE lks_prdcd LIKE ${pluPrefix}
        ORDER BY lks_koderak, lks_kodesubrak, lks_tiperak, lks_shelvingrak, lks_nourut
      `,
      // Sales Unit and Pricing Information (different packaging/min_jual)
      prisma.$queryRaw`
        SELECT 
          prd_prdcd, 
          prd_unit, 
          prd_frac, 
          prd_hrgjual, 
          prd_avgcost, 
          prd_kodetag, 
          prd_flag_aktivasi, 
          prd_minjual
        FROM tbmaster_prodmast
        WHERE prd_prdcd LIKE ${pluPrefix}
        ORDER BY prd_minjual, prd_avgcost DESC
      `,
      // Pembatasan
      prisma.$queryRaw`
        SELECT *
        FROM (
            SELECT 'PEMBATASAN QTY' AS "ket",
                   prd_unit AS "satuan",
                   MTR_QTYREGULERBIRU AS "br",
                   MTR_QTYREGULERBIRUPLUS AS "bp",
                   MTR_QTYFREEPASS AS "fs",
                   MTR_QTYRETAILERMERAH AS "ret",
                   MTR_QTYSILVER AS "sil",
                   MTR_QTYGOLD1 AS "gd1",
                   MTR_QTYGOLD2 AS "gd2",
                   MTR_QTYGOLD3 AS "gd3",
                   MTR_QTYPLATINUM AS "pla"
            FROM TBTABEL_MAXTRANSAKSI
            LEFT JOIN tbmaster_prodmast ON TBTABEL_MAXTRANSAKSI.MTR_PRDCD = tbmaster_prodmast.PRD_PRDCD
            WHERE MTR_PRDCD LIKE ${pluPrefix}
            UNION ALL
            SELECT DISTINCT
                   'PEMBATASAN PROMO' AS "ket",
                   'CTN' AS "satuan",
                   CASE WHEN ALK_MEMBER = 'REGBIRUPLUS' THEN ALK_QTYALOKASI ELSE 0 END AS "br",
                   CASE WHEN ALK_MEMBER = 'REGBIRU' THEN ALK_QTYALOKASI ELSE 0 END AS "bp",
                   CASE WHEN ALK_MEMBER = 'FREEPASS' THEN ALK_QTYALOKASI ELSE 0 END AS "fs",
                   CASE WHEN ALK_MEMBER = 'RETMERAH' THEN ALK_QTYALOKASI ELSE 0 END AS "ret",
                   CASE WHEN ALK_MEMBER = 'SILVER' THEN ALK_QTYALOKASI ELSE 0 END AS "sil",
                   CASE WHEN ALK_MEMBER = 'GOLD1' THEN ALK_QTYALOKASI ELSE 0 END AS "gd1",
                   CASE WHEN ALK_MEMBER = 'GOLD2' THEN ALK_QTYALOKASI ELSE 0 END AS "gd2",
                   CASE WHEN ALK_MEMBER = 'GOLD3' THEN ALK_QTYALOKASI ELSE 0 END AS "gd3",
                   CASE WHEN ALK_MEMBER = 'PLATINUM' THEN ALK_QTYALOKASI ELSE 0 END AS "pla"
            FROM TBTR_PROMOMD_ALOKASI
            WHERE ALK_PRDCD LIKE ${pluPrefix}
        ) AS combined_result
      `,
      // History Penjualan
      prisma.$queryRaw`
        SELECT * 
        FROM tbtr_rekapsalesbulanan 
        WHERE rsl_prdcd LIKE ${pluPrefix}
        ORDER BY rsl_group DESC
      `,
      // History Penerimaan (Top 15)
      prisma.$queryRaw`
        SELECT
            m.mstd_kodesupplier as "mstd_kodesupplier",
            s.sup_namasupplier AS "mstd_namasupplier",
            m.mstd_qty as "mstd_qty",
            m.mstd_qtybonus1 as "mstd_qtybonus1",
            m.mstd_qtybonus2 as "mstd_qtybonus2",
            m.mstd_nodoc as "mstd_nodoc",
            TO_CHAR(m.mstd_tgldoc,'DD-MON-YYYY') AS "mstd_tgldoc",
            TO_CHAR(m.mstd_create_dt,'hh24:mi:ss') AS "mstd_jam",
            (m.mstd_gross - m.mstd_discrph) / (m.mstd_qty + 0.00000001) AS "mstd_lastcost",
            m.mstd_avgcost / m.mstd_frac AS "mstd_avgcost",
            m.mstd_create_dt as "mstd_create_dt"
        FROM tbtr_mstran_d m
        LEFT JOIN tbmaster_supplier s ON s.sup_kodesupplier = m.mstd_kodesupplier
        WHERE m.mstd_prdcd LIKE ${pluPrefix}
        AND m.mstd_typetrn IN ('B','L')
        AND m.mstd_recordid IS NULL
        ORDER BY m.mstd_create_dt DESC
        LIMIT 15
      `,
      // Trend Sales
      prisma.$queryRaw`
        SELECT 
           a.*,
           b.ST_SALES as "st_sales",
           CASE
               WHEN p.PRD_UNIT = 'KG' AND p.PRD_FRAC = 1000
                   THEN (b.ST_SALES * b.ST_AVGCOST) / p.PRD_FRAC
               ELSE b.ST_SALES * b.ST_AVGCOST
           END AS "hpp"
        FROM TBTR_SALESBULANAN a
        LEFT JOIN TBMASTER_STOCK b ON a.SLS_PRDCD = b.ST_PRDCD AND b.ST_LOKASI = '01'
        LEFT JOIN tbmaster_prodmast p ON a.SLS_PRDCD = p.PRD_PRDCD
        WHERE a.SLS_PRDCD LIKE ${pluPrefix}
      `,
    ]);

    const queryTime = Date.now() - startTime;
    console.log(`[PERF] All queries completed in ${queryTime}ms`);

    // 4. Handle Product Not Found
    if (!productData || productData.length === 0) {
      return res.status(404).json({ message: "Product data not found!" });
    }

    // 5. Send combined and serialized data to the client
    const result = {
      product: serializeBigInt(productData[0]),
      stock: serializeBigInt(stockData) || [],
      locations: serializeBigInt(locationData) || [],
      salesUnits: serializeBigInt(salesUnitData) || [],
      pembatasan: serializeBigInt(pembatasanData) || [],
      penjualan: serializeBigInt(penjualanData) || [],
      penerimaan: serializeBigInt(penerimaanData) || [],
      trendSales: serializeBigInt(trendSalesData) || [],
    };

    // Cache the result
    setCache(cacheKey, result);
    res.json(result);
  } catch (error) {
    // Prevent sensitive error leakage to the client
    console.error("Database Query Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

// Get Detail Cashback by Kode Promosi
export const getDetailCashback = async (req, res) => {
  const { kodePromosi } = req.params;

  try {
    if (!kodePromosi || typeof kodePromosi !== "string") {
      return res.status(400).json({ message: "Invalid promo code!" });
    }

    const details = await prisma.$queryRaw`
      SELECT 
        cbd_kodepromosi,
        cbh_mekanisme,
        cbd_prdcd,
        prd_deskripsipanjang,
        cbd_cashback,
        cbd_flagkelipatan,
        cbd_minstruk,
        cbd_maxstruk,
        cbd_alokasistok
      FROM tbtr_cashback_dtl
      LEFT JOIN tbmaster_prodmast ON cbd_prdcd = prd_prdcd
      LEFT JOIN tbtr_cashback_hdr ON cbd_kodepromosi = cbh_kodepromosi
      WHERE cbd_kodepromosi = ${kodePromosi}
    `;

    res.json({ details: serializeBigInt(details) || [] });
  } catch (error) {
    console.error("Database Query Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
};

// Get Detail Gift by Kode Promosi
export const getDetailGift = async (req, res) => {
  const { kodePromosi } = req.params;

  try {
    if (!kodePromosi || typeof kodePromosi !== "string") {
      return res.status(400).json({ message: "Invalid promo code!" });
    }

    const details = await prisma.$queryRaw`
      SELECT 
        gfd_kodepromosi,
        gfd_prdcd,
        prd_deskripsipanjang,
        gfh_mekanisme,
        CASE 
          WHEN non_prdcd IS NOT NULL THEN 'PLU LARANGAN' 
          ELSE 'DILUAR ITEM LARANGAN' 
        END AS ket
      FROM tbtr_gift_dtl
      LEFT JOIN tbmaster_prodmast ON gfd_prdcd = prd_prdcd
      LEFT JOIN tbmaster_plunonpromo ON gfd_prdcd = non_prdcd
      LEFT JOIN tbtr_gift_hdr ON gfh_kodepromosi = gfd_kodepromosi
      WHERE gfd_kodepromosi = ${kodePromosi}
    `;

    res.json({ details: serializeBigInt(details) || [] });
  } catch (error) {
    console.error("Database Query Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
};

// Get Cashback BMS1 - Harga, CB, Net per Member Type
export const getCashbackBMS1 = async (req, res) => {
  let { plu } = req.params;

  try {
    if (
      !plu ||
      typeof plu !== "string" ||
      plu.length > 20 ||
      !/^[a-zA-Z0-9]+$/.test(plu)
    ) {
      return res.status(400).json({ message: "Invalid PLU format!" });
    }

    const pluPrefix = plu.substring(0, 6) + "%";

    // Query untuk mendapatkan harga, cashback, dan net per member type
    const data = await prisma.$queryRaw`
      SELECT 
        prd_prdcd as plu,
        prd_unit as unit,
        prd_frac as frac,
        prd_minjual as minjual,
        prd_hrgjual as hrg_normal,
        -- Member Merah (Retailer)
        COALESCE(mm.hrgmm, 0) as hrgmm,
        COALESCE(mm.cbmm, 0) as cbmm,
        COALESCE(mm.hrg_netmm, 0) as hrg_netmm,
        -- Member Biru (Reguler)
        COALESCE(mb.hrgbiru, 0) as hrgbiru,
        COALESCE(mb.cbbiru, 0) as cbbiru,
        COALESCE(mb.hrg_netbiru, 0) as hrg_netbiru,
        -- Member Platinum
        COALESCE(mp.hrgpla, 0) as hrgpla,
        COALESCE(mp.cbpla, 0) as cbpla,
        COALESCE(mp.hrg_netpla, 0) as hrg_netpla
      FROM tbmaster_prodmast
      LEFT JOIN (
        -- Cashback Member Merah (Retailer)
        SELECT 
          cbd_prdcd as plu,
          (CASE WHEN prd_prdcd LIKE '%0' 
                THEN prd_hrgjual * prd_minjual 
                ELSE prd_hrgjual 
           END) as hrgmm,
          COALESCE(cbd_cashback, 0) as cbmm,
          (CASE WHEN prd_prdcd LIKE '%0' 
                THEN (prd_hrgjual * prd_minjual) - COALESCE(cbd_cashback, 0)
                ELSE prd_hrgjual - COALESCE(cbd_cashback, 0)
           END) as hrg_netmm
        FROM tbtr_cashback_dtl
        LEFT JOIN tbtr_cashback_hdr ON cbd_kodepromosi = cbh_kodepromosi
        LEFT JOIN tbtr_cashback_alokasi ON cbd_kodepromosi = cba_kodepromosi
        LEFT JOIN tbmaster_prodmast ON cbd_prdcd = prd_prdcd
        WHERE CURRENT_DATE BETWEEN DATE(cbh_tglawal) AND DATE(cbh_tglakhir)
          AND (COALESCE(cba_retailer, '0') = '1' OR COALESCE(cba_silver, '0') = '1' 
               OR COALESCE(cba_gold1, '0') = '1' OR COALESCE(cba_gold2, '0') = '1')
          AND cbh_namapromosi NOT LIKE 'KLIK%'
          AND cbh_namapromosi NOT LIKE '%UNIQUE%'
          AND cbh_namapromosi NOT LIKE '%PWP%'
          AND cbh_namapromosi NOT LIKE '%UNICODE%'
          AND COALESCE(cbd_recordid, '2') <> '1'
          AND COALESCE(cbd_redeempoint, '0') = '0'
          AND cbd_prdcd LIKE ${pluPrefix}
      ) mm ON prd_prdcd = mm.plu
      LEFT JOIN (
        -- Cashback Member Biru (Reguler)
        SELECT 
          cbd_prdcd as plu,
          (CASE WHEN prd_prdcd LIKE '%0' 
                THEN prd_hrgjual * prd_minjual 
                ELSE prd_hrgjual 
           END) as hrgbiru,
          COALESCE(cbd_cashback, 0) as cbbiru,
          (CASE WHEN prd_prdcd LIKE '%0' 
                THEN (prd_hrgjual * prd_minjual) - COALESCE(cbd_cashback, 0)
                ELSE prd_hrgjual - COALESCE(cbd_cashback, 0)
           END) as hrg_netbiru
        FROM tbtr_cashback_dtl
        LEFT JOIN tbtr_cashback_hdr ON cbd_kodepromosi = cbh_kodepromosi
        LEFT JOIN tbtr_cashback_alokasi ON cbd_kodepromosi = cba_kodepromosi
        LEFT JOIN tbmaster_prodmast ON cbd_prdcd = prd_prdcd
        WHERE CURRENT_DATE BETWEEN DATE(cbh_tglawal) AND DATE(cbh_tglakhir)
          AND (COALESCE(cba_reguler, '0') = '1' OR COALESCE(cba_reguler_biruplus, '0') = '1')
          AND cbh_namapromosi NOT LIKE 'KLIK%'
          AND cbh_namapromosi NOT LIKE '%UNIQUE%'
          AND cbh_namapromosi NOT LIKE '%PWP%'
          AND cbh_namapromosi NOT LIKE '%UNICODE%'
          AND COALESCE(cbd_recordid, '2') <> '1'
          AND COALESCE(cbd_redeempoint, '0') = '0'
          AND cbd_prdcd LIKE ${pluPrefix}
      ) mb ON prd_prdcd = mb.plu
      LEFT JOIN (
        -- Cashback Member Platinum
        SELECT 
          cbd_prdcd as plu,
          (CASE WHEN prd_prdcd LIKE '%0' 
                THEN prd_hrgjual * prd_minjual 
                ELSE prd_hrgjual 
           END) as hrgpla,
          COALESCE(cbd_cashback, 0) as cbpla,
          (CASE WHEN prd_prdcd LIKE '%0' 
                THEN (prd_hrgjual * prd_minjual) - COALESCE(cbd_cashback, 0)
                ELSE prd_hrgjual - COALESCE(cbd_cashback, 0)
           END) as hrg_netpla
        FROM tbtr_cashback_dtl
        LEFT JOIN tbtr_cashback_hdr ON cbd_kodepromosi = cbh_kodepromosi
        LEFT JOIN tbtr_cashback_alokasi ON cbd_kodepromosi = cba_kodepromosi
        LEFT JOIN tbmaster_prodmast ON cbd_prdcd = prd_prdcd
        WHERE CURRENT_DATE BETWEEN DATE(cbh_tglawal) AND DATE(cbh_tglakhir)
          AND COALESCE(cba_platinum, '0') = '1'
          AND cbh_namapromosi NOT LIKE 'KLIK%'
          AND cbh_namapromosi NOT LIKE '%UNIQUE%'
          AND cbh_namapromosi NOT LIKE '%PWP%'
          AND cbh_namapromosi NOT LIKE '%UNICODE%'
          AND COALESCE(cbd_recordid, '2') <> '1'
          AND COALESCE(cbd_redeempoint, '0') = '0'
          AND cbd_prdcd LIKE ${pluPrefix}
      ) mp ON prd_prdcd = mp.plu
      WHERE prd_prdcd LIKE ${pluPrefix}
        AND (mm.plu IS NOT NULL OR mb.plu IS NOT NULL OR mp.plu IS NOT NULL)
      ORDER BY prd_prdcd
    `;

    res.json({ data: serializeBigInt(data) || [] });
  } catch (error) {
    console.error("Database Query Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
};

// Get Promo Data (Lazy Loaded) - Cashback, Gift, Instore, HJK
export const getProductPromos = async (req, res) => {
  let { plu } = req.params;

  try {
    if (
      !plu ||
      typeof plu !== "string" ||
      plu.length > 20 ||
      !/^[a-zA-Z0-9]+$/.test(plu)
    ) {
      return res.status(400).json({ message: "Invalid PLU format!" });
    }

    // Check cache first
    const cacheKey = `promos_${plu}`;
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      console.log(`[PERF] Cache hit for promos: ${plu}`);
      return res.json(cachedData);
    }

    const pluPrefix = plu.substring(0, 6) + "%";
    const startTime = Date.now();
    console.log(`[PERF] Starting promo queries for PLU: ${plu}`);

    const [cashbackData, giftData, instoreData, hjkData] = await Promise.all([
      // Promo Cashback
      prisma.$queryRaw`
        SELECT DISTINCT 
          CBD_PRDCD as "cbd_prdcd",
          CBD_KODEPROMOSI as "cbd_kodepromosi",
          CBH_NAMAPROMOSI as "cbh_namapromosi",
          CBD_MINSTRUK as "cbd_minstruk",
          CBH_MINRPHPRODUKPROMO as "cbh_minrphprodukpromo",
          CBH_MINTOTBELANJA as "cbh_mintotbelanja",
          CASE WHEN COALESCE(cbd_cashback, 0) = 0 THEN cbh_cashback ELSE cbd_cashback END AS "cbd_cashback",
          TO_CHAR(CBH_TGLAWAL,'DD-MON-YY') as "cbh_tglawal",
          TO_CHAR(CBH_TGLAKHIR,'DD-MON-YY') as "cbh_tglakhir",
          CBA_REGULER as "cba_reguler",
          CBA_REGULER_BIRUPLUS as "cba_reguler_biruplus",
          CBA_FREEPASS as "cba_freepass",
          CBA_RETAILER as "cba_retailer",
          CBA_PLATINUM as "cba_platinum"
        FROM tbtr_cashback_dtl d
        LEFT JOIN tbtr_cashback_hdr h ON d.cbd_kodepromosi = h.cbh_kodepromosi
        LEFT JOIN tbtr_cashback_alokasi a ON d.cbd_kodepromosi = a.cba_kodepromosi
        WHERE cbh_tglakhir >= CURRENT_DATE
        AND CBH_RECORDID IS NULL
        AND cbd_prdcd LIKE ${pluPrefix}
      `,
      // Promo Gift
      prisma.$queryRaw`
        SELECT 
            d.gfd_kodepromosi as "gif_kode_promosi",
            h.gfh_namapromosi as "gif_nama_promosi",  
            d.gfd_pcs as "gif_min_beli_pcs",
            d.gfd_rph as "gif_min_beli_rph",
            h.gfh_mintotbelanja as "gif_min_total_struk",
            h.gfh_mintotsponsor as "gif_min_total_sponsor",
            h.gfh_jmlhadiah as "gif_jumlah_hadiah",
            p.prd_deskripsipanjang as "gif_nama_hadiah",
            h.gfh_kethadiah as "gif_plu_hadiah",
            TO_CHAR(h.gfh_tglawal,'DD-MON-YY') as "gif_mulai",
            TO_CHAR(h.gfh_tglakhir,'DD-MON-YY') as "gif_selesai",
            a.gfa_reguler as "gif_reguler",
            a.gfa_retailer as "gif_retailer",
            a.gfa_platinum as "gif_platinum"
        FROM tbtr_gift_dtl d
        LEFT JOIN tbtr_gift_hdr h ON d.gfd_kodepromosi = h.gfh_kodepromosi
        LEFT JOIN tbtr_gift_alokasi a ON d.gfd_kodepromosi = a.gfa_kodepromosi
        LEFT JOIN tbmaster_prodmast p ON h.gfh_kethadiah = p.prd_prdcd
        WHERE h.gfh_tglakhir >= CURRENT_DATE
        AND h.gfh_recordid IS NULL
        AND d.gfd_prdcd LIKE ${pluPrefix}
      `,
      // Instore Promo
      prisma.$queryRaw`
        SELECT 
            isd_kodepromosi as "isd_kodepromosi",
            CASE WHEN isd_jenispromosi = 'H' THEN 'G' ELSE 'I' END AS "isd_jenispromosi",
            ish_tglawal as "ish_tglawal",
            ish_tglakhir as "ish_tglakhir",
            isd_minpcs as "isd_minpcs",
            CASE WHEN isd_jenispromosi = 'I' THEN isd_minrph ELSE ish_minsponsor END AS "isd_minrph",
            ish_minstruk as "ish_minstruk",
            ish_prdcdhadiah as "ish_prdcdhadiah",
            bprp_ketpanjang as "bprp_ketpanjang",
            ish_jmlhadiah as "ish_jmlhadiah",
            ish_reguler as "ish_reguler",
            ish_retailer as "ish_retailer",
            ish_platinum as "ish_platinum"
        FROM tbtr_instore_dtl
        LEFT JOIN tbtr_instore_hdr ON isd_kodepromosi = ish_kodepromosi
        LEFT JOIN tbmaster_brgpromosi ON ish_prdcdhadiah = bprp_prdcd
        WHERE ish_tglakhir >= CURRENT_DATE
        AND isd_prdcd LIKE ${pluPrefix}
      `,
      // Harga Jual Khusus HJK
      prisma.$queryRaw`
        SELECT 
            hgk_prdcd as "hgk_prdcd",
            hgk_hrgjual as "hgk_hrgjual",
            hgk_tglawal as "hgk_tglawal",
            hgk_jamawal as "hgk_jamawal",
            hgk_tglakhir as "hgk_tglakhir",
            hgk_jamakhir as "hgk_jamakhir",
            hgk_hariaktif as "hgk_hariaktif"
        FROM tbtr_hargakhusus
        WHERE HGK_TGLAKHIR >= CURRENT_DATE
        AND hgk_prdcd LIKE ${pluPrefix}
      `,
    ]);

    const queryTime = Date.now() - startTime;
    console.log(`[PERF] Promo queries completed in ${queryTime}ms`);

    const result = {
      cashback: serializeBigInt(cashbackData) || [],
      gift: serializeBigInt(giftData) || [],
      instore: serializeBigInt(instoreData) || [],
      hjk: serializeBigInt(hjkData) || [],
    };

    // Cache the result
    setCache(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error("Database Query Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
};
