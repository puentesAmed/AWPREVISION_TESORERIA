import React, { useEffect, useMemo, useState } from 'react';
import {
  SimpleGrid, Box, Text, useColorModeValue, HStack, Icon, Spinner,
  Select, Button, Flex
} from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { api } from '@/lib/api';

/* ========= Helpers ========= */
const mapFilters = (f = {}) => {
  const out = {};
  if (f.accountId) { out.accountId = f.accountId; out.account = f.accountId; }
  if (f.categoryId) { out.categoryId = f.categoryId; out.category = f.categoryId; }
  if (f.month) out.month = Number(f.month);
  if (f.year)  out.year  = Number(f.year);
  return out;
};

// Rango temporal para /cashflows (fallback)
const buildRange = (f = {}) => {
  const y = Number(f.year);
  const m = Number(f.month);
  if (y && m) {
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end   = new Date(Date.UTC(y, m, 1));
    return { start: start.toISOString(), end: end.toISOString() };
  }
  if (y) {
    const start = new Date(Date.UTC(y, 0, 1));
    const end   = new Date(Date.UTC(y + 1, 0, 1));
    return { start: start.toISOString(), end: end.toISOString() };
  }
  return {}; // sin rango => backend decide (o trae todo)
};

// Agrupa cashflows a mensual
const monthlyFromCashflows = (rows = []) => {
  const map = new Map(); // key: 'YYYY-MM' -> { month, ingresos, gastos }
  for (const r of rows) {
    if (!r?.date) continue;
    const d = new Date(r.date);
    if (isNaN(d)) continue;
    const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const cur = map.get(ym) || { month: ym, ingresos: 0, gastos: 0 };
    const amt = Number(r.amount || 0);
    if (amt > 0) cur.ingresos += amt; else cur.gastos += Math.abs(amt);
    map.set(ym, cur);
  }
  return Array.from(map.values()).sort((a,b) => a.month.localeCompare(b.month));
};

// Resumen ingresos/gastos desde cashflows
const summaryFromCashflows = (rows = []) => {
  let ingresos = 0, gastos = 0;
  for (const r of rows) {
    const amt = Number(r.amount || 0);
    if (amt > 0) ingresos += amt; else gastos += Math.abs(amt);
  }
  return { ingresos, gastos };
};

