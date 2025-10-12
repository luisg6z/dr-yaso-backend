import { Router } from 'express'
import { getStatesByCountryIdHandler } from './states.controller'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { authorize } from '../auth/middlewares/authorize.middleware'

const StateRouter = Router()

StateRouter.get(
    '/:id',
    authenticate,
    authorize([tipoUsuarioEnum.enumValues[0]]),
    getStatesByCountryIdHandler,
)

export default StateRouter
