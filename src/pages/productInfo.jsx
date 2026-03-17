import React, { useState } from 'react';
import { Search, PackageSearch } from 'lucide-react';

export default function ProductInfo() {
  const [plu, setPlu] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!plu.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setError('');
    setProduct(null);

    try {
      // Endpoint ini nanti disesuaikan sama route backend Node.js lo
      const response = await fetch(`http://localhost:3000/api/products/${plu}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Gagal menarik data');
      
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Informasi Produk</h1>
        <p className="text-sm text-slate-500">Pencarian Master Produk berdasarkan PLU atau Barcode</p>
      </div>

      {/* Search Bar Section */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8 bg-white p-4 rounded-lg border border-gray-200 max-w-3xl">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
            placeholder="Ketik PLU atau Barcode di sini..."
            value={plu}
            onChange={(e) => setPlu(e.target.value)}
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={loading || !plu.trim()}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? 'Mencari...' : 'Cari Data'}
        </button>
      </form>

      {/* Conditional Rendering Area (Hasil Pencarian) */}
      <div className="bg-white rounded-lg border border-gray-200 min-h-[300px] flex flex-col">
        {!hasSearched && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12">
            <PackageSearch className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">Belum ada pencarian</p>
            <p className="text-sm">Silakan masukkan PLU atau Barcode pada kolom di atas.</p>
          </div>
        )}

        {loading && (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-red-200 rounded-full mb-4"></div>
              <p className="text-slate-500">Mengambil data dari database...</p>
            </div>
          </div>
        )}

        {hasSearched && !loading && error && (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <p className="text-red-500 font-semibold mb-2">Error: {error}</p>
              <p className="text-slate-500 text-sm">Pastikan PLU/Barcode benar atau cek koneksi database.</p>
            </div>
          </div>
        )}

        {hasSearched && !loading && product && (
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-slate-800 text-sm font-semibold uppercase">
                  <th className="p-4 border-r border-gray-200">PLU</th>
                  <th className="p-4 border-r border-gray-200">Deskripsi Barang</th>
                  <th className="p-4 border-r border-gray-200">Divisi</th>
                  <th className="p-4 border-r border-gray-200">Departemen</th>
                  <th className="p-4 border-r border-gray-200">Kategori</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-slate-50">
                  <td className="p-4 text-sm text-slate-700 border-r border-gray-100">{product.prd_prdcd}</td>
                  <td className="p-4 text-sm font-medium text-slate-900 border-r border-gray-100">{product.prd_deskripsipanjang}</td>
                  <td className="p-4 text-sm text-slate-700 border-r border-gray-100">{product.prd_kodedivisi}</td>
                  <td className="p-4 text-sm text-slate-700 border-r border-gray-100">{product.prd_kodedepartement}</td>
                  <td className="p-4 text-sm text-slate-700">{product.prd_kodekategoribarang}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}