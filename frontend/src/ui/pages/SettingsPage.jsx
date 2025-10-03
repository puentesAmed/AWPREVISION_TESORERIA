// src/ui/pages/SettingsPage/SettingsPage.jsx
import React, { useRef, useState } from "react";
import {
  Box, Heading, Text, Select, Button, useColorMode,
  useToast, AlertDialog, AlertDialogBody, AlertDialogFooter,
  AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
  Stack, Divider
} from "@chakra-ui/react";
import { clearAllCashflows } from "@/api/forecastsService.js";

export function SettingsPage() {
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const cancelRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleThemeChange = (e) => {
    const v = e.target.value;
    if (v === "Oscuro" && colorMode !== "dark") toggleColorMode();
    if (v === "Claro" && colorMode !== "light") toggleColorMode();
  };

  const handleClearAll = async () => {
    setBusy(true);
    try {
      const res = await clearAllCashflows();
      toast({
        title: "Vencimientos eliminados",
        description: `Se eliminaron ${res.deleted ?? 0} registros.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "No se pudieron borrar los vencimientos.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error(e);
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  return (
    <Box p={6}>
      <Heading mb={2}>Configuración</Heading>
      <Text mb={6}>Personaliza la aplicación a tus necesidades.</Text>

      <Stack spacing={6}>
        {/* Preferencias UI */}
        <Box p={6} borderRadius="md" shadow="md" bg={colorMode === "light" ? "gray.100" : "gray.700"}>
          <Heading size="sm" mb={4}>Preferencias de interfaz</Heading>

          <Text mb={2}>Tema de la interfaz</Text>
          <Select
            value={colorMode === "light" ? "Claro" : "Oscuro"}
            onChange={handleThemeChange}
            mb={4}
            maxW="280px"
          >
            <option>Claro</option>
            <option>Oscuro</option>
          </Select>

          <Text mb={2}>Moneda base</Text>
          <Select mb={6} maxW="280px">
            <option>EUR (€)</option>
            <option>USD ($)</option>
            <option>GBP (£)</option>
          </Select>

          <Button colorScheme="blue">Guardar Cambios</Button>
        </Box>

        {/* Acciones peligrosas */}
        <Box p={6} borderRadius="md" shadow="md" bg={colorMode === "light" ? "gray.100" : "gray.700"}>
          <Heading size="sm" mb={4}>Acciones</Heading>
          <Text mb={2} color="gray.300">Vencimientos</Text>
          <Text fontSize="sm" mb={4} color="gray.400">
            Borra todos los vencimientos del calendario. Esta acción no se puede deshacer.
          </Text>

          <Divider mb={4} opacity={0.3} />

          <Button
            colorScheme="red"
            variant="solid"
            onClick={() => setConfirmOpen(true)}
            isLoading={busy}
          >
            Borrar TODOS los vencimientos
          </Button>
        </Box>
      </Stack>

      {/* Diálogo de confirmación */}
      <AlertDialog
        isOpen={confirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => !busy && setConfirmOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirmar borrado masivo
            </AlertDialogHeader>

            <AlertDialogBody>
              Vas a eliminar <b>todos</b> los vencimientos. ¿Seguro que quieres continuar?
              Esta acción es irreversible.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setConfirmOpen(false)} disabled={busy}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleClearAll} ml={3} isLoading={busy}>
                Sí, borrar todo
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
