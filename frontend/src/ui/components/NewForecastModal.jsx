/*import React,{ useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createForecast } from '@/api/forecastsService.js'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api.js'

export function NewForecastModal({ date=null,onClose }){ 
    const { register,handleSubmit,reset }=useForm({ defaultValues:{ date:date||'', amount:'', account:'', type:'out', category:'', counterparty:'',concept:'' } }); 
    
    const { data:accounts=[] }=useQuery(['accounts'],()=> api.get('/accounts').then(r=>r.data));

    const { data:counterparties=[] }=useQuery(['counterparties'],()=> api.get('/counterparties').then(r=>r.data));

    useEffect(()=>{ if(date) reset(v=>({...v,date})) },[date,reset]); 
    
    const onSubmit=async(vals)=>{ await createForecast({ ...vals, amount:Number(vals.amount), date:new Date(vals.date) }); onClose() };
         return (
            <div className='modal-overlay'>
                <div className='modal card' style={{width:520}}>
                    <h3>Nuevo vencimiento</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className='modal-form' style={{display:'grid',gap:10}}>
                        <input className='input' type='date' {...register('date',{required:true})}/>
                        <select className='input' {...register('account',{required:true})}>
                            <option value=''>Cuenta</option>{accounts.map(a=> <option key={a._id} value={a._id}>{a.alias}</option>)}
                        </select>
                        <select className='input' {...register('counterparty')}>
                            <option value=''>Proveedor</option>{counterparties.map(c=> <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                        <input className='input' type='number' step='0.01' placeholder='Importe' {...register('amount',{required:true})}/>
                        <select className='input' {...register('type')}>
                            <option value='out'>Pago</option>
                            <option value='in'>Cobro</option>
                        </select>
                        <input className='input' placeholder='Categoría (id opcional)' {...register('category')}/>
                        <input className='input' placeholder='Concepto' {...register('concept')}/>
                        <div style={{display:'flex',gap:10,justifyContent:'flexend'}}>
                        <button type='button' className='btn-secondary' onClick={onClose}>Cancelar</button>
                        <button className='btn' type='submit'>Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        ) 
    }*/

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createForecast } from '@/api/forecastsService.js';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api.js';

export function NewForecastModal({ date = null, onClose }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      date: date || '',
      amount: '',
      account: '',
      type: 'out',
      category: '',
      counterparty: '',
      concept: '',
    },
  });

  // Query de cuentas
  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.get('/accounts').then(r => r.data),
  });

  // Query de proveedores
  const { data: counterparties = [] } = useQuery({
    queryKey: ['counterparties'],
    queryFn: () => api.get('/counterparties').then(r => r.data),
  });

  useEffect(() => {
    if (date) reset(v => ({ ...v, date }));
  }, [date, reset]);

  const onSubmit = async vals => {
  const payload = {
    ...vals,
    amount: Number(vals.amount),
    date: vals.date ? new Date(vals.date).toISOString() : undefined,
    category: vals.category || undefined, // <- si está vacío, se omite
  };

  console.log('Payload enviado al backend:', payload);

  try {
    await createForecast(payload);
    onClose();
  } catch (err) {
    console.error('Error al crear forecast:', err.response?.data || err.message);
    alert('Error al crear forecast. Mira la consola para más detalles.');
  }
};



  return (
    <div className="modal-overlay">
      <div className="modal card" style={{ width: 520 }}>
        <h3>Nuevo vencimiento</h3>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="modal-form"
          style={{ display: 'grid', gap: 10 }}
        >
          <input className="input" type="date" {...register('date', { required: true })} />

          <select className="input" {...register('account', { required: true })}>
            <option value="">Cuenta</option>
            {accounts.map(a => (
              <option key={a._id} value={a._id}>
                {a.alias}
              </option>
            ))}
          </select>

          <select className="input" {...register('counterparty')}>
            <option value="">Proveedor</option>
            {counterparties.map(c => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            className="input"
            type="number"
            step="0.01"
            placeholder="Importe"
            {...register('amount', { required: true })}
          />

          <select className="input" {...register('type')}>
            <option value="out">Pago</option>
            <option value="in">Cobro</option>
          </select>

          <input className="input" placeholder="Categoría (id opcional)" {...register('category')} />
          <input className="input" placeholder="Concepto" {...register('concept')} />

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn" type="submit">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


