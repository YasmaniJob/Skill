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
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 p-10 text-center">
            <div className="inline-flex p-4 bg-red-50 rounded-lg mb-8">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-4">Algo salió mal</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Error de Sistema</p>
            
            <p className="text-xs text-slate-500 mb-10 leading-relaxed px-4">
              La aplicación ha encontrado un error inesperado. Por favor, intenta recargar la página para continuar.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-black text-[11px] uppercase tracking-widest rounded-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Recargar aplicación
            </button>

            <div className="mt-10 pt-8 border-t border-slate-100 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Detalle Técnico</label>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] font-mono text-slate-500 break-all leading-relaxed">
                  {this.state.error?.toString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
