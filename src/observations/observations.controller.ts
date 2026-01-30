import { RequestHandler } from 'express'
import { db } from '../db/db'
import { Usuarios } from '../db/schemas/Usuarios'
import { eq } from 'drizzle-orm'
import {
    createObservation,
    getObservationsByVolunteer,
    getObservationsByUser,
    updateObservation,
    deleteObservation,
} from './observations.service'
import {
    observationCreateSchema,
    observationUpdateSchema,
} from './observations.schemas'

export const createObservationController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const parsed = observationCreateSchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid body',
                errors: parsed.error.flatten(),
            })
            return
        }
        const { idVoluntario, observacion } = parsed.data
        const tokenUser = res.locals.user as
            | { id?: number; email?: string }
            | undefined
        let idUsuario = tokenUser?.id
        if (!idUsuario) {
            const email = tokenUser?.email
            if (!email) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            }
            const rows = await db
                .select({ id: Usuarios.id })
                .from(Usuarios)
                .where(eq(Usuarios.correo, email))
                .limit(1)
            idUsuario = rows[0]?.id
            if (!idUsuario) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            }
        }
        const row = await createObservation(
            idUsuario,
            idVoluntario,
            observacion,
        )
        res.status(201).json(row)
        return
    } catch (err) {
        next(err)
        return
    }
}

export const getObservationsByVolunteerController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const idVoluntario = Number(req.params.id)
        const rows = await getObservationsByVolunteer(idVoluntario)
        res.json(rows)
        return
    } catch (err) {
        next(err)
        return
    }
}

export const getObservationsByUserController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const idUsuario = Number(req.params.id)
        const rows = await getObservationsByUser(idUsuario)
        res.json(rows)
        return
    } catch (err) {
        next(err)
        return
    }
}

export const updateObservationController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const parsed = observationUpdateSchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid body',
                errors: parsed.error.flatten(),
            })
            return
        }
        const { idVoluntario, fechaHoraRegistro, observacion } = parsed.data
        const tokenUser = res.locals.user as
            | { id?: number; email?: string }
            | undefined
        let idUsuario = tokenUser?.id
        if (!idUsuario) {
            const email = tokenUser?.email
            if (!email) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            }
            const rows = await db
                .select({ id: Usuarios.id })
                .from(Usuarios)
                .where(eq(Usuarios.correo, email))
                .limit(1)
            idUsuario = rows[0]?.id
            if (!idUsuario) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            }
        }
        const row = await updateObservation(
            idUsuario,
            idVoluntario,
            new Date(fechaHoraRegistro),
            observacion,
        )
        res.json(row)
        return
    } catch (err) {
        next(err)
        return
    }
}

export const deleteObservationController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { idVoluntario, fechaHoraRegistro } = req.query
        const tokenUser = res.locals.user as
            | { id?: number; email?: string }
            | undefined
        let idUsuario = tokenUser?.id
        if (!idUsuario) {
            const email = tokenUser?.email
            if (!email) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            }
            const rows = await db
                .select({ id: Usuarios.id })
                .from(Usuarios)
                .where(eq(Usuarios.correo, email))
                .limit(1)
            idUsuario = rows[0]?.id
            if (!idUsuario) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            }
        }
        const result = await deleteObservation(
            Number(idUsuario),
            Number(idVoluntario),
            new Date(String(fechaHoraRegistro)),
        )
        res.json(result)
        return
    } catch (err) {
        next(err)
        return
    }
}
