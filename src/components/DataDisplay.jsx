import { Plus, Search } from 'lucide-react';

export function EmptyDataState({
  icon: Icon,
  title,
  subtitle,
  actionText,
  onAction,
  actionVariant = 'primary'
}) {
  const buttonClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    success: 'bg-green-600 hover:bg-green-700',
    danger: 'bg-red-600 hover:bg-red-700'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-lg border-2 border-dashed border-gray-300 animate-fade-in">
      <div className="mb-4 p-4 bg-gray-100 rounded-full">
        {Icon && (
          <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
        )}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 text-center">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 text-center mb-6 max-w-xs">
        {subtitle}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className={`flex items-center gap-2 px-6 py-3 ${buttonClasses[actionVariant]} text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg`}
        >
          <Plus className="w-5 h-5" />
          {actionText}
        </button>
      )}
    </div>
  );
}

export function NoResultsFound({ query }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-lg border border-gray-200 animate-fade-in">
      <div className="mb-4 p-4 bg-gray-100 rounded-full">
        <Search className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 text-center">
        No se encontraron resultados
      </h3>
      <p className="text-sm sm:text-base text-gray-600 text-center max-w-xs">
        No hay registros que coincidan con <span className="font-semibold">"{query}"</span>
      </p>
    </div>
  );
}

export function LoadingSpinner({ size = 'md', message = 'Cargando...' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12">
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-3 sm:mb-4`} />
      <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>{message}</p>
    </div>
  );
}

export function DataTable({ columns, rows, onRowClick, loading, emptyMessage }) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">{emptyMessage || 'No hay datos disponibles'}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className={`transition-all hover:bg-blue-50 ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-800"
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color = 'blue', trend }) {
  const bgColors = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
    yellow: 'bg-yellow-100'
  };

  const textColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-600">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs. anterior
            </p>
          )}
        </div>
        {Icon && (
          <div className={`${bgColors[color]} ${textColors[color]} p-3 rounded-full`}>
            <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        )}
      </div>
    </div>
  );
}
