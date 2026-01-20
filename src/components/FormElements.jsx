import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  success,
  required,
  disabled,
  icon: Icon,
  description,
  validationPattern,
  autoComplete,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const isPasswordType = type === 'password';
  const displayType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  const handleBlur = (e) => {
    setTouched(true);
    props.onBlur?.(e);
  };

  const showValidation = touched && (error || success);

  return (
    <div className="group">
      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 group-focus-within:text-blue-600 transition capitalize">
        {Icon && <Icon className="inline w-4 h-4 mr-1" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type={displayType}
          value={value}
          onChange={(e) => {
            if (validationPattern && !validationPattern.test(e.target.value) && e.target.value) {
              return;
            }
            onChange(e.target.value);
          }}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base border-2 rounded-lg focus:outline-none transition duration-300 bg-white ${
            error && touched
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : success && touched
              ? 'border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200'
              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          {...props}
        />

        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-200 p-1"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            disabled={disabled}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}

        {showValidation && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {error && touched ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500 animate-fade-in" />
            )}
          </div>
        )}
      </div>

      {description && !error && (
        <p className="text-xs text-gray-500 mt-1 ml-1">{description}</p>
      )}

      {error && touched && (
        <p className="text-xs text-red-600 mt-1 ml-1 flex items-center gap-1 animate-fade-in">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

export function FormSelect({
  label,
  options,
  value,
  onChange,
  error,
  required,
  disabled,
  icon: Icon,
  ...props
}) {
  const [touched, setTouched] = useState(false);

  return (
    <div className="group">
      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 group-focus-within:text-blue-600 transition capitalize">
        {Icon && <Icon className="inline w-4 h-4 mr-1" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        disabled={disabled}
        className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base border-2 rounded-lg focus:outline-none transition duration-300 bg-white ${
          error && touched
            ? 'border-red-400 focus:border-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        {...props}
      >
        <option value="">Seleccionar...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && touched && (
        <p className="text-xs text-red-600 mt-1 ml-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

export function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  rows = 4,
  maxLength,
  ...props
}) {
  const [touched, setTouched] = useState(false);

  return (
    <div className="group">
      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 group-focus-within:text-blue-600 transition capitalize flex justify-between">
        <span>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
        {maxLength && (
          <span className="text-xs text-gray-500">{value.length}/{maxLength}</span>
        )}
      </label>
      
      <textarea
        value={value}
        onChange={(e) => {
          if (!maxLength || e.target.value.length <= maxLength) {
            onChange(e.target.value);
          }
        }}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base border-2 rounded-lg focus:outline-none transition duration-300 bg-white resize-none ${
          error && touched
            ? 'border-red-400 focus:border-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        {...props}
      />

      {error && touched && (
        <p className="text-xs text-red-600 mt-1 ml-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

export function FormButton({
  children,
  loading,
  disabled,
  variant = 'primary',
  icon: Icon,
  fullWidth = false,
  size = 'md',
  ...props
}) {
  const baseClasses = 'font-bold transition-all duration-300 transform flex items-center justify-center gap-2 rounded-lg';
  
  const variantClasses = {
    primary: 'bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg hover:shadow-xl',
    success: 'bg-linear-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg hover:shadow-xl',
    danger: 'bg-linear-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50',
    ghost: 'bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50 disabled:opacity-50'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs sm:text-sm',
    md: 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base',
    lg: 'px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg'
  };

  return (
    <button
      disabled={loading || disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span>
          Procesando...
        </>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          {children}
        </>
      )}
    </button>
  );
}
