/*import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../state/auth.js'
export function AppLayout(){
  const { user, logout } = useAuth(); const nav = useNavigate()
  return (
    <div>
      <header className="header-container">
        <nav className="nav">
          <strong>Previsión de Tesorería</strong>
          <NavLink to="/calendar">Calendario</NavLink>
          <NavLink to="/totals">Totales</NavLink>
          <NavLink to="/accounts">Cuentas</NavLink>
          <NavLink to="/import">Importar</NavLink>
          <NavLink to="/settings">Ajustes</NavLink>
          <NavLink to="/scenarios">Escenarios</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/cashflows">Flujos</NavLink>
        </nav>
        <div className='user'>
          <span>{user?.name}</span>
          <button className="btn" onClick={()=>{ logout(); nav('/login') }}>Salir</button>
        </div>
      </header>
      <main className="container"><Outlet/></main>
    </div>
  )
}
*/

import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Spacer,
  useColorMode,
  useDisclosure,
  VStack,
  Collapse,
  Button,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useAuth } from '../../state/auth.js';

export function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure();

  const pages = [
    { name: 'Calendario', path: '/calendar' },
    { name: 'Totales', path: '/totals' },
    { name: 'Cuentas', path: '/accounts' },
    { name: 'Importar', path: '/import' },
    { name: 'Ajustes', path: '/settings' },
    { name: 'Escenarios', path: '/scenarios' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Flujos', path: '/cashflows' },
  ];

  return (
    <Flex direction="column" minH="100vh">
      {/* Navbar */}
      <Flex as="header" bg="brand.500" color="white" p={4} align="center">
        <Box fontWeight="bold" fontSize="xl">Previsión de Tesorería</Box>
        <Spacer />

        {/* Desktop Links */}
        <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
          {pages.map(page => (
            <NavLink
              key={page.path}
              to={page.path}
              style={({ isActive }) => ({
                fontWeight: isActive ? 'bold' : 'normal',
                textDecoration: isActive ? 'underline' : 'none',
              })}
            >
              {page.name}
            </NavLink>
          ))}
          <IconButton
            aria-label="Toggle Theme"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            colorScheme="accent"
            size="sm"
          />
        </HStack>

        {/* Mobile Menu Button */}
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          aria-label="Open Menu"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          onClick={onToggle}
          ml={2}
        />

        <Spacer />

        {/* User Info */}
        <Box>
          <span>{user?.name}</span>
          <Button
            size="sm"
            ml={2}
            onClick={() => { logout(); nav('/login'); }}
          >
            Salir
          </Button>
        </Box>
      </Flex>

      {/* Mobile Menu Links */}
      <Collapse in={isOpen} animateOpacity>
        <VStack
          bg="brand.500"
          color="white"
          display={{ md: 'none' }}
          spacing={2}
          p={4}
        >
          {pages.map(page => (
            <NavLink
              key={page.path}
              to={page.path}
              onClick={onToggle} // Cierra el menú al hacer click
              style={({ isActive }) => ({
                fontWeight: isActive ? 'bold' : 'normal',
                textDecoration: isActive ? 'underline' : 'none',
                width: '100%',
                textAlign: 'center',
              })}
            >
              {page.name}
            </NavLink>
          ))}
          <Button
            size="sm"
            onClick={toggleColorMode}
            w="full"
            mt={2}
            colorScheme="accent"
          >
            {colorMode === 'light' ? 'Oscuro' : 'Claro'}
          </Button>
        </VStack>
      </Collapse>

      {/* Contenido principal */}
      <Box
        flex="1"
        p={6}
        bg={colorMode === 'light' ? 'neutral.50' : 'neutral.900'}
        color={colorMode === 'light' ? 'neutral.800' : 'neutral.100'}
      >
        <Outlet />
      </Box>

      {/* Footer */}
      <Box as="footer" bg="brand.500" color="white" p={4} textAlign="center">
        © 2025 Milugui
      </Box>
    </Flex>
  );
}
