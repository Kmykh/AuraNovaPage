"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuditLogs } from '@/hooks/use-audit-logs';
import { formatDate } from '@/lib/order-helpers';
import { AdminAuditLogResponse } from '@/types/audit';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Shield, RefreshCw, Search, ChevronLeft, ChevronRight, X, Copy, User, Activity, Globe, Monitor, Calendar, Clock, Database, Terminal, AlertCircle, Laptop, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { ApiProblemDetails } from '@/lib/api-errors';

const getActionBadgeColor = (action: string) => {
  const lower = action.toLowerCase();
  if (lower.includes('create') || lower.includes('add') || lower.includes('insert')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
  }
  if (lower.includes('update') || lower.includes('edit') || lower.includes('change') || lower.includes('patch')) {
    return 'bg-blue-50 text-blue-700 border-blue-200/50';
  }
  if (lower.includes('delete') || lower.includes('remove') || lower.includes('clear')) {
    return 'bg-rose-50 text-rose-700 border-rose-200/50';
  }
  return 'bg-amber-50 text-amber-700 border-amber-200/50';
};

const parseUserAgent = (ua?: string) => {
  if (!ua) return 'Desconocido';
  if (ua.includes('Windows')) return 'Windows (PC)';
  if (ua.includes('Macintosh') || ua.includes('Mac OS X')) return 'macOS (Mac)';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS (iPhone/iPad)';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('Linux')) return 'Linux';
  return 'Otro dispositivo';
};

