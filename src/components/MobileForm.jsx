/**
 * Componente para formularios responsivos en mobile
 * Automáticamente adapta el layout según el tamaño de pantalla
 */
export default function ResponsiveForm({ children, className = '', columns = 'auto' }) {
  const columnClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    auto: 'grid-cols-1 md:grid-cols-2'
  }[columns] || 'grid-cols-1 md:grid-cols-2';

  return (
    <form className={`${className}`}>
      {/* Para inputs individuales */}
      {Array.isArray(children) ? (
        <div className={`grid gap-4 ${columnClass}`}>
          {children}
        </div>
      ) : (
        <div className={`grid gap-4 ${columnClass}`}>
          {children}
        </div>
      )}
    </form>
  );
}

/**
 * Componente para grupos de inputs en mobile
 */
export function FormGroup({ label, error, required = false, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}

/**
 * Inputs optimizados para mobile
 */
export function MobileInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        w-full px-4 py-3 rounded-lg border-2 border-gray-300
        text-base font-normal
        focus:border-blue-500 focus:outline-none
        disabled:bg-gray-100 disabled:text-gray-500
        transition-colors duration-200
        ${className}
      `}
      {...props}
    />
  );
}

/**
 * Select optimizado para mobile
 */
export function MobileSelect({
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        w-full px-4 py-3 rounded-lg border-2 border-gray-300
        text-base font-normal
        focus:border-blue-500 focus:outline-none
        disabled:bg-gray-100 disabled:text-gray-500
        appearance-none bg-white bg-no-repeat
        bg-[url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")]
        bg-right-4 bg-center bg-[length:1.5em_1.5em]
        pr-10
        transition-colors duration-200
        ${className}
      `}
      {...props}
    >
      {placeholder && (
        <option value="">{placeholder}</option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Textarea optimizado para mobile
 */
export function MobileTextarea({
  placeholder,
  value,
  onChange,
  rows = 4,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      className={`
        w-full px-4 py-3 rounded-lg border-2 border-gray-300
        text-base font-normal resize-none
        focus:border-blue-500 focus:outline-none
        disabled:bg-gray-100 disabled:text-gray-500
        transition-colors duration-200
        ${className}
      `}
      {...props}
    />
  );
}

/**
 * Botón optimizado para mobile (44x44px min)
 */
export function MobileButton({
  onClick,
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-lg font-medium transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        min-h-[44px] min-w-[44px]
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Checkbox optimizado para mobile
 */
export function MobileCheckbox({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer select-none ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-6 h-6 rounded border-2 border-gray-300 text-blue-600 cursor-pointer"
        {...props}
      />
      <span className="text-base text-gray-900">{label}</span>
    </label>
  );
}

/**
 * Radio button optimizado para mobile
 */
export function MobileRadio({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer select-none ${className}`}>
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-6 h-6 text-blue-600 cursor-pointer"
        {...props}
      />
      <span className="text-base text-gray-900">{label}</span>
    </label>
  );
}
