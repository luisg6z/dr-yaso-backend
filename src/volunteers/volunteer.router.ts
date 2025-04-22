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
} from "./volunteer.controller";

const volunteersRouter = Router();

volunteersRouter.post(
  "/",
  validate(createVolunteerSchema),
  createVolunteerHandler
);

volunteersRouter.get("/:id", getVolunteerByIdHandler);

volunteersRouter.get("/", getAllVolunteersHandler);

volunteersRouter.put(
  "/:id",
  validate(updateVolunteerSchema),
  updateVolunteerHandler
);

volunteersRouter.delete("/:id", deleteVolunteerHandler);

export default volunteersRouter;
