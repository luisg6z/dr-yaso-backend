import { Router } from 'express'
import { getCitiesByStateIdHandler } from './cities.controller'
import { tipoUsuarioEnum } from '../db/schemas/Usuarios'
import { authenticate } from '../auth/middlewares/auth.middleware'
import { authorize } from '../auth/middlewares/authorize.middleware'

const CityRouter = Router()

CityRouter.get(
    '/:id',
    authenticate,
    authorize([
        tipoUsuarioEnum.enumValues[0],
        tipoUsuarioEnum.enumValues[1],
        tipoUsuarioEnum.enumValues[2],
        tipoUsuarioEnum.enumValues[3],
    ]),
    getCitiesByStateIdHandler,
)

export default CityRouter
