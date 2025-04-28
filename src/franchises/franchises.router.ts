import { Router } from "express";
import { createFranchiseHandler, deleteFranchiseHandler, getActivesFranchisesHandler, getAllFranchisesHandler, getFranchiseByIdHandler, updateFranchiseHandler } from "./franchises.controller";
import { validate } from "../middleware/validate";
import { createFranchiseSchema, updateFranchiseSchema } from "./franchises.schemas";
import { authenticate } from "../auth/middlewares/auth.middleware";
import { authorize } from "../auth/middlewares/authorize.middleware";
import { tipoUsuarioEnum } from "../db/schemas/Usuarios";


const franchiseRouter = Router();

franchiseRouter.post("/", authenticate, authorize([tipoUsuarioEnum.enumValues[0]]), validate(createFranchiseSchema) ,createFranchiseHandler);
franchiseRouter.get("/", authenticate, authorize([
    tipoUsuarioEnum.enumValues[0], 
    tipoUsuarioEnum.enumValues[1], 
    tipoUsuarioEnum.enumValues[2], 
    tipoUsuarioEnum.enumValues[3]])
    , getAllFranchisesHandler);
franchiseRouter.get("/actives", authenticate, authorize([
    tipoUsuarioEnum.enumValues[0], 
    tipoUsuarioEnum.enumValues[1], 
    tipoUsuarioEnum.enumValues[2], 
    tipoUsuarioEnum.enumValues[3]])
    , getActivesFranchisesHandler);
franchiseRouter.get("/:id", authenticate, authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]), getFranchiseByIdHandler);
franchiseRouter.patch("/:id", authenticate, authorize([tipoUsuarioEnum.enumValues[0]]), validate(updateFranchiseSchema), updateFranchiseHandler);
franchiseRouter.delete("/:id", authenticate, authorize([tipoUsuarioEnum.enumValues[0]]), deleteFranchiseHandler);

export default franchiseRouter;