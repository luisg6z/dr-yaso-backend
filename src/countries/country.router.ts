import { Router } from "express";
import { authenticate } from "../auth/middlewares/auth.middleware";
import { authorize } from "../auth/middlewares/authorize.middleware";
import { tipoUsuarioEnum } from "../db/schemas/Usuarios";
import { getAllCountriesHandler } from "./country.controller";


const countriesRouter = Router()


countriesRouter.get("/", authenticate, authorize([tipoUsuarioEnum.enumValues[0]]), getAllCountriesHandler)
countriesRouter.get("/:id", authenticate, authorize([tipoUsuarioEnum.enumValues[0]]), getAllCountriesHandler)