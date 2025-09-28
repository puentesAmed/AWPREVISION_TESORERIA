import React from "react"
import { DataTable } from "../components/DataTable"

export function AccountsPage() {
  const columns = [
    { key: "name", header: "Cuenta" },
    { key: "type", header: "Tipo" },
    { key: "balance", header: "Saldo (€)", render: r => r.balance.toLocaleString() }
  ]
  const rows = [
    { name: "Banco Principal", type: "Corriente", balance: 12000 },
    { name: "Caja Chica", type: "Efectivo", balance: 800 }
  ]

  return (
    <div className="page">
      <h1 className="page-title">Cuentas</h1>
      <p className="page-subtitle">Gestiona las cuentas bancarias y de efectivo.</p>
      <DataTable columns={columns} rows={rows} />
    </div>
  )
}
