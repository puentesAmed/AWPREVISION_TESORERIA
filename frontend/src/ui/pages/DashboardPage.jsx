/*import React from 'react'
import { KpiCard } from '../components/KpiCard.jsx'
import { ForecastChart } from '../components/ForecastChart.jsx'

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
*/
/*
import React from 'react';
import { SimpleGrid, Box, Text, useColorModeValue } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function DashboardPage() {
  const cardBg = useColorModeValue('white', 'neutral.800');
  const cardColor = useColorModeValue('black', 'white');

  // Datos de ejemplo para la gráfica
  const data = [
    { name: 'Ene', ingresos: 4000, gastos: 2400 },
    { name: 'Feb', ingresos: 3000, gastos: 1398 },
    { name: 'Mar', ingresos: 2000, gastos: 9800 },
    { name: 'Abr', ingresos: 2780, gastos: 3908 },
    { name: 'May', ingresos: 1890, gastos: 4800 },
    { name: 'Jun', ingresos: 2390, gastos: 3800 },
    { name: 'Jul', ingresos: 3490, gastos: 4300 },
  ];

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      
      
      <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor}>
        <Text fontSize="xl" fontWeight="bold">Ingresos Mensuales</Text>
        <Text fontSize="3xl" mt={4}>$24,000</Text>
      </Box>

      
      <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor}>
        <Text fontSize="xl" fontWeight="bold">Gastos Mensuales</Text>
        <Text fontSize="3xl" mt={4}>$15,500</Text>
      </Box>

     
      <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor}>
        <Text fontSize="xl" fontWeight="bold">Balance</Text>
        <Text fontSize="3xl" mt={4}>$8,500</Text>
      </Box>

     
      <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor} colSpan={3}>
        <Text fontSize="xl" fontWeight="bold" mb={4}>Ingresos vs Gastos</Text>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="ingresos" stroke="#00e68f" strokeWidth={2} />
            <Line type="monotone" dataKey="gastos" stroke="#0099e6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

    </SimpleGrid>
  );
}
*/

import React from 'react';
import { SimpleGrid, Box, Text, useColorModeValue, HStack, Icon } from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart as RePieChart, Pie, Cell } from 'recharts';

export function DashboardPage() {
  const cardBg = useColorModeValue('white', 'neutral.800');
  const cardColor = useColorModeValue('black', 'white');

  // Datos para la gráfica de línea
  const lineData = [
    { month: 'Ene', ingresos: 4000, gastos: 2400 },
    { month: 'Feb', ingresos: 3000, gastos: 1398 },
    { month: 'Mar', ingresos: 2000, gastos: 9800 },
    { month: 'Abr', ingresos: 2780, gastos: 3908 },
    { month: 'May', ingresos: 1890, gastos: 4800 },
    { month: 'Jun', ingresos: 2390, gastos: 3800 },
    { month: 'Jul', ingresos: 3490, gastos: 4300 },
  ];

  // Datos para la gráfica de barras
  const barData = [
    { name: 'Cuenta A', balance: 4000 },
    { name: 'Cuenta B', balance: 3000 },
    { name: 'Cuenta C', balance: 2000 },
  ];

  // Datos para pie chart
  const pieData = [
    { name: 'Ingresos', value: 40000 },
    { name: 'Gastos', value: 25500 },
  ];

  const COLORS = ['#00e68f', '#0099e6'];

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>

      {/* KPI Cards */}
      <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor}>
        <HStack spacing={4}>
          <Icon as={FiDollarSign} w={8} h={8} color="green.400" />
          <Box>
            <Text fontSize="sm" fontWeight="bold">Ingresos Mensuales</Text>
            <Text fontSize="2xl" fontWeight="bold">$24,000</Text>
          </Box>
        </HStack>
      </Box>

      <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor}>
        <HStack spacing={4}>
          <Icon as={FiTrendingDown} w={8} h={8} color="red.400" />
          <Box>
            <Text fontSize="sm" fontWeight="bold">Gastos Mensuales</Text>
            <Text fontSize="2xl" fontWeight="bold">$15,500</Text>
          </Box>
        </HStack>
      </Box>

      <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor}>
        <HStack spacing={4}>
          <Icon as={FiTrendingUp} w={8} h={8} color="blue.400" />
          <Box>
            <Text fontSize="sm" fontWeight="bold">Balance</Text>
            <Text fontSize="2xl" fontWeight="bold">$8,500</Text>
          </Box>
        </HStack>
      </Box>

      {/* Line Chart */}
      <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor} colSpan={3}>
        <Text fontSize="xl" fontWeight="bold" mb={4}>Ingresos vs Gastos</Text>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="ingresos" stroke="#00e68f" strokeWidth={2} />
            <Line type="monotone" dataKey="gastos" stroke="#0099e6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Bar Chart */}
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

      {/* Pie Chart */}
      <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="md" color={cardColor}>
        <Text fontSize="xl" fontWeight="bold" mb={4}>Distribución Ingresos/Gastos</Text>
        <ResponsiveContainer width="100%" height={250}>
          <RePieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </RePieChart>
        </ResponsiveContainer>
      </Box>

    </SimpleGrid>
  );
}
