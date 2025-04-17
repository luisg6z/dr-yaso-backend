import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  createLocationSchema,
  updateLocationSchema,
} from "./locations.schemas";
import {
  createLocationHandler,
  updateLocationHandler,
  getAllLocationsHandler,
  getLocationByIdHandler,
  deleteLocationHandler,
} from "./locations.controller";

const locationRouter = Router();

locationRouter.post(
  "/",
  validate(createLocationSchema),
  createLocationHandler
);
locationRouter.get("/", getAllLocationsHandler);

locationRouter.get("/:id", getLocationByIdHandler);

locationRouter.put(
  "/:id",
  validate(updateLocationSchema),
  updateLocationHandler
);

locationRouter.delete("/:id", deleteLocationHandler);

export default locationRouter;
