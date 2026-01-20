import { Loader } from 'lucide-react';

export function LoadingSpinner({ size = 'md', text = 'Cargando...' }) {
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
      <Loader className={`${sizeClasses[size]} text-blue-600 animate-spin-slow mb-3 sm:mb-4`} />
      <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>{text}</p>
    </div>
  );
}

export function SkeletonLoader({ count = 3, height = 'h-12' }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${height} bg-gray-200 rounded-lg skeleton`} />
      ))}
    </div>
  );
}

export function TableSkeletonLoader({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-2">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="flex-1 h-10 bg-gray-200 rounded-lg skeleton" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <div className="h-12 bg-gray-200 rounded-lg skeleton w-3/4" />
      <div className="h-4 bg-gray-200 rounded-lg skeleton" />
      <div className="h-4 bg-gray-200 rounded-lg skeleton w-5/6" />
      <div className="h-10 bg-gray-200 rounded-lg skeleton w-1/3 mt-4" />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  actionText,
  onAction,
  actionDisabled = false
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
      {Icon && (
        <Icon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mb-4" />
      )}
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 text-center">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 text-center mb-6 max-w-xs">
        {message}
      </p>
      {actionText && (
        <button
          onClick={onAction}
          disabled={actionDisabled}
          className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export function LoadingOverlay({ isLoading, message = 'Cargando...' }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 sm:p-12 animate-fade-in">
        <LoadingSpinner size="lg" text={message} />
      </div>
    </div>
  );
}
