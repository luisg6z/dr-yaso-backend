import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  createVolunteerSchema,
  updateVolunteerSchema,
} from "./volunteer.schemas";
import {
  createVolunteerHandler,
  getVolunteerByIdHandler,
  getAllVolunteersHandler,
  updateVolunteerHandler,
  deleteVolunteerHandler,
  getVolunteersByOccupationHandler,
} from "./volunteer.controller";
import { authenticate } from "../auth/middlewares/auth.middleware";
import { authorize } from "../auth/middlewares/authorize.middleware";
import { tipoUsuarioEnum } from "../db/schemas/Usuarios";

const volunteersRouter = Router();

volunteersRouter.post(
  "/",
  authenticate,
  authorize([tipoUsuarioEnum.enumValues[0]]),
  validate(createVolunteerSchema),
  createVolunteerHandler
);

volunteersRouter.get(
  "/:id",
  authenticate,
  authorize([tipoUsuarioEnum.enumValues[0]]),
  getVolunteerByIdHandler
);

volunteersRouter.get(
  "/",
  authenticate,
  authorize([tipoUsuarioEnum.enumValues[0]]),
  getAllVolunteersHandler
);

volunteersRouter.put(
  "/:id",
  authenticate,
  authorize([tipoUsuarioEnum.enumValues[0]]),
  validate(updateVolunteerSchema),
  updateVolunteerHandler
);

volunteersRouter.delete(
  "/:id",
  authenticate,
  authorize([tipoUsuarioEnum.enumValues[0]]),
  deleteVolunteerHandler
);

volunteersRouter.get(
  "/occupation/:id",
  authenticate,
  authorize([tipoUsuarioEnum.enumValues[0]]),
  getVolunteersByOccupationHandler
);

export default volunteersRouter;
