/*import React from 'react'
import { useQuery,useMutation,useQueryClient } from '@tanstack/react-query'
import { getAccounts,createAccount,updateAccount,deleteAccount } from '@/api/accountsService.js'
import { useForm } from 'react-hook-form'


export function AccountsPage(){ 

  const qc=useQueryClient(); 
  const { data:accounts=[], isLoading}=useQuery(['accounts'],getAccounts); 
  const { register,handleSubmit,reset }=useForm({ defaultValues:{alias:'', bank:'', number:'', initialBalance:0 } }); 
  const createMut=useMutation({ mutationFn:createAccount, onSuccess:()=> qc.invalidateQueries(['accounts']) }); 
  const updateMut=useMutation({ mutationFn:({id,payload})=> updateAccount(id,payload), onSuccess:()=> qc.invalidateQueries(['accounts']) });
  const deleteMut=useMutation({ mutationFn:deleteAccount, onSuccess:()=> qc.invalidateQueries(['accounts']) });
  const onSubmit=(vals)=> createMut.mutate(vals,{ onSuccess:()=> reset() }); 

  return (
    <div className='page'>
      <div className='card'>
        <h3>Nueva cuenta</h3>
        <form onSubmit={handleSubmit(onSubmit)} className='controls'>
          <input className='input' placeholder='Alias' {...register('alias',{required:true})}/>
          <input className='input' placeholder='Banco' {...register('bank')}/>
          <input className='input' placeholder='Número' {...register('number')}/>
          <input className='input' type='number' step='0.01' placeholder='Saldo inicial' {...register('initialBalance',{valueAsNumber:true})}/>
          <button className='btn'  type='submit'>Guardar</button>
        </form>
      </div>
      <div className='card'>
        <table className='table'>
          <thead>
            <tr>
              <th>Alias</th>
              <th>Banco</th>
              <th>Número</th>
              <th>Saldo inicial</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(a=> (
              <tr key={a._id}>
                <td>{a.alias}</td>
                <td>{a.bank||'—'}</td>
                <td>{a.number||'—'}</td>
                <td>{(a.initialBalance||0).toLocaleString('es-ES',{style:'currency',currency:'EUR'})}</td>
                <td style={{display:'flex',gap:8,justifyContent:'flexend'}}>
                <button className='btn-secondary' onClick={()=> updateMut.mutate({ id:a._id, payload:{ alias:a.alias+'*' }})}>Renombrar *</button>
                <button className='btn-danger' onClick={()=> deleteMut.mutate(a._id)}>Eliminar</button>
                </td>
              </tr>
            )
          )}
          </tbody>
        </table>
      </div>
    </div>
  ) 
}*/

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '@/api/accountsService.js';
import { useForm } from 'react-hook-form';

export function AccountsPage() {
  const qc = useQueryClient();

  // useQuery actualizado para v5
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { alias: '', bank: '', number: '', initialBalance: 0 },
  });

  const createMut = useMutation({
    mutationFn: createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateAccount(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });

  const onSubmit = vals => createMut.mutate(vals, { onSuccess: () => reset() });

  return (
    <div className="page">
      <div className="card">
        <h3>Nueva cuenta</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="controls">
          <input className="input" placeholder="Alias" {...register('alias', { required: true })} />
          <input className="input" placeholder="Banco" {...register('bank')} />
          <input className="input" placeholder="Número" {...register('number')} />
          <input
            className="input"
            type="number"
            step="0.01"
            placeholder="Saldo inicial"
            {...register('initialBalance', { valueAsNumber: true })}
          />
          <button className="btn" type="submit">
            Guardar
          </button>
        </form>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Alias</th>
              <th>Banco</th>
              <th>Número</th>
              <th>Saldo inicial</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(a => (
              <tr key={a._id}>
                <td>{a.alias}</td>
                <td>{a.bank || '—'}</td>
                <td>{a.number || '—'}</td>
                <td>
                  {(a.initialBalance || 0).toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </td>
                <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => updateMut.mutate({ id: a._id, payload: { alias: a.alias + '*' } })}
                  >
                    Renombrar *
                  </button>
                  <button className="btn-danger" onClick={() => deleteMut.mutate(a._id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
