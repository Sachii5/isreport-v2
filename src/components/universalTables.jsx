import React from 'react';

export default function UniversalTable({ columns, data, isLoading }) {
  if (isLoading) {
    return <div className="p-4 text-center text-slate-500 animate-pulse">Menarik data dari database...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-red-500 font-medium bg-red-50 rounded-md">Data tidak ditemukan.</div>;
  }

  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-gray-200 text-slate-800 text-sm font-semibold uppercase">
            {columns.map((col, idx) => (
              <th key={idx} className="p-3 border-r border-gray-200 last:border-r-0">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="p-3 text-sm text-slate-700 border-r border-gray-100 last:border-r-0">
                  {row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}