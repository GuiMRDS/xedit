/* eslint-disable no-unused-vars */

import { useState } from "react";
import { Button } from "@primer/react";
import DefaultLayout from "interface/DefaultLayout";
import { Description } from "node_modules/@primer/react/dist/Blankslate/Blankslate";

export default function RegisterPage() {
  console.log("Render do <RegisterPage>");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const resquestBody = { username, email, password };

    const response = await fetch("/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resquestBody),
    });

    if (response.status === 201) {
      location.href = "/cadastro/confirmar";
    }
  }

  return (
    <DefaultLayout
      metadata={{
        title: "Cadastro",
        description: "Crie sua conta de forma gratuita.",
      }}
    >
      <h1>Cadastro</h1>

      <form onSubmit={handleSubmit}>
        <div>
          Nome do usuário:{" "}
          <input
            type="text"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
        </div>
        <div>
          Email:{" "}
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
        </div>
        <div>
          Senha:{" "}
          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
        </div>

        <button type="submit">Criar Cadastro</button>
      </form>
    </DefaultLayout>
  );
}
