import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import activation from "models/activation";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValue = request.body;
  const newUser = await user.create(userInputValue);

  // 1. Criar o Token de ativação
  const activationToken = await activation.create(newUser.id);
  // 2. Enviar esse Token por Email
  await activation.sendEmailToUser(newUser, activationToken);

  return response.status(201).json(newUser);
}
