import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Enviar a servicio de logging en producción
    if (process.env.NODE_ENV === 'production') {
      // Aquí podrías enviar a Sentry u otro servicio
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    try {
      // Ejemplo: enviar a un servidor de logging
      // fetch('/api/logs', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     error: error.toString(),
      //     stack: errorInfo.componentStack,
      //     timestamp: new Date().toISOString(),
      //   }),
      // });
    } catch (err) {
      console.error('Error al registrar el error:', err);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 0v2m0-4H8m4 0h4m-11 0H3m6 0h6"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Algo salió mal
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Disculpa, ha ocurrido un error inesperado. Por favor, intenta recargar la página.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 rounded border border-red-200">
                <p className="text-xs font-mono text-red-800 mb-2 font-semibold">
                  Error:
                </p>
                <p className="text-xs text-red-700 mb-3 break-words">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-semibold text-red-800 hover:text-red-900">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-40 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
              >
                Intentar de nuevo
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded hover:bg-gray-300 transition"
              >
                Ir al inicio
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <p className="mt-4 text-xs text-gray-500 text-center">
                Errores capturados: {this.state.errorCount}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
