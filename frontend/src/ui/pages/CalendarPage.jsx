import React, { useState, useEffect, useRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { getCalendar } from "@/api/forecastsService.js";
import { NewForecastModal } from "@/ui/components/NewForecastModal.jsx";
import { api } from "@/lib/api.js";

export function CalendarPage() {
  const ref = useRef(null);

  const [allEvents, setAllEvents] = useState([]); // todos los eventos globales
  const [events, setEvents] = useState([]);       // eventos filtrados
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [filters, setFilters] = useState({
    accountId: "",
    categoryId: "",
    month: "",
    year: "",
  });

  // ---- helpers fecha ----
  const toISODate = (v) => {
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  };
  const pickEventDate = (ev) =>
    toISODate(ev.date ?? ev.start ?? ev.startStr ?? ev?.extendedProps?.date);

  // ---- helpers campos ----
  const getAccountId = (e) =>
    String(
      e.account?._id ?? e.accountId ?? e.account ??
      e.bankAccount?._id ?? e.bankAccountId ?? e.bankAccount ??
      e.extendedProps?.account?._id ?? e.extendedProps?.accountId ?? e.extendedProps?.account ??
      e.extendedProps?.bankAccount?._id ?? e.extendedProps?.bankAccountId ?? e.extendedProps?.bankAccount ?? ""
    ) || "";

  const getAccountAlias = (e, fallbackId = "") =>
    e.account?.alias ??
    e.bankAccount?.alias ??
    e.extendedProps?.account?.alias ??
    e.extendedProps?.bankAccount?.alias ??
    e.account?.name ??
    e.accountName ??
    (fallbackId ? `Cuenta ${fallbackId}` : "Sin cuenta");

  const getCategoryId = (e) =>
    String(
      e.category?._id ?? e.categoryId ?? e.category ??
      e.extendedProps?.category?._id ?? e.extendedProps?.categoryId ?? e.extendedProps?.category ?? ""
    ) || "";

  const getCategoryName = (e, fallbackId = "") =>
    e.category?.name ??
    e.categoryName ??
    e.extendedProps?.category?.name ??
    (fallbackId ? `Categoría ${fallbackId}` : "—");

  const getType = (e) => e.extendedProps?.type ?? e.type ?? undefined;
  const getAmount = (e) => Number(e.amount ?? e.extendedProps?.amount ?? 0) || 0;

  // ---- carga global ----
  async function loadAll() {
    try {
      const data = await getCalendar({}); // ⚠️ backend debe permitir devolver todos
      const arr = Array.isArray(data) ? data : [];

      const normalized = arr.map((e) => {
        const id = String(e.id ?? e._id ?? e?.extendedProps?.cashflowId ?? "");
        const startISO = pickEventDate(e);
        const accountId = getAccountId(e);
        const accountAlias = getAccountAlias(e, accountId);
        const categoryId = getCategoryId(e);
        const categoryName = getCategoryName(e, categoryId);
        const type = getType(e);
        const amount = getAmount(e);

        return {
          ...e,
          id,
          start: startISO ?? undefined,
          _accountId: accountId,
          _accountAlias: accountAlias,
          _categoryId: categoryId,
          _categoryName: categoryName,
          _type: type,
          _amount: amount,
          extendedProps: {
            ...(e.extendedProps || {}),
            amount,
            type,
            accountAlias: accountAlias,
            categoryName,
            counterparty: e.counterparty ?? e.extendedProps?.counterparty ?? null,
          },
        };
      }).filter(e => !!e.start);

      setAllEvents(normalized);
      setEvents(projectForCalendar(normalized, filters));
    } catch (err) {
      console.error(err);
      alert("No se pudo cargar el calendario global");
    }
  }

  // ---- proyección para pintar ----
  function projectForCalendar(source, f) {
    let list = source;
    if (f.accountId) list = list.filter(e => e._accountId === f.accountId);
    if (f.categoryId) list = list.filter(e => e._categoryId === f.categoryId);
    if (f.month) list = list.filter(e => (new Date(e.start + "T00:00:00Z").getUTCMonth() + 1) === Number(f.month));
    if (f.year) list = list.filter(e => new Date(e.start + "T00:00:00Z").getUTCFullYear() === Number(f.year));

    // Cuenta específica ⇒ eventos individuales
    if (f.accountId) {
      return list.map((e) => {
        const prov = e.extendedProps?.counterparty?.name || "—";
        const amount = e._amount.toLocaleString("es-ES", { minimumFractionDigits: 2 });
        const cat = e._categoryName || "—";
        const color = e._type === "income" ? "green" : e._type === "expense" ? "red" : undefined;

        return {
          id: e.id,
          title: `${prov} · ${amount}€ · ${cat}`,
          start: e.start,
          allDay: true,
          color,
          extendedProps: e.extendedProps,
        };
      });
    }

    // Todas ⇒ agrupar por (día + cuenta)
    const grouped = new Map();
    for (const e of list) {
      const accId = e._accountId || "NA";
      const key = `${e.start}__${accId}`;
      const prev = grouped.get(key);
      if (!prev) {
        grouped.set(key, {
          date: e.start,
          accId,
          accAlias: e._accountAlias || (accId !== "NA" ? `Cuenta ${accId}` : "Sin cuenta"),
          sum: e._amount,
          type: e._type,
        });
      } else {
        prev.sum += e._amount;
      }
    }

    return Array.from(grouped.values()).map(g => {
      const title = `${g.accAlias}: ${g.sum.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€`;
      const color = g.type === "income" ? "green" : g.type === "expense" ? "red" : undefined;
      return {
        id: `${g.date}__${g.accId}`,
        title,
        start: g.date,
        allDay: true,
        color,
      };
    });
  }

  // ---- opciones filtros ----
  const accountOptions = useMemo(() => {
    const m = new Map();
    for (const e of allEvents) {
      if (!e._accountId) continue;
      m.set(e._accountId, e._accountAlias || `Cuenta ${e._accountId}`);
    }
    return Array.from(m.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [allEvents]);

  const categoryOptions = useMemo(() => {
    const m = new Map();
    for (const e of allEvents) {
      if (!e._categoryId) continue;
      m.set(e._categoryId, e._categoryName || `Categoría ${e._categoryId}`);
    }
    return Array.from(m.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [allEvents]);

  const yearOptions = useMemo(() => {
    const set = new Set();
    for (const e of allEvents) {
      if (!e.start) continue;
      set.add(new Date(e.start).getFullYear());
    }
    return Array.from(set).sort().map(y => ({ value: String(y), label: String(y) }));
  }, [allEvents]);

  const monthOptions = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => {
      const label = new Date(0, i).toLocaleString("es-ES", { month: "long" });
      return { value: String(i + 1), label: label[0].toUpperCase() + label.slice(1) };
    }), []);

  // ---- efectos ----
  useEffect(() => { loadAll(); }, []);
  useEffect(() => { setEvents(projectForCalendar(allEvents, filters)); }, [filters, allEvents]);

    // Mover el calendario cuando cambian Mes/Año del filtro
  useEffect(() => {
    const apiCal = ref.current?.getApi();
    if (!apiCal) return;

    const { month, year } = filters;

    if (year || month) {
      const d = apiCal.getDate();                 // fecha actual de la vista
      const targetYear = year ? Number(year) : d.getFullYear();
      const targetMonth = month ? Number(month) - 1 : d.getMonth();
      apiCal.gotoDate(new Date(targetYear, targetMonth, 1)); // 👈 navega a la vista correcta
    } else {
      // Sin mes/año => volvemos a hoy
      apiCal.today();
    }
  }, [filters.month, filters.year]);

  // ---- eliminar evento ----
  const onEventClick = async (info) => {
    try {
      const evx = info.event.extendedProps || {};
      const id = info.event.id || evx.cashflowId || evx.id || evx._id;
      if (!id) return;

      const nombre = evx?.counterparty?.name || evx?.accountAlias || "—";
      const ok = confirm(`¿Eliminar vencimiento de ${nombre} por ${Number(evx?.amount || 0).toLocaleString("es-ES", { minimumFractionDigits: 2 })}€?`);
      if (!ok) return;

      await api.delete(`/cashflows/${id}`);
      loadAll();
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar. Revisa la consola.");
    }
  };

  return (
    <div className="page">
      <div className="card" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btn" onClick={() => { setSelectedDate(null); setOpen(true); }}>
          + Nuevo vencimiento
        </button>

        <label>
          Cuenta:
          <select value={filters.accountId} onChange={e => setFilters(f => ({ ...f, accountId: e.target.value }))}>
            <option value="">Todas</option>
            {accountOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>

        <label>
          Categoría:
          <select value={filters.categoryId} onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value }))}>
            <option value="">Todas</option>
            {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>

        <label>
          Mes:
          <select value={filters.month} onChange={e => setFilters(f => ({ ...f, month: e.target.value }))}>
            <option value="">Todos</option>
            {monthOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>

        <label>
          Año:
          <select value={filters.year} onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}>
            <option value="">Todos</option>
            {yearOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>

        <button className="btn" onClick={() => setFilters({ accountId: "", categoryId: "", month: "", year: "" })}>
          Limpiar filtros
        </button>
      </div>

      <div className="card">
        <FullCalendar
          ref={ref}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          events={events}
          eventClick={onEventClick}
          dateClick={(info) => { setSelectedDate(info.dateStr); setOpen(true); }}
          height="auto"
          expandRows={true}
          dayMaxEvents={false}
          eventDisplay="block"
        />
      </div>

      {open && (
        <NewForecastModal
          date={selectedDate}
          onClose={() => {
            setOpen(false);
            loadAll();
          }}
        />
      )}
    </div>
  );
}
