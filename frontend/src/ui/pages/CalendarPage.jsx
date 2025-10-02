/*import React, { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { getCalendar } from '@/api/forecastsService.js'
import { NewForecastModal } from '@/ui/components/NewForecastModal.jsx'


export function CalendarPage(){
    const [events,setEvents]=useState([]); 
    const [open,setOpen]=useState(false); 
    const [selectedDate,setSelectedDate]=useState(null); 
    
    const ref=useRef()
    async function load(range){ setEvents(await getCalendar(range)) }

    useEffect(()=>{ const api=ref.current?.getApi(); 
        if(api){ load({ start:api.view.activeStart.toISOString(), 
            end:api.view.activeEnd.toISOString() }) } },[])
            return (
                <div className='page'>
                    <div className='card'>
                        <button className='btn' onClick={()=>{setSelectedDate(null); setOpen(true) }}>+ Nuevo vencimiento</button>
                    </div>
                <div className='card'>
                    <FullCalendar ref={ref} plugins={[dayGridPlugin,timeGridPlugin,interactionPlugin]}
                    initialView='dayGridMonth' events={events} datesSet={({view})=> load({
                    start:view.activeStart.toISOString(), end:view.activeEnd.toISOString() })} dateClick={info=> {
                    setSelectedDate(info.dateStr); setOpen(true) }}/>
                </div>
                {open && <NewForecastModal date={selectedDate} onClose={()=>{ setOpen(false);

                const api=ref.current?.getApi(); load({ start:api.view.activeStart.toISOString(), end:api.view.activeEnd.toISOString() }) }}/>}

                </div>
            ) 
        }
*/  
/*      

import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getCalendar } from '@/api/forecastsService.js';
import { NewForecastModal } from '@/ui/components/NewForecastModal.jsx';
import { api } from '@/lib/api.js';

export function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const ref = useRef();

  async function load(range) {
    setEvents(await getCalendar(range));
  }

  // Carga inicial de calendario
  useEffect(() => {
    const apiCal = ref.current?.getApi();
    if (apiCal) {
      load({
        start: apiCal.view.activeStart.toISOString(),
        end: apiCal.view.activeEnd.toISOString(),
      });
    }
  }, []);

  // Alerta de próximos vencimientos (7 días), una vez al día
  useEffect(() => {
    (async () => {
      try {
        const todayKey = `upcomingShown:${new Date().toISOString().slice(0, 10)}`;
        if (localStorage.getItem(todayKey)) return;

        const { data } = await api.get('/cashflows/upcoming?days=7');
        if (!Array.isArray(data) || data.length === 0) return;

        const fmt = d =>
          new Date(d).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });

        const lines = data.slice(0, 5).map(i => `• ${fmt(i.date)} · ${(i.counterparty?.name) || '—'} · ${i.amount}€`);
        alert(`Vencimientos próximos (${data.length}):\n${lines.join('\n')}`);

        localStorage.setItem(todayKey, '1');
      } catch (_) {
        //silencio
}
    })();
  }, []);

  // Borrar al hacer clic en evento
  const onEventClick = async info => {
    try {
      const ev = info.event.extendedProps || {};
      const nombre = ev?.counterparty?.name || '—';
      const ok = confirm(`¿Eliminar vencimiento de ${nombre} por ${ev?.amount}€?`);
      if (!ok) return;

      await api.delete(`/cashflows/${info.event.id}`);

      const apiCal = ref.current?.getApi();
      if (apiCal) {
        await load({
          start: apiCal.view.activeStart.toISOString(),
          end: apiCal.view.activeEnd.toISOString(),
        });
      } else {
        // fallback
        info.event.remove();
      }
    } catch (e) {
      alert('No se pudo eliminar. Revisa la consola.');
      console.error(e);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <button
          className="btn"
          onClick={() => {
            setSelectedDate(null);
            setOpen(true);
          }}
        >
          + Nuevo vencimiento
        </button>
      </div>

      <div className="card">
        <FullCalendar
          ref={ref}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={onEventClick}
          datesSet={({ view }) =>
            load({
              start: view.activeStart.toISOString(),
              end: view.activeEnd.toISOString(),
            })
          }
          dateClick={info => {
            setSelectedDate(info.dateStr);
            setOpen(true);
          }}
        />
      </div>

      {open && (
        <NewForecastModal
          date={selectedDate}
          onClose={() => {
            setOpen(false);
            const apiCal = ref.current?.getApi();
            if (apiCal) {
              load({
                start: apiCal.view.activeStart.toISOString(),
                end: apiCal.view.activeEnd.toISOString(),
              });
            }
          }}
        />
      )}
    </div>
  );
}
*/


