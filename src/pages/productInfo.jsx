import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Search, PackageSearch, AlertTriangle, Eye, X } from "lucide-react";
import UniversalTable from "../components/universalTables";

// Helper: Format angka ke Rupiah
const formatRupiah = (num) => {
  const n = Number(num) || 0;
  return `Rp ${n.toLocaleString("id-ID")}`;
};

// Helper: Format angka dengan separator ribuan
const formatNumber = (num) => {
  const n = Number(num) || 0;
  return n.toLocaleString("id-ID");
};

// Constants - defined outside component to prevent re-creation
const MONTHS_NUM = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];
const MONTHS_NAME = [
  { name: "Jan", num: "01" },
  { name: "Feb", num: "02" },
  { name: "Mar", num: "03" },
  { name: "Apr", num: "04" },
  { name: "Mei", num: "05" },
  { name: "Jun", num: "06" },
  { name: "Jul", num: "07" },
  { name: "Agu", num: "08" },
  { name: "Sep", num: "09" },
  { name: "Okt", num: "10" },
  { name: "Nov", num: "11" },
  { name: "Des", num: "12" },
];

const useProductSearch = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const searchProduct = useCallback(async (pluCode) => {
    if (!pluCode || loading) return null;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setHasSearched(true);
    setError("");
    setProduct(null);

    try {
      const response = await fetch(
        `http://localhost:3000/api/products/${encodeURIComponent(pluCode)}`,
        {
          signal: abortControllerRef.current.signal,
          headers: { Accept: "application/json" },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error((data && data.message) || `Server Error (${response.status})`);
      }

      if (!data) throw new Error("Format respons tidak valid dari server.");

      setProduct(data);
      return data;
    } catch (err) {
      if (err.name === "AbortError") {
        return null;
      }
      if (err.message.includes("Failed to fetch")) {
        setError("Koneksi ke server gagal. Pastikan API sedang berjalan atau cek koneksi internet Anda.");
      } else {
        setError(err.message);
      }
      return null;
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [loading]);

  return { product, loading, error, hasSearched, searchProduct };
};

export default function ProductInfo() {
  const [plu, setPlu] = useState("");
  const { product, loading, error, hasSearched, searchProduct } = useProductSearch();
  const [activeTab, setActiveTab] = useState("ringkasan");

  // State for Modals
  const [activeModal, setActiveModal] = useState(null); // 'rak', 'penerimaan', 'penjualan', or null

  // State for Detail Modals
  const [detailModal, setDetailModal] = useState(null); // 'cashback' or 'gift'
  const [selectedPromoCode, setSelectedPromoCode] = useState(null);
  const [detailData, setDetailData] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // State for Cashback BMS1
  const [cashbackBMS1, setCashbackBMS1] = useState([]);
  const [cashbackBMS1Loading, setCashbackBMS1Loading] = useState(false);

  // State for Promo Data (lazy loaded)
  const [promoData, setPromoData] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoLoaded, setPromoLoaded] = useState(false);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (detailModal) {
          setDetailModal(null);
          setSelectedPromoCode(null);
          setDetailData([]);
        } else if (activeModal) {
          setActiveModal(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModal, detailModal]);

  // Fetch Promo Data (lazy loaded when tab "promosi" is clicked)
  const fetchPromoData = useCallback(
    async (pluCode) => {
      if (promoLoaded || promoLoading) return;
      setPromoLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/products/${encodeURIComponent(pluCode)}/promos`,
        );
        const data = await response.json();
        setPromoData(data);
        setPromoLoaded(true);
      } catch (err) {
        console.error("Error fetching promo data:", err);
        setPromoData({ cashback: [], gift: [], instore: [], hjk: [] });
      } finally {
        setPromoLoading(false);
      }
    },
    [promoLoaded, promoLoading],
  );

  // Lazy load promo data when "promosi" tab is clicked
  useEffect(() => {
    if (activeTab === "promosi" && product && !promoLoaded && !promoLoading) {
      fetchPromoData(plu.trim());
    }
  }, [activeTab, product, promoLoaded, promoLoading, fetchPromoData, plu]);

  // Fetch detail cashback
  const fetchDetailCashback = useCallback(async (kodePromosi) => {
    setDetailLoading(true);
    setDetailModal("cashback");
    setSelectedPromoCode(kodePromosi);
    try {
      const response = await fetch(
        `http://localhost:3000/api/promo/cashback/${encodeURIComponent(kodePromosi)}`,
      );
      const data = await response.json();
      setDetailData(data.details || []);
    } catch (err) {
      console.error("Error fetching cashback detail:", err);
      setDetailData([]);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Fetch detail gift
  const fetchDetailGift = useCallback(async (kodePromosi) => {
    setDetailLoading(true);
    setDetailModal("gift");
    setSelectedPromoCode(kodePromosi);
    try {
      const response = await fetch(
        `http://localhost:3000/api/promo/gift/${encodeURIComponent(kodePromosi)}`,
      );
      const data = await response.json();
      setDetailData(data.details || []);
    } catch (err) {
      console.error("Error fetching gift detail:", err);
      setDetailData([]);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Fetch Cashback BMS1
  const fetchCashbackBMS1 = useCallback(async (pluCode) => {
    setCashbackBMS1Loading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/cashback-bms1/${encodeURIComponent(pluCode)}`,
      );
      const data = await response.json();
      setCashbackBMS1(data.data || []);
    } catch (err) {
      console.error("Error fetching cashback BMS1:", err);
      setCashbackBMS1([]);
    } finally {
      setCashbackBMS1Loading(false);
    }
  }, []);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!plu.trim() || loading) return;

    setActiveTab("ringkasan");
    setPromoData(null);
    setPromoLoaded(false);
    setCashbackBMS1([]);

    await searchProduct(plu.trim());
    fetchCashbackBMS1(plu.trim());
  }, [plu, loading, searchProduct, fetchCashbackBMS1]);

  // Memoized columns for UniversalTable to prevent re-renders
  const hjkColumns = useMemo(() => [
    { header: "PLU", accessor: "hgk_prdcd" },
    { header: "Harga Khusus", accessor: "hgk_hrgjual" },
    { header: "Tgl Mulai", accessor: "hgk_tglawal" },
    { header: "Tgl Selesai", accessor: "hgk_tglakhir" },
  ], []);

  const pembatasanColumns = useMemo(() => [
    { header: "Ket", accessor: "ket" },
    { header: "Satuan", accessor: "satuan" },
    { header: "Biru", accessor: "br" },
    { header: "Biru+", accessor: "bp" },
    { header: "Retailer", accessor: "ret" },
    { header: "Platinum", accessor: "pla" },
  ], []);

  const rakColumns = useMemo(() => [
    { header: "Kode Rak", accessor: "lks_koderak" },
    { header: "Sub Rak", accessor: "lks_kodesubrak" },
    { header: "Tipe", accessor: "lks_tiperak" },
    { header: "Shelving", accessor: "lks_shelvingrak" },
    { header: "Urutan", accessor: "lks_nourut" },
    { header: "Qty Limit", accessor: "lks_qty" },
    { header: "Exp. Date", accessor: "lks_expdate" },
  ], []);

  const penerimaanColumns = useMemo(() => [
    { header: "Nama Supplier", accessor: "mstd_namasupplier" },
    { header: "No. Dokumen", accessor: "mstd_nodoc" },
    { header: "Tanggal Doc", accessor: "mstd_tgldoc" },
    { header: "Jam", accessor: "mstd_jam" },
    { header: "Qty Terima", accessor: "mstd_qty" },
    { header: "Bonus 1", accessor: "mstd_qtybonus1" },
    { header: "Bonus 2", accessor: "mstd_qtybonus2" },
    { header: "Avg Cost / Unit", accessor: "mstd_avgcost" },
  ], []);

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Informasi Produk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pencarian terpadu Master Produk & Promosi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* KOLOM KIRI (SEARCH \& SUMMARY LAYER) - Lebih Lebar (5 columns) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
              Cari Produk
            </h3>
            <form onSubmit={handleSearch} className="flex flex-col gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-mono"
                  placeholder="Input PLU / Barcode"
                  value={plu}
                  onChange={(e) => setPlu(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading || !plu.trim()}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center"
              >
                {loading ? "Mencari..." : "Cari Data"}
              </button>
            </form>
          </div>

          {/* ========================================================= */}
          {/* PANEL PREVIEW KIRI & BUTTON TRIGGER MODAL (Hanya Saat Loaded) */}
          {/* ========================================================= */}
          {hasSearched && !loading && product && !error && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* === RINGKASAN PRODUK UTAMA === */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Master Data
                  </h3>
                </div>
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-md font-mono border border-red-100">
                      {product.product.prd_prdcd}
                    </span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <PackageSearch className="w-3.5 h-3.5" /> PLU Induk
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-800 mb-6 leading-tight">
                    {product.product.prd_deskripsipanjang}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                        Divisi
                      </p>
                      <p className="text-sm font-medium text-slate-800">
                        {product.product.prd_kodedivisi}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                        Departemen
                      </p>
                      <p className="text-sm font-medium text-slate-800">
                        {product.product.prd_kodedepartement}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                        Kategori
                      </p>
                      <p className="text-sm font-medium text-slate-800">
                        {product.product.prd_kodekategoribarang}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* === QUICK ACTIONS (MODALS TRIGGER) === */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Direct Panel Access
                  </h3>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <button
                    onClick={() => setActiveModal("rak")}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-gray-200 p-3 rounded-lg flex items-center justify-between transition-all group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-sm group-hover:text-amber-600 transition-colors">
                        Lokasi & Rak Penyimpanan
                      </span>
                      <span className="text-xs text-slate-400 mt-0.5">
                        {Array.isArray(product.locations) ? product.locations.length : 0} record(s) ditemukan
                      </span>
                    </div>
                    <Eye className="w-5 h-5 text-slate-400 group-hover:text-amber-500" />
                  </button>

                  <button
                    onClick={() => setActiveModal("penerimaan")}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-gray-200 p-3 rounded-lg flex items-center justify-between transition-all group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-sm group-hover:text-emerald-600 transition-colors">
                        History Penerimaan Barang
                      </span>
                      <span className="text-xs text-slate-400 mt-0.5">
                        Top 15 Transaksi Terakhir
                      </span>
                    </div>
                    <Eye className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                  </button>

                  <button
                    onClick={() => setActiveModal("penjualan")}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-gray-200 p-3 rounded-lg flex items-center justify-between transition-all group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-sm group-hover:text-blue-600 transition-colors">
                        History Penjualan 12 Bulan
                      </span>
                      <span className="text-xs text-slate-400 mt-0.5">
                        Crosstab Qty, Rupiah & Margin
                      </span>
                    </div>
                    <Eye className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN (TABS HASIL DATA) - Lebih Sempit (7 columns) */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          {/* STATE: BELUM CARI */}
          {!hasSearched && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-16 bg-white rounded-xl border border-gray-200 border-dashed min-h-[400px]">
              <div className="bg-slate-50 p-4 rounded-full mb-4">
                <PackageSearch className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-base font-medium text-slate-600">
                Belum ada pencarian
              </p>
              <p className="text-sm mt-1 text-slate-400">
                Silakan masukkan PLU atau Barcode pada panel di samping.
              </p>
            </div>
          )}

          {/* STATE: LOADING */}
          {loading && (
            <div className="flex-1 flex items-center justify-center p-16 bg-white rounded-xl border border-gray-200 min-h-[400px]">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-medium text-slate-500 tracking-wide">
                  Mengambil data dari server...
                </p>
              </div>
            </div>
          )}

          {/* STATE: ERROR */}
          {hasSearched && !loading && error && (
            <div className="flex-1 flex items-center justify-center p-16 bg-white rounded-xl border border-red-200 min-h-[400px]">
              <div className="text-center max-w-sm">
                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-50 mb-5">
                  <AlertTriangle className="h-7 w-7 text-red-500" />
                </div>
                <p className="text-red-700 font-bold mb-2">Pencarian Gagal</p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* STATE: HASIL DATA */}
          {hasSearched && !loading && product && !error && (
            <div className="space-y-6">
              {/* TAB NAVIGATION */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1.5 flex space-x-1 overflow-x-auto scroolbar-hide">
                <button
                  onClick={() => setActiveTab("ringkasan")}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === "ringkasan" ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  Ringkasan
                </button>
                <button
                  onClick={() => setActiveTab("promosi")}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === "promosi" ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  Promosi Aktif
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === "history" ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  History Transaksi
                </button>
                <button
                  onClick={() => setActiveTab("aturan")}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === "aturan" ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  Aturan & Batasan
                </button>
              </div>

              {/* ========== TAB CONTENT: RINGKASAN STOK & HARGA ========== */}
              {activeTab === "ringkasan" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* PANEL MULTI-KOLOM: SATUAN JUAL & STOK */}
                  <div className="grid grid-cols-1 gap-6">
                    {/* Satuan Jual */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                          Satuan Jual & Harga
                        </h3>
                      </div>
                      <div className="p-0">
                        {product.salesUnits?.error ? (
                          <div className="p-6 text-center text-red-600 bg-red-50 italic text-sm border-t border-red-100 font-medium">
                            <AlertTriangle className="w-5 h-5 mx-auto mb-2 opacity-80" />
                            Gagal memuat satuan jual dari server.
                          </div>
                        ) : Array.isArray(product.salesUnits) &&
                          product.salesUnits.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs text-left text-slate-600 border-collapse">
                            <thead className="bg-slate-50 text-slate-800 border-b border-gray-200 font-semibold uppercase tracking-wider text-[10px]">
                              <tr>
                                <th className="p-3 border-r border-gray-200 text-center">
                                  #
                                </th>
                                <th className="p-3 border-r border-gray-200 text-center">
                                  Satuan
                                </th>
                                <th className="p-3 border-r border-gray-200 text-right">
                                  Harga Jual
                                </th>
                                <th className="p-3 border-r border-gray-200 text-right">
                                  Avg Cost
                                </th>
                                <th className="p-3 border-r border-gray-200 text-right">
                                  %
                                </th>
                                <th className="p-3 border-r border-gray-200 text-center">
                                  Tag
                                </th>
                                <th className="p-3 border-r border-gray-200 text-center">
                                  Actv
                                </th>
                                <th className="p-3 text-center">Min Jual</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {Array.isArray(product.salesUnits) &&
                                product.salesUnits.map((row, idx) => {
                                  const margin =
                                    row.prd_hrgjual > 0
                                      ? (
                                          ((row.prd_hrgjual - row.prd_avgcost) /
                                            row.prd_hrgjual) *
                                          100
                                        ).toFixed(2)
                                      : 0;
                                  return (
                                    <tr
                                      key={idx}
                                      className="hover:bg-slate-50 transition-colors"
                                    >
                                      <td className="p-3 border-r border-gray-200 text-center text-slate-500">
                                        {row.prd_prdcd?.slice(-1) || idx + 1}
                                      </td>
                                      <td className="p-3 border-r border-gray-200 text-nowrap">
                                        {row.prd_unit} / {row.prd_frac}
                                      </td>
                                      <td className="p-3 border-r border-gray-200 text-right tabular-nums font-medium text-emerald-700">
                                        {formatRupiah(row.prd_hrgjual)}
                                      </td>
                                      <td className="p-3 border-r border-gray-200 text-right tabular-nums text-slate-600">
                                        {formatRupiah(row.prd_avgcost)}
                                      </td>
                                      <td className="p-3 border-r border-gray-200 text-right tabular-nums text-blue-700">
                                        {margin}%
                                      </td>
                                      <td className="p-3 border-r border-gray-200 text-center">
                                        {row.prd_kodetag || "-"}
                                      </td>
                                      <td className="p-3 border-r border-gray-200 text-center">
                                        {row.prd_flag_aktivasi || "-"}
                                      </td>
                                      <td className="p-3 text-center">
                                        {row.prd_minjual || "-"}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-6 text-center text-slate-500 italic text-sm">
                            Tidak ada data satuan jual yang tersedia.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stok */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                          Informasi Stok
                        </h3>
                      </div>
                      <div className="p-0">
                        {product.stock?.error ? (
                          <div className="p-6 text-center text-red-600 bg-red-50 italic text-sm border-t border-red-100 font-medium">
                            <AlertTriangle className="w-5 h-5 mx-auto mb-2 opacity-80" />
                            Gagal memuat saldo dari server. Tabel Stok tidak
                            dapat ditampilkan saat ini.
                          </div>
                        ) : Array.isArray(product.stock) &&
                          product.stock.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-xs text-left text-slate-600 border-collapse">
                              <thead className="bg-slate-50 text-slate-800 border-b border-gray-200 font-semibold uppercase tracking-wider text-[10px]">
                                <tr>
                                  <th className="p-3 border-r border-gray-200 text-center">
                                    Lok
                                  </th>
                                  <th className="p-3 border-r border-gray-200 text-right">
                                    Awal
                                  </th>
                                  <th className="p-3 border-r border-gray-200 text-right">
                                    Terima
                                  </th>
                                  <th className="p-3 border-r border-gray-200 text-right">
                                    Keluar
                                  </th>
                                  <th className="p-3 border-r border-gray-200 text-right">
                                    Sales
                                  </th>
                                  <th className="p-3 border-r border-gray-200 text-right">
                                    Retur
                                  </th>
                                  <th className="p-3 border-r border-gray-200 text-right">
                                    Adj
                                  </th>
                                  <th className="p-3 border-r border-gray-200 text-right">
                                    Intransit
                                  </th>
                                  <th className="p-3 border-r border-gray-200 text-right">
                                    Akhir
                                  </th>
                                  <th className="p-3 text-right">Saldo Rp</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {product.stock.map((row, idx) => (
                                  <tr
                                    key={idx}
                                    className="hover:bg-slate-50 transition-colors"
                                  >
                                    <td className="p-3 border-r border-gray-200 text-center font-bold text-slate-700">
                                      {row.location_code}
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                                      {formatNumber(row.st_saldoawal)}
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-right tabular-nums text-emerald-700">
                                      {formatNumber(row.st_trfin)}
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-right tabular-nums text-red-600">
                                      {formatNumber(row.st_trfout)}
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-right tabular-nums font-medium text-blue-700">
                                      {formatNumber(row.st_sales)}
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                                      {formatNumber(row.st_retur)}
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                                      {formatNumber(row.st_adj)}
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                                      {formatNumber(row.st_intransit)}
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-right tabular-nums font-bold text-slate-800">
                                      {formatNumber(row.st_saldoakhir)}
                                    </td>
                                    <td className="p-3 text-right tabular-nums text-emerald-700 font-medium">
                                      {formatRupiah(
                                        row.st_saldoakhir * row.st_avgcost,
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-6 text-center text-slate-500 italic text-sm">
                            Tidak ada data stok yang tersedia.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Harga Netto */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                          Harga Netto
                        </h3>
                      </div>
                      <div className="p-0">
                        {cashbackBMS1Loading ? (
                          <div className="p-8 text-center text-slate-500">
                            <div className="animate-spin w-6 h-6 border-3 border-slate-300 border-t-slate-600 rounded-full mx-auto mb-2"></div>
                            Memuat data harga netto...
                          </div>
                        ) : cashbackBMS1 && cashbackBMS1.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-xs text-left text-slate-600 border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-gray-200">
                                  <th
                                    rowSpan="2"
                                    className="p-3 border-r border-gray-200 text-center align-middle"
                                  >
                                    #
                                  </th>
                                  <th
                                    colSpan="3"
                                    className="p-2 border-r border-gray-200 text-center bg-red-100 text-red-800"
                                  >
                                    Member Merah
                                  </th>
                                  <th
                                    colSpan="3"
                                    className="p-2 border-r border-gray-200 text-center bg-blue-100 text-blue-800"
                                  >
                                    Member Biru
                                  </th>
                                  <th
                                    colSpan="3"
                                    className="p-2 text-center bg-gray-200 text-gray-800"
                                  >
                                    Member Platinum
                                  </th>
                                </tr>
                                <tr className="bg-slate-50 border-b border-gray-200 text-[10px]">
                                  <th className="p-2 border-r border-gray-200 text-right">
                                    Harga
                                  </th>
                                  <th className="p-2 border-r border-gray-200 text-right">
                                    CB
                                  </th>
                                  <th className="p-2 border-r border-gray-200 text-right">
                                    Net
                                  </th>
                                  <th className="p-2 border-r border-gray-200 text-right">
                                    Harga
                                  </th>
                                  <th className="p-2 border-r border-gray-200 text-right">
                                    CB
                                  </th>
                                  <th className="p-2 border-r border-gray-200 text-right">
                                    Net
                                  </th>
                                  <th className="p-2 border-r border-gray-200 text-right">
                                    Harga
                                  </th>
                                  <th className="p-2 border-r border-gray-200 text-right">
                                    CB
                                  </th>
                                  <th className="p-2 text-right">Net</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {cashbackBMS1.map((row, idx) => (
                                  <tr
                                    key={idx}
                                    className="hover:bg-slate-50 transition-colors"
                                  >
                                    <td className="p-3 border-r border-gray-200 text-center font-medium text-slate-500">
                                      {row.plu?.slice(-1) || idx + 1}
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                                      {formatRupiah(row.hrgmm)}
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-right tabular-nums text-red-600 font-medium">
                                      {formatRupiah(row.cbmm)}
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-right tabular-nums font-bold text-red-800">
                                      {formatRupiah(row.hrg_netmm)}
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                                      {formatRupiah(row.hrgbiru)}
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-right tabular-nums text-blue-600 font-medium">
                                      {formatRupiah(row.cbbiru)}
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-right tabular-nums font-bold text-blue-800">
                                      {formatRupiah(row.hrg_netbiru)}
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                                      {formatRupiah(row.hrgpla)}
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-right tabular-nums text-gray-600 font-medium">
                                      {formatRupiah(row.cbpla)}
                                    </td>
                                    <td className="p-3 text-right tabular-nums font-bold text-gray-800">
                                      {formatRupiah(row.hrg_netpla)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-6 text-center text-slate-500 italic text-sm">
                            Tidak ada data harga netto.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========== TAB CONTENT: PROMOSI ========== */}
              {activeTab === "promosi" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {promoLoading ? (
                    <div className="flex items-center justify-center p-16 bg-white rounded-xl border border-gray-200">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                        <p className="text-sm font-medium text-slate-500">
                          Memuat data promosi...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {/* Cashback */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            Promo Cashback
                          </h3>
                        </div>
                        <div className="p-0">
                          {promoData?.cashback &&
                          promoData.cashback.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs text-left text-slate-600 border-collapse">
                                <thead className="bg-slate-50 text-slate-800 border-b border-gray-200 font-semibold uppercase tracking-wider text-[10px]">
                                  <tr>
                                    <th className="p-3 border-r border-gray-200">
                                      Kode
                                    </th>
                                    <th className="p-3 border-r border-gray-200">
                                      Nama Promosi
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-right">
                                      Min Qty
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-right">
                                      Min Sponsor
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-right">
                                      Min Total
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-right">
                                      Nilai CB
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-center">
                                      Mulai
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-center">
                                      Selesai
                                    </th>
                                    <th className="p-3 text-left">Member</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {promoData.cashback.map((row, idx) => {
                                    const memberBadges = [];
                                    if (
                                      row.cba_reguler === "1" ||
                                      row.cba_reguler === 1
                                    )
                                      memberBadges.push(
                                        <span
                                          key="mb"
                                          className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] rounded font-bold"
                                        >
                                          MB
                                        </span>,
                                      );
                                    if (
                                      row.cba_retailer === "1" ||
                                      row.cba_retailer === 1
                                    )
                                      memberBadges.push(
                                        <span
                                          key="mm"
                                          className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] rounded font-bold ml-1"
                                        >
                                          MM
                                        </span>,
                                      );
                                    if (
                                      row.cba_platinum === "1" ||
                                      row.cba_platinum === 1
                                    )
                                      memberBadges.push(
                                        <span
                                          key="pla"
                                          className="px-1.5 py-0.5 bg-black text-white text-[9px] rounded font-bold ml-1"
                                        >
                                          PLA
                                        </span>,
                                      );
                                    return (
                                      <tr
                                        key={idx}
                                        className="hover:bg-slate-50 transition-colors"
                                      >
                                        <td className="p-3 border-r border-gray-200 font-mono text-slate-700">
                                          <button
                                            onClick={() =>
                                              fetchDetailCashback(
                                                row.cbd_kodepromosi,
                                              )
                                            }
                                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                          >
                                            {row.cbd_kodepromosi}
                                          </button>
                                        </td>
                                        <td className="p-3 border-r border-gray-200">
                                          {row.cbh_namapromosi}
                                        </td>
                                        <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                                          {formatNumber(row.cbd_minstruk)}
                                        </td>
                                        <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                                          {formatRupiah(
                                            row.cbh_minrphprodukpromo,
                                          )}
                                        </td>
                                        <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                                          {formatRupiah(row.cbh_mintotbelanja)}
                                        </td>
                                        <td className="p-3 border-r border-gray-200 text-right tabular-nums font-bold text-emerald-700">
                                          {formatRupiah(row.cbd_cashback)}
                                        </td>
                                        <td className="p-3 border-r border-gray-200 text-center">
                                          {row.cbh_tglawal}
                                        </td>
                                        <td className="p-3 border-r border-gray-200 text-center">
                                          {row.cbh_tglakhir}
                                        </td>
                                        <td className="p-3 flex flex-wrap gap-0.5">
                                          {memberBadges.length > 0
                                            ? memberBadges
                                            : "-"}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-6 text-center text-slate-500 italic text-sm">
                              Tidak ada promo Cashback
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Gift */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            Promo Gift
                          </h3>
                        </div>
                        <div className="p-0">
                          {promoData?.gift && promoData.gift.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs text-left text-slate-600 border-collapse">
                                <thead className="bg-slate-50 text-slate-800 border-b border-gray-200 font-semibold uppercase tracking-wider text-[10px]">
                                  <tr>
                                    <th className="p-3 border-r border-gray-200">
                                      Kode
                                    </th>
                                    <th className="p-3 border-r border-gray-200">
                                      Nama Promosi
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-right">
                                      Min Qty
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-right">
                                      Min Rph
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-right">
                                      Min Struk
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-right">
                                      Jml Hadiah
                                    </th>
                                    <th className="p-3 border-r border-gray-200">
                                      Nama Hadiah
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-center">
                                      Mulai
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-center">
                                      Selesai
                                    </th>
                                    <th className="p-3 text-left">Member</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {promoData.gift.map((row, idx) => {
                                    const memberBadges = [];
                                    if (
                                      row.gif_reguler === "1" ||
                                      row.gif_reguler === 1
                                    )
                                      memberBadges.push(
                                        <span
                                          key="mb"
                                          className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] rounded font-bold"
                                        >
                                          MB
                                        </span>,
                                      );
                                    if (
                                      row.gif_retailer === "1" ||
                                      row.gif_retailer === 1
                                    )
                                      memberBadges.push(
                                        <span
                                          key="mm"
                                          className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] rounded font-bold ml-1"
                                        >
                                          MM
                                        </span>,
                                      );
                                    if (
                                      row.gif_platinum === "1" ||
                                      row.gif_platinum === 1
                                    )
                                      memberBadges.push(
                                        <span
                                          key="pla"
                                          className="px-1.5 py-0.5 bg-black text-white text-[9px] rounded font-bold ml-1"
                                        >
                                          PLA
                                        </span>,
                                      );
                                    return (
                                      <tr
                                        key={idx}
                                        className="hover:bg-slate-50 transition-colors"
                                      >
                                        <td className="p-3 border-r border-gray-200 font-mono text-slate-700">
                                          <button
                                            onClick={() =>
                                              fetchDetailGift(
                                                row.gif_kode_promosi,
                                              )
                                            }
                                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                          >
                                            {row.gif_kode_promosi}
                                          </button>
                                        </td>
                                        <td className="p-3 border-r border-gray-200">
                                          {row.gif_nama_promosi}
                                        </td>
                                        <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                                          {formatNumber(row.gif_min_beli_pcs)}
                                        </td>
                                        <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                                          {formatRupiah(row.gif_min_beli_rph)}
                                        </td>
                                        <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                                          {formatRupiah(
                                            row.gif_min_total_struk,
                                          )}
                                        </td>
                                        <td className="p-3 border-r border-gray-200 text-right tabular-nums font-medium text-emerald-700">
                                          {formatNumber(row.gif_jumlah_hadiah)}
                                        </td>
                                        <td className="p-3 border-r border-gray-200">
                                          {row.gif_nama_hadiah ||
                                            row.gif_plu_hadiah ||
                                            "-"}
                                        </td>
                                        <td className="p-3 border-r border-gray-200 text-center">
                                          {row.gif_mulai}
                                        </td>
                                        <td className="p-3 border-r border-gray-200 text-center">
                                          {row.gif_selesai}
                                        </td>
                                        <td className="p-3 flex flex-wrap gap-0.5">
                                          {memberBadges.length > 0
                                            ? memberBadges
                                            : "-"}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-6 text-center text-slate-500 italic text-sm">
                              Tidak ada promo Gift
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Instore */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            Instore Promo
                          </h3>
                        </div>
                        <div className="p-0">
                          {promoData?.instore &&
                          promoData.instore.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs text-left text-slate-600 border-collapse">
                                <thead className="bg-slate-50 text-slate-800 border-b border-gray-200 font-semibold uppercase tracking-wider text-[10px]">
                                  <tr>
                                    <th className="p-3 border-r border-gray-200">
                                      Kode
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-center">
                                      Tipe
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-right">
                                      Min Qty
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-right">
                                      Min Rph
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-right">
                                      Jml Hadiah
                                    </th>
                                    <th className="p-3 border-r border-gray-200">
                                      Hadiah
                                    </th>
                                    <th className="p-3 border-r border-gray-200 text-center">
                                      Mulai
                                    </th>
                                    <th className="p-3 text-center">Selesai</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {promoData.instore.map((row, idx) => (
                                    <tr
                                      key={idx}
                                      className="hover:bg-slate-50 transition-colors"
                                    >
                                      <td className="p-3 border-r border-gray-200 font-mono text-slate-700">
                                        {row.isd_kodepromosi}
                                      </td>
                                      <td className="p-3 border-r border-gray-200 text-center">
                                        <span
                                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.isd_jenispromosi === "G" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}
                                        >
                                          {row.isd_jenispromosi === "G"
                                            ? "Gift"
                                            : "Instore"}
                                        </span>
                                      </td>
                                      <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                                        {formatNumber(row.isd_minpcs)}
                                      </td>
                                      <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                                        {formatRupiah(row.isd_minrph)}
                                      </td>
                                      <td className="p-3 border-r border-gray-200 text-right tabular-nums font-medium text-emerald-700">
                                        {formatNumber(row.ish_jmlhadiah)}
                                      </td>
                                      <td className="p-3 border-r border-gray-200">
                                        {row.bprp_ketpanjang || "-"}
                                      </td>
                                      <td className="p-3 border-r border-gray-200 text-center">
                                        {row.ish_tglawal}
                                      </td>
                                      <td className="p-3 text-center">
                                        {row.ish_tglakhir}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-6 text-center text-slate-500 italic text-sm">
                              Tidak ada Instore Promo
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Harga Jual Khusus */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            Harga Jual Khusus
                          </h3>
                        </div>
                        <div className="p-0">
                          {Array.isArray(promoData?.hjk) && promoData.hjk.length > 0 ? (
                            <UniversalTable
                              columns={hjkColumns}
                              data={promoData.hjk}
                            />
                          ) : (
                            <div className="p-6 text-center text-slate-500 italic text-sm">
                              Tidak ada Harga Jual Khusus
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========== TAB CONTENT: HISTORY & TREND ========== */}
              {activeTab === "history" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Trend Sales Bulanan */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Trend Sales Bulanan
                      </h3>
                    </div>
                    <div className="p-0">
                      {Array.isArray(product.trendSales) && product.trendSales.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs text-left text-slate-600 border-collapse">
                            <thead className="bg-slate-50 text-slate-800 border-b border-gray-200 font-semibold uppercase tracking-wider text-[10px]">
                              <tr>
                                <th className="p-3 border-r border-gray-200 text-center">
                                  Bulan
                                </th>
                                <th className="p-3 border-r border-gray-200 text-right">
                                  Qty
                                </th>
                                <th className="p-3 text-right">Rupiah</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {(() => {
                                const row = product.trendSales[0];
                                if (!row) return null;
                                const currentMonth = new Date().getMonth() + 1;
                                const months = [
                                  { name: "Jan", num: "01" },
                                  { name: "Feb", num: "02" },
                                  { name: "Mar", num: "03" },
                                  { name: "Apr", num: "04" },
                                  { name: "Mei", num: "05" },
                                  { name: "Jun", num: "06" },
                                  { name: "Jul", num: "07" },
                                  { name: "Agu", num: "08" },
                                  { name: "Sep", num: "09" },
                                  { name: "Okt", num: "10" },
                                  { name: "Nov", num: "11" },
                                  { name: "Des", num: "12" },
                                ];
                                return months.map((m, idx) => {
                                  const isCurrentMonth =
                                    parseInt(m.num) === currentMonth;
                                  const qty = isCurrentMonth
                                    ? row.st_sales || 0
                                    : row[`sls_qty_${m.num}`] ||
                                      row[`SLS_QTY_${m.num}`] ||
                                      0;
                                  const rph = isCurrentMonth
                                    ? row.hpp || 0
                                    : row[`sls_rph_${m.num}`] ||
                                      row[`SLS_RPH_${m.num}`] ||
                                      0;
                                  return (
                                    <tr
                                      key={m.num}
                                      className={`hover:bg-slate-50 transition-colors ${isCurrentMonth ? "bg-gray-200" : ""}`}
                                    >
                                      <td className="p-3 border-r border-gray-200 font-medium">
                                        {m.name}
                                      </td>
                                      <td className="p-3 border-r border-gray-200 text-right tabular-nums font-medium text-emerald-700">
                                        {formatNumber(qty)}
                                      </td>
                                      <td className="p-3 text-right tabular-nums text-blue-700">
                                        {formatRupiah(rph)}
                                      </td>
                                    </tr>
                                  );
                                });
                              })()}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-500 italic text-sm">
                          Tidak ada data trend sales
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 text-center bg-white border border-dashed border-gray-300 rounded-xl">
                    <p className="text-slate-500 mb-3">
                      Data Penerimaan dan 12-Bulan Penjualan detail tersedia via
                      Modal.
                    </p>
                    <div className="flex justify-center gap-3 relative z-0">
                      <button
                        onClick={() => setActiveModal("penerimaan")}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Buka Modal Penerimaan
                      </button>
                      <button
                        onClick={() => setActiveModal("penjualan")}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Buka Modal Penjualan 12 Bulan
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========== TAB CONTENT: ATURAN ========== */}
              {activeTab === "aturan" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Pembatasan */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Pembatasan
                      </h3>
                    </div>
                    <div className="p-0 text-xs text-nowrap truncate overflow-x-auto">
                      {Array.isArray(product.pembatasan) && product.pembatasan.length > 0 ? (
                        <UniversalTable
                          columns={pembatasanColumns}
                          data={product.pembatasan}
                        />
                      ) : (
                        <div className="p-6 text-center text-slate-500 italic text-sm">
                          Tidak ada aturan pembatasan
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL POPUPS OVERLAY COMPONENTS */}
      {/* ========================================================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-8xl max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-900/5 drop-shadow-2xl scale-in-center">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {activeModal === "rak" && "Lokasi Rak Penyimpanan"}
                {activeModal === "penerimaan" && "History Penerimaan Barang"}
                {activeModal === "penjualan" &&
                  "Crosstab History Penjualan 12 Bulan"}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Tutup Modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-0 overflow-y-auto bg-white flex-1 relative">
              {/* --- CONTENT: RAK --- */}
              {activeModal === "rak" && (
                <div className="p-0">
                  {product.locations?.error ? (
                    <div className="p-6 text-center text-red-600 bg-red-50 italic text-sm font-medium">
                      <AlertTriangle className="w-5 h-5 mx-auto mb-2 opacity-80" />
                      Gagal memuat detail lokasi dari server.
                    </div>
                  ) : (
                    <UniversalTable
                      columns={rakColumns}
                      data={product.locations || []}
                    />
                  )}
                </div>
              )}

              {/* --- CONTENT: PENERIMAAN --- */}
              {activeModal === "penerimaan" && (
                <div className="p-0 text-sm">
                  {Array.isArray(product.penerimaan) && product.penerimaan.length > 0 ? (
                    <UniversalTable
                      columns={penerimaanColumns}
                      data={product.penerimaan}
                    />
                  ) : (
                    <div className="p-6 text-center text-slate-500 italic text-sm">
                      Tidak ada history penerimaan untuk produk ini.
                    </div>
                  )}
                </div>
              )}

              {/* --- CONTENT: PENJUALAN 12 BULAN (CROSSTAB CUSTOM) --- */}
              {activeModal === "penjualan" && (
                <div className="p-4 bg-white">
                  {Array.isArray(product.penjualan) && product.penjualan.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="min-w-full text-xs text-left text-slate-600 border-collapse">
                        <thead className="bg-slate-100 text-slate-800 border-b border-gray-200 font-semibold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th
                              rowSpan="2"
                              className="p-3 border-r border-gray-200 text-center"
                            >
                              Group
                            </th>
                            <th
                              rowSpan="2"
                              className="p-3 border-r border-gray-200 text-center"
                            >
                              Metrics
                            </th>
                            <th
                              colSpan="12"
                              className="p-2 border-b border-gray-200 text-center"
                            >
                              Bulan Transaksi (01 - 12)
                            </th>
                          </tr>
                          <tr>
                            {MONTHS_NUM.map((m) => (
                              <th
                                key={m}
                                className="p-2 border-r border-gray-200 text-center hover:bg-slate-200 transition-colors"
                              >
                                {m}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {product.penjualan.map((row, idx) => {
                            // Define member group name logic based on legacy
                            let groupName = "Other";
                            if (row.rsl_group === "01")
                              groupName = "Member Biru";
                            else if (row.rsl_group === "02") groupName = "OMI";
                            else if (row.rsl_group === "03")
                              groupName = "Member Merah";
                            else if (row.rsl_group === "04") groupName = "IDM";

                            return (
                              <React.Fragment key={idx}>
                                {/* Row: QTY */}
                                <tr className="hover:bg-slate-50 transition-colors">
                                  <td
                                    rowSpan="5"
                                    className="px-3 py-2 border-r border-b border-gray-200 font-bold bg-white aligns-top text-center align-middle whitespace-nowrap"
                                  >
                                    {groupName}
                                  </td>
                                  <td className="px-3 py-2 border-r border-gray-200 font-medium">
                                    Qty Terjual
                                  </td>
                                  {MONTHS_NUM.map((m) => (
                                    <td
                                      key={m}
                                      className="px-2 py-2 border-r border-gray-100 text-right tabular-nums"
                                    >
                                      {formatNumber(row[`rsl_qty_${m}`] || 0)}
                                    </td>
                                  ))}
                                </tr>
                                {/* Row: Rupiah */}
                                <tr className="hover:bg-slate-50 transition-colors">
                                  <td className="px-3 py-2 border-r border-gray-200 font-medium text-emerald-700 bg-emerald-50/30">
                                    Rupiah
                                  </td>
                                  {MONTHS_NUM.map((m) => (
                                    <td
                                      key={m}
                                      className="px-2 py-2 border-r border-gray-100 text-right tabular-nums text-emerald-800 bg-emerald-50/30"
                                    >
                                      {formatRupiah(row[`rsl_rph_${m}`] || 0)}
                                    </td>
                                  ))}
                                </tr>
                                {/* Row: Margin Rupiah */}
                                <tr className="hover:bg-slate-50 transition-colors">
                                  <td className="px-3 py-2 border-r border-gray-200 font-medium text-blue-700 bg-blue-50/30">
                                    Margin
                                  </td>
                                  {MONTHS_NUM.map((m) => {
                                    const rph = Number(
                                      row[`rsl_rph_${m}`] || 0,
                                    );
                                    const hpp = Number(
                                      row[`rsl_hpp_${m}`] || 0,
                                    );
                                    return (
                                      <td
                                        key={m}
                                        className="px-2 py-2 border-r border-gray-100 text-right tabular-nums text-blue-800 bg-blue-50/30"
                                      >
                                        {formatRupiah(rph - hpp)}
                                      </td>
                                    );
                                  })}
                                </tr>
                                {/* Row: Margin Persen */}
                                <tr className="hover:bg-slate-50 transition-colors">
                                  <td className="px-3 py-2 border-r border-gray-200 font-medium text-purple-700 bg-purple-50/30">
                                    Margin (%)
                                  </td>
                                  {MONTHS_NUM.map((m) => {
                                    const rph = Number(
                                      row[`rsl_rph_${m}`] || 0,
                                    );
                                    const hpp = Number(
                                      row[`rsl_hpp_${m}`] || 0,
                                    );
                                    const pct =
                                      rph > 0 ? ((rph - hpp) / rph) * 100 : 0;
                                    return (
                                      <td
                                        key={m}
                                        className="px-2 py-2 border-r border-gray-100 text-right tabular-nums text-purple-800 bg-purple-50/30"
                                      >
                                        {pct.toFixed(2)}%
                                      </td>
                                    );
                                  })}
                                </tr>
                                {/* Row: Member Count */}
                                <tr className="hover:bg-slate-50 transition-colors border-b-2 border-gray-300">
                                  <td className="px-3 py-2 border-r border-gray-200 font-medium text-slate-500">
                                    Jml Member
                                  </td>
                                  {MONTHS_NUM.map((m) => (
                                    <td
                                      key={m}
                                      className="px-2 py-2 border-r border-gray-100 text-right tabular-nums text-slate-500"
                                    >
                                      {formatNumber(
                                        row[`rsl_jmlmember_${m}`] || 0,
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-500 italic text-sm">
                      Tidak ada history penjualan bulanan untuk produk ini.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-colors shadow-sm"
              >
                Kembali ke Info Produk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAIL PROMO MODALS */}
      {/* ========================================================================= */}
      {detailModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden ring-1 ring-slate-900/5 drop-shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {detailModal === "cashback" &&
                  `Detail Cashback: ${selectedPromoCode}`}
                {detailModal === "gift" && `Detail Gift: ${selectedPromoCode}`}
              </h3>
              <button
                onClick={() => {
                  setDetailModal(null);
                  setSelectedPromoCode(null);
                  setDetailData([]);
                }}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Tutup Modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-0 overflow-y-auto bg-white flex-1">
              {detailLoading ? (
                <div className="p-12 text-center text-slate-500">
                  <div className="animate-spin w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full mx-auto mb-4"></div>
                  Memuat data...
                </div>
              ) : detailData && detailData.length > 0 ? (
                <div className="overflow-x-auto">
                  {detailModal === "cashback" && (
                    <table className="min-w-full text-xs text-left text-slate-600 border-collapse">
                      <thead className="bg-slate-50 text-slate-800 border-b border-gray-200 font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3 border-r border-gray-200 text-center">
                            #
                          </th>
                          <th className="p-3 border-r border-gray-200">
                            Kode Promosi
                          </th>
                          <th className="p-3 border-r border-gray-200">
                            Mekanisme
                          </th>
                          <th className="p-3 border-r border-gray-200">PLU</th>
                          <th className="p-3 border-r border-gray-200">
                            Deskripsi
                          </th>
                          <th className="p-3 border-r border-gray-200 text-right">
                            Cashback
                          </th>
                          <th className="p-3 border-r border-gray-200 text-center">
                            Kelipatan
                          </th>
                          <th className="p-3 border-r border-gray-200 text-right">
                            Min Struk
                          </th>
                          <th className="p-3 border-r border-gray-200 text-right">
                            Max Struk
                          </th>
                          <th className="p-3 text-right">Alokasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {detailData.map((row, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="p-3 border-r border-gray-200 text-center text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="p-3 border-r border-gray-200 font-mono text-slate-700">
                              {row.cbd_kodepromosi}
                            </td>
                            <td className="p-3 border-r border-gray-200">
                              {row.cbh_mekanisme || "-"}
                            </td>
                            <td className="p-3 border-r border-gray-200 font-mono text-slate-700">
                              {row.cbd_prdcd}
                            </td>
                            <td className="p-3 border-r border-gray-200">
                              {row.prd_deskripsipanjang || "-"}
                            </td>
                            <td className="p-3 border-r border-gray-200 text-right tabular-nums font-bold text-emerald-700">
                              {formatRupiah(row.cbd_cashback)}
                            </td>
                            <td className="p-3 border-r border-gray-200 text-center">
                              {row.cbd_flagkelipatan || "-"}
                            </td>
                            <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                              {row.cbd_minstruk || "-"}
                            </td>
                            <td className="p-3 border-r border-gray-200 text-right tabular-nums">
                              {row.cbd_maxstruk || "-"}
                            </td>
                            <td className="p-3 text-right tabular-nums">
                              {row.cbd_alokasistok || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {detailModal === "gift" && (
                    <table className="min-w-full text-xs text-left text-slate-600 border-collapse">
                      <thead className="bg-slate-50 text-slate-800 border-b border-gray-200 font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3 border-r border-gray-200 text-center">
                            #
                          </th>
                          <th className="p-3 border-r border-gray-200">
                            Kode Promosi
                          </th>
                          <th className="p-3 border-r border-gray-200">PLU</th>
                          <th className="p-3 border-r border-gray-200">
                            Deskripsi
                          </th>
                          <th className="p-3 border-r border-gray-200">
                            Mekanisme
                          </th>
                          <th className="p-3">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {detailData.map((row, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="p-3 border-r border-gray-200 text-center text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="p-3 border-r border-gray-200 font-mono text-slate-700">
                              {row.gfd_kodepromosi}
                            </td>
                            <td className="p-3 border-r border-gray-200 font-mono text-slate-700">
                              {row.gfd_prdcd}
                            </td>
                            <td className="p-3 border-r border-gray-200">
                              {row.prd_deskripsipanjang || "-"}
                            </td>
                            <td className="p-3 border-r border-gray-200">
                              {row.gfh_mekanisme || "-"}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.ket === "PLU LARANGAN" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                              >
                                {row.ket || "-"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 italic text-sm">
                  Tidak ada data detail
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => {
                  setDetailModal(null);
                  setSelectedPromoCode(null);
                  setDetailData([]);
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-colors shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
