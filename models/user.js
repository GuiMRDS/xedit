import database from "infra/database";
import { ValidationError } from "infra/errors";

async function create(userInputValue) {
  await validateUniqueEmail(userInputValue.email);

  const newUser = await runInsertQuery(userInputValue);
  return newUser;

  async function validateUniqueEmail(email) {
    const result = await database.query({
      text: `
    SELECT  
      email
    FROM
      users
    WHERE
      LOWER(email) = LOWER($1)
    ;`,
      values: [email],
    });

    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "O email informando já estpa sendo utilizando.",
        action: "Ultilize outro email para realizar o cadastro do usuario.",
      });
    }
  }

  async function runInsertQuery() {
    const result = await database.query({
      text: `
    INSERT INTO 
      users (username, email, password) 
    VALUES 
      ($1, $2, $3)
    RETURNING
      *
    ;`,
      values: [
        userInputValue.username,
        userInputValue.email,
        userInputValue.password,
      ],
    });
    return result.rows[0];
  }
}

const user = { create };

export default user;
