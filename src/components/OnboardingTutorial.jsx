import { useState, useEffect } from 'react';
import { Bell, X, ArrowRight, Check, Sparkles } from 'lucide-react';

const OnboardingTutorial = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animación de entrada
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const steps = [
    {
      title: '¡Bienvenido a Confirmación 2026! 🎉',
      description: 'Te ayudaremos a configurar las notificaciones para que no te pierdas nada importante.',
      icon: <Sparkles className="w-16 h-16 text-yellow-500" />,
      image: null
    },
    {
      title: 'Activa las Notificaciones 🔔',
      description: 'Recibe recordatorios automáticos para pasar asistencia, revisar pagos pendientes y más.',
      icon: <Bell className="w-16 h-16 text-blue-500 animate-pulse" />,
      highlight: 'bell-button'
    },
    {
      title: 'Nunca Olvides Nada ⏰',
      description: 'Configura recordatorios semanales que se adaptan a tu rol y responsabilidades.',
      icon: <Check className="w-16 h-16 text-green-500" />,
      features: [
        '📋 Recordatorio de asistencia (Jueves 5:05 PM)',
        '👨‍🏫 Asistencia de catequistas (Jueves 4:00 PM)'
      ]
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkipNow = () => {
    setIsVisible(false);
    setTimeout(() => {
      onSkip();
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-60 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
    >
      {/* Backdrop con blur */}
      <div className="absolute inset-0 backdrop-blur-sm" onClick={handleSkipNow} />
      
      {/* Tutorial Card */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Header con gradiente */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12" />
          
          <button
            onClick={handleSkipNow}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <div className="flex justify-center mb-4">
              {currentStepData.icon}
            </div>
            <h2 className="text-2xl font-bold text-center">
              {currentStepData.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-gray-700 text-center text-lg leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Features list para el último paso */}
          {currentStepData.features && (
            <div className="space-y-3">
              {currentStepData.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg transform transition hover:scale-105"
                >
                  <div className="shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Highlight para el paso de activar notificaciones */}
          {currentStepData.highlight === 'bell-button' && (
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-500 text-white p-2 rounded-lg">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Busca este botón</p>
                  <p className="text-sm text-gray-600">En la esquina superior derecha</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg">
                <span className="text-xl">👆</span>
                <span>Haz clic en el icono de campana para comenzar</span>
              </div>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-2 pt-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentStep
                    ? 'w-8 h-2 bg-blue-600'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {!isLastStep && (
              <button
                onClick={handleSkipNow}
                className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition"
              >
                Saltar
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              {isLastStep ? (
                <>
                  <Check className="w-5 h-5" />
                  ¡Entendido!
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Footer hint */}
          {isLastStep && (
            <p className="text-center text-sm text-gray-500 italic">
              Puedes activar las notificaciones en cualquier momento desde el icono 🔔
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