import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getCalendar } from '@/api/forecastsService.js';
import { NewForecastModal } from '@/ui/components/NewForecastModal.jsx';
import { api } from '@/lib/api.js';

export function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const ref = useRef();

  async function load(range) {
    try {
      const data = await getCalendar(range);
      setEvents(
        data.map(e => ({
          ...e,
          id: String(e.id ?? e?.extendedProps?.cashflowId ?? e?._id ?? ''), // normaliza id
        }))
      );
    } catch (err) {
      console.error(err);
      alert('No se pudo cargar el calendario');
    }
  }

  useEffect(() => {
    const apiCal = ref.current?.getApi();
    if (apiCal) {
      load({
        start: apiCal.view.activeStart.toISOString(),
        end: apiCal.view.activeEnd.toISOString(),
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const todayKey = `upcomingShown:${new Date().toISOString().slice(0, 10)}`;
        if (localStorage.getItem(todayKey)) return;
        const { data } = await api.get('/cashflows/upcoming?days=7');
        if (!Array.isArray(data) || data.length === 0) return;

        const fmt = d =>
          new Date(d).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

        const lines = data.slice(0, 5).map(i => `• ${fmt(i.date)} · ${i.counterparty?.name || '—'} · ${i.amount}€`);
        alert(`Vencimientos próximos (${data.length}):\n${lines.join('\n')}`);
        localStorage.setItem(todayKey, '1');
      } catch {}
    })();
  }, []);

  const onEventClick = async info => {
    try {
      const evx = info.event.extendedProps || {};
      const id =
        info.event.id ||
        evx.cashflowId ||
        evx.id ||
        evx._id;

      if (!id) {
        console.error('Evento sin id', info.event);
        alert('Id no válido');
        return;
      }

      const nombre = evx?.counterparty?.name || '—';
      const ok = confirm(`¿Eliminar vencimiento de ${nombre} por ${evx?.amount}€?`);
      if (!ok) return;

      await api.delete(`/cashflows/${id}`);

      const apiCal = ref.current?.getApi();
      if (apiCal) {
        await load({
          start: apiCal.view.activeStart.toISOString(),
          end: apiCal.view.activeEnd.toISOString(),
        });
      } else {
        info.event.remove();
      }
    } catch (e) {
      console.error(e);
      alert('No se pudo eliminar. Revisa la consola.');
    }
  };

  return (
    <div className="page">
      <div className="card">
        <button
          className="btn"
          onClick={() => {
            setSelectedDate(null);
            setOpen(true);
          }}
        >
          + Nuevo vencimiento
        </button>
      </div>

      <div className="card">
        <FullCalendar
          ref={ref}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={onEventClick}
          datesSet={({ view }) =>
            load({
              start: view.activeStart.toISOString(),
              end: view.activeEnd.toISOString(),
            })
          }
          dateClick={info => {
            setSelectedDate(info.dateStr);
            setOpen(true);
          }}
        />
      </div>

      {open && (
        <NewForecastModal
          date={selectedDate}
          onClose={() => {
            setOpen(false);
            const apiCal = ref.current?.getApi();
            if (apiCal) {
              load({
                start: apiCal.view.activeStart.toISOString(),
                end: apiCal.view.activeEnd.toISOString(),
              });
            }
          }}
        />
      )}
    </div>
  );
}
