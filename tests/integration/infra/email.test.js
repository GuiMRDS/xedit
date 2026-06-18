import email from "infra/email.js";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("Send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "Xedit <contato@xedit.com.br>",
      to: "contato@gmail.com",
      subject: "Teste de assunto",
      text: "Teste de corpo.",
    });
    await email.send({
      from: "Xedit <contato@xedit.com.br>",
      to: "contato@gmail.com",
      subject: "Último email enviado.",
      text: "Corpo do ultimo email.",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<contato@xedit.com.br>");
    expect(lastEmail.recipients[0]).toBe("<contato@gmail.com>");
    expect(lastEmail.subject).toBe("Último email enviado.");
    expect(lastEmail.text).toBe("Corpo do ultimo email.\n");
  });
});
