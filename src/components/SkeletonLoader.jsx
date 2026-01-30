/**
 * Componente SkeletonLoader
 * Muestra un esqueleto de carga con el mismo diseño que los módulos
 */
export default function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button Skeleton */}
        <div className="mb-3 sm:mb-4">
          <div className="h-5 bg-gray-300 rounded w-48 animate-pulse"></div>
        </div>

        {/* Header Card */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="text-center mb-4">
              {/* Icon and Title */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
                <div className="h-6 sm:h-8 w-6 sm:w-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="h-8 sm:h-9 bg-gray-300 rounded w-40 animate-pulse"></div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5 mx-auto animate-pulse"></div>
              </div>

              {/* User Info */}
              <div className="h-4 bg-gray-200 rounded w-40 mx-auto mt-3 animate-pulse"></div>
            </div>

            {/* Dropdown Selector */}
            <div className="mb-4">
              <div className="h-4 bg-gray-300 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-10 bg-gray-300 rounded-lg w-full sm:w-56 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Empty State Message */}
        <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl p-8 sm:p-12 text-center mb-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gray-300 rounded-full animate-pulse"></div>
          </div>

          {/* Title */}
          <div className="h-7 bg-gray-300 rounded w-64 mx-auto mb-3 animate-pulse"></div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-80 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-72 mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="bg-green-50 border-2 border-green-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition"
            >
              {/* Card Title */}
              <div className="h-6 bg-gray-400 rounded w-32 mb-2 animate-pulse"></div>

              {/* Card Description */}
              <div className="h-4 bg-gray-300 rounded w-48 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4">
          <div className="flex gap-2">
            <div 
              className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce"
              style={{animationDelay: '0s'}}
            ></div>
            <div 
              className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce"
              style={{animationDelay: '0.2s'}}
            ></div>
            <div 
              className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce"
              style={{animationDelay: '0.4s'}}
            ></div>
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-semibold text-sm sm:text-base">Cargando módulo</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Por favor espera...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
