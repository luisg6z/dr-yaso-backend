import { Router } from 'express'
import { validate } from '../middleware/validate'
import {
    createOccupationSchema,
    updateOccupationSchema,
} from './occupations.schemas'
import {
    createOccupationHandler,
    updateOccupationHandler,
    getAllOccupationsHandler,
    getOccupationByIdHandler,
    deleteOccupationHandler,
} from './occupations.controller'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { authorize } from '../auth/middlewares/authorize.middleware'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'

const occupationRouter = Router()

occupationRouter.post(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0]]),
    validate(createOccupationSchema),
    createOccupationHandler,
)
occupationRouter.get(
    '/',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    getAllOccupationsHandler,
)

occupationRouter.get(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[3]]),
    getOccupationByIdHandler,
)

occupationRouter.put(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0]]),
    validate(updateOccupationSchema),
    updateOccupationHandler,
)

occupationRouter.delete(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0]]),
    deleteOccupationHandler,
)

export default occupationRouter
