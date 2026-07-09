import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication";
import authorization from "infra/authorization";
import session from "models/session";

import { ForbiddenError } from "infra/errors";

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .post(controller.canRequest("create:session"), postHandler)
  .delete(deleteHandler)
  .handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValue = request.body;

  const authenticatedUser = await authentication.getUser(
    userInputValue.email,
    userInputValue.password,
  );

  if (!authorization.can(authenticatedUser, "create:session")) {
    throw new ForbiddenError({
      message: "Você não possui permissão para fazer login.",
      action: "Contate o suporte para caso tenha alguma dúvida.",
    });
  }

  const newSession = await session.create(authenticatedUser.id);
  controller.setSessionCookie(newSession.token, response);

  const secureOutputValues = authorization.filterOutput(
    authenticatedUser,
    "read:session",
    newSession,
  );

  return response.status(201).json(secureOutputValues);
}

async function deleteHandler(request, response) {
  const sessionToken = request.cookies.session_id;
  const userTryingDelete = request.context.user;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const expiredSession = await session.expireById(sessionObject.id);
  controller.clearSessionCookie(response);

  const secureOutputValues = authorization.filterOutput(
    userTryingDelete,
    "read:session",
    expiredSession,
  );

  return response.status(200).json(secureOutputValues);
}
