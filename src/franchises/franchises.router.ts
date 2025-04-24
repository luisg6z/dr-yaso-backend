import { Router } from "express";
import { createFranchiseHandler, deleteFranchiseHandler, getActivesFranchisesHandler, getAllFranchisesHandler, getFranchiseByIdHandler, updateFranchiseHandler } from "./franchises.controller";
import { validate } from "../middleware/validate";
import { createFranchiseSchema, updateFranchiseSchema } from "./franchises.schemas";
import { authenticate } from "../auth/middlewares/auth.middleware";
import { authorize } from "../auth/middlewares/authorize.middleware";
import { tipoUsuarioEnum } from "../db/schemas/Usuarios";


const franchiseRouter = Router();

franchiseRouter.post("/", validate(createFranchiseSchema) ,createFranchiseHandler);
franchiseRouter.get("/all", authenticate, authorize([tipoUsuarioEnum.enumValues[0]]),  getAllFranchisesHandler);
franchiseRouter.get("/", getActivesFranchisesHandler);
franchiseRouter.get("/:id", getFranchiseByIdHandler);
franchiseRouter.patch("/:id", validate(updateFranchiseSchema), updateFranchiseHandler);
franchiseRouter.delete("/:id", deleteFranchiseHandler);

export default franchiseRouter;