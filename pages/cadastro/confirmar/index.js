/* eslint-disable no-unused-vars */

import { Banner } from "@primer/react";
import DefaultLayout from "interface/DefaultLayout";

export default function ConfirmRegistrerPage() {
  return (
    <DefaultLayout
      contentWidth="small"
      metadata={{
        title: "Confirmar seu email",
      }}
    >
      <Banner
        variant="warning"
        title="Falta só mais uma etapa!"
        description="Abra o email enviado pelo Xedit e clique no link de confirmação."
      />
    </DefaultLayout>
  );
}
