import crypto from "node:crypto";
import database from "infra/database";
import { UnauthorizedError } from "infra/errors";

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000;

async function findOneValidByToken(sessionToken) {
  const sessionFound = await runSelectQuery(sessionToken);

  return sessionFound;

  async function runSelectQuery(sessionToken) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          sessions
        WHERE
          token = $1
          AND expires_at > NOW()  
        LIMIT
          1
      `,
      values: [sessionToken],
    });

    if (results.rowCount === 0) {
      throw new UnauthorizedError({
        message: "Usuario não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
      });
    }

    return results.rows[0];
  }
}

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expires_at = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newSession = await runInsertQuery(token, userId, expires_at);
  return newSession;

  async function runInsertQuery(token, userId, expires_at) {
    const results = await database.query({
      text: `
        INSERT INTO
          sessions (token, user_id, expires_at)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
      `,
      values: [token, userId, expires_at],
    });

    return results.rows[0];
  }
}

async function renew(sessionId) {
  const expires_at = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const renewedSessionObject = await runUpdateQuery(sessionId, expires_at);
  return renewedSessionObject;

  async function runUpdateQuery(sessionId, expires_at) {
    const results = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = $1,
          updated_at = NOW()
        WHERE
          id = $2
        RETURNING
          *
      ;`,
      values: [expires_at, sessionId],
    });

    return results.rows[0];
  }
}

async function expireById(sessionId) {
  const expiredSessionObject = await runUpdateQuery(sessionId);
  return expiredSessionObject;

  async function runUpdateQuery(sessionId) {
    const results = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = expires_at - interval '1 year',
          updated_at =  NOW()
        WHERE
          id = $1
        RETURNING
          *
        ;`,
      values: [sessionId],
    });

    return results.rows[0];
  }
}

const session = {
  create,
  renew,
  findOneValidByToken,
  expireById,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
