import React, { useState, useRef, useEffect } from 'react';
import { Search, PackageSearch, AlertTriangle, Eye, X } from 'lucide-react';
import UniversalTable from '../components/universalTables';

export default function ProductInfo() {
  const [plu, setPlu] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [error, setError] = useState('');
  
  // State for Modals
  const [activeModal, setActiveModal] = useState(null); // 'rak', 'penerimaan', 'penjualan', or null

  const abortControllerRef = useRef(null);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!plu.trim() || loading) return;

    // Batalkan request sebelumnya jika user spam klik secara cepat
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setHasSearched(true);
    setError('');
    setProduct(null);
    setActiveTab('ringkasan');

    try {
      const response = await fetch(`http://localhost:3000/api/products/${encodeURIComponent(plu.trim())}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error((data && data.message) || `Server Error (${response.status})`);
      }
      
      if (!data) throw new Error("Format respons tidak valid dari server.");

      setProduct(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request dibatalkan');
        return;
      }
      // Graceful error handling saat koneksi terputus atau API offline
      if (err.message.includes('Failed to fetch')) {
        setError("Koneksi ke server gagal. Pastikan API sedang berjalan atau cek koneksi internet Anda.");
      } else {
        setError(err.message);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Informasi Produk</h1>
          <p className="text-sm text-slate-500 mt-1">Pencarian terpadu Master Produk & Promosi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* KOLOM KIRI (SEARCH \& SUMMARY LAYER) - Lebih Lebar (5 columns) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Cari Produk</h3>
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
                {loading ? 'Mencari...' : 'Cari Data'}
              </button>
            </form>
          </div>

         {/* ========================================================= */}
         {/* PANEL PREVIEW KIRI & BUTTON TRIGGER MODAL (Hanya Saat Loaded) */}
         {/* ========================================================= */}
         {hasSearched && !loading && product && !error && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* === RINGKASAN PRODUK UTAMA === */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
                {/* Aksen Label */}
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
                  Master Data
                </div>
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
                       <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Divisi</p>
                       <p className="text-sm font-medium text-slate-800">{product.product.prd_kodedivisi}</p>
                     </div>
                     <div>
                       <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Departemen</p>
                       <p className="text-sm font-medium text-slate-800">{product.product.prd_kodedepartement}</p>
                     </div>
                     <div>
                       <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Kategori</p>
                       <p className="text-sm font-medium text-slate-800">{product.product.prd_kodekategoribarang}</p>
                     </div>
                   </div>
                </div>
              </div>

              {/* === QUICK ACTIONS (MODALS TRIGGER) === */}
              <div className="bg-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                
                <h3 className="text-sm font-medium text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                   Direct Panel Access
                </h3>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setActiveModal('rak')}
                    className="w-full bg-slate-700/50 hover:bg-slate-700 text-white border border-slate-600 p-3 rounded-xl flex items-center justify-between transition-all group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-sm group-hover:text-amber-300 transition-colors">Lokasi & Rak Penyimpanan</span>
                      <span className="text-xs text-slate-400 mt-0.5">{product.locations?.length || 0} record(s) ditemukan</span>
                    </div>
                    <Eye className="w-5 h-5 text-slate-400 group-hover:text-amber-300" />
                  </button>

                  <button 
                    onClick={() => setActiveModal('penerimaan')}
                    className="w-full bg-slate-700/50 hover:bg-slate-700 text-white border border-slate-600 p-3 rounded-xl flex items-center justify-between transition-all group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-sm group-hover:text-emerald-300 transition-colors">History Penerimaan Barang</span>
                      <span className="text-xs text-slate-400 mt-0.5">Top 15 Transaksi Terakhir</span>
                    </div>
                    <Eye className="w-5 h-5 text-slate-400 group-hover:text-emerald-300" />
                  </button>

                  <button 
                    onClick={() => setActiveModal('penjualan')}
                    className="w-full bg-slate-700/50 hover:bg-slate-700 text-white border border-slate-600 p-3 rounded-xl flex items-center justify-between transition-all group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-sm group-hover:text-blue-300 transition-colors">History Penjualan 12 Bulan</span>
                      <span className="text-xs text-slate-400 mt-0.5">Crosstab Qty, Rupiah & Margin</span>
                    </div>
                    <Eye className="w-5 h-5 text-slate-400 group-hover:text-blue-300" />
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
              <p className="text-base font-medium text-slate-600">Belum ada pencarian</p>
              <p className="text-sm mt-1 text-slate-400">Silakan masukkan PLU atau Barcode pada panel di samping.</p>
            </div>
          )}

          {/* STATE: LOADING */}
          {loading && (
            <div className="flex-1 flex items-center justify-center p-16 bg-white rounded-xl border border-gray-200 min-h-[400px]">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-medium text-slate-500 tracking-wide">Mengambil data dari server...</p>
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
                <p className="text-slate-600 text-sm leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* STATE: HASIL DATA */}
          {hasSearched && !loading && product && !error && (
            <div className="space-y-6">
              
              {/* TAB NAVIGATION */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1.5 flex space-x-1 overflow-x-auto scroolbar-hide">
                <button 
                  onClick={() => setActiveTab('ringkasan')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'ringkasan' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Ringkasan
                </button>
                <button 
                  onClick={() => setActiveTab('promosi')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'promosi' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Promosi Aktif
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'history' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  History Transaksi
                </button>
                <button 
                  onClick={() => setActiveTab('aturan')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'aturan' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Aturan & Batasan
                </button>
              </div>

              {/* ========== TAB CONTENT: RINGKASAN STOK & HARGA ========== */}
              {activeTab === 'ringkasan' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  
                  {/* PANEL MULTI-KOLOM: SATUAN JUAL & STOK */}
                  <div className="grid grid-cols-1 gap-6">
                    {/* Satuan Jual */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Satuan Jual & Harga</h3>
                        </div>
                        <div className="p-0">
                          <UniversalTable 
                            columns={[
                              { header: 'Unit/Frac', accessor: 'prd_unit' }, 
                              { header: 'Hrg Jual', accessor: 'prd_hrgjual' },
                              { header: 'Avg Cost', accessor: 'prd_avgcost' },
                              { header: 'Min', accessor: 'prd_minjual' }
                            ]}
                            data={product.salesUnits}
                          />
                        </div>
                    </div>

                    {/* Stok */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Informasi Stok</h3>
                        </div>
                        <div className="p-0 text-xs">
                          <UniversalTable 
                            columns={[
                              { header: 'LOK', accessor: 'location_code' },
                              { header: 'Awal', accessor: 'st_saldoawal' },
                              { header: 'In/Out', accessor: 'st_trfin' }, 
                              { header: 'Sales', accessor: 'st_sales' },
                              { header: 'Akhir', accessor: 'st_saldoakhir' }
                            ]}
                            data={product.stock}
                          />
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========== TAB CONTENT: PROMOSI ========== */}
              {activeTab === 'promosi' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Cashback */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Promo Cashback</h3>
                        </div>
                        <div className="p-0 text-xs text-nowrap truncate overflow-x-auto">
                          {product.cashback && product.cashback.length > 0 ? (
                            <UniversalTable 
                              columns={[
                                { header: 'Kode', accessor: 'cbd_kodepromosi' },
                                { header: 'Nama Promo', accessor: 'cbh_namapromosi' },
                                { header: 'Nilai CB', accessor: 'cbd_cashback' },
                                { header: 'Mulai', accessor: 'cbh_tglawal' },
                                { header: 'Selesai', accessor: 'cbh_tglakhir' }
                              ]}
                              data={product.cashback}
                            />
                          ) : (
                            <div className="p-4 text-center text-slate-500 italic">Tidak ada promo Cashback</div>
                          )}
                        </div>
                    </div>

                    {/* Gift */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Promo Gift</h3>
                        </div>
                        <div className="p-0 text-xs text-nowrap truncate overflow-x-auto">
                          {product.gift && product.gift.length > 0 ? (
                            <UniversalTable 
                              columns={[
                                { header: 'Kode', accessor: 'gif_kode_promosi' },
                                { header: 'Nama Promo', accessor: 'gif_nama_promosi' },
                                { header: 'Hadiah', accessor: 'gif_nama_hadiah' },
                                { header: 'Mulai', accessor: 'gif_mulai' },
                                { header: 'Selesai', accessor: 'gif_selesai' }
                              ]}
                              data={product.gift}
                            />
                          ) : (
                            <div className="p-4 text-center text-slate-500 italic">Tidak ada promo Gift</div>
                          )}
                        </div>
                    </div>
                    
                    {/* Instore */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Instore Promo</h3>
                        </div>
                        <div className="p-0 text-xs text-nowrap truncate overflow-x-auto">
                          {product.instore && product.instore.length > 0 ? (
                            <UniversalTable 
                              columns={[
                                { header: 'Kode', accessor: 'isd_kodepromosi' },
                                { header: 'Tipe', accessor: 'isd_jenispromosi' },
                                { header: 'Hadiah', accessor: 'bprp_ketpanjang' },
                                { header: 'Mulai', accessor: 'ish_tglawal' },
                                { header: 'Selesai', accessor: 'ish_tglakhir' }
                              ]}
                              data={product.instore}
                            />
                          ) : (
                            <div className="p-4 text-center text-slate-500 italic">Tidak ada Instore Promo</div>
                          )}
                        </div>
                    </div>

                    {/* Harga Jual Khusus */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Harga Jual Khusus</h3>
                        </div>
                        <div className="p-0 text-xs text-nowrap truncate overflow-x-auto">
                          {product.hjk && product.hjk.length > 0 ? (
                            <UniversalTable 
                              columns={[
                                { header: 'PLU', accessor: 'hgk_prdcd' },
                                { header: 'Harga Khusus', accessor: 'hgk_hrgjual' },
                                { header: 'Tgl Mulai', accessor: 'hgk_tglawal' },
                                { header: 'Tgl Selesai', accessor: 'hgk_tglakhir' }
                              ]}
                              data={product.hjk}
                            />
                          ) : (
                            <div className="p-4 text-center text-slate-500 italic">Tidak ada Harga Jual Khusus</div>
                          )}
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========== TAB CONTENT: HISTORY & TREND ========== */}
              {activeTab === 'history' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Trend Sales (Belum di Modal-kan, render di Tab) */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Trend Sales Bulanan (Raw)</h3>
                    </div>
                    <div className="p-4 text-sm text-slate-600 bg-slate-50">
                      <pre className="bg-white border border-slate-200 shadow-inner p-3 rounded-lg text-xs overflow-x-auto max-h-64">{JSON.stringify(product.trendSales, null, 2)}</pre>
                    </div>
                  </div>
                  
                  <div className="p-8 text-center bg-white border border-dashed border-gray-300 rounded-xl">
                      <p className="text-slate-500 mb-3">Data Penerimaan dan 12-Bulan Penjualan dipindahkan ke Modal untuk kelegaan Layar.</p>
                      <div className="flex justify-center gap-3 relative z-0">
                         <button onClick={() => setActiveModal('penerimaan')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                           Buka Modal Penerimaan
                         </button>
                         <button onClick={() => setActiveModal('penjualan')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                           Buka Modal Penjualan 12 Bulan
                         </button>
                      </div>
                  </div>
                </div>
              )}

              {/* ========== TAB CONTENT: ATURAN ========== */}
              {activeTab === 'aturan' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Pembatasan */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Pembatasan</h3>
                      </div>
                      <div className="p-0 text-xs text-nowrap truncate overflow-x-auto">
                        {product.pembatasan && product.pembatasan.length > 0 ? (
                          <UniversalTable 
                            columns={[
                              { header: 'Ket', accessor: 'ket' },
                              { header: 'Satuan', accessor: 'satuan' },
                              { header: 'Biru', accessor: 'br' },
                              { header: 'Biru+', accessor: 'bp' },
                              { header: 'Retailer', accessor: 'ret' },
                              { header: 'Platinum', accessor: 'pla' }
                            ]}
                            data={product.pembatasan}
                          />
                        ) : (
                          <div className="p-4 text-center text-slate-500 italic">Tidak ada aturan pembatasan</div>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-900/5 drop-shadow-2xl scale-in-center">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 {activeModal === 'rak' && 'Lokasi Rak Penyimpanan'}
                 {activeModal === 'penerimaan' && 'History Penerimaan Barang'}
                 {activeModal === 'penjualan' && 'Crosstab History Penjualan 12 Bulan'}
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
               {activeModal === 'rak' && (
                 <div className="p-0">
                    <UniversalTable 
                      columns={[
                        { header: 'Kode Rak', accessor: 'lks_koderak' },
                        { header: 'Sub Rak', accessor: 'lks_kodesubrak' },
                        { header: 'Tipe', accessor: 'lks_tiperak' },
                        { header: 'Shelving', accessor: 'lks_shelvingrak' },
                        { header: 'Urutan', accessor: 'lks_nourut' },
                        { header: 'Qty Limit', accessor: 'lks_qty' },
                        { header: 'Exp. Date', accessor: 'lks_expdate' }
                      ]}
                      data={product.locations || []}
                    />
                 </div>
               )}

               {/* --- CONTENT: PENERIMAAN --- */}
               {activeModal === 'penerimaan' && (
                 <div className="p-0 text-sm">
                    {product.penerimaan && product.penerimaan.length > 0 ? (
                      <UniversalTable 
                        columns={[
                          { header: 'Nama Supplier', accessor: 'mstd_namasupplier' },
                          { header: 'No. Dokumen', accessor: 'mstd_nodoc' },
                          { header: 'Tanggal Doc', accessor: 'mstd_tgldoc' },
                          { header: 'Jam', accessor: 'mstd_jam' },
                          { header: 'Qty Terima', accessor: 'mstd_qty' },
                          { header: 'Bonus 1', accessor: 'mstd_qtybonus1' },
                          { header: 'Bonus 2', accessor: 'mstd_qtybonus2' },
                          { header: 'Avg Cost / Unit', accessor: 'mstd_avgcost' }
                        ]}
                        data={product.penerimaan}
                      />
                    ) : (
                      <div className="p-12 text-center text-slate-500 text-lg">Tidak ada history penerimaan untuk produk ini.</div>
                    )}
                 </div>
               )}

               {/* --- CONTENT: PENJUALAN 12 BULAN (CROSSTAB CUSTOM) --- */}
               {activeModal === 'penjualan' && (
                 <div className="p-4 bg-white">
                    {product.penjualan && product.penjualan.length > 0 ? (
                       <div className="overflow-x-auto rounded-xl border border-gray-200">
                          <table className="min-w-full text-xs text-left text-slate-600 border-collapse">
                            <thead className="bg-slate-100 text-slate-800 border-b border-gray-200 font-semibold uppercase tracking-wider text-[10px]">
                              <tr>
                                <th rowSpan="2" className="p-3 border-r border-gray-200 text-center">Group</th>
                                <th rowSpan="2" className="p-3 border-r border-gray-200 text-center">Metrics</th>
                                <th colSpan="12" className="p-2 border-b border-gray-200 text-center">Bulan Transaksi (01 - 12)</th>
                              </tr>
                              <tr>
                                {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                                  <th key={m} className="p-2 border-r border-gray-200 text-center hover:bg-slate-200 transition-colors">{m}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {product.penjualan.map((row, idx) => {
                                 // Define member group name logic based on legacy
                                 let groupName = "Other";
                                 if (row.rsl_group === '01') groupName = "Member Biru";
                                 else if (row.rsl_group === '02') groupName = "OMI";
                                 else if (row.rsl_group === '03') groupName = "Member Merah";
                                 else if (row.rsl_group === '04') groupName = "IDM";

                                 return (
                                   <React.Fragment key={idx}>
                                     {/* Row: QTY */}
                                     <tr className="hover:bg-slate-50 transition-colors">
                                       <td rowSpan="5" className="px-3 py-2 border-r border-b border-gray-200 font-bold bg-white aligns-top text-center align-middle whitespace-nowrap">{groupName}</td>
                                       <td className="px-3 py-2 border-r border-gray-200 font-medium">Qty Terjual</td>
                                       {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                                         <td key={m} className="px-2 py-2 border-r border-gray-100 text-right tabular-nums">{Number(row[`rsl_qty_${m}`] || 0).toLocaleString('id-ID')}</td>
                                       ))}
                                     </tr>
                                     {/* Row: Rupiah */}
                                     <tr className="hover:bg-slate-50 transition-colors">
                                       <td className="px-3 py-2 border-r border-gray-200 font-medium text-emerald-700 bg-emerald-50/30">Rupiah (x1000)</td>
                                       {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                                         <td key={m} className="px-2 py-2 border-r border-gray-100 text-right tabular-nums text-emerald-800 bg-emerald-50/30">
                                            {(Number(row[`rsl_rph_${m}`] || 0) / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                         </td>
                                       ))}
                                     </tr>
                                     {/* Row: Margin Rupiah */}
                                     <tr className="hover:bg-slate-50 transition-colors">
                                       <td className="px-3 py-2 border-r border-gray-200 font-medium text-blue-700 bg-blue-50/30">Margin (x1000)</td>
                                       {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => {
                                          const rph = Number(row[`rsl_rph_${m}`] || 0);
                                          const hpp = Number(row[`rsl_hpp_${m}`] || 0);
                                          return (
                                           <td key={m} className="px-2 py-2 border-r border-gray-100 text-right tabular-nums text-blue-800 bg-blue-50/30">
                                              {((rph - hpp) / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                           </td>
                                          )
                                       })}
                                     </tr>
                                     {/* Row: Margin Persen */}
                                     <tr className="hover:bg-slate-50 transition-colors">
                                       <td className="px-3 py-2 border-r border-gray-200 font-medium text-purple-700 bg-purple-50/30">Margin (%)</td>
                                       {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => {
                                          const rph = Number(row[`rsl_rph_${m}`] || 0);
                                          const hpp = Number(row[`rsl_hpp_${m}`] || 0);
                                          const pct = rph > 0 ? ((rph - hpp) / rph) * 100 : 0;
                                          return (
                                           <td key={m} className="px-2 py-2 border-r border-gray-100 text-right tabular-nums text-purple-800 bg-purple-50/30">
                                              {pct.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                           </td>
                                          )
                                       })}
                                     </tr>
                                     {/* Row: Member Count */}
                                     <tr className="hover:bg-slate-50 transition-colors border-b-2 border-gray-300">
                                       <td className="px-3 py-2 border-r border-gray-200 font-medium text-slate-500">Jml Member</td>
                                       {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                                         <td key={m} className="px-2 py-2 border-r border-gray-100 text-right tabular-nums text-slate-500">
                                            {Number(row[`rsl_jmlmember_${m}`] || 0).toLocaleString('id-ID')}
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
                      <div className="p-12 text-center text-slate-500 text-lg">Tidak ada history penjualan bulanan untuk produk ini.</div>
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

    </div>
  );
}