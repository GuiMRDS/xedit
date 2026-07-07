import orchestrator from "../../../../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST to /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving pending migrations", async () => {
      const response = await fetch("http://localhost:3000/api/v1/user");
      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação.",
        action: `Verifique se o seu usuário possui a feature "read:session"`,
        statusCode: 403,
      });
    });
  });

  describe("Default user", () => {
    test("Retrieving pending migrations", async () => {
      const createUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createUser);
      const sessionObject = await orchestrator.createSession(createUser.id);

      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação.",
        action: 'Verifique se o seu usuário possui a feature "read:migration"',
        statusCode: 403,
      });
    });
  });

  describe("Privileged user", () => {
    test("With `create:migration`", async () => {
      const createdUser = await orchestrator.createUser({});
      const activatedUser = await orchestrator.activateUser(createdUser);
      await orchestrator.addFeaturesToUser(createdUser, ["create:migration"]);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(Array.isArray(responseBody)).toBe(true);
    });
  });
});