export function DashboardPage() {
  const cardBg = useColorModeValue('white', 'neutral.800');
  const cardColor = useColorModeValue('black', 'white');

  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState({ ingresos: 0, gastos: 0, balance: 0 });
  const [lineData, setLineData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [renderKey, setRenderKey] = useState(0);
  const COLORS = ['#00e68f', '#0099e6'];

  // ---- filtros ----
  const [filters, setFilters] = useState({
    accountId: '',
    categoryId: '',
    month: '',  // 1..12
    year: '',   // 2025...
  });

  // ---- opciones selects ----
  const [accountOptions, setAccountOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => {
      const label = new Date(0, i).toLocaleString('es-ES', { month: 'long' });
      return { value: String(i + 1), label: label[0].toUpperCase() + label.slice(1) };
    }),
    []
  );
  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, k) => String(y - 3 + k)).map(v => ({ value: v, label: v }));
  }, []);

  // ---- cargar opciones globales ----
  useEffect(() => {
    (async () => {
      try {
        const [{ data: accs }, { data: cats }] = await Promise.all([
          api.get('/accounts'),
          api.get('/categories'),
        ]);
        setAccountOptions(
          (accs || []).map(a => ({
            value: String(a._id || a.id),
            label: a.alias || a.name || `Cuenta ${a._id || a.id}`,
          })).sort((a,b)=>a.label.localeCompare(b.label,'es'))
        );
        setCategoryOptions(
          (cats || []).map(c => ({
            value: String(c._id || c.id),
            label: c.name || `Categoría ${c._id || c.id}`,
          })).sort((a,b)=>a.label.localeCompare(b.label,'es'))
        );
      } catch {}
    })();
  }, []);

  // ---- load data ----
  async function loadData(f) {
    setLoading(true);
    try {
      const paramsBalance = mapFilters(f);
      // 1) KPIs + cuentas (endpoint que tienes operativo)
      const { data: accBal } = await api.get('/accounts/balance', { params: paramsBalance });
      const kpiRaw = accBal?.kpi ?? { ingresos: 0, gastos: 0, balance: 0 };
      let accountsRows = Array.isArray(accBal?.accounts) ? accBal.accounts : [];

      // Si hay cuenta filtrada, muestra solo esa en barras
      if (f.accountId) accountsRows = accountsRows.filter(a => String(a.id) === String(f.accountId));
      setBarData(accountsRows.map(a => ({
        name: a.name || `Cuenta ${a.id}`,
        balance: Number(a.balance ?? 0),
      })));

      // 2) Monthly + Summary con fallback desde /cashflows (filtrados)
      const range = buildRange(f);
      const paramsCash = { ...mapFilters(f), ...range };
      let cashflows = [];
      try {
        const { data } = await api.get('/cashflows', { params: paramsCash });
        cashflows = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
      } catch {
        cashflows = []; // si no existe el endpoint, se muestran vacíos
      }

      const monthly = monthlyFromCashflows(cashflows);
      const sum = summaryFromCashflows(cashflows);

      // 3) Elegir KPIs (prioriza filtrado real si hay cashflows; si no, usa balance global)
      const k = (cashflows.length > 0 || f.accountId || f.categoryId || f.month || f.year)
        ? { ingresos: sum.ingresos, gastos: sum.gastos, balance: sum.ingresos - sum.gastos }
        : { ingresos: Number(kpiRaw.ingresos||0), gastos: Number(kpiRaw.gastos||0), balance: Number(kpiRaw.balance||0) };

      setKpi(k);
      setLineData(monthly);
      setPieData([
        { name: 'Ingresos', value: Number(k.ingresos||0) },
        { name: 'Gastos',   value: Number(k.gastos||0) }
      ]);

      setRenderKey(v => v + 1);
    } catch (e) {
      console.error('Dashboard error:', e);
      setKpi({ ingresos: 0, gastos: 0, balance: 0 });
      setLineData([]);
      setBarData([]);
      setPieData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(filters); }, [filters]);

  // ---- UI ----
  return (
    <>
      {/* Filtros */}
      <Box mb={4} p={4} bg={cardBg} borderRadius="2xl" boxShadow="sm">
        <Flex gap={4} wrap="wrap" align="center">
          <HStack spacing={2}>
            <Text minW="70px">Cuenta:</Text>
            <Select
              placeholder="Todas"
              value={filters.accountId}
              onChange={(e)=>setFilters(f=>({ ...f, accountId: e.target.value }))}
              maxW="260px"
            >
              {accountOptions.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </Select>
          </HStack>

          <HStack spacing={2}>
            <Text minW="80px">Categoría:</Text>
            <Select
              placeholder="Todas"
              value={filters.categoryId}
              onChange={(e)=>setFilters(f=>({ ...f, categoryId: e.target.value }))}
              maxW="260px"
            >
              {categoryOptions.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </Select>
          </HStack>

          <HStack spacing={2}>
            <Text minW="45px">Mes:</Text>
            <Select
              placeholder="Todos"
              value={filters.month}
              onChange={(e)=>setFilters(f=>({ ...f, month: e.target.value }))}
              maxW="180px"
            >
              {monthOptions.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
            </Select>
          </HStack>

          <HStack spacing={2}>
            <Text minW="45px">Año:</Text>
            <Select
              placeholder="Todos"
              value={filters.year}
              onChange={(e)=>setFilters(f=>({ ...f, year: e.target.value }))}
              maxW="140px"
            >
              {yearOptions.map(y => (<option key={y.value} value={y.value}>{y.label}</option>))}
            </Select>
          </HStack>

          <Button
            onClick={()=>setFilters({ accountId:'', categoryId:'', month:'', year:'' })}
            colorScheme="blue"
            variant="solid"
          >
            Limpiar filtros
          </Button>
        </Flex>
      </Box>

      {loading ? (
        <Spinner mt={10} size="xl" />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {/* KPIs */}
          <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor}>
            <HStack spacing={4}>
              <Icon as={FiDollarSign} w={8} h={8} color="green.400" />
              <Box>
                <Text fontSize="sm" fontWeight="bold">Ingresos</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {Number(kpi.ingresos || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </Text>
              </Box>
            </HStack>
          </Box>

          <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor}>
            <HStack spacing={4}>
              <Icon as={FiTrendingDown} w={8} h={8} color="red.400" />
              <Box>
                <Text fontSize="sm" fontWeight="bold">Gastos</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {Number(kpi.gastos || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </Text>
              </Box>
            </HStack>
          </Box>

          <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor}>
            <HStack spacing={4}>
              <Icon as={FiTrendingUp} w={8} h={8} color="blue.400" />
              <Box>
                <Text fontSize="sm" fontWeight="bold">Balance</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {Number(kpi.balance || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </Text>
              </Box>
            </HStack>
          </Box>

          {/* Línea */}
          <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor} colSpan={3}>
            <Text fontSize="xl" fontWeight="bold" mb={4}>Ingresos vs Gastos</Text>
            <ResponsiveContainer width="100%" height={300} key={`lc-${renderKey}`}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="ingresos" stroke="#00e68f" strokeWidth={2} />
                <Line type="monotone" dataKey="gastos" stroke="#0099e6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          {/* Barras */}
          <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor}>
            <Text fontSize="xl" fontWeight="bold" mb={4}>Balances por Cuenta</Text>
            <ResponsiveContainer width="100%" height={250} key={`bc-${renderKey}`}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="balance" fill="#00e68f" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Pie */}
          <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor}>
            <Text fontSize="xl" fontWeight="bold" mb={4}>Distribución Ingresos/Gastos</Text>
            <ResponsiveContainer width="100%" height={250} key={`pc-${renderKey}`}>
              <RePieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </RePieChart>
            </ResponsiveContainer>
          </Box>
        </SimpleGrid>
      )}
    </>
  );
}
