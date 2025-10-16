import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '@/api/accountsService.js';
import { useForm } from 'react-hook-form';
import {
  Box, Heading, Button, Input, useColorModeValue, Stack, FormControl, FormLabel,
  Table, Thead, Tbody, Tr, Th, Td, HStack, Spinner, Text
} from '@chakra-ui/react';

const toHexSafe = (c) => {
  const v = String(c || '').toUpperCase();
  return /^#[0-9A-F]{6}$/.test(v) ? v : null;
};

export function AccountsPage() {
  const qc = useQueryClient();

  // tokens del tema
  const pageBg   = useColorModeValue('neutral.50','neutral.900');
  const cardBg   = useColorModeValue('white','neutral.800');
  const border   = useColorModeValue('neutral.200','neutral.700');
  const subtle   = useColorModeValue('neutral.600','neutral.300');

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { alias: '', bank: '', number: '', initialBalance: 0, color: '#2563EB' },
  });

  const createMut = useMutation({
    mutationFn: createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateAccount(id, payload),
    onMutate: async ({ id, payload }) => {
      await qc.cancelQueries({ queryKey: ['accounts'] });
      const prev = qc.getQueryData(['accounts']);
      qc.setQueryData(['accounts'], (old = []) =>
        old.map(a => (a._id === id ? { ...a, ...payload } : a))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['accounts'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });

  const onSubmit = (vals) => {
    const color = toHexSafe(vals.color) || undefined;
    createMut.mutate({ ...vals, color }, { onSuccess: () => reset() });
  };

  const onColorChange = (a, color) => {
    const hex = toHexSafe(color);
    if (!hex) return;
    updateMut.mutate({ id: a._id, payload: { color: hex } });
  };

  if (isLoading) {
    return (
      <Box bg={pageBg} minH="calc(100vh - 120px)" p={6} display="grid" placeItems="center">
        <HStack>
          <Spinner />
          <Text color={subtle}>Cargando…</Text>
        </HStack>
      </Box>
    );
  }

  return (
    <Box bg={pageBg} minH="calc(100vh - 120px)" p={6}>
      {/* Nueva cuenta */}
      <Box bg={cardBg} border="1px solid" borderColor={border} rounded="lg" p={6} mb={6}>
        <Heading size="md" mb={4}>Nueva cuenta</Heading>
        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb={4}>
            <FormControl isRequired>
              <FormLabel>Alias</FormLabel>
              <Input placeholder="Alias" {...register('alias', { required: true })} />
            </FormControl>
            <FormControl>
              <FormLabel>Banco</FormLabel>
              <Input placeholder="Banco" {...register('bank')} />
            </FormControl>
            <FormControl>
              <FormLabel>Número</FormLabel>
              <Input placeholder="Número" {...register('number')} />
            </FormControl>
            <FormControl>
              <FormLabel>Saldo inicial</FormLabel>
              <Input type="number" step="0.01" placeholder="0,00" {...register('initialBalance', { valueAsNumber: true })} />
            </FormControl>
            <FormControl>
              <FormLabel>Color</FormLabel>
              <Input type="color" p={0} h="40px" {...register('color')} />
            </FormControl>
          </Stack>
          <Button type="submit" isLoading={createMut.isPending}>Guardar</Button>
        </Box>
      </Box>

      {/* Listado */}
      <Box bg={cardBg} border="1px solid" borderColor={border} rounded="lg" p={6}>
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th>Color</Th>
              <Th>Alias</Th>
              <Th>Banco</Th>
              <Th>Número</Th>
              <Th isNumeric>Saldo inicial</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {accounts.map(a => (
              <Tr key={a._id}>
                <Td>
                  <HStack>
                    <Box
                      title={a.color || '#999999'}
                      w="18px" h="18px" rounded="md"
                      border="1px solid" borderColor={border}
                      bg={a.color || '#999999'}
                    />
                    <Input
                      type="color"
                      value={/^#[0-9a-fA-F]{6}$/.test(a.color || '') ? a.color : '#999999'}
                      onChange={(e) => onColorChange(a, e.target.value)}
                      w="44px" h="32px" p={0} border="none" bg="transparent" cursor="pointer"
                    />
                  </HStack>
                </Td>
                <Td>{a.alias}</Td>
                <Td>{a.bank || '—'}</Td>
                <Td>{a.number || '—'}</Td>
                <Td isNumeric>
                  {(a.initialBalance || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </Td>
                <Td>
                  <HStack justify="flex-end">
                    <Button
                      variant="ghost"
                      onClick={() => updateMut.mutate({ id: a._id, payload: { alias: a.alias + '*' } })}
                      isLoading={updateMut.isPending}
                    >
                      Renombrar *
                    </Button>
                    <Button
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => deleteMut.mutate(a._id)}
                      isLoading={deleteMut.isPending}
                    >
                      Eliminar
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
