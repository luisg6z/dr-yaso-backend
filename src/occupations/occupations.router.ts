import { Router } from "express";
import { validate } from "../middleware/validate";
import { createOccupationSchema } from "./occupations.schemas";
import { createOccupationHandler } from "./occupations.controller";

const occupationRouter = Router();

occupationRouter.post(
  "/",
  validate(createOccupationSchema),
  createOccupationHandler
);

export default occupationRouter;
