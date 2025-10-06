import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { createForecast } from "@/api/forecastsService.js";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api.js";
import {
  Box,
  VStack,
  HStack,
  Button,
  Input,
  Select,
  useColorModeValue,
  Text
} from "@chakra-ui/react";

export function NewForecastModal({ date = null, onClose }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      date: date || "",
      amount: "",
      account: "",
      type: "out",
      category: "",
      counterparty: "",
      concept: "",
    },
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.get("/accounts").then((r) => r.data),
  });

  const { data: counterparties = [] } = useQuery({
    queryKey: ["counterparties"],
    queryFn: () => api.get("/counterparties").then((r) => r.data),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data),
  });

  useEffect(() => {
    if (date) reset((v) => ({ ...v, date }));
  }, [date, reset]);

  //const bgCard = useColorModeValue("neutral.100", "neutral.800");
  const inputBg = useColorModeValue("neutral.50", "neutral.700");
  const inputColor = useColorModeValue("neutral.800", "neutral.100");
  const placeholderColor = useColorModeValue("gray.400", "gray.500");
  const buttonBg = useColorModeValue("brand.500", "accent.500");
  const buttonColor = useColorModeValue("white", "black");
  const buttonHover = useColorModeValue("brand.600", "accent.600");
  const buttonSecondaryBg = useColorModeValue("neutral.300", "neutral.600");
  const buttonSecondaryHover = useColorModeValue("neutral.400", "neutral.500");

  const onSubmit = async (vals) => {
    const payload = {
      ...vals,
      amount: Number(vals.amount),
      date: vals.date ? new Date(vals.date).toISOString() : undefined,
      category: vals.category || undefined,
    };

    try {
      await createForecast(payload);
      onClose();
    } catch (err) {
      console.error("Error al crear forecast:", err.response?.data || err.message);
      alert("Error al crear forecast. Mira la consola para más detalles.");
    }
  };

  return (
    <Box
      position="fixed"
      inset={0}
      bg="rgba(0,0,0,0.5)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
    >
      <Box
        bg={useColorModeValue("whiteAlpha.700", "blackAlpha.700")}
        p={6}
        borderRadius="14px"
        w={{ base: "90%", md: 520 }}
      >
        <Text fontSize="xl" fontWeight="bold" mb={4}>Nuevo vencimiento</Text>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={3}>
            <Input
              type="date"
              bg={inputBg}
              color={inputColor}
              _placeholder={{ color: placeholderColor }}
              {...register("date", { required: true })}
            />
            <Select
              bg={inputBg}
              color={inputColor}
              placeholder="Cuenta"
              {...register("account", { required: true })}
            >
              {accounts.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.alias}
                </option>
              ))}
            </Select>
            <Select
              bg={inputBg}
              color={inputColor}
              placeholder="Proveedor"
              {...register("counterparty")}
            >
              {counterparties.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              step="0.01"
              placeholder="Importe"
              bg={inputBg}
              color={inputColor}
              _placeholder={{ color: placeholderColor }}
              {...register("amount", { required: true })}
            />
            <Select
              bg={inputBg}
              color={inputColor}
              {...register("type")}
            >
              <option value="out">Pago</option>
              <option value="in">Cobro</option>
            </Select>
            <Select
              bg={inputBg}
              color={inputColor}
              placeholder="Sin categoría"
              {...register("category")}
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
            <Input
              placeholder="Concepto"
              bg={inputBg}
              color={inputColor}
              _placeholder={{ color: placeholderColor }}
              {...register("concept")}
            />
          </VStack>

          <HStack mt={4} justifyContent="flex-end" spacing={3}>
            <Button
              type="button"
              bg={buttonSecondaryBg}
              _hover={{ bg: buttonSecondaryHover }}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              bg={buttonBg}
              color={buttonColor}
              _hover={{ bg: buttonHover }}
            >
              Guardar
            </Button>
          </HStack>
        </form>
      </Box>
    </Box>
  );
}
