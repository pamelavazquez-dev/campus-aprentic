export default function DataTable({ columns, rows, emptyMessage, loading, loadingMessage }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-gray-200/60 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
          <span className="text-gray-500 font-bold tracking-wide text-sm">{loadingMessage || 'Cargando datos...'}</span>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/40">
                {columns.map((column, idx) => (
                  <th key={column.key} className={`px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap ${idx === 0 ? 'pl-8' : ''} ${idx === columns.length - 1 ? 'pr-8' : ''}`}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/80 bg-white/40">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center text-gray-400 font-semibold bg-white/50">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <span className="text-gray-500">{emptyMessage}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="group hover:bg-white hover:shadow-[0_2px_10px_rgb(0,0,0,0.03)] transition-all duration-300 relative z-0 hover:z-10">
                    {columns.map((column, idx) => (
                      <td key={column.key} data-label={column.header} className={`px-6 py-5 text-sm font-medium text-gray-600 border-none ${idx === 0 ? 'pl-8 text-text-strong font-extrabold group-hover:text-brand-primary transition-colors' : ''} ${idx === columns.length - 1 ? 'pr-8' : ''}`}>
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
