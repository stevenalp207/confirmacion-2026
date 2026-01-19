import { Calendar as CalendarIcon } from 'lucide-react'

function FAB({ onClick, label = 'Calendario' }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-6 right-6 z-50 rounded-full bg-brand-accent text-white shadow-lg hover:shadow-xl hover:brightness-110 active:brightness-95 transition flex items-center gap-2 px-4 py-3"
    >
      <CalendarIcon className="w-5 h-5" />
      <span className="font-semibold">{label}</span>
    </button>
  )
}

export default FAB
