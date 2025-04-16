import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  createOccupationSchema,
  updateOccupationSchema,
} from "./locations.schemas";
import {
  createOccupationHandler,
  updateOccupationHandler,
  getAllOccupationsHandler,
  getOccupationByIdHandler,
  deleteOccupationHandler,
} from "./locations.controller";

const occupationRouter = Router();

occupationRouter.post(
  "/",
  validate(createOccupationSchema),
  createOccupationHandler
);
occupationRouter.get("/", getAllOccupationsHandler);

occupationRouter.get("/:id", getOccupationByIdHandler);

occupationRouter.put(
  "/:id",
  validate(updateOccupationSchema),
  updateOccupationHandler
);

occupationRouter.delete("/:id", deleteOccupationHandler);

export default occupationRouter;
