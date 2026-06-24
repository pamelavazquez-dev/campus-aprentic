export default function DataTable({ columns, rows, emptyMessage, loading, loadingMessage }) {
  return (
    <div className="bg-surface backdrop-blur-lg border border-border-default rounded-2xl overflow-hidden shadow-sm">
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium">{loadingMessage || 'Cargando datos...'}</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-border-default">
                {columns.map((column) => (
                  <th key={column.key} className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 font-medium">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors duration-200 group">
                    {columns.map((column) => (
                      <td key={column.key} data-label={column.header} className="px-6 py-4 text-sm text-text-strong">
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
