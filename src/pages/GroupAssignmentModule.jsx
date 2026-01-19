import { ArrowLeft, Shuffle } from 'lucide-react'
import GroupAssignmentTool from '../components/GroupAssignmentTool'

export default function GroupAssignmentModule({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver</span>
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Shuffle className="w-6 h-6 text-amber-600" />
                <h1 className="text-2xl font-bold text-gray-800">
                  Asignación de Grupos
                </h1>
              </div>
              <p className="text-sm text-gray-600">
                Distribución automática y equilibrada de estudiantes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        <GroupAssignmentTool />
      </div>
    </div>
  )
}
