import { Router } from "express";
import { createFranchiseHandler, deleteFranchiseHandler, getActivesFranchisesHandler, getAllFranchisesHandler, getFranchiseByIdHandler, updateFranchiseHandler } from "./franchises.controller";
import { validate } from "../middleware/validate";
import { createFranchiseSchema, updateFranchiseSchema } from "./franchises.schemas";


const franchiseRouter = Router();

franchiseRouter.post("/", validate(createFranchiseSchema) ,createFranchiseHandler);
franchiseRouter.get("/all", getAllFranchisesHandler);
franchiseRouter.get("/", getActivesFranchisesHandler);
franchiseRouter.get("/:id", getFranchiseByIdHandler);
franchiseRouter.patch("/:id", validate(updateFranchiseSchema), updateFranchiseHandler);
franchiseRouter.delete("/:id", deleteFranchiseHandler);

export default franchiseRouter;