export function AdminAuditLogsList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract from query params
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialPageSize = Number(searchParams.get('pageSize')) || 20;
  
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);
  
  // Local state for filter inputs
  const [actionFilter, setActionFilter] = useState(searchParams.get('action') || '');
  const [entityTypeFilter, setEntityTypeFilter] = useState(searchParams.get('entityType') || '');
  const [adminUserIdFilter, setAdminUserIdFilter] = useState(searchParams.get('adminUserId') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

  // Modal State
  const [selectedLog, setSelectedLog] = useState<AdminAuditLogResponse | null>(null);

  // Sync state with URL params
  const [lastQuery, setLastQuery] = useState(searchParams.toString());
  if (searchParams.toString() !== lastQuery) {
    setPage(Number(searchParams.get('page')) || 1);
    setActionFilter(searchParams.get('action') || '');
    setEntityTypeFilter(searchParams.get('entityType') || '');
    setAdminUserIdFilter(searchParams.get('adminUserId') || '');
    setDateFrom(searchParams.get('dateFrom') || '');
    setDateTo(searchParams.get('dateTo') || '');
    setLastQuery(searchParams.toString());
  }

  const queryFilters: Record<string, string | number> = {
    page,
    pageSize,
  };
  if (actionFilter) queryFilters.action = actionFilter;
  if (entityTypeFilter) queryFilters.entityType = entityTypeFilter;
  if (adminUserIdFilter) queryFilters.adminUserId = adminUserIdFilter;
  if (dateFrom) queryFilters.dateFrom = dateFrom;
  if (dateTo) queryFilters.dateTo = dateTo;

  const { data: pagedResponse, isLoading, error, refetch, isFetching } = useAuditLogs(queryFilters);

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('pageSize', pageSize.toString());
    if (actionFilter) params.set('action', actionFilter);
    if (entityTypeFilter) params.set('entityType', entityTypeFilter);
    if (adminUserIdFilter) params.set('adminUserId', adminUserIdFilter);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    router.push(`/admin/auditoria?${params.toString()}`);
  };

  const clearFilters = () => {
    setActionFilter('');
    setEntityTypeFilter('');
    setAdminUserIdFilter('');
    setDateFrom('');
    setDateTo('');
    router.push('/admin/auditoria?page=1&pageSize=20');
  };

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/auditoria?${params.toString()}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('ID copiado al portapapeles');
  };

  const renderDetails = (details: string) => {
    try {
      const parsed = JSON.parse(details);
      return (
        <pre className="bg-[#1E1E1E] text-sage p-4 rounded-xl text-xs overflow-x-auto border border-brown/20 font-mono">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch {
      return (
        <div className="bg-[#FAFAFA] text-brown p-4 rounded-xl text-sm border border-sage/20 whitespace-pre-wrap">
          {details}
        </div>
      );
    }
  };

  // View logic
  if (error instanceof ApiProblemDetails && error.status === 403) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-sage/20 shadow-sm">
        <Shield className="w-12 h-12 text-rose mb-4" />
        <h2 className="text-xl font-serif text-brown font-semibold mb-2">Acceso denegado</h2>
        <p className="text-sage max-w-md">No tienes permisos para consultar la auditoría.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-sage/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative">
          <div>
            <h1 className="text-2xl font-serif font-bold text-brown flex items-center gap-2">
              <Shield className="text-gold animate-pulse" /> Auditoría
            </h1>
            <p className="text-sm text-sage mt-1">Monitorea y supervisa las acciones administrativas del sistema.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => refetch()} 
            disabled={isFetching}
            className="w-full md:w-auto h-10 px-4 text-xs font-semibold hover:bg-cream transition-all duration-200"
          >
            <RefreshCw size={16} className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar logs
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
          <div className="relative">
            <label className="block text-xs font-semibold text-sage mb-1.5 uppercase tracking-wider">Acción</label>
            <div className="relative">
              <Activity size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage/40" />
              <input 
                type="text" 
                placeholder="Ej. Update, Delete..."
                className="w-full pl-9 pr-3 py-2 bg-[#FAFAFA] border border-sage/30 focus:border-gold rounded-lg text-sm outline-none transition-colors"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-sage mb-1.5 uppercase tracking-wider">Entidad</label>
            <div className="relative">
              <Database size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage/40" />
              <input 
                type="text" 
                placeholder="Ej. Product, Order..."
                className="w-full pl-9 pr-3 py-2 bg-[#FAFAFA] border border-sage/30 focus:border-gold rounded-lg text-sm outline-none transition-colors"
                value={entityTypeFilter}
                onChange={(e) => setEntityTypeFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sage mb-1.5 uppercase tracking-wider">Administrador</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage/40" />
              <input 
                type="text" 
                placeholder="Nombre o ID..."
                className="w-full pl-9 pr-3 py-2 bg-[#FAFAFA] border border-sage/30 focus:border-gold rounded-lg text-sm outline-none transition-colors"
                value={adminUserIdFilter}
                onChange={(e) => setAdminUserIdFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sage mb-1.5 uppercase tracking-wider">Desde</label>
            <input 
              type="datetime-local" 
              className="w-full px-3 py-2 bg-[#FAFAFA] border border-sage/30 focus:border-gold rounded-lg text-sm outline-none transition-colors"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-sage mb-1.5 uppercase tracking-wider">Hasta</label>
            <input 
              type="datetime-local" 
              className="w-full px-3 py-2 bg-[#FAFAFA] border border-sage/30 focus:border-gold rounded-lg text-sm outline-none transition-colors"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-sage/10">
          <Button variant="outline" onClick={clearFilters} className="text-sage hover:bg-cream">Limpiar filtros</Button>
          <Button onClick={applyFilters} className="bg-brown hover:bg-brown/90 text-white font-medium shadow-sm hover:shadow">
            <Search size={16} className="mr-2" /> Buscar registros
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-sage/10 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} variant="rect" className="w-full h-16 rounded-xl" />)}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose">
            <p>No pudimos cargar la auditoría.</p>
            <Button onClick={() => refetch()} variant="outline" className="mt-4 border-rose text-rose">Reintentar</Button>
          </div>
        ) : (!pagedResponse?.items || pagedResponse.items.length === 0) ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Shield className="w-12 h-12 text-sage/30 mb-4" />
            <p className="text-brown font-medium">No hay registros de auditoría</p>
            <p className="text-sage text-sm mt-1 mb-4">Para los filtros seleccionados no encontramos acciones.</p>
            <Button onClick={clearFilters} variant="outline">Limpiar filtros</Button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAFAFA] border-b border-sage/20 text-brown">
                  <tr>
                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Fecha y Hora</th>
                    <th className="px-6 py-4 font-semibold">Administrador</th>
                    <th className="px-6 py-4 font-semibold">Acción / Entidad</th>
                    <th className="px-6 py-4 font-semibold">Detalle del Evento</th>
                    <th className="px-6 py-4 font-semibold">Origen</th>
                    <th className="px-6 py-4 font-semibold text-right">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage/10">
                  {(pagedResponse?.items || []).map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAFAFA]/50 transition-colors group">
                      <td className="px-6 py-4 text-sage whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-sage/60" />
                          <span>{formatDate(log.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-brown">{log.adminName}</span>
                          {log.adminEmail && <span className="text-xs text-sage">{log.adminEmail}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-block w-fit px-2.5 py-0.5 border rounded-md text-[11px] font-semibold ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                          <span className="text-xs text-sage font-medium flex items-center gap-1">
                            <Database size={11} /> {log.entityType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-brown font-medium max-w-[280px] truncate" title={log.description}>
                          {log.description || 'Sin descripción'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span className="text-brown font-mono font-medium">{log.ipAddress || 'Sin IP'}</span>
                          {log.userAgent && (
                            <span className="text-sage flex items-center gap-1" title={log.userAgent}>
                              <Laptop size={12} /> {parseUserAgent(log.userAgent)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="h-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-cream border-sage/20 text-brown"
                        >
                          Ver reporte
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-sage/10">
              {(pagedResponse?.items || []).map((log) => (
                <div key={log.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-brown">{log.adminName}</p>
                      <p className="text-xs text-sage">{formatDate(log.createdAt)}</p>
                    </div>
                    <span className={`px-2 py-0.5 border rounded-md text-[10px] font-semibold ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </div>
                  
                  <div className="bg-[#FAFAFA] p-3 rounded-xl border border-sage/10 space-y-2">
                    <p className="text-xs font-semibold text-brown leading-relaxed">{log.description || 'Sin descripción'}</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-sage/5">
                      <div>
                        <span className="text-sage block mb-0.5">Entidad</span>
                        <span className="font-medium text-brown">{log.entityType}</span>
                      </div>
                      <div>
                        <span className="text-sage block mb-0.5">IP</span>
                        <span className="font-mono text-brown truncate">{log.ipAddress || 'Sin IP'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full text-xs h-8 bg-white"
                    onClick={() => setSelectedLog(log)}
                  >
                    Ver reporte completo
                  </Button>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-sage/10 bg-[#FAFAFA] flex items-center justify-between">
              <span className="text-sm text-sage font-medium">
                Página {pagedResponse.page ?? 1} de {pagedResponse.totalPages ?? 1} ({pagedResponse.totalItems ?? 0} registros)
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => goToPage((pagedResponse.page ?? 1) - 1)}
                  disabled={!pagedResponse.hasPreviousPage}
                >
                  <ChevronLeft size={16} className="mr-1" /> Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => goToPage((pagedResponse.page ?? 1) + 1)}
                  disabled={!pagedResponse.hasNextPage}
                >
                  Siguiente <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)}>
        {selectedLog && (
          <div className="p-1 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6 border-b border-sage/10 pb-4">
              <h2 className="text-xl font-serif text-brown font-bold flex items-center gap-2">
                <Shield className="text-gold" /> Reporte de Auditoría
              </h2>
              <button onClick={() => setSelectedLog(null)} className="text-sage hover:text-brown transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Event Description Callout */}
            <div className="bg-cream/40 border border-gold/20 p-4 rounded-xl mb-6">
              <span className="text-[10px] uppercase font-bold text-gold-dark tracking-wider block mb-1">Descripción del evento</span>
              <p className="text-sm font-medium text-brown leading-relaxed">
                {selectedLog.description || 'No hay descripción adicional disponible para esta acción.'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Administrator Details */}
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-sage/10 space-y-3">
                <h3 className="text-xs font-semibold text-sage uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} className="text-gold" /> Administrador
                </h3>
                <div className="space-y-1">
                  <span className="block text-sm font-bold text-brown">{selectedLog.adminName}</span>
                  {selectedLog.adminEmail && <span className="block text-xs text-sage">{selectedLog.adminEmail}</span>}
                  <span className="block text-[10px] font-mono text-sage/70 pt-1 border-t border-sage/5">ID: {selectedLog.adminUserId}</span>
                </div>
              </div>

              {/* Action & Metadata */}
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-sage/10 space-y-3">
                <h3 className="text-xs font-semibold text-sage uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-gold" /> Acción realizada
                </h3>
                <div className="space-y-2">
                  <span className={`inline-block px-2.5 py-0.5 border rounded-md text-xs font-semibold ${getActionBadgeColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                  <div className="flex items-center gap-4 text-xs text-sage">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(selectedLog.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Entity Scope */}
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-sage/10 space-y-3 md:col-span-2">
                <h3 className="text-xs font-semibold text-sage uppercase tracking-wider flex items-center gap-1.5">
                  <Database size={14} className="text-gold" /> Entidad Afectada
                </h3>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-sage/5">
                  <div className="space-y-0.5">
                    <span className="block text-xs text-sage uppercase">Tipo</span>
                    <span className="text-sm font-bold text-brown">{selectedLog.entityType}</span>
                  </div>
                  <div className="space-y-1 flex-1 md:pl-6 md:border-l border-sage/10">
                    <span className="block text-xs text-sage uppercase">ID de la Entidad</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-brown break-all">{selectedLog.entityId}</span>
                      <button 
                        onClick={() => copyToClipboard(selectedLog.entityId)}
                        className="text-gold hover:text-gold-dark p-1 hover:bg-cream/40 rounded transition-colors"
                        title="Copiar ID"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connection Details */}
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-sage/10 space-y-3 md:col-span-2">
                <h3 className="text-xs font-semibold text-sage uppercase tracking-wider flex items-center gap-1.5">
                  <Globe size={14} className="text-gold" /> Conexión y Dispositivo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="block text-[10px] text-sage uppercase mb-0.5">IP Address</span>
                    <span className="text-sm font-mono text-brown">{selectedLog.ipAddress || 'No disponible'}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="block text-[10px] text-sage uppercase mb-0.5">Navegador / Sistema</span>
                    <span className="text-xs text-brown flex items-center gap-1 font-medium leading-relaxed">
                      <Monitor size={12} className="text-sage" /> {selectedLog.userAgent || 'No disponible'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Payload Details */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-sage uppercase tracking-wider flex items-center gap-1.5">
                <Terminal size={14} className="text-gold" /> Detalles del Payload (JSON)
              </span>
              {renderDetails(selectedLog.details)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
