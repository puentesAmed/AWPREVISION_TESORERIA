import React, { useState, useEffect, useRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { getCalendar } from "@/api/forecastsService.js";
import { NewForecastModal } from "@/ui/components/NewForecastModal.jsx";
import { api } from "@/lib/api.js";
import { Button, useColorModeValue, useBreakpointValue } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getAccounts } from "@/api/accountsService.js";
import { setCashflowStatus } from "@/api/cashflowsService.js";
import { createPortal } from "react-dom";
import listPlugin from "@fullcalendar/list";

/* ========= Utils ========= */
const toISODate = (v) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};
const pickEventDate = (ev) =>
  toISODate(ev.date ?? ev.start ?? ev.startStr ?? ev?.extendedProps?.date);

// ✅ añade este helper arriba (junto a utils)
const toLocalYMD = (ymdOrISO) => {
  if (!ymdOrISO) return null;
  const d = new Date(ymdOrISO.length > 10 ? ymdOrISO : `${ymdOrISO}T00:00:00`);
  if (isNaN(d)) return null;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};


// Deriva el uiStatus en base al estado persistido y fecha
const computeUiStatus = (persistedStatus, ymd) => {
  if (!persistedStatus) return "pending";
  if (persistedStatus === "paid") return "paid";
  if (persistedStatus === "unpaid") return "unpaid";
 
  // pending: si fecha pasada => overdue
  if (persistedStatus === "pending") {
    if (!ymd) return "pending";
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(ymd + "T00:00:00");
    return d < today ? "overdue" : "pending";
  }
  // fallback
  return persistedStatus;
};

