import { useEffect, useMemo, useState } from 'react';
import { getStudentPhotoUrl } from '../utils/studentPhoto';

function getInitials(name) {
  if (!name || typeof name !== 'string') return 'N/A';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'N/A';
  return parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
}

function StudentPhoto({ email, name, sizeClass = 'w-14 h-14 text-base', enableZoom = false }) {
  const [imageError, setImageError] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const photoUrl = useMemo(() => getStudentPhotoUrl(email), [email]);

  useEffect(() => {
    setImageError(false);
  }, [photoUrl]);

  const initials = useMemo(() => getInitials(name), [name]);
  const showImage = !!photoUrl && !imageError;
  const canZoom = enableZoom && showImage;

  return (
    <>
      <div className={`${sizeClass} rounded-full overflow-hidden border-2 border-white/60 bg-blue-100 flex items-center justify-center shadow relative`}>
        {showImage ? (
          <img
            src={photoUrl}
            alt={`Foto de ${name || 'estudiante'}`}
            className={`w-full h-full object-cover ${canZoom ? 'cursor-zoom-in' : ''}`}
            loading="lazy"
            onError={() => setImageError(true)}
            onClick={() => canZoom && setShowZoom(true)}
          />
        ) : (
          <span className="font-bold text-blue-700">{initials}</span>
        )}
      </div>

      {canZoom && showZoom && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowZoom(false)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowZoom(false)}
              className="absolute -top-3 -right-3 w-10 h-10 p-0 rounded-full bg-white text-gray-800 font-bold shadow flex items-center justify-center leading-none aspect-square transition-all duration-200 hover:scale-105 hover:bg-gray-100 hover:text-gray-900"
              aria-label="Cerrar zoom"
            >
              ×
            </button>
            <img
              src={photoUrl}
              alt={`Foto ampliada de ${name || 'estudiante'}`}
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default StudentPhoto;
