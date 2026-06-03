/* eslint-disable no-unused-vars */
import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <br />
      <h2>DataBase</h2>
      <DatabaseStatus />
    </>
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

  return <div>Última atualização: {updatedAtText} </div>;
}

function DatabaseStatus() {
  const { isLoading, data, error } = useSWR("/api/v1/status", fetchAPI);

  let databaseStatus = "Carregando...";

  if (error) {
    databaseStatus = <div>Erro ao carregar dados.</div>;
  } else if (!isLoading && data) {
    databaseStatus = (
      <>
        <div>
          Versão do banco de dados: {data.dependencies.database.version}
        </div>
        <div>
          Máximo de conexões: {data.dependencies.database.max_connections}
        </div>
        <div>
          Conexões abertas: {data.dependencies.database.opened_connections}
        </div>
      </>
    );
  }

  return databaseStatus;
}
