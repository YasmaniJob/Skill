import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
            <div className="inline-flex p-4 bg-red-50 rounded-2xl mb-6">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Algo salió mal</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              La aplicación ha encontrado un error inesperado. Por favor, intenta recargar la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-sky-100"
            >
              <RefreshCw className="w-5 h-5" />
              Recargar aplicación
            </button>
            <div className="mt-8 pt-6 border-t border-slate-100 text-left">
              <p className="text-[10px] font-mono text-slate-400 break-all bg-slate-50 p-3 rounded-lg">
                {this.state.error?.toString()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
