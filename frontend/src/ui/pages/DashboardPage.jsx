/*import React, { useEffect, useMemo, useState } from 'react';
import {
  SimpleGrid, Box, Text, useColorModeValue, HStack, Icon, Spinner,
  Select, Button, Flex
} from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { getAccountsBalance, getMonthlyCashflows, getSummary } from '@/api/dashboardService';
import { api } from '@/lib/api';

export function DashboardPage() {
  const cardBg = useColorModeValue('white', 'neutral.800');
  const cardColor = useColorModeValue('black', 'white');

  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState({ ingresos: 0, gastos: 0, balance: 0 });
  const [lineData, setLineData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const COLORS = ['#00e68f', '#0099e6'];

  // ---- filtros ----
  const [filters, setFilters] = useState({
    accountId: '',
    categoryId: '',
    month: '',  // 1..12
    year: '',   // 2025...
  });

  // ---- opciones de selects (globales) ----
  const [accountOptions, setAccountOptions] = useState([]);   // [{value,label}]
  const [categoryOptions, setCategoryOptions] = useState([]); // [{value,label}]

  // meses/años (meses fijos, años rango útil)
  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => {
      const label = new Date(0, i).toLocaleString('es-ES', { month: 'long' });
      return { value: String(i + 1), label: label[0].toUpperCase() + label.slice(1) };
    }),
    []
  );

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    // Ventana [-3, +3]. Cambia si quieres más.
    return Array.from({ length: 7 }, (_, k) => String(y - 3 + k))
      .map(v => ({ value: v, label: v }));
  }, []);

  // ---- cargar opciones globales para selects ----
  useEffect(() => {
    (async () => {
      try {
        const [{ data: accs }, { data: cats }] = await Promise.all([
          api.get('/accounts/distinct'),   // {_id, alias|name}
          api.get('/categories/distinct'), // {_id, name}
        ]);
        setAccountOptions(
          (accs || []).map(a => ({
            value: String(a._id),
            label: a.alias || a.name || `Cuenta ${a._id}`,
          })).sort((a,b)=>a.label.localeCompare(b.label,'es'))
        );
        setCategoryOptions(
          (cats || []).map(c => ({
            value: String(c._id),
            label: c.name || `Categoría ${c._id}`,
          })).sort((a,b)=>a.label.localeCompare(b.label,'es'))
        );
      } catch (e) {
        // silencioso
      }
    })();
  }, []);

  // ---- cargar datos con filtros ----
  async function loadData(f) {
    setLoading(true);
    try {
      const [accRes, flowRes, sumRes] = await Promise.allSettled([
        getAccountsBalance(f),
        getMonthlyCashflows(f),
        getSummary(f),
      ]);

      const acc = accRes.status === 'fulfilled' ? accRes.value : null;
      const flow = flowRes.status === 'fulfilled' ? (flowRes.value || []) : [];
      const sum  = sumRes.status === 'fulfilled'  ? sumRes.value : null;

      const k = acc?.kpi ?? { ingresos: 0, gastos: 0, balance: 0 };
      setKpi(k);
      setBarData(acc?.accounts ?? []);      // [{name, balance}]
      setLineData(flow ?? []);              // [{month, ingresos, gastos}]

      const pie = sum && typeof sum.ingresos === 'number' && typeof sum.gastos === 'number'
        ? [{ name:'Ingresos', value: sum.ingresos }, { name:'Gastos', value: sum.gastos }]
        : [{ name:'Ingresos', value: k.ingresos },   { name:'Gastos', value: k.gastos }];
      setPieData(pie);
    } catch (e) {
      console.error('Dashboard error:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(filters); }, [filters]);

  // ---- UI ----
  return (
    <>
      
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
              {accountOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
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
              {categoryOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
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
              {monthOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
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
              {yearOptions.map(y => (
                <option key={y.value} value={y.value}>{y.label}</option>
              ))}
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

          
          <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor} colSpan={3}>
            <Text fontSize="xl" fontWeight="bold" mb={4}>Ingresos vs Gastos</Text>
            <ResponsiveContainer width="100%" height={300}>
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

         
          <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor}>
            <Text fontSize="xl" fontWeight="bold" mb={4}>Balances por Cuenta</Text>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="balance" fill="#00e68f" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          
          <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor}>
            <Text fontSize="xl" fontWeight="bold" mb={4}>Distribución Ingresos/Gastos</Text>
            <ResponsiveContainer width="100%" height={250}>
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
*/

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
import { getAccountsBalance, getMonthlyCashflows, getSummary } from '@/api/dashboardService';
import { api } from '@/lib/api';