/* ========= Menú de estado (botón) ========= */
function EventStatusMenu({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 168 });
  const btnRef = React.useRef(null);

  // Tema
  const btnBg   = useColorModeValue("#E5E7EB", "#374151");
  const btnBor  = useColorModeValue("#CBD5E1", "#4B5563");
  const btnFg   = useColorModeValue("#111827", "#F9FAFB");

  const menuBg  = useColorModeValue("#FFFFFF", "#1F2937");
  const menuFg  = useColorModeValue("#111827", "#F3F4F6");
  const menuBor = useColorModeValue("#E5E7EB", "#374151");
  const itemHv  = useColorModeValue("#F3F4F6", "#111827");
  const shadow  = useColorModeValue("0 12px 28px rgba(0,0,0,.14)", "0 12px 28px rgba(0,0,0,.35)");

  const toggle = (e) => { e.stopPropagation(); setOpen(o => !o); };

  React.useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const mw = 168;
    const left = Math.max(8, Math.min(rect.right - mw, window.innerWidth - mw - 8));
    const top  = Math.min(rect.bottom + 6, window.innerHeight - 8);
    setPos({ top, left, width: mw });

    const close = (ev) => {
      // cierra si click fuera del botón o del menú
      if (!btnRef.current?.contains(ev.target)) setOpen(false);
    };
    const hide  = () => setOpen(false);
    document.addEventListener("click", close);  // burbujeo (no capture) para menos coste
    window.addEventListener("resize", hide);
    window.addEventListener("scroll", hide, true);
    return () => {
      document.removeEventListener("click", close);
      window.removeEventListener("resize", hide);
      window.removeEventListener("scroll", hide, true);
    };
  }, [open]);

  const Item = ({ v, children }) => (
    <div
      className="evt-ctrl"
      role="option"
      onClick={(e)=>{ e.stopPropagation(); onChange(v); setOpen(false); }}
      onMouseDown={(e)=> e.preventDefault()}
      style={{
        padding:"8px 12px",
        cursor:"pointer",
        whiteSpace:"nowrap",
        borderRadius:6,
        userSelect:"none"
      }}
      onMouseEnter={(e)=> (e.currentTarget.style.background = itemHv)}
      onMouseLeave={(e)=> (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </div>
  );

  return (
    <div className="evt-ctrl" style={{ position:"relative", display:"inline-flex" }} onClick={(e)=> e.stopPropagation()}>
      <button
        ref={btnRef}
        className="evt-ctrl"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Cambiar estado"
        title="Cambiar estado"
        style={{
          width:22, height:22,
          display:"inline-flex", alignItems:"center", justifyContent:"center",
          borderRadius:6, border:`1px solid ${btnBor}`, background:btnBg, color:btnFg,
          cursor:"pointer", padding:0, marginLeft:4, lineHeight:1
        }}
        onMouseDown={(e)=> e.preventDefault()}
      >
        ▾
      </button>

      {open && createPortal(
        <div
          className="evt-ctrl"
          role="listbox"
          style={{
            position:"fixed", top:pos.top, left:pos.left, width:pos.width,
            zIndex: 2147483647,
            background:menuBg, color:menuFg, border:`1px solid ${menuBor}`,
            borderRadius:10, boxShadow:shadow, padding:6
          }}
          onClick={(e)=> e.stopPropagation()}
          onWheel={(e)=> e.stopPropagation()}
        >
          <Item v="pending">Pendiente</Item>
          <Item v="overdue">Vencido</Item>
          <Item v="unpaid">Impagado</Item>
          <Item v="paid">Pagado</Item>
          
        </div>,
        document.body
      )}
    </div>
  );
}

/* ========= Página ========= */
export function CalendarPage() {
  const ref = useRef(null);
  const [allEvents, setAllEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: getAccounts });
 
  const [calKey, setCalKey] = useState(0);

  const isMobile = useBreakpointValue({ base: true, md: false });



  // Totales por día
  const [dayTotals, setDayTotals] = useState(new Map());
  const SUM_ABSOLUTE = false;

  // Botones
  const buttonBg = useColorModeValue("brand.500", "accent.500");
  const buttonColor = useColorModeValue("white", "black");
  const buttonHover = useColorModeValue("brand.600", "accent.600");

  // Filtros
  const [filters, setFilters] = useState({
    accountId: "",
    categoryId: "",
    month: "",
    year: "",
    status: "", // filtrado por estado persistido
  });

  const [calTitle, setCalTitle] = useState("");

  // helpers campos
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

  // carga global
  async function loadAll() {
    try {
      const data = await getCalendar({});
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

        const backendColor = e.color || e.extendedProps?.color || undefined;
        const status = e.status ?? e.extendedProps?.status ?? "pending"; // persistido
        const ui = computeUiStatus(status, startISO);                    // derivado

        const accountColor =
          e.account?.color ??
          e.extendedProps?.account?.color ??
          undefined;

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
          _accountColor: accountColor,
          _color: backendColor,
          _status: status,   // persistido
          _ui: ui,           // derivado
          extendedProps: {
            ...(e.extendedProps || {}),
            amount,
            type,
            accountAlias,
            categoryName,
            counterparty: e.counterparty ?? e.extendedProps?.counterparty ?? null,
            accountColor,
            status,
            uiStatus: ui,
            group: false,
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

  // filtro totales
  function filterBaseForTotals(source, f) {
    let list = source;
    if (f.accountId) list = list.filter(e => e._accountId === f.accountId);
    if (f.categoryId) list = list.filter(e => e._categoryId === f.categoryId);
    if (f.month) list = list.filter(e => (new Date(e.start + "T00:00:00Z").getUTCMonth() + 1) === Number(f.month));
    if (f.year)  list = list.filter(e => new Date(e.start + "T00:00:00Z").getUTCFullYear() === Number(f.year));
    return list;
  }

  // proyección para pintar
  function projectForCalendar(source, f) {
    let list = source;
    if (f.accountId) list = list.filter(e => e._accountId === f.accountId);
    if (f.categoryId) list = list.filter(e => e._categoryId === f.categoryId);
    if (f.month) list = list.filter(e => (new Date(e.start + "T00:00:00Z").getUTCMonth() + 1) === Number(f.month));
    if (f.year) list = list.filter(e => new Date(e.start + "T00:00:00Z").getUTCFullYear() === Number(f.year));

 
      if (f.status) {
        // filtra por el estado *visual* (pending | overdue | paid | unpaid)
        list = list.filter(e => {
          const ui = e._ui
            || e.extendedProps?.uiStatus
            || computeUiStatus(e._status || e.extendedProps?.status, e.start?.slice(0,10));
          return ui === f.status;
        });
      }

    if (f.accountId) {
      return list.map((e) => {
        const prov = e.extendedProps?.counterparty?.name || "—";
        const amount = e._amount.toLocaleString("es-ES", { minimumFractionDigits: 2 });
        const cat = e._categoryName || "—";
        const fallback = e._type === "out" ? "#ef4444" : "#10b981";
        const accColor = e._color || e._accountColor || fallback;

        return {
          id: e.id,
          title: `${prov} · ${amount}€ · ${cat}`,
          start: e.start,
          allDay: true,
          backgroundColor: accColor,
          borderColor: accColor,
          textColor: "#fff",
          extendedProps: e.extendedProps,
        };
      });
    }

    // agrupado
    const grouped = new Map();
    for (const e of list) {
      const accId = e._accountId || "NA";
      const key = `${e.start}__${accId}`;
      const fallback = e._type === "out" ? "#ef4444" : "#10b981";
      const accColor = e._color || e._accountColor || fallback;

      const prev = grouped.get(key);
      if (!prev) {
        grouped.set(key, {
          date: e.start,
          accId,
          accAlias: e._accountAlias || (accId !== "NA" ? `Cuenta ${accId}` : "Sin cuenta"),
          sum: e._amount,
          type: e._type,
          accColor,
        });
      } else {
        prev.sum += e._amount;
        if (!prev.accColor && accColor) prev.accColor = accColor;
      }
    }

    return Array.from(grouped.values()).map(g => ({
      id: `${g.date}__${g.accId}`,
      title: `${g.accAlias}: ${g.sum.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€`,
      start: g.date,
      allDay: true,
      backgroundColor: g.accColor,
      borderColor: g.accColor,
      textColor: "#fff",
      extendedProps: {
        group: true,
        accId: g.accId,
        accAlias: g.accAlias,
        sum: g.sum,
        accountColor: g.accColor,
        dateYMD: g.date,
      },
    }));
  }

  // opciones filtros
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

  /* ===== efectos ===== */
  useEffect(() => { loadAll(); }, []);
  useEffect(() => { setEvents(projectForCalendar(allEvents, filters)); }, [filters, allEvents]);

  useEffect(() => {
    const map = new Map();
    const list = filterBaseForTotals(allEvents, filters);
    for (const e of list) {
      const ymd = toLocalYMD(e.start);
      const amtRaw = Number(e._amount ?? e.extendedProps?.amount ?? 0) || 0;
      const amt = SUM_ABSOLUTE ? Math.abs(amtRaw) : amtRaw;
      if (!ymd || !amt) continue;
      map.set(ymd, (map.get(ymd) || 0) + amt);
    }
    setDayTotals(map);

    // 👇 fuerza que se re-ejecute dayCellDidMount
    setCalKey(k => k + 1);
  }, [allEvents, filters]);


  // click evento (ignora clics en el botón/menú)
  const onEventClick = async (info) => {
    const t = info.jsEvent?.target;
    if (t && t.closest?.(".evt-ctrl")) return;

    try {
      const ev = info.event;
      const xp = ev.extendedProps || {};

      if (xp.group) {
        const accId = xp.accId;
        const dateStr = xp.dateYMD || (ev.startStr ? ev.startStr.slice(0, 10) : undefined);
        if (accId) setFilters((f) => ({ ...f, accountId: accId }));
        const apiCal = ref.current?.getApi();
        if (apiCal && dateStr) requestAnimationFrame(() => apiCal.gotoDate(dateStr));
        return;
      }

      const id = ev.id || xp.cashflowId || xp.id || xp._id;
      if (!id) return;

      const nombre = xp?.counterparty?.name || xp?.accountAlias || "—";
      const ok = confirm(`¿Eliminar vencimiento de ${nombre} por ${Number(xp?.amount || 0).toLocaleString("es-ES", { minimumFractionDigits: 2 })}€?`);
      if (!ok) return;

      await api.delete(`/cashflows/${id}`);
      loadAll();
    } catch (e) {
      console.error(e);
      alert("No se pudo procesar la acción. Revisa la consola.");
    }
  };

  // Totales en celdas
  const dayCellDidMount = React.useCallback(
    (info) => {
      const localYMD = [
        info.date.getFullYear(),
        String(info.date.getMonth() + 1).padStart(2, "0"),
        String(info.date.getDate()).padStart(2, "0"),
      ].join("-");
      const total = dayTotals.get(localYMD);

      const prev = info.el.querySelector(".fc-day-total");
      if (prev) prev.remove();
      if (!total) return;

      const node = document.createElement("div");
      node.className = "fc-day-total";
      node.textContent = `Total: ${total.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€`;
      Object.assign(node.style, {
        position: "absolute",
        left: "6px",
        bottom: "6px",
        fontSize: "14px",
        fontWeight: "600",
        lineHeight: "1",
        padding: "2px 6px",
        borderRadius: "4px",
        pointerEvents: "none",
        zIndex: 6,
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        whiteSpace: "nowrap",
      });
      if (getComputedStyle(info.el).position === "static") {
        info.el.style.position = "relative";
      }
      info.el.appendChild(node);
    },
    [dayTotals]
  );

  /* ===== Render de evento ===== */
  function renderEventContent(arg) {
    const ev = arg.event;
    const xp = ev.extendedProps || {};
    const isGroup = xp.group === true;

    if (isGroup) {
      const sumTxt = Number(xp.sum || 0).toLocaleString("es-ES", { minimumFractionDigits: 2 });
      return (
        <div style={{ display:"flex", flexDirection:"row", gap:2, justifyContent:"space-between", alignItems:"center", padding:"0 2px" }}>
          <div style={{ fontWeight: 700 }}>{xp.accAlias || "Cuenta"}</div>
          <div style={{ fontSize: 15, fontWeight: 550 }}>{sumTxt}€</div>
        </div>
      );
    }

    // Individual
    const prov   = xp?.counterparty?.name || xp?.accountAlias || "—";
    const amount = Number(xp?.amount || 0).toLocaleString("es-ES", { minimumFractionDigits: 2 });
    const ui     = xp?.uiStatus; // 'pending' | 'overdue' | 'paid' | 'unpaid' 
    const ymd    = ev.startStr?.slice(0,10);

    const badgeStyle = {
      fontSize: 10,
      padding: "2px 6px",
      borderRadius: 6,
      marginLeft: 6,
      background: ui === "paid" ? "#9ca3af"
                : ui === "overdue" ? "#f59e0b"
                : ui === "unpaid" ? "#ef4444"
                : "transparent",
      color: "#fff"
    };

    const handleStatusChange = async (next) => {
      const id = ev.id || xp.cashflowId || xp.id || xp._id;
      if (!id) return;

      // 1) Optimista: actualiza en memoria
      setAllEvents(prev => prev.map(e => {
        if (e.id !== id) return e;
        const persistedNext = next;
        const uiNext = computeUiStatus(persistedNext, ymd);
        const ext = e.extendedProps || {};
        return {
          ...e,
          _status: persistedNext,
          _ui: uiNext,
          extendedProps: { ...ext, status: persistedNext, uiStatus: uiNext }
        };
      }));

      // 2) API (si falla, recupera desde servidor)
      try {
        // Si tu helper espera (id, payload) cámbialo por: await setCashflowStatus(id, { status: next });
        await setCashflowStatus(id, next);
      } catch (err) {
        console.error(err);
        alert("No se pudo actualizar el estado.");
        // deshacer con truth desde backend
        loadAll();
      }
    };

    return (
      <div style={{ display:"flex", flexDirection:"column", gap:2, justifyContent:"space-between", padding:"0 2px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"space-between" }}>
          <span style={{ 
            fontWeight: 600,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: isMobile ? "clip" : "ellipsis",
            whiteSpace: isMobile ? "normal" : "nowrap",
            wordBreak: "break-word",
            }}>
            {prov}
          </span>

          {/* No mostrar badge si pending */}
          {ui && ui !== "pending" && (
            <span style={badgeStyle}>
              {ui === "paid" ? "Pagado"
                : ui === "overdue" ? "Vencido"
                : ui === "unpaid" ? "Impagado" : ""
}
            </span>
          )}

          {/* Botón menú estado */}
          <EventStatusMenu value={ui || "pending"} onChange={handleStatusChange} />
        </div>

        <div style={{ fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:600 }}>
          {amount}€
        </div>
      </div>
    );
  }

  function renderEventContentList(arg) {
    const ev = arg.event;
    const xp = ev.extendedProps || {};
    const prov   = xp?.counterparty?.name || xp?.accountAlias || "—";
    const amount = Number(xp?.amount || 0).toLocaleString("es-ES", { minimumFractionDigits: 2 });
    const ui     = xp?.uiStatus;
    const ymd    = ev.startStr?.slice(0,10);

    const badgeStyle = {
      fontSize: 12, padding:"2px 6px", borderRadius: 6, marginLeft: 8,
      background: ui==="paid" ? "#9ca3af" : ui==="overdue" ? "#f59e0b" : ui==="unpaid" ? "#ef4444" : "transparent",
      color:"#fff"
    };

    const handleStatusChange = async (next) => {
      const id = ev.id || xp.cashflowId || xp.id || xp._id;
      if (!id) return;
      setAllEvents(prev => prev.map(e => {
        if (e.id !== id) return e;
        const uiNext = computeUiStatus(next, ymd);
        const ext = e.extendedProps || {};
        return { ...e, _status: next, _ui: uiNext, extendedProps: { ...ext, status: next, uiStatus: uiNext } };
      }));
      try { await setCashflowStatus(id, next); } catch { loadAll(); }
    };

    return (
      <div style={{ display:"flex", alignItems:"center", gap:10, width:"100%" }}>
        <div style={{ fontWeight:600, flex:1, minWidth:0, wordBreak:"break-word" }}>{prov}</div>
        {ui && ui!=="pending" && <span style={badgeStyle}>
          {ui==="paid"?"Pagado":ui==="overdue"?"Vencido":ui==="unpaid"?"Impagado":""}
        </span>}
        <div style={{ fontWeight:700 }}>{amount}€</div>
        <EventStatusMenu value={ui || "pending"} onChange={handleStatusChange} />
      </div>
    );
  }

  return (
    <div className="page">
      <div
        className="card"
        style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center", justifyContent:"space-between" }}
      >
        <Button
          bg={buttonBg}
          color={buttonColor}
          _hover={{ bg: buttonHover }}
          onClick={() => { setSelectedDate(null); setOpen(true); }}
        >
          + Nuevo vencimiento
        </Button>

        <label style={{ gap:10, display:"flex", alignItems:"center" }}>
          Cuenta:
          <select
            value={filters.accountId}
            onChange={(e) => setFilters((f) => ({ ...f, accountId: e.target.value }))}
          >
            <option value="">Todas</option>
            {useMemo(() => accountOptions, [accountOptions]).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        <label style={{ gap:10, display:"flex", alignItems:"center" }}>
          Categoría:
          <select
            value={filters.categoryId}
            onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))}
          >
            <option value="">Todas</option>
            {useMemo(() => categoryOptions, [categoryOptions]).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        <label style={{ gap:10, display:"flex", alignItems:"center" }}>
          Mes:
          <select
            value={filters.month}
            onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))}
          >
            <option value="">Todos</option>
            {useMemo(() => monthOptions, [monthOptions]).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        <label style={{ gap:10, display:"flex", alignItems:"center" }}>
          Año:
          <select
            value={filters.year}
            onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
          >
            <option value="">Todos</option>
            {useMemo(() => yearOptions, [yearOptions]).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        <label style={{ gap:10, display:"flex", alignItems:"center" }}>
          Estado:
          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="overdue">Vencido</option>
            <option value="unpaid">Impagado</option>
            <option value="paid">Pagado</option>
          </select>
        </label>

        <Button
          bg={buttonBg}
          color={buttonColor}
          _hover={{ bg: buttonHover }}
          onClick={() => setFilters({ accountId:"", categoryId:"", month:"", year:"", status:"" })}
        >
          Limpiar filtros
        </Button>
      </div>

      <div className="card">
        {accounts.length > 0 && (
          <div
            className="card"
            style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center", width:"100%", padding:"2px 0" }}
          >
            <strong>Leyenda cuentas:</strong>
            {accounts.map((a) => (
              <span key={a._id} style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                <span
                  style={{
                    width:12, height:12, borderRadius:3,
                    background: a.color || "#999", border:"1px solid #ddd",
                  }}
                />
                <span>{a.alias}</span>
              </span>
            ))}
          </div>
        )}

        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", marginBottom:0 }}>
          <h2 style={{ marginTop:8, fontSize:24, fontWeight:800 }}>{calTitle}</h2>
        </div>

        <FullCalendar
          key={`cal-${isMobile ? 'm' : 'd'}-${calKey}`}
          ref={ref}
          plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
          locale={esLocale}

          /* Vistas y cabecera */
          initialView={isMobile ? "listMonth" : "dayGridMonth"}
          headerToolbar={{ left: "", center: "", right: "prev,next today" }}
          titleFormat={isMobile ? { month: "short", year: "numeric" } : { month: "long", year: "numeric" }}
          dayHeaderFormat={isMobile ? { weekday: "short" } : { weekday: "long" }}
          fixedWeekCount={false}

          /* Datos */
          events={events}
          eventContent={(arg) =>
            arg.view.type.startsWith("list")
              ? renderEventContentList(arg)
              : renderEventContent(arg)
          }

          /* Interacciones */
          eventClick={onEventClick}
          dateClick={(info) => { setSelectedDate(info.dateStr); setOpen(true); }}
          eventDidMount={(info) => {
            const xp = info.event.extendedProps || {};
            if (xp.group) {
              info.el.style.cursor = "pointer";
              info.el.title = `Ver detalle de ${xp.accAlias} en ${xp.dateYMD}`;
            }
          }}
          dayCellDidMount={isMobile ? undefined : dayCellDidMount}
          datesSet={(arg) => {
            const mid = new Date((arg.start.getTime() + arg.end.getTime()) / 2);
            const month = mid.toLocaleString("es-ES", { month: "long" });
            const newTitle = `${month.charAt(0).toUpperCase() + month.slice(1)} ${mid.getFullYear()}`;
            setCalTitle((t) => (t === newTitle ? t : newTitle));
          }}

          /* Layout */
          height="auto"
          expandRows={!isMobile}
          dayMaxEventRows={isMobile ? false : 3}
          dayMaxEvents={isMobile ? false : true}

          /* List view: ocultar “Todo el día” */
          displayEventTime={isMobile ? false : true}
          allDayText=""

          /* List view: formato de día */
          listDayFormat={{ weekday: "long", day: "numeric" }}
          listDaySideFormat={false}
        />

      </div>

      {open && (
        <NewForecastModal
          date={selectedDate}
          onClose={() => { setOpen(false); loadAll(); }}
        />
      )}
    </div>
  );
}
