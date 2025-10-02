import React, { useState } from 'react';
import { api } from '@/lib/api.js';

export function ImportPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { created, errorsCount, errors: [...] }
  const [errMsg, setErrMsg] = useState('');

  const onUpload = async () => {
  if (!file) return;
  setLoading(true);
  setErrMsg('');
  setResult(null);
  try {
    const fd = new FormData();
    fd.append('file', file);

    // NO pongas Content-Type; deja que el navegador lo ponga con boundary
    const { data } = await api.post('/cashflows/import', fd);

    setResult(data);
  } catch (e) {
    // muestra el mensaje real del backend
    setErrMsg(e.response?.data?.error || e.message);
    console.error(e.response?.data || e);
  } finally {
    setLoading(false);
  }
};


  const onChangeFile = e => {
    setFile(e.target.files?.[0] || null);
    setResult(null);
    setErrMsg('');
  };

  return (
    <div className="page">
      <div className="card" style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
        <h3>Importar vencimientos</h3>
        <input
          className="input"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={onChangeFile}
        />
        <button className="btn" onClick={onUpload} disabled={!file || loading}>
          {loading ? 'Subiendo…' : 'Subir'}
        </button>

        <p className="muted">
          Formato: columnas <code>fecha|date</code>, <code>importe|amount</code>,{' '}
          <code>tipo|type</code> (<code>Pago/out</code> o <code>Cobro/in</code>),{' '}
          <code>cuenta|account</code> (alias existente), <code>proveedor|counterparty</code>,{' '}
          <code>categoria|category</code>, <code>concepto|concept</code>, <code>estado|status</code>.
        </p>

        {errMsg && (
          <div className="alert error">
            Error: {errMsg}
          </div>
        )}

        {result && (
          <div className="card" style={{ padding: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Importación completada</strong>
              <div>Creados: {result.created}</div>
              <div>Errores: {result.errorsCount}</div>
            </div>

            {Array.isArray(result.errors) && result.errors.length > 0 && (
              <div style={{ maxHeight: 260, overflow: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fila</th>
                      <th>Error</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((e, idx) => (
                      <tr key={idx}>
                        <td>{e.row ?? '-'}</td>
                        <td>{e.error}</td>
                        <td>{e.value ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
