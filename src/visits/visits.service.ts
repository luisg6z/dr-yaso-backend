import { and, eq } from 'drizzle-orm'
import { db } from '../db/db'
import { Visitas } from '../db/schemas/Visitas'
import { Pagination } from '../types/types'
import { VisitCreate, VisitUpdate } from './visits.schema'
import { Realizan, responsabilitiesEnum } from '../db/schemas/Realizan'
import { Locaciones } from '../db/schemas/Locaciones'
import { Voluntarios } from '../db/schemas/Voluntarios'
import { AppError } from '../common/errors/errors'
import { DetallesVoluntarios } from '../db/schemas/DetallesVoluntarios'

export const createVisit = async (visit: VisitCreate) => {
    if (visit.locationId) {
        const location = await db
            .select({
                id: Locaciones.id,
                name: Locaciones.descripcion,
            })
            .from(Locaciones)
            .where(eq(Locaciones.id, visit.locationId))

        if (location.length < 1) {
            throw new AppError(400, 'Location not found')
        }
    }

    const date = new Date(visit.date)

    const id = await db.transaction(async (tx) => {
        const createdVisit = await tx
            .insert(Visitas)
            .values({
                tipo: visit.type,
                observacion: visit.observation,
                fechaHora: date,
                beneficiariosDirectos: visit.directBeneficiaries,
                beneficiariosIndirectos: visit.indirectBeneficiaries,
                cantPersonalDeSalud: visit.healthPersonnelCount,
                idLocacion: visit.locationId,
            })
            .returning()

        if (visit.coordinatorId) {
            await tx.insert(Realizan).values({
                idVisita: createdVisit[0].id,
                idVoluntario: visit.coordinatorId,
                responsabilidad: 'Coordinador',
            })
        }

        if (visit.clownsIds) {
            visit.clownsIds.forEach(async (element) => {
                await tx.insert(Realizan).values({
                    idVisita: createdVisit[0].id,
                    idVoluntario: element,
                    responsabilidad: 'Payaso',
                })
            })
        }

        if (visit.hallwaysIds) {
            visit.hallwaysIds.forEach(async (element) => {
                await tx.insert(Realizan).values({
                    idVisita: createdVisit[0].id,
                    idVoluntario: element,
                    responsabilidad: 'Pasillero',
                })
            })
        }

        return createdVisit[0].id
    })

    return await getVisitById(id)
}

export const getVisitById = async (id: number) => {
    const visit = await db
        .select({
            id: Visitas.id,
            type: Visitas.tipo,
            observations: Visitas.observacion,
            date: Visitas.fechaHora,
            directBeneficiaries: Visitas.beneficiariosDirectos,
            indirectBeneficiaries: Visitas.beneficiariosIndirectos,
            healthPersonnelCount: Visitas.cantPersonalDeSalud,
            location: {
                id: Locaciones.id,
                name: Locaciones.descripcion,
            },
        })
        .from(Visitas)
        .leftJoin(Locaciones, eq(Locaciones.id, Visitas.idLocacion))
        .where(eq(Visitas.id, id))

    if (visit.length === 0) {
        throw new AppError(404, 'Visit not found')
    }

    const volunteers = await db
        .select({
            id: Voluntarios.id,
            firstName: Voluntarios.nombres,
            lastName: Voluntarios.apellidos,
            idNumber: Voluntarios.numeroDocumento,
            idType: Voluntarios.tipoDocumento,
            status: Voluntarios.estatus,
            responsibility: Realizan.responsabilidad,
            clownName: DetallesVoluntarios.nombrePayaso,
        })
        .from(Realizan)
        .leftJoin(Voluntarios, eq(Voluntarios.id, Realizan.idVoluntario))
        .leftJoin(
            DetallesVoluntarios,
            eq(DetallesVoluntarios.idVoluntario, Voluntarios.id),
        )
        .where(eq(Realizan.idVisita, id))

    const coordinator = volunteers.find(
        (volunteer) =>
            volunteer.responsibility === responsabilitiesEnum.enumValues[2],
    )
    const clowns = volunteers.filter(
        (volunteer) =>
            volunteer.responsibility === responsabilitiesEnum.enumValues[1],
    )
    const hallways = volunteers.filter(
        (volunteer) =>
            volunteer.responsibility === responsabilitiesEnum.enumValues[0],
    )

    return {
        ...visit[0],
        coordinator: coordinator || [],
        clowns: clowns.map((clown) => ({
            id: clown.id,
            firstName: clown.firstName,
            lastName: clown.lastName,
            idNumber: clown.idNumber,
            idType: clown.idType,
            status: clown.status,
            clownName: clown.clownName,
        })),
        hallways: hallways.map((hallway) => ({
            id: hallway.id,
            firstName: hallway.firstName,
            lastName: hallway.lastName,
            idNumber: hallway.idNumber,
            idType: hallway.idType,
            status: hallway.status,
        })),
    }
}

