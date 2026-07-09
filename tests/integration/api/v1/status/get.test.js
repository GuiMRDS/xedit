import orchestrator from "../../../../orchestrator.js";

const { webserver } = orchestrator;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET to /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/status`);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      const parsedUpdateAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdateAt);

      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(responseBody.dependencies.database.open_connections).toEqual(1);
      expect(responseBody).toEqual({
        dependencies: {
          database: {
            max_connections: responseBody.dependencies.database.max_connections,
            open_connections:
              responseBody.dependencies.database.open_connections,
          },
        },
        updated_at: responseBody.updated_at,
      });
    });
  });

  describe("Default use user", () => {
    test("Retrieving current system status", async () => {
      const createUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createUser);

      const response = await fetch(`${webserver.origin}/api/v1/status`);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      const parsedUpdateAt = new Date(responseBody.updated_at).toISOString();

      expect(responseBody.updated_at).toEqual(parsedUpdateAt);
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(responseBody.dependencies.database.open_connections).toEqual(1);
      expect(responseBody).toEqual({
        dependencies: {
          database: {
            max_connections: responseBody.dependencies.database.max_connections,
            open_connections:
              responseBody.dependencies.database.open_connections,
          },
        },
        updated_at: responseBody.updated_at,
      });
    });
  });

  describe("Privileged user", () => {
    test("With `read:status:version`", async () => {
      const createdUser = await orchestrator.createUser({});
      const activatedUser = await orchestrator.activateUser(createdUser);

      await orchestrator.addFeaturesToUser(activatedUser, [
        "read:status",
        "read:status:version",
      ]);

      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      const parsedUpdateAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdateAt);

      expect(responseBody.dependencies.database.version).toEqual("16.13");
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(responseBody.dependencies.database.open_connections).toEqual(1);
      expect(responseBody).toEqual({
        dependencies: {
          database: {
            version: responseBody.dependencies.database.version,
            max_connections: responseBody.dependencies.database.max_connections,
            open_connections:
              responseBody.dependencies.database.open_connections,
          },
        },
        updated_at: responseBody.updated_at,
      });
    });
  });
});
