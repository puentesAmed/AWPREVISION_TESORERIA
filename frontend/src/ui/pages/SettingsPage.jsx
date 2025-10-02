/*import React from "react"

export function SettingsPage() {
  return (
    <div className="page">
      <h1 className="page-title">Configuración</h1>
      <p className="page-subtitle">Personaliza la aplicación a tus necesidades.</p>

      <div className="card form-card">
        <label>Tema de la interfaz</label>
        <select className="input">
          <option>Claro</option>
          <option>Oscuro</option>
        </select>

        <label className="mt-4">Moneda base</label>
        <select className="input">
          <option>EUR (€)</option>
          <option>USD ($)</option>
          <option>GBP (£)</option>
        </select>

        <button className="btn mt-6">Guardar Cambios</button>
      </div>
    </div>
  )
}
*/
import React from "react";
import { Box, Heading, Text, Select, Button, useColorMode } from "@chakra-ui/react";

export function SettingsPage() {
  const { colorMode, toggleColorMode } = useColorMode();

  const handleThemeChange = (e) => {
    if (e.target.value === "Oscuro" && colorMode !== "dark") toggleColorMode();
    if (e.target.value === "Claro" && colorMode !== "light") toggleColorMode();
  };

  return (
    <Box p={6}>
      <Heading mb={2}>Configuración</Heading>
      <Text mb={6}>Personaliza la aplicación a tus necesidades.</Text>

      <Box p={6} borderRadius="md" shadow="md" bg={colorMode === "light" ? "gray.100" : "gray.700"}>
        <Text mb={2}>Tema de la interfaz</Text>
         <Select value={colorMode === "light" ? "Claro" : "Oscuro"} onChange={handleThemeChange}>
            <option>Claro</option>
            <option>Oscuro</option>
         </Select>

        <Text mb={2}>Moneda base</Text>
        <Select mb={4}>
          <option>EUR (€)</option>
          <option>USD ($)</option>
          <option>GBP (£)</option>
        </Select>

        <Button colorScheme="blue">Guardar Cambios</Button>
      </Box>
    </Box>
  );
}
