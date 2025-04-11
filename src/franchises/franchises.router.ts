import { Router } from "express";
import { createFranchiseHandler, deleteFranchiseHandler, getAllFranchisesHandler, getFranchiseByIdHandler, updateFranchiseHandler } from "./franchises.controller";
import { validate } from "../middleware/validate";
import { createFranchiseSchema, updateFranchiseSchema } from "./franchises.schemas";


const franchiseRouter = Router();

franchiseRouter.post("/", validate(createFranchiseSchema) ,createFranchiseHandler);
franchiseRouter.get("/", getAllFranchisesHandler);
franchiseRouter.get("/:id", getFranchiseByIdHandler);
franchiseRouter.patch("/:id", validate(updateFranchiseSchema), updateFranchiseHandler);
franchiseRouter.delete("/:id", deleteFranchiseHandler);

export default franchiseRouter;