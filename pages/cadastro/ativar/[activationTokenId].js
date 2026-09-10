/* eslint-disable no-unused-vars */

import { Banner } from "@primer/react";
import DefaultLayout from "interface/DefaultLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ActivateUserPage() {
  const router = useRouter();
  const activationTokenId = router.query.activationTokenId;
  const [activationStatus, setActivationStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!activationTokenId) {
      return;
    }

    sendActivationRequest();

    async function sendActivationRequest() {
      try {
        const response = await fetch(
          `/api/v1/activations/${activationTokenId}`,
          {
            method: "PATCH",
            signal: AbortSignal.timeout(5000),
          },
        );

        const activationResponseBody = await response.json();

        if (
          response.status === 200 &&
          !activationResponseBody.alreadyActivated
        ) {
          setActivationStatus("success");
          return;
        }

        setErrorMessage(
          `${activationResponseBody.message} Não foi possível ativar o cadastro.`,
        );

        setActivationStatus("failure");
      } catch (error) {
        if (error.name === "TimeoutError") {
          console.error("O servidor demorou muito para responder");
        }
        setErrorMessage(
          "Houve uma falha de conexão com o servidor. Tente novamente mais tarde.",
        );
        setActivationStatus("failure");
      }
    }
  }, [activationTokenId]);

  return (
    <DefaultLayout
      contentWidth="small"
      metadata={{
        title: "Confirmar seu email",
      }}
    >
      {activationStatus === "loading" && (
        <Banner variant="info">
          <Banner.Title>Verificando Token...</Banner.Title>
        </Banner>
      )}

      {activationStatus === "failure" && (
        <Banner variant="critical">
          <Banner.Title>Não foi possivel ativar seu cadastro.</Banner.Title>
          <Banner.Description>{errorMessage}</Banner.Description>
        </Banner>
      )}

      {activationStatus === "success" && (
        <Banner variant="success">
          <Banner.Title>Cadastro ativado com sucesso!</Banner.Title>
          <Banner.Description>
            Sua conta está ativa e vc já pode fazer{" "}
            <a href="/login">fazer o login</a>
          </Banner.Description>
        </Banner>
      )}
    </DefaultLayout>
  );
}
