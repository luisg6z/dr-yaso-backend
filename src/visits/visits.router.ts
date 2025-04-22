import { Router } from "express";
import { validate } from "../middleware/validate";
import { createVisitSchema, updateVisitSchema } from "./visits.schema";
import { createVisitsHandler, deleteVisitHandler, getAllVisitsHandler, getVisitByIdHandler, updateVisitHandler } from "./visits.controller";


const visitsRouter = Router();

visitsRouter.post("/", validate(createVisitSchema), createVisitsHandler);
visitsRouter.get("/", getAllVisitsHandler)
visitsRouter.get("/:id", getVisitByIdHandler);
visitsRouter.patch("/:id", validate(updateVisitSchema), updateVisitHandler);
visitsRouter.delete("/:id", deleteVisitHandler);

export default visitsRouter;