import { Router } from 'express'
import { validate } from '../middleware/validate'
import { createLocationSchema, updateLocationSchema } from './locations.schemas'
import {
    createLocationHandler,
    updateLocationHandler,
    getAllLocationsHandler,
    getLocationByIdHandler,
    deleteLocationHandler,
} from './locations.controller'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { authorize } from '../auth/middlewares/authorize.middleware'

const locationRouter = Router()

locationRouter.post(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    validate(createLocationSchema),
    createLocationHandler,
)
locationRouter.get(
    '/',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[2],
        tipoUsuarioEnum.enumValues[3],
    ]),
    getAllLocationsHandler,
)

locationRouter.get(
    '/:id',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[2],
        tipoUsuarioEnum.enumValues[3],
    ]),
    getLocationByIdHandler,
)

locationRouter.put(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    validate(updateLocationSchema),
    updateLocationHandler,
)

locationRouter.delete(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    deleteLocationHandler,
)

export default locationRouter
