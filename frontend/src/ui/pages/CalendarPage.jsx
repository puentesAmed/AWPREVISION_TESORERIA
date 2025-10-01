import React, { useState, useEffect, useRef } from 'react'
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