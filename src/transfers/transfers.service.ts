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
    updateTransferStatusSchema,
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

// StatusInput type removed as it is replaced by Zod schema inference or not used directly

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

const mapTransfer = (row: {
    Traspasos: typeof Traspasos.$inferSelect
    Voluntarios: typeof Voluntarios.$inferSelect | null
    origen: { id: number; nombre: string } | null
    destino: { id: number; nombre: string } | null
}) => {
    return {
        id: row.Traspasos.id,
        date: row.Traspasos.fecha,
        status: row.Traspasos.estado,
        reason: row.Traspasos.motivo,
        observation: row.Traspasos.observacion,
        volunteer: row.Voluntarios
            ? {
                id: row.Voluntarios.id,
                nombres: row.Voluntarios.nombres,
                apellidos: row.Voluntarios.apellidos,
            }
            : null,
        origin: row.origen
            ? {
                id: row.origen.id,
                nombre: row.origen.nombre,
            }
            : null,
        destination: row.destino
            ? {
                id: row.destino.id,
                nombre: row.destino.nombre,
            }
            : null,
    }
}

const getTransfersQuery = () => {
    return db
        .select({
            Traspasos: Traspasos,
            Voluntarios: Voluntarios,
            origen: {
                id: Origen.id,
                nombre: Origen.nombre,
            },
            destino: {
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

    const rows = await getTransfersQuery().limit(limit).offset(offset)
    const transfers = rows.map(mapTransfer)

    const totalItems = await db.$count(Traspasos)
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

export const getTransfersByFranchise = async (
    franchiseId: number,
    pagination: Pagination,
) => {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    const whereCondition = or(
        eq(Traspasos.idFranquiciaOrigen, franchiseId),
        eq(Traspasos.idFranquiciaDestino, franchiseId),
    )

    const rows = await getTransfersQuery()
        .where(whereCondition)
        .limit(limit)
        .offset(offset)

    const transfers = rows.map(mapTransfer)

    const totalItems = await db.$count(Traspasos, whereCondition);

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
    data: z.infer<typeof updateTransferStatusSchema>,
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

        const dbStatus = statusToDb[data.status];

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

        await tx
            .update(Traspasos)
            .set({
                estado: dbStatus,
                observacion: data.observation,
            })
            .where(eq(Traspasos.id, id))

        // Return mapped object
        // We need to fetch it again to get joined fields.
        // Can't call getTransferById inside transaction easily if it uses global db.
        // But getTransferById filters by ID, so it's fine to call it after commit?
        // No, we are inside transaction callback.
        // We can replicate the query logic with 'tx' or just return the ID and fetch after?
        // The service function returns the result of transaction.
        // Let's just return the id from transaction and fetch outside?
        // Or better, let's just make getTransferById accept an optional db instance?
        // For now, let's just return the raw updated fields + manually constructed object to avoid complex refactor of getTransfersQuery.
        // OR, just use the helper mapTransfer if we fetch the necessary joined data inside TX.
        // Simplest: Return the result of getTransferById(id) *after* the update.
        // But `db` inside `getTransferById` is the global pool, which might not see uncommitted changes if isolation level is high?
        // Postgres read committed usually sees own changes? No, other connections don't see it.
        // If `db` is global pool, it's a different connection than `tx`.
        // So `getTransferById` will fail to see the update if called inside.
        // Solution: We must pass `tx` to `getTransferById` or replicate logic.
        // Since `getTransfersQuery` uses `db`, we'd need to parameterize it.
        // Let's stick to returning a simplified object or duplicate query with `tx`.

        // Actually, we can just return the updated ID and fetch it AFTER the transaction.
        return id
    })
        .then(id => getTransferById(id)) // Fetch full object after commit
}

export const getTransferById = async (id: number) => {
    const row = await getTransfersQuery()
        .where(eq(Traspasos.id, id))
        .then((rows) => rows[0])

    // Check if row exists, though getTransfersQuery returns array, so row might be undefined
    if (!row) {
        // Handle "not found" or return null depending on contract. 
        // Usually throwing is better for getById.
        // But getById logic in this file (previous version) was returning "transfer".
        // Let's assume it should exist or return undefined, or throw.
        // Original code: await db... where(id).then(rows => rows[0]). return transfer; (implicitly can be undefined)
        // Let's stick to returning mapped or undefined if original did that.
        // Actually, let's keep it safe. If not found, returning undefined is fine if type allows.
        return undefined
    }

    return mapTransfer(row)
}