// ---- mapea filtros a params compatibles con distintos backends ----
const mapFiltersToParams = (f = {}) => {
  const out = {};
  if (f.accountId) { out.accountId = f.accountId; out.account = f.accountId; }
  if (f.categoryId) { out.categoryId = f.categoryId; out.category = f.categoryId; }
  if (f.month) {
    const m = Number(f.month);
    if (!Number.isNaN(m)) { out.month = m; out.mm = m; }
  }
  if (f.year) {
    const y = Number(f.year);
    if (!Number.isNaN(y)) { out.year = y; out.yyyy = y; }
  }
  return out;
};

// ---- fallback: si el servicio no aplica filtros, forzamos request con params ----
async function safeGetAccountsBalance(filters) {
  try {
    const res = await getAccountsBalance(filters);
    return res;
  } catch {
    const { data } = await api.get('/dashboard/accounts-balance', { params: mapFiltersToParams(filters) });
    return data;
  }
}
async function safeGetMonthlyCashflows(filters) {
  try {
    const res = await getMonthlyCashflows(filters);
    return res;
  } catch {
    const { data } = await api.get('/dashboard/monthly', { params: mapFiltersToParams(filters) });
    return data;
  }
}
async function safeGetSummary(filters) {
  try {
    const res = await getSummary(filters);
    return res;
  } catch {
    const { data } = await api.get('/dashboard/summary', { params: mapFiltersToParams(filters) });
    return data;
  }
}

export function DashboardPage() {
  const cardBg = useColorModeValue('white', 'neutral.800');
  const cardColor = useColorModeValue('black', 'white');

  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState({ ingresos: 0, gastos: 0, balance: 0 });
  const [lineData, setLineData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const COLORS = ['#00e68f', '#0099e6'];

  // ---- filtros ----
  const [filters, setFilters] = useState({
    accountId: '',
    categoryId: '',
    month: '',  // 1..12
    year: '',   // 2025...
  });

  // ---- opciones de selects (globales) ----
  const [accountOptions, setAccountOptions] = useState([]);   // [{value,label}]
  const [categoryOptions, setCategoryOptions] = useState([]); // [{value,label}]

  // meses/años
  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => {
      const label = new Date(0, i).toLocaleString('es-ES', { month: 'long' });
      return { value: String(i + 1), label: label[0].toUpperCase() + label.slice(1) };
    }),
    []
  );

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, k) => String(y - 3 + k))
      .map(v => ({ value: v, label: v }));
  }, []);

  // ---- cargar opciones globales para selects ----
  useEffect(() => {
    (async () => {
      try {
        const [{ data: accs }, { data: cats }] = await Promise.all([
          api.get('/accounts'),    // ya lo tienes
          api.get('/categories'),  // ya lo tienes
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
      } catch (e) {
        console.warn('No se pudieron cargar cuentas/categorías', e);
      }
    })();
  }, []);


  // ---- cargar datos con filtros ----
  async function loadData(f) {
    setLoading(true);
    const params = mapFiltersToParams(f);
    console.debug('[Dashboard] filtros -> params', params);
    try {
      const [accRes, flowRes, sumRes] = await Promise.all([
        safeGetAccountsBalance(f),
        safeGetMonthlyCashflows(f),
        safeGetSummary(f),
      ]);

      const k = accRes?.kpi ?? { ingresos: 0, gastos: 0, balance: 0 };
      setKpi(k);
      setBarData(Array.isArray(accRes?.accounts) ? accRes.accounts : []); // [{name, balance}]
      setLineData(Array.isArray(flowRes) ? flowRes : []);                 // [{month, ingresos, gastos}]

      const pie = (sumRes && typeof sumRes.ingresos === 'number' && typeof sumRes.gastos === 'number')
        ? [{ name:'Ingresos', value: sumRes.ingresos }, { name:'Gastos', value: sumRes.gastos }]
        : [{ name:'Ingresos', value: k.ingresos }, { name:'Gastos', value: k.gastos }];
      setPieData(pie);
    } catch (e) {
      console.error('Dashboard error:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(filters); }, [filters]);

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
              {accountOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
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
              {categoryOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
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
              {monthOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
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
              {yearOptions.map(y => (
                <option key={y.value} value={y.value}>{y.label}</option>
              ))}
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
            <ResponsiveContainer width="100%" height={300}>
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
            <ResponsiveContainer width="100%" height={250}>
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
            <ResponsiveContainer width="100%" height={250}>
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
