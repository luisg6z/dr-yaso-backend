import { Router } from 'express'
import { validate } from '../middleware/validate'
import { createMeetingSchema, updateMeetingSchema } from './meetings.schema'
import {
    createMeetingHandler,
    deleteMeetingHandler,
    getAllMeetingsHandler,
    getMeetingByIdHandler,
    updateMeetingHandler,
} from './meetings.controller'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { authorize } from '../auth/middlewares/authorize.middleware'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'

const meetingsRouter = Router()

meetingsRouter.post(
    '/',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[1],
        tipoUsuarioEnum.enumValues[3],
    ]),
    validate(createMeetingSchema),
    createMeetingHandler,
)
meetingsRouter.get(
    '/',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[1],
        tipoUsuarioEnum.enumValues[3],
    ]),
    getAllMeetingsHandler,
)
meetingsRouter.get(
    '/:id',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[1],
        tipoUsuarioEnum.enumValues[3],
    ]),
    getMeetingByIdHandler,
)
meetingsRouter.patch(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[1]]),
    validate(updateMeetingSchema),
    updateMeetingHandler,
)
meetingsRouter.delete(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0], tipoUsuarioEnum.enumValues[1]]),
    deleteMeetingHandler,
)

export default meetingsRouter
