import email from "infra/email";
import database from "infra/database";
import webServer from "infra/webserver";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          *
      ;`,
      values: [userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function findOndeByUserId(userId) {
  const newToken = await runInsertQuery(userId);
  return newToken;

  async function runInsertQuery(userId) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          user_id = $1
        LIMIT
          1
      ;`,
      values: [userId],
    });

    return results.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "Xedit <contato@Xedit.com.br>",
    to: user.email,
    subject: "Ative seu cadastro no Xedit!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro no Xedit
    
${webServer.origin}/cadastro/ativar/${activationToken.id}
    
Atenciosamente,
Equipe Xedit`,
  });
}

const activation = {
  sendEmailToUser,
  create,
  findOndeByUserId,
};

export default activation;
