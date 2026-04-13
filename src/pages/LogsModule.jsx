import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, History, Search, Filter, RefreshCw, Trash2, Download } from 'lucide-react';
import { clearAuditLogs, getModuleLabel, readAuditLogs } from '../utils/auditLogs';
import { supabase } from '../config/supabase';
import { gruposData } from '../data/grupos';
import { catequistas } from '../data/catequistas';

const ACTION_COLORS = {
  insert: 'bg-emerald-50 text-emerald-700',
  update: 'bg-blue-50 text-blue-700',
  upsert: 'bg-indigo-50 text-indigo-700',
  delete: 'bg-rose-50 text-rose-700'
};

function ActionBadge({ action }) {
  const color = ACTION_COLORS[action] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase ${color}`}>
      {action}
    </span>
  );
}

function LogsModule({ onBack }) {
  const [logs, setLogs] = useState(() => readAuditLogs());
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const catequizandosById = useMemo(() => {
    const map = new Map();

    Object.entries(gruposData || {}).forEach(([groupName, groupInfo]) => {
      const students = groupInfo?.estudiantes || {};
      Object.values(students).forEach((student) => {
        if (!student?.id) return;
        map.set(String(student.id), {
          name: student.nombre || String(student.id),
          group: groupName
        });
      });
    });

    return map;
  }, []);

  const catequistasByName = useMemo(() => {
    const map = new Map();
    (catequistas || []).forEach((item) => {
      if (!item?.nombre) return;
      map.set(item.nombre, item.grupo || null);
    });
    return map;
  }, []);

  const getGroupDisplay = useCallback((item) => {
    if (item?.group) return item.group;

    const payload = item?.payload || {};
    if (payload?.group) return payload.group;

    const affectedType = payload?.affectedType;
    const affectedName = payload?.affectedName;
    if (affectedType === 'catequista' && affectedName) {
      return catequistasByName.get(affectedName) || '-';
    }

    return '-';
  }, [catequistasByName]);

  const getAffectedDisplay = useCallback((item) => {
    const payload = item?.payload || {};
    const affectedName = payload.affectedName;
    const affectedType = payload.affectedType;
    const affectedId = payload.affectedId;

    if (affectedName && affectedType === 'catequizando') return `Catequizando: ${affectedName}`;
    if (affectedName && affectedType === 'catequista') return `Catequista: ${affectedName}`;

    if (affectedType === 'catequizando' && affectedId !== null && affectedId !== undefined) {
      const resolved = catequizandosById.get(String(affectedId));
      if (resolved?.name) return `Catequizando: ${resolved.name}`;
      return `Catequizando ID: ${affectedId}`;
    }

    return '-';
  }, [catequizandosById]);

  const fetchLogsFromSupabase = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1500);

      if (error) {
        console.error('Error cargando audit_logs:', error);
        return;
      }

      if (Array.isArray(data)) {
        const normalized = data.map((item) => ({
          id: item.id,
          timestamp: item.timestamp,
          actor: item.actor,
          module: item.module,
          table: item.table_name,
          action: item.action,
          status: item.status,
          durationMs: item.duration_ms,
          payload: item.payload,
          group: item.payload?.group || null
        }));
        setLogs(normalized);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogsFromSupabase();
  }, [fetchLogsFromSupabase]);

  const moduleOptions = useMemo(() => {
    const modules = Array.from(new Set(logs.map((item) => item.module).filter(Boolean)));
    return modules.sort((a, b) => getModuleLabel(a).localeCompare(getModuleLabel(b)));
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return logs.filter((item) => {
      if (moduleFilter !== 'all' && item.module !== moduleFilter) return false;
      if (actionFilter !== 'all' && item.action !== actionFilter) return false;

      if (!normalizedQuery) return true;

      const searchable = [
        item.actor,
        item.table,
        item.action,
        getAffectedDisplay(item),
        getModuleLabel(item.module),
        item.timestamp
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [logs, query, moduleFilter, actionFilter, getAffectedDisplay]);

  const totalToday = useMemo(() => {
    const today = new Date();
    return logs.filter((item) => {
      const date = new Date(item.timestamp);
      return date.toDateString() === today.toDateString();
    }).length;
  }, [logs]);

  const refreshLogs = () => {
    fetchLogsFromSupabase();
  };

  const clearAllLogs = async () => {
    if (!window.confirm('Esto eliminara todos los registros de auditoria. Deseas continuar?')) return;

    const { error } = await supabase
      .from('audit_logs')
      .delete()
      .gt('id', 0);

    if (error) {
      alert('No se pudieron limpiar los logs en Supabase.');
      return;
    }

    clearAuditLogs();
    setLogs([]);
  };

  const exportLogs = () => {
    const content = JSON.stringify(logs, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-confirmacion-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Menu Principal
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Logs de Cambios</h1>
              <p className="text-sm text-slate-600">Auditoria de cambios por modulo y tabla</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Total registros</p>
              <p className="text-2xl font-bold text-slate-900">{logs.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Cambios hoy</p>
              <p className="text-2xl font-bold text-slate-900">{totalToday}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Modulos con actividad</p>
              <p className="text-2xl font-bold text-slate-900">{moduleOptions.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-5">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Buscar</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Actor, tabla, modulo o fecha"
                  className="w-full border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm"
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Modulo</label>
              <div className="relative">
                <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm bg-white"
                >
                  <option value="all">Todos</option>
                  {moduleOptions.map((module) => (
                    <option key={module} value={module}>{getModuleLabel(module)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Accion</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm bg-white"
              >
                <option value="all">Todas</option>
                <option value="insert">Insert</option>
                <option value="update">Update</option>
                <option value="upsert">Upsert</option>
                <option value="delete">Delete</option>
              </select>
            </div>

            <div className="lg:col-span-2 flex items-end gap-2">
              <button
                onClick={refreshLogs}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 px-3 rounded-lg text-sm font-semibold"
              >
                <RefreshCw className="w-4 h-4" />
                {loading ? 'Cargando...' : 'Recargar'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportLogs}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-300 text-white py-2 px-3 rounded-lg text-sm font-semibold"
            >
              <Download className="w-4 h-4" />
              Exportar JSON
            </button>
            <button
              onClick={clearAllLogs}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white py-2 px-3 rounded-lg text-sm font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar Logs
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No hay registros para los filtros actuales.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-215">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-600">
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Modulo</th>
                    <th className="px-4 py-3">Tabla</th>
                    <th className="px-4 py-3">Grupo</th>
                    <th className="px-4 py-3">Afectado</th>
                    <th className="px-4 py-3">Accion</th>
                    <th className="px-4 py-3">Duracion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 text-sm">
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleString('es-CR')}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{item.actor || 'sistema'}</td>
                      <td className="px-4 py-3 text-slate-700">{getModuleLabel(item.module)}</td>
                      <td className="px-4 py-3 text-slate-700">{item.table}</td>
                      <td className="px-4 py-3 text-slate-700">{getGroupDisplay(item)}</td>
                      <td className="px-4 py-3 text-slate-700">{getAffectedDisplay(item)}</td>
                      <td className="px-4 py-3"><ActionBadge action={item.action} /></td>
                      <td className="px-4 py-3 text-slate-600">{item.durationMs ? `${item.durationMs} ms` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LogsModule;
