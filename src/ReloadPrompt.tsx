import { useRegisterSW } from 'virtual:pwa-register/react';

export default function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('SW registrado:', r);
    },
    onRegisterError(error: Error) {
      console.error('Error al registrar SW:', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-indigo-600 border border-indigo-500 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center gap-4 text-white">
      <div className="text-sm font-medium">
        Hay una nueva actualización disponible.
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => updateServiceWorker(true)}
          className="px-4 py-2 bg-white text-indigo-700 font-bold rounded-lg text-sm hover:bg-gray-100 transition-colors"
        >
          Actualizar
        </button>
        <button 
          onClick={() => setNeedRefresh(false)}
          className="px-4 py-2 bg-indigo-800 text-indigo-100 font-bold rounded-lg text-sm hover:bg-indigo-900 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
