import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  createVolunteerSchema,
  updateVolunteerSchema,
} from "./volunteer.schemas";
import {
  createVolunteerHandler,
  getVolunteerByIdHandler,
  getAllVolunteersHandler,
  updateVolunteerHandler,
  deleteVolunteerHandler,
  getVolunteersByOccupationHandler,
} from "./volunteer.controller";
import { authenticate } from "../auth/middlewares/auth.middleware";
import { authorize } from "../auth/middlewares/authorize.middleware";
import { tipoUsuarioEnum } from "../db/schemas/Usuarios";

const volunteersRouter = Router();

/**
 * @swagger
 * /api/volunteers:
 *   post:
 *     summary: Crear un nuevo voluntario
 *     tags:
 *       - Volunteers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VolunteerCreate'
 *     responses:
 *       201:
 *         description: Voluntario creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */
volunteersRouter.post(
  "/",
  authenticate,
  authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
  validate(createVolunteerSchema),
  createVolunteerHandler
);

volunteersRouter.get(
  "/:id",
  authenticate,
  authorize([
    tipoUsuarioEnum.enumValues[0],
    tipoUsuarioEnum.enumValues[1],
    tipoUsuarioEnum.enumValues[2],
    tipoUsuarioEnum.enumValues[3],
  ]),
  getVolunteerByIdHandler
);

volunteersRouter.get(
  "/",
  authenticate,
  authorize([
    tipoUsuarioEnum.enumValues[0],
    tipoUsuarioEnum.enumValues[1],
    tipoUsuarioEnum.enumValues[2],
    tipoUsuarioEnum.enumValues[3],
  ]),
  getAllVolunteersHandler
);

volunteersRouter.put(
  "/:id",
  authenticate,
  authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
  validate(updateVolunteerSchema),
  updateVolunteerHandler
);

volunteersRouter.delete(
  "/:id",
  authenticate,
  authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
  deleteVolunteerHandler
);

volunteersRouter.get(
  "/occupation/:id",
  authenticate,
  authorize([tipoUsuarioEnum.enumValues[0]]),
  getVolunteersByOccupationHandler
);

export default volunteersRouter;
