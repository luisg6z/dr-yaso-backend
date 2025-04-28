import { Router } from "express";
import { validate } from "../middleware/validate";
import { createUserSchema, updateUserSchema } from "./users.schema";
import { createUserHandler, deleteUserHandler, getAllUsersHandler, getUserByIdHandler, updateUserHandler } from "./users.controller";
import { authorize } from "../auth/middlewares/authorize.middleware";
import { authenticate } from "../auth/middlewares/auth.middleware";
import { tipoUsuarioEnum } from "../db/schemas/Usuarios";


const usersRouter = Router();

usersRouter.post("/",authenticate, authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]), validate(createUserSchema), createUserHandler)
usersRouter.get("/", authenticate, authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[1], tipoUsuarioEnum.enumValues[3]]), getAllUsersHandler);
usersRouter.get("/:id", authenticate, authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[1], tipoUsuarioEnum.enumValues[3]]), getUserByIdHandler);
usersRouter.patch("/:id", authenticate, authorize([tipoUsuarioEnum.enumValues[0]]), validate(updateUserSchema), updateUserHandler);
usersRouter.delete("/:id", authenticate, authorize([tipoUsuarioEnum.enumValues[0]]), deleteUserHandler);

export default usersRouter;