// Helper to map visit row
const mapVisit = (row: {
    Visitas: typeof Visitas.$inferSelect
    Locaciones: typeof Locaciones.$inferSelect | null
}) => {
    return {
        id: row.Visitas.id,
        type: row.Visitas.tipo,
        observations: row.Visitas.observacion,
        date: row.Visitas.fechaHora,
        directBeneficiaries: row.Visitas.beneficiariosDirectos,
        indirectBeneficiaries: row.Visitas.beneficiariosIndirectos,
        healthPersonnelCount: row.Visitas.cantPersonalDeSalud,
        location: row.Locaciones
            ? {
                id: row.Locaciones.id,
                name: row.Locaciones.descripcion,
            }
            : null,
    }
}

export const getAllVisitsForFranchise = async (franchiseId: number) => {
    const rows = await db
        .select({
            Visitas: Visitas,
            Locaciones: Locaciones,
        })
        .from(Visitas)
        .leftJoin(Locaciones, eq(Locaciones.id, Visitas.idLocacion))
        .where(eq(Locaciones.idFranquicia, franchiseId))

    const visits = rows.map(mapVisit)

    return {
        items: visits,
    }
}

export const getAllVisits = async (pagination: Pagination) => {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    const rows = await db
        .select({
            Visitas: Visitas,
            Locaciones: Locaciones,
        })
        .from(Visitas)
        .leftJoin(Locaciones, eq(Locaciones.id, Visitas.idLocacion))
        .limit(limit)
        .offset(offset)

    const visits = rows.map(mapVisit)

    const totalItems = await db.$count(Visitas)

    return {
        items: visits,
        paginate: {
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
        },
    }
}

export const updateVisit = async (id: number, visit: VisitUpdate) => {
    if (visit.locationId) {
        const location = await db
            .select({
                id: Locaciones.id,
                name: Locaciones.descripcion,
            })
            .from(Locaciones)
            .where(eq(Locaciones.id, visit.locationId))

        if (location.length === 0) throw new AppError(400, 'Location not found')
    }

    const existingVisit = await db
        .select({
            id: Visitas.id,
            type: Visitas.tipo,
        })
        .from(Visitas)
        .where(eq(Visitas.id, id))

    if (existingVisit.length === 0) {
        throw new AppError(404, 'Visit not found')
    }

    await db.transaction(async (tx) => {
        await tx
            .update(Visitas)
            .set({
                tipo: visit.type,
                observacion: visit.observation,
                fechaHora: visit.date ? new Date(visit.date) : undefined,
                beneficiariosDirectos: visit.directBeneficiaries,
                beneficiariosIndirectos: visit.indirectBeneficiaries,
                cantPersonalDeSalud: visit.healthPersonnelCount,
                idLocacion: visit.locationId,
            })
            .where(eq(Visitas.id, id))
            .returning()

        if (visit.coordinatorId) {
            await tx
                .update(Realizan)
                .set({
                    idVoluntario: visit.coordinatorId,
                    responsabilidad: responsabilitiesEnum.enumValues[2],
                })
                .where(
                    and(
                        eq(Realizan.idVisita, id),
                        eq(
                            Realizan.responsabilidad,
                            responsabilitiesEnum.enumValues[2],
                        ),
                    ),
                )
        }

        if (visit.clownsIds) {
            await tx
                .delete(Realizan)
                .where(
                    and(
                        eq(Realizan.idVisita, id),
                        eq(
                            Realizan.responsabilidad,
                            responsabilitiesEnum.enumValues[1],
                        ),
                    ),
                )

            visit.clownsIds.forEach(async (element) => {
                await tx.insert(Realizan).values({
                    idVisita: id,
                    idVoluntario: element,
                    responsabilidad: responsabilitiesEnum.enumValues[1],
                })
            })
        }

        if (visit.hallwaysIds) {
            await tx
                .delete(Realizan)
                .where(
                    and(
                        eq(Realizan.idVisita, id),
                        eq(
                            Realizan.responsabilidad,
                            responsabilitiesEnum.enumValues[0],
                        ),
                    ),
                )

            visit.hallwaysIds.forEach(async (element) => {
                await tx.insert(Realizan).values({
                    idVisita: id,
                    idVoluntario: element,
                    responsabilidad: responsabilitiesEnum.enumValues[0],
                })
            })
        }
    })

    return await getVisitById(id)
}

export const deleteVisit = async (id: number) => {
    const existingVisit = await db
        .select({
            id: Visitas.id,
            type: Visitas.tipo,
        })
        .from(Visitas)
        .where(eq(Visitas.id, id))

    if (existingVisit.length === 0) {
        throw new AppError(404, 'Visit not found')
    }

    return await db.delete(Visitas).where(eq(Visitas.id, id)).returning()
}
