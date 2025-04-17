import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  createVolunteerSchema,
  updateVolunteerSchema,
} from "./volunteer.schemas";
import {
  createVolunteerHandler,
  getVolunteerByIdHandler,
} from "./volunteer.controller";

const volunteersRouter = Router();

volunteersRouter.post(
  "/",
  validate(createVolunteerSchema),
  createVolunteerHandler
);

volunteersRouter.get("/:id", getVolunteerByIdHandler);

export default volunteersRouter;
