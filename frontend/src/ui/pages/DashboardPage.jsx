import React from 'react'
import { KpiCard } from '@/ui/components/KpiCard.jsx'
import { ForecastChart } from '@/ui/components/ForecastChart.jsx'

// Sustituye por fetch real a /forecast
const mock = Array.from({length:30}).map((_,i)=>({ date:`D${i+1}`, total: 10000 + i*200 - (i%6)*900 }))

export function DashboardPage(){
  return (<div className="grid">
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
      <KpiCard title="Runway" value="62 días" hint="saldo < 0"/>
      <KpiCard title="Saldo mínimo" value="8.420 €" hint="90 días"/>
      <KpiCard title="Déficit máximo" value="-3.200 €" hint="base"/>
    </div>
    <ForecastChart data={mock}/>
  </div>)
}
