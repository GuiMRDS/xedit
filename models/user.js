import database from "infra/database";
import password from "models/password";
import { ValidationError, NotFoundError } from "infra/errors";

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username) {
    const result = await database.query({
      text: `
        SELECT  
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [username],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informando não foi encotrado no sistema.",
        action: "Verificque se o username está digitando corretamente.",
      });
    }

    return result.rows[0];
  }
}

async function create(userInputValue) {
  await validateUniqueEmail(userInputValue.email);
  await validateUniqueUsername(userInputValue.username);
  await hashPasswordInObject(userInputValue);

  const newUser = await runInsertQuery(userInputValue);
  return newUser;

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

async function update(username, userInputValue) {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValue) {
    await validateUniqueUsername(userInputValue.username);
  }

  if ("email" in userInputValue) {
    await validateUniqueEmail(userInputValue.email);
  }

  if ("password" in userInputValue) {
    await hashPasswordInObject(userInputValue);
  }

  const userWithNewValues = { ...currentUser, ...userInputValue };

  const updateUser = await runUpdateQuery(userWithNewValues);
  return updateUser;

  async function runUpdateQuery() {
    const result = await database.query({
      text: `
        UPDATE
          users
        SET
          username = $2,
          email = $3,
          password = $4,
          update_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      `,
      values: [
        userWithNewValues.id,
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
      ],
    });

    return result.rows[0];
  }
}

async function validateUniqueUsername(username) {
  const result = await database.query({
    text: `
    SELECT  
      username
    FROM
      users
    WHERE
      LOWER(username) = LOWER($1)
    ;`,
    values: [username],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizando.",
      action: "Ultilize outro username para realizar para esta operação.",
    });
  }
}

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
      message: "O email informado já está sendo utilizando.",
      action: "Ultilize outro email para realizar para esta operação.",
    });
  }
}

async function hashPasswordInObject(userInputValue) {
  const hashedPassword = await password.hash(userInputValue.password);
  userInputValue.password = hashedPassword;
}

const user = {
  create,
  findOneByUsername,
  update,
};

export default user;
