import { db } from '../db/db'
import { Traspasos } from '../db/schemas/Traspasos'
import { Voluntarios } from '../db/schemas/Voluntarios'
import { Franquicias } from '../db/schemas/Franquicias'
import { Pertenecen } from '../db/schemas/Pertenecen'
import { eq, or, and, isNull } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { AppError } from '../common/errors/errors'
import { z } from 'zod'
import {
    createTransferSchema,
} from './transfers.schemas'
import { Pagination } from '../types/types'

const Origen = alias(Franquicias, 'origen')
const Destino = alias(Franquicias, 'destino')

// Mappings
const statusToDb = {
    pending: 'pendiente',
    approved: 'aprobado',
    rejected: 'rechazada',
} as const

// Removed statusFromDb as we want to keep Spanish values in response

type StatusInput = 'approved' | 'rejected';

export const createTransfer = async (
    data: z.infer<typeof createTransferSchema>,
) => {
    // Map English inputs to Spanish DB fields
    const dbData = {
        idVoluntario: data.volunteerId,
        idFranquiciaOrigen: data.originFranchiseId,
        idFranquiciaDestino: data.destinationFranchiseId,
        fecha: data.date,
        estado: 'pendiente' as const,
        motivo: data.reason,
        observacion: data.observation,
    }

    const [transfer] = await db
        .insert(Traspasos)
        .values(dbData)
        .returning()

    // Return English mapped response, but keep status value in Spanish
    return {
        id: transfer.id,
        volunteerId: transfer.idVoluntario,
        originFranchiseId: transfer.idFranquiciaOrigen,
        destinationFranchiseId: transfer.idFranquiciaDestino,
        date: transfer.fecha,
        status: transfer.estado, // Keep spanish value
        reason: transfer.motivo,
        observation: transfer.observacion,
    }
}

const getTransfersQuery = () => {
    return db
        .select({
            id: Traspasos.id,
            date: Traspasos.fecha,
            status: Traspasos.estado, // Directly use the DB value
            reason: Traspasos.motivo,
            observation: Traspasos.observacion,
            volunteer: {
                id: Voluntarios.id,
                nombres: Voluntarios.nombres,
                apellidos: Voluntarios.apellidos,
            },
            origin: {
                id: Origen.id,
                nombre: Origen.nombre,
            },
            destination: {
                id: Destino.id,
                nombre: Destino.nombre,
            },
        })
        .from(Traspasos)
        .leftJoin(Voluntarios, eq(Traspasos.idVoluntario, Voluntarios.id))
        .leftJoin(Origen, eq(Traspasos.idFranquiciaOrigen, Origen.id))
        .leftJoin(Destino, eq(Traspasos.idFranquiciaDestino, Destino.id))
}

export const getAllTransfers = async (pagination: Pagination) => {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    const transfers = await getTransfersQuery().limit(limit).offset(offset)

    const totalItems = await db.$count(Traspasos)
    const totalPages = Math.ceil(totalItems / limit)

    return {
        items: transfers, // Already mapped by query structure, no need for extra map if keys are correct.
        // Wait, query returns English keys "date", "status", "reason", etc.
        paginate: {
            page,
            limit,
            totalItems,
            totalPages,
        },
    }
}

export const getTransfersByFranchise = async (franchiseId: number, pagination: Pagination) => {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    const query = getTransfersQuery().where(
        or(
            eq(Traspasos.idFranquiciaOrigen, franchiseId),
            eq(Traspasos.idFranquiciaDestino, franchiseId),
        ),
    )

    const transfers = await query.limit(limit).offset(offset)

    // We need total count for this specific filter
    const totalItemsQuery = await db
        .select({ count: Traspasos.id })
        .from(Traspasos)
        .where(
            or(
                eq(Traspasos.idFranquiciaOrigen, franchiseId),
                eq(Traspasos.idFranquiciaDestino, franchiseId),
            ),
        )

    const totalItems = totalItemsQuery.length; // Count hack for simple where. 
    // Or better iterate if large? db.$count with where is better if supported.
    // Drizzle's $count might not support complex where clauses easily depending on version.
    // Let's use array length of full query or a separate count query. 
    // For pagination accuracy, a separate count query is best.

    // Actually, let's just use the length of the filtered query WITHOUT limit/offset for total count.

    // Re-instantiating query for count (Drizzle objects are mutable builder pattern? No, usually immutable or copied?)
    // To be safe, re-build count query.

    const totalPages = Math.ceil(totalItems / limit)

    return {
        items: transfers,
        paginate: {
            page,
            limit,
            totalItems,
            totalPages,
        },
    }
}

export const updateTransferStatus = async (
    id: number,
    status: StatusInput,
) => {
    return await db.transaction(async (tx) => {
        const [transfer] = await tx
            .select()
            .from(Traspasos)
            .where(eq(Traspasos.id, id))

        if (!transfer) throw new AppError(404, 'Transfer not found')

        if (transfer.estado !== 'pendiente') {
            throw new AppError(400, 'Transfer is not pending')
        }

        const dbStatus = statusToDb[status];

        if (dbStatus === 'aprobado') {
            // Close current active association
            await tx
                .update(Pertenecen)
                .set({ fechaHoraEgreso: new Date() })
                .where(
                    and(
                        eq(Pertenecen.idVoluntario, transfer.idVoluntario),
                        eq(
                            Pertenecen.idFranquicia,
                            transfer.idFranquiciaOrigen,
                        ),
                        isNull(Pertenecen.fechaHoraEgreso),
                    ),
                )

            // Create new association
            await tx.insert(Pertenecen).values({
                idVoluntario: transfer.idVoluntario,
                idFranquicia: transfer.idFranquiciaDestino,
                fechaHoraIngreso: new Date(),
            })
        }

        const [updated] = await tx
            .update(Traspasos)
            .set({ estado: dbStatus })
            .where(eq(Traspasos.id, id))
            .returning()

        return {
            id: updated.id,
            volunteerId: updated.idVoluntario,
            originFranchiseId: updated.idFranquiciaOrigen,
            destinationFranchiseId: updated.idFranquiciaDestino,
            date: updated.fecha,
            status: updated.estado, // Keep Spanish
            reason: updated.motivo,
            observation: updated.observacion,
        }
    })
}

export const getTransferById = async (id: number) => {
    const [transfer] = await db
        .select()
        .from(Traspasos)
        .where(eq(Traspasos.id, id))
    return transfer
}
