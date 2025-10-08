import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '@/api/accountsService.js';
import { useForm } from 'react-hook-form';

const toHexSafe = (c) => {
  const v = String(c || '').toUpperCase();
  return /^#[0-9A-F]{6}$/.test(v) ? v : null;
};

export function AccountsPage() {
  const qc = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
  });

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: { alias: '', bank: '', number: '', initialBalance: 0, color: '#2563EB' },
  });

  const createMut = useMutation({
    mutationFn: createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateAccount(id, payload),
    onMutate: async ({ id, payload }) => {
      await qc.cancelQueries({ queryKey: ['accounts'] });
      const prev = qc.getQueryData(['accounts']);
      qc.setQueryData(['accounts'], (old = []) =>
        old.map(a => (a._id === id ? { ...a, ...payload } : a))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['accounts'], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });

  const onSubmit = (vals) => {
    const color = toHexSafe(vals.color) || undefined; // backend generará uno si falta
    createMut.mutate({ ...vals, color }, { onSuccess: () => reset() });
  };

  const onColorChange = (a, color) => {
    const hex = toHexSafe(color);
    if (!hex) return; // ignora valores inválidos
    updateMut.mutate({ id: a._id, payload: { color: hex } });
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="card">Cargando…</div>
      </div>
    );
  }

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

          {/* Color de la cuenta (crear) */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Color:
            <input type="color" {...register('color')} />
            {/*<code style={{ fontSize: 12 }}>{(watch('color') || '').toUpperCase()}</code>*/}
          </label>

          <button className="btn" type="submit">Guardar</button>
        </form>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Color</th>
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
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      title={a.color || '#999999'}
                      style={{
                        width: 18, height: 18, borderRadius: 4,
                        background: a.color || '#999999', border: '1px solid #ddd'
                      }}
                    />
                    <input
                      type="color"
                      value={/^#[0-9a-fA-F]{6}$/.test(a.color || '') ? a.color : '#999999'}
                      onChange={(e) => onColorChange(a, e.target.value)}
                      style={{ cursor: 'pointer', background: 'transparent', border: 'none' }}
                    />
                    {/*<code style={{ fontSize: 12 }}>{(a.color || '#999999').toUpperCase()}</code>*/}
                  </div>
                </td>
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
