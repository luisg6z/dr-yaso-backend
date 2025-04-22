import { Router } from "express";
import { validate } from "../middleware/validate";
import { createUserSchema, updateUserSchema } from "./users.schema";
import { createUserHandler, deleteUserHandler, getAllUsersHandler, getUserByIdHandler, updateUserHandler } from "./users.controller";


const usersRouter = Router();

usersRouter.post("/", validate(createUserSchema), createUserHandler)
usersRouter.get("/", getAllUsersHandler);
usersRouter.get("/:id", getUserByIdHandler);
usersRouter.patch("/:id", validate(updateUserSchema), updateUserHandler);
usersRouter.delete("/:id", deleteUserHandler);

export default usersRouter;