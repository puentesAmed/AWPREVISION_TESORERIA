import React,{ useState,useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTotals } from '@/api/reportsService.js'
import { api } from '@/lib/api.js'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'


export function TotalsPage(){
    const [from,setFrom]=useState(()=>{ 
        const d=new Date(); 
        d.setDate(d.getDate()-30); 
        return d.toISOString().slice(0,10) 
    }); 
    
    const [to,setTo]=useState(()=> new Date().toISOString().slice(0,10))
    const [granularity,setGranularity]=useState('day'); 
    const [account,setAccount]=useState('')
    const { data:accounts=[] }=useQuery(['accounts'],()=> api.get('/accounts').then(r=>r.data))
    const { data:totals=[], isLoading }=useQuery(['totals',from,to,account,granularity],()=> getTotals({
        from,to,account,groupBy:'date',granularity }),{ keepPreviousData:true })
        
    const chartData=useMemo(()=> totals.map(t=> ({ date:t._id?.date||t._id, total:t.total })),[totals])
        return (
            <div className='page'>
                <div className='card controls'>
                    <input className='input' type='date' value={from} onChange={e=>setFrom(e.target.value)}/>
                    <input className='input' type='date' value={to} onChange={e=>setTo(e.target.value)}/>
                    <select className='input' value={granularity} onChange={e=>setGranularity(e.target.value)}> 
                        <option value='day'>Día</option>
                        <option value='week'>Semana</option>
                        <option value='month'>Mes</option>
                    </select>
                    <select className='input' value={account} onChange={e=>setAccount(e.target.value)}>
                        <option value=''>Todas</option>
                        {accounts.map(a=> 
                            <option key={a._id} value={a._id}>{a.alias}</option>)}
                    </select>
                </div>
                <div className='card' style={{height:360}}>
                    <ResponsiveContainer width='100%' height='100%'>
                        <LineChart data={chartData}>
                            <XAxis dataKey='date'/><YAxis/>
                            <Tooltip/>
                            <Line dataKey='total' type='monotone' dot={false}/>
                        </LineChart>                                
                    </ResponsiveContainer>
                </div>
                <div className='card'>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>{chartData.map((r,i)=> 
                            <tr key={i}>
                                <td>{r.date}</td>
                                <td>{(r.total||0).toLocaleString('es-ES',{style:'currency',currency:'EUR'})}</td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        ) 
    }