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

const Origen = alias(Franquicias, 'origen')
const Destino = alias(Franquicias, 'destino')

// Mappings
const statusToDb = {
    pending: 'pendiente',
    approved: 'aprobado',
    rejected: 'rechazada',
} as const

const statusFromDb = {
    pendiente: 'pending',
    aprobado: 'approved',
    rechazada: 'rejected',
} as const

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

    // Return English mapped response
    return {
        id: transfer.id,
        volunteerId: transfer.idVoluntario,
        originFranchiseId: transfer.idFranquiciaOrigen,
        destinationFranchiseId: transfer.idFranquiciaDestino,
        date: transfer.fecha,
        status: statusFromDb[transfer.estado as keyof typeof statusFromDb],
        reason: transfer.motivo,
        observation: transfer.observacion,
    }
}

const getTransfersQuery = () => {
    return db
        .select({
            id: Traspasos.id,
            date: Traspasos.fecha,
            // Map status later or use SQL case? JS mapping is easier.
            statusRaw: Traspasos.estado,
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

const mapTransferResponse = (t: any) => ({
    ...t,
    status: statusFromDb[t.statusRaw as keyof typeof statusFromDb],
    statusRaw: undefined
});

export const getAllTransfers = async () => {
    const transfers = await getTransfersQuery()
    return transfers.map(mapTransferResponse)
}

export const getTransfersByFranchise = async (franchiseId: number) => {
    const transfers = await getTransfersQuery().where(
        or(
            eq(Traspasos.idFranquiciaOrigen, franchiseId),
            eq(Traspasos.idFranquiciaDestino, franchiseId),
        ),
    )
    return transfers.map(mapTransferResponse)
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
            status: statusFromDb[updated.estado as keyof typeof statusFromDb],
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
