/*
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";

import { useAuth } from "../../state/auth.js";
import { api } from "../../lib/api.js";

const schema = z.object({
  email: z.string().email("Formato de email no válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export function LoginPage() {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
  });
  const { errors, isSubmitting } = formState;

  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const cardBg = useColorModeValue("white", "neutral.800");
  const border = useColorModeValue("neutral.200", "neutral.700");
  const btnBg = useColorModeValue("brand.500", "accent.500");
  const btnHover = useColorModeValue("brand.600", "accent.600");
  const btnColor = useColorModeValue("white", "black");

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post("/auth/login", values);
      // data: { user, token }
      login(data.user, data.token);
      nav(loc.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error", err);
      alert("Credenciales incorrectas");
    }
  };

  return (
    <Box
      maxW="420px"
      mx="auto"
      mt={12}
      p={6}
      bg={cardBg}
      border="1px solid"
      borderColor={border}
      rounded="lg"
      boxShadow={useColorModeValue("sm", "none")}
    >
      <Heading as="h2" size="lg" mb={6} textAlign="center">
        Iniciar sesión
      </Heading>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="tucorreo@dominio.com"
              autoComplete="email"
              autoFocus
              {...register("email")}
            />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.password}>
            <FormLabel>Contraseña</FormLabel>
            <Input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            bg={btnBg}
            color={btnColor}
            _hover={{ bg: btnHover }}
            isLoading={isSubmitting}
            loadingText="Accediendo"
            width="full"
          >
            Entrar
          </Button>
        </VStack>
      </form>
    </Box>
  );
}

export default LoginPage;
*/

// src/ui/pages/LoginPage.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  useColorModeValue,
  VStack,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

import { useAuth } from "../../state/auth.js";
import { api } from "../../lib/api.js";

const schema = z.object({
  email: z.string().email("Formato de email no válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export function LoginPage() {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
  });
  const { errors, isSubmitting } = formState;

  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const [showPwd, setShowPwd] = React.useState(false);

  const cardBg = useColorModeValue("white", "neutral.800");
  const border = useColorModeValue("neutral.200", "neutral.700");
  const btnBg = useColorModeValue("brand.500", "accent.500");
  const btnHover = useColorModeValue("brand.600", "accent.600");
  const btnColor = useColorModeValue("white", "black");

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post("/auth/login", values);
      login(data.user, data.token);
      nav(loc.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error", err);
      alert("Credenciales incorrectas");
    }
  };

  return (
    <Box
      maxW="420px"
      mx="auto"
      mt={12}
      p={6}
      bg={cardBg}
      border="1px solid"
      borderColor={border}
      rounded="lg"
      boxShadow={useColorModeValue("sm", "none")}
    >
      <Heading as="h2" size="lg" mb={6} textAlign="center">
        Iniciar sesión
      </Heading>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="tucorreo@dominio.com"
              autoComplete="email"
              autoFocus
              {...register("email")}
            />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.password}>
            <FormLabel>Contraseña</FormLabel>
            <InputGroup>
              <Input
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
              />
              <InputRightElement width="3rem">
                <IconButton
                  aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPwd((s) => !s)}
                  icon={showPwd ? <ViewOffIcon /> : <ViewIcon />}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            bg={btnBg}
            color={btnColor}
            _hover={{ bg: btnHover }}
            isLoading={isSubmitting}
            loadingText="Accediendo"
            width="full"
          >
            Entrar
          </Button>
        </VStack>
      </form>
    </Box>
  );
}

export default LoginPage;
