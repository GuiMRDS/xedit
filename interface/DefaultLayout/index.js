/* eslint-disable no-unused-vars */

import { PageLayout, Header, Text } from "@primer/react";

export default function DefaultLayout({ children }) {
  return (
    <>
      <Header>
        <Header.Item full>
          <Header.Link href="/">Xedit</Header.Link>
        </Header.Item>
        <Header.Item>
          <Header.Link href="/login">Login</Header.Link>
        </Header.Item>
        <Header.Item>
          <Header.Link href="/cadastro">Cadastrar</Header.Link>
        </Header.Item>
      </Header>

      <PageLayout>
        <PageLayout.Content>{children}</PageLayout.Content>
        <PageLayout.Footer divider="line">
          <Text size="small">© {new Date().getFullYear()} Xedit</Text>
        </PageLayout.Footer>
      </PageLayout>
    </>
  );
}
