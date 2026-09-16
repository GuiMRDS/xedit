/* eslint-disable no-unused-vars */
import useSWR from "swr";
import DefaultLayout from "interface/DefaultLayout";
import { Banner, Heading, Stack } from "@primer/react";
import { Card } from "@primer/react/experimental";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <DefaultLayout contentWidth="medium" metadata={{ title: "Status" }}>
      <Stack gap={"spacious"}>
        <Heading as="h1">Status</Heading>
        <DatabaseStatus />
        <UpdatedAt />
      </Stack>
    </DefaultLayout>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return (
    <Banner variant="info" layout="compact">
      <Banner.Title>Última atualização: {updatedAtText} </Banner.Title>
    </Banner>
  );
}

function DatabaseStatus() {
  const { isLoading, data, error } = useSWR("/api/v1/status", fetchAPI);

  if (error) {
    return (
      <Banner variant="critical">
        <Banner.Title>Erro ao carregar dados.</Banner.Title>
        <Banner.Description>{error.message}</Banner.Description>
      </Banner>
    );
  }

  if (isLoading || !data) {
    return;
  }

  const database = data.dependencies.database;
  const openedConnections = database.open_connections;
  const maxConnections = database.max_connections;
  const versionDB = database.version ?? "-";

  return (
    <Stack>
      <Heading as="h2" variant="medium">
        DataBase
      </Heading>
      <Stack direction={{ narrow: "vertical", regular: "horizontal" }}>
        <Stack.Item grow>
          <Card>
            <Card.Heading>Conexões Abertas</Card.Heading>
            <Card.Description>{openedConnections}</Card.Description>
            <Card.Metadata>Uso neste instante</Card.Metadata>
          </Card>
        </Stack.Item>
        <Stack.Item grow>
          <Card>
            <Card.Heading>Conexões Máximas</Card.Heading>
            <Card.Description>{maxConnections}</Card.Description>
            <Card.Metadata>Conexões disponiveis</Card.Metadata>
          </Card>
        </Stack.Item>
        <Stack.Item grow>
          <Card>
            <Card.Heading>PostgreSQL</Card.Heading>
            <Card.Description>{versionDB}</Card.Description>
            <Card.Metadata>Versão em execulção</Card.Metadata>
          </Card>
        </Stack.Item>
      </Stack>
    </Stack>
  );
}
