import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Spacer,
  VStack,
  Collapse,
  Button,
  Link as ChakraLink,
  useColorMode,
  useDisclosure,
  useColorModeValue,
  Text,
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

  // Colores dinámicos
  const bgNavbar = useColorModeValue('brand.100', 'neutral.500');
  const colorNavbar = useColorModeValue('black', 'white');
  const linkColor = useColorModeValue('gray.800', 'gray.200');
  const bgContent = useColorModeValue('neutral.50', 'neutral.900');
  const textContent = useColorModeValue('neutral.800', 'neutral.100');
  const bgButton = useColorModeValue('brand.500', 'accent.500');
  const colorButton = useColorModeValue('white', 'black');
  const hoverButton = useColorModeValue('brand.600', 'accent.600');
  const bgMobileMenu = useColorModeValue('brand.100', 'brand.500');
  const colorMobileMenu = useColorModeValue('black', 'white');

  return (
    <Flex direction="column" minH="100vh">
      {/* Navbar */}
      <Flex as="header" bg={bgNavbar} color={colorNavbar} p={4} align="center">
        <Box fontWeight="bold" fontSize="xl">Previsión de Tesorería</Box>
        <Spacer />

        {/* Desktop Links */}
        <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
          {pages.map(page => (
            <ChakraLink
              as={NavLink}
              key={page.path}
              to={page.path}
              color={linkColor}
              _hover={{ textDecoration: 'underline' }}
              style={({ isActive }) => ({
                fontWeight: isActive ? 'bold' : 'normal',
                textDecoration: isActive ? 'underline' : 'none',
              })}
            >
              {page.name}
            </ChakraLink>
          ))}
          <IconButton
            aria-label="Toggle Theme"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            size="sm"
            bg={bgButton}
            color={colorButton}
            _hover={{ bg: hoverButton }}
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
          <Text color={linkColor}>{user?.name}</Text>
          <Button
            size="sm"
            ml={2}
            bg={bgButton}
            color={colorButton}
            _hover={{ bg: hoverButton }}
            onClick={() => { logout(); nav('/login'); }}
          >
            Salir
          </Button>
        </Box>
      </Flex>

      {/* Mobile Menu Links */}
      <Collapse in={isOpen} animateOpacity>
        <VStack
          bg={bgMobileMenu}
          color={colorMobileMenu}
          display={{ md: 'none' }}
          spacing={2}
          p={4}
        >
          {pages.map(page => (
            <ChakraLink
              as={NavLink}
              key={page.path}
              to={page.path}
              onClick={onToggle}
              color={linkColor}
              width="100%"
              textAlign="center"
              _hover={{ textDecoration: 'underline' }}
              style={({ isActive }) => ({
                fontWeight: isActive ? 'bold' : 'normal',
                textDecoration: isActive ? 'underline' : 'none',
              })}
            >
              {page.name}
            </ChakraLink>
          ))}
          <Button
            size="sm"
            w="full"
            mt={2}
            bg={bgButton}
            color={colorButton}
            _hover={{ bg: hoverButton }}
            onClick={toggleColorMode}
          >
            {colorMode === 'light' ? 'Oscuro' : 'Claro'}
          </Button>
        </VStack>
      </Collapse>

      {/* Contenido principal */}
      <Box
        flex="1"
        p={6}
        bg={bgContent}
        color={textContent}
      >
        <Outlet /> {/* Aquí se renderizan las páginas individuales */}
      </Box>

      {/* Footer */}
      <Box as="footer" bg={bgNavbar} color={colorNavbar} p={4} textAlign="center">
        © 2025 Milugui
      </Box>
    </Flex>
  );
}
