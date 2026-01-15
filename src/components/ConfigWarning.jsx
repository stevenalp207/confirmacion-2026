import { isFirebaseConfigured } from '../config/firebase';

function ConfigWarning() {
  if (isFirebaseConfigured) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-gray-900 px-4 py-3 text-center z-50">
      <p className="font-semibold">
        ⚠️ Firebase no está configurado. 
        <span className="ml-2">
          Lee el archivo <code className="bg-yellow-600 px-2 py-1 rounded">FIREBASE_SETUP.md</code> para instrucciones.
        </span>
      </p>
    </div>
  );
}

export default ConfigWarning;
