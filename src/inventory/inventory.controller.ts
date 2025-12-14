import { RequestHandler } from 'express'
import { movementCreateSchema } from './inventory.schemas'
import {
    createInventoryMovement,
    getMovementsForProductFranchise,
} from './inventory.service'

export const createInventoryMovementController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const parsed = movementCreateSchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid body',
                errors: parsed.error.flatten(),
            })
            return
        }
        const user = res.locals.user
        const idUsuario = Number(user?.id)
        if (!Number.isFinite(idUsuario)) {
            res.status(401).json({ message: 'No autorizado' })
            return
        }
        const row = await createInventoryMovement(parsed.data, idUsuario)
        res.status(201).json(row)
        return
    } catch (err) {
        next(err)
        return
    }
}

export const getMovementsForProductFranchiseController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const productId = Number(req.params.productId)
        const franchiseId = Number(req.query.franchiseId)
        const page = Number(req.query.page ?? 1)
        const limit = Number(req.query.limit ?? 10)
        if (!Number.isFinite(productId) || !Number.isFinite(franchiseId)) {
            res.status(400).json({
                message: 'productId y franchiseId requeridos',
            })
            return
        }
        const result = await getMovementsForProductFranchise(
            productId,
            franchiseId,
            { page, limit },
        )
        res.json(result)
        return
    } catch (err) {
        next(err)
        return
    }
}
