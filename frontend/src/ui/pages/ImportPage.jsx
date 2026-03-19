import React, { useState } from 'react';
import { api } from '@/lib/api.js';
import {
  Box, Heading, Text, Button, Input, Code, Stack,
  useColorModeValue, Alert, AlertIcon, Table, Thead, Tbody, Tr, Th, Td, Divider
} from '@chakra-ui/react';


export function ImportPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errMsg, setErrMsg] = useState('');

  const pageBg = useColorModeValue('neutral.50','neutral.900');
  const cardBg = useColorModeValue('white','neutral.800');
  const border = useColorModeValue('neutral.200','neutral.700');
  const subtle = useColorModeValue('neutral.600','neutral.300');

  const onUpload = async () => {
    if (!file) return;
    setLoading(true); setErrMsg(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/cashflows/import', fd);
      setResult(data);
    } catch (e) {
      setErrMsg(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const onChangeFile = (e) => {
    setFile(e.target.files?.[0] || null);
    setResult(null);
    setErrMsg('');
  };

  return (
    <Box bg={pageBg} minH="calc(100vh - 120px)" p={6}>
      <Box bg={cardBg} border="1px solid" borderColor={border} rounded="lg" p={6} maxW="720px">
        <Heading size="md" mb={4}>Importar vencimientos</Heading>

        <Stack direction={{ base: 'column', md: 'row' }} spacing={3} align="center" mb={2}>
          <Input type="file" accept=".csv,.xlsx,.xls" onChange={onChangeFile} />
          <Button onClick={onUpload} isLoading={loading} loadingText="Importando…" isDisabled={!file}>
            Importar
          </Button>
        </Stack>

        <Text fontSize="sm" color={subtle} mb={4}>
          Columnas: <Code>date</Code>, <Code>amount</Code>, <Code>type</Code> (<Code>in/out</Code>),
          <Code>account</Code>, <Code>counterparty</Code>, <Code>category</Code>, <Code>concept</Code>, <Code>status</Code>.
          La validación, la inversión de signo y la detección de duplicados se resuelven en backend durante la importación.
        </Text>

        {errMsg && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {errMsg}
          </Alert>
        )}

        {result && (
          <Box bg={useColorModeValue('neutral.100','neutral.700')} rounded="md" p={4} border="1px solid" borderColor={border}>
            <Heading size="sm" mb={2}>Importación completada</Heading>
            <Text>Nuevo(s): <b>{result.created}</b></Text>
            {'skipped' in result ? <Text>Omitidos por duplicado: <b>{result.skipped}</b></Text> : null}
            <Text>Errores: <b>{result.errorsCount}</b></Text>

            {Array.isArray(result.errors) && result.errors.length > 0 && (
              <>
                <Divider my={3} />
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Fila</Th>
                      <Th>Error</Th>
                      <Th>Valor</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {result.errors.map((e, idx) => (
                      <Tr key={idx}>
                        <Td>{e.row ?? '-'}</Td>
                        <Td>{e.error}</Td>
                        <Td>{e.value ?? '-'}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
