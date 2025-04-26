import { Router } from "express";
import { validate } from "../middleware/validate";
import { createVisitSchema, updateVisitSchema } from "./visits.schema";
import { createVisitsHandler, deleteVisitHandler, getAllVisitsHandler, getVisitByIdHandler, updateVisitHandler } from "./visits.controller";
import { authenticate } from "../auth/middlewares/auth.middleware";
import { authorize } from "../auth/middlewares/authorize.middleware";
import { tipoUsuarioEnum } from "../db/schemas/Usuarios";


const visitsRouter = Router();

visitsRouter.post("/", authenticate, authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[2], tipoUsuarioEnum.enumValues[3]]), validate(createVisitSchema), createVisitsHandler);
visitsRouter.get("/", authenticate, authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[2], tipoUsuarioEnum.enumValues[3]]), getAllVisitsHandler)
visitsRouter.get("/:id", authenticate, authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[2], tipoUsuarioEnum.enumValues[3]]), getVisitByIdHandler);
visitsRouter.patch("/:id", authenticate, authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[2], tipoUsuarioEnum.enumValues[3]]), validate(updateVisitSchema), updateVisitHandler);
visitsRouter.delete("/:id", authenticate, authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[2]]), deleteVisitHandler);

export default visitsRouter;