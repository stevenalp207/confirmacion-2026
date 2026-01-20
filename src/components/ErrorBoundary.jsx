import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4 sm:p-8">
          <div className="bg-white rounded-lg shadow-2xl p-8 sm:p-12 max-w-md w-full animate-fade-in">
            <div className="flex justify-center mb-6">
              <AlertTriangle className="w-16 h-16 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2 text-center">
              Algo salió mal
            </h1>
            <p className="text-gray-600 text-center mb-4">
              Lo sentimos, pero encontramos un error inesperado.
            </p>
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded max-h-40 overflow-y-auto">
              <p className="text-sm text-red-700 font-mono break-words">
                {this.state.error?.message}
              </p>
            </div>
            <button
              onClick={this.resetError}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorAlert({ title, message, onDismiss, type = 'error' }) {
  const bgColors = {
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200'
  };

  const titleColors = {
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
    success: 'text-green-800'
  };

  const messageColors = {
    error: 'text-red-700',
    warning: 'text-yellow-700',
    info: 'text-blue-700',
    success: 'text-green-700'
  };

  const borderColors = {
    error: 'border-l-red-600',
    warning: 'border-l-yellow-600',
    info: 'border-l-blue-600',
    success: 'border-l-green-600'
  };

  return (
    <div
      className={`${bgColors[type]} border-l-4 ${borderColors[type]} p-4 sm:p-6 rounded-lg animate-fade-in shadow-md`}
      role="alert"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className={`font-bold text-sm sm:text-base mb-1 ${titleColors[type]}`}>
            {title}
          </h3>
          <p className={`text-sm ${messageColors[type]}`}>{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Cerrar alerta"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export function ValidationError({ errors, field }) {
  if (!errors || !errors[field]) return null;

  return (
    <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium flex items-center gap-1">
      <span className="text-lg">⚠️</span>
      {errors[field]}
    </p>
  );
}
