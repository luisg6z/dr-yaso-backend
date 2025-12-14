import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../db/db'
import {
    ReunionesDeComite,
    tipoReunionComiteEnum,
} from '../db/schemas/ReunionesDeComite'
import { Asisten } from '../db/schemas/Asisten'
import { Pagination } from '../types/types'
import { MeetingCreate, MeetingUpdate } from './meetings.schema'
import { Voluntarios } from '../db/schemas/Voluntarios'
import { AppError } from '../common/errors/errors'
import { getVolunteerById } from '../volunteers/volunteer.service'
import { DetallesVoluntarios } from '../db/schemas/DetallesVoluntarios'
import { Pertenecen } from '../db/schemas/Pertenecen'
import { Franquicias } from '../db/schemas/Franquicias'

export const createMeeting = async (meeting: MeetingCreate) => {
    if (meeting.responsibleId) {
        const volunteer = await db
            .select({
                id: Voluntarios.id,
                firstName: Voluntarios.nombres,
                lastName: Voluntarios.apellidos,
                idNumber: Voluntarios.numeroDocumento,
                idType: Voluntarios.tipoDocumento,
                status: Voluntarios.estatus,
            })
            .from(Voluntarios)
            .where(eq(Voluntarios.id, meeting.responsibleId))

        if (volunteer.length < 1) {
            throw new AppError(400, 'Responsible volunteer not found')
        }
    }

    if (meeting.franchiseId) {
        const franchise = await db
            .select({
                id: Franquicias.id,
                name: Franquicias.nombre,
            })
            .from(Franquicias)
            .where(eq(Franquicias.id, meeting.franchiseId))

        if (franchise.length < 1) {
            throw new AppError(400, "This franchise doesn't exists")
        }
    }

    const data = await db.transaction(async (tx) => {
        // Crear la reunión
        const createdMeeting = await tx
            .insert(ReunionesDeComite)
            .values({
                fecha: new Date(meeting.date).toISOString(),
                tipoDeReunionComite: meeting.type,
                observacion: meeting.notes,
                idResponsable: meeting.responsibleId,
                idFranquicia: meeting.franchiseId,
            })
            .returning()

        // Insertar los voluntarios que asisten
        if (meeting.volunteersIds) {
            meeting.volunteersIds.forEach(async (volunteerId) => {
                await tx.insert(Asisten).values({
                    idReunionComite: createdMeeting[0].id,
                    idVoluntario: volunteerId,
                })
            })
        }
    })

    return data
}

export const getMeetingById = async (id: number) => {
    const meeting = await db
        .select({
            id: ReunionesDeComite.id,
            type: ReunionesDeComite.tipoDeReunionComite,
            notes: ReunionesDeComite.observacion,
            date: ReunionesDeComite.fecha,
            responsibleId: ReunionesDeComite.idResponsable,
            franchise: {
                id: Franquicias.id,
                name: Franquicias.nombre,
            },
        })
        .from(ReunionesDeComite)
        .innerJoin(
            Franquicias,
            eq(Franquicias.id, ReunionesDeComite.idFranquicia),
        )
        .where(eq(ReunionesDeComite.id, id))

    if (meeting.length === 0) {
        throw new AppError(404, 'Meeting not found')
    }

    const { responsibleId, ...formattedMeeting } = meeting[0]

    const responsible = await getVolunteerById(responsibleId || -1)

    const volunteers = await db
        .select({
            id: Voluntarios.id,
            firstName: Voluntarios.nombres,
            lastName: Voluntarios.apellidos,
            idType: Voluntarios.tipoDocumento,
            idNumber: Voluntarios.numeroDocumento,
            birthDate: Voluntarios.fechaNacimiento,
            profession: Voluntarios.profesion,
            status: Voluntarios.estatus,
            gender: Voluntarios.genero,
            bloodType: DetallesVoluntarios.tipoSangre,
            maritalStatus: DetallesVoluntarios.estadoCivil,
            phoneNumbers: DetallesVoluntarios.telefonos,
            clownName: DetallesVoluntarios.nombrePayaso,
            shirtSize: DetallesVoluntarios.tallaCamisa,
            hasShirtWithLogo: DetallesVoluntarios.tieneCamisaConLogo,
            hasCoatWithLogo: DetallesVoluntarios.tieneBataConLogo,
            allergies: DetallesVoluntarios.alergias,
            disability: DetallesVoluntarios.discapacidad,
            socialMedia: {
                facebook: DetallesVoluntarios.facebook,
                x: DetallesVoluntarios.x,
                instagram: DetallesVoluntarios.instagram,
                tikTok: DetallesVoluntarios.tiktok,
            },
            emergencyContact: {
                name: DetallesVoluntarios.nombreContactoEmergencia,
                phone: DetallesVoluntarios.telefonoContactoEmergencia,
            },
            franchise: {
                id: Pertenecen.idFranquicia,
                name: Franquicias.nombre, // Join with Franquicias to get the name
            },
        })
        .from(Asisten)
        .leftJoin(Voluntarios, eq(Voluntarios.id, Asisten.idVoluntario))
        .where(eq(Asisten.idReunionComite, id))
        .leftJoin(
            DetallesVoluntarios,
            eq(DetallesVoluntarios.idVoluntario, Asisten.idVoluntario),
        )
        .leftJoin(
            Pertenecen,
            and(
                eq(Pertenecen.idVoluntario, Asisten.idVoluntario),
                isNull(Pertenecen.fechaHoraEgreso), // Filter where fechaHoraEgreso is NULL
            ),
        )
        .leftJoin(
            Franquicias,
            eq(Franquicias.id, Pertenecen.idFranquicia), // Join with Franquicias to get franchise details
        )

    return {
        meeting: formattedMeeting,
        responsible,
        volunteers: volunteers,
    }
}

export const getDisciplineMeetings = async (
    pagination: Pagination,
    franchiseId: number,
) => {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    // Obtener todas las reuniones con paginación
    const meetings = await db
        .select({
            id: ReunionesDeComite.id,
            type: ReunionesDeComite.tipoDeReunionComite,
            notes: ReunionesDeComite.observacion,
            date: ReunionesDeComite.fecha,
            responsibleId: ReunionesDeComite.idResponsable,
            franchise: {
                id: Franquicias.id,
                name: Franquicias.nombre,
            },
        })
        .from(ReunionesDeComite)
        .innerJoin(
            Franquicias,
            eq(Franquicias.id, ReunionesDeComite.idFranquicia),
        )
        .where(
            and(
                eq(
                    ReunionesDeComite.tipoDeReunionComite,
                    tipoReunionComiteEnum.enumValues[5],
                ),
                eq(ReunionesDeComite.idFranquicia, franchiseId),
            ),
        )
        .limit(limit)
        .offset(offset)

    // Obtener los responsables para cada reunión
    const meetingsWithResponsibles = await Promise.all(
        meetings.map(async (meeting) => {
            const responsible = await getVolunteerById(
                meeting.responsibleId || -1,
            )
            return {
                ...meeting,
                responsible,
            }
        }),
    )

    const totalItems = await db.$count(
        ReunionesDeComite,
        and(
            eq(ReunionesDeComite.idFranquicia, franchiseId),
            eq(
                ReunionesDeComite.tipoDeReunionComite,
                tipoReunionComiteEnum.enumValues[5],
            ),
        ),
    )

    return {
        items: meetingsWithResponsibles,
        paginate: {
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
        },
    }
}

export const getMeetingsForAFranchise = async (
    pagination: Pagination,
    franchiseId: number,
) => {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    // Obtener todas las reuniones con paginación
    const meetings = await db
        .select({
            id: ReunionesDeComite.id,
            type: ReunionesDeComite.tipoDeReunionComite,
            notes: ReunionesDeComite.observacion,
            date: ReunionesDeComite.fecha,
            responsibleId: ReunionesDeComite.idResponsable,
            franchise: {
                id: Franquicias.id,
                name: Franquicias.nombre,
            },
        })
        .from(ReunionesDeComite)
        .innerJoin(
            Franquicias,
            eq(Franquicias.id, ReunionesDeComite.idFranquicia),
        )
        .where(eq(ReunionesDeComite.idFranquicia, franchiseId))
        .limit(limit)
        .offset(offset)

    // Obtener los responsables para cada reunión
    const meetingsWithResponsibles = await Promise.all(
        meetings.map(async (meeting) => {
            const responsible = await getVolunteerById(
                meeting.responsibleId || -1,
            )
            return {
                ...meeting,
                responsible,
            }
        }),
    )

    const totalItems = await db.$count(
        ReunionesDeComite,
        eq(ReunionesDeComite.idFranquicia, franchiseId),
    )

    return {
        items: meetingsWithResponsibles,
        paginate: {
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
        },
    }
}

export const getAllMeetings = async (pagination: Pagination) => {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    // Obtener todas las reuniones con paginación
    const meetings = await db
        .select({
            id: ReunionesDeComite.id,
            type: ReunionesDeComite.tipoDeReunionComite,
            notes: ReunionesDeComite.observacion,
            date: ReunionesDeComite.fecha,
            responsibleId: ReunionesDeComite.idResponsable,
            franchise: {
                id: Franquicias.id,
                name: Franquicias.nombre,
            },
        })
        .from(ReunionesDeComite)
        .innerJoin(
            Franquicias,
            eq(Franquicias.id, ReunionesDeComite.idFranquicia),
        )
        .limit(limit)
        .offset(offset)

    // Obtener los responsables para cada reunión
    const meetingsWithResponsibles = await Promise.all(
        meetings.map(async (meeting) => {
            const responsible = await getVolunteerById(
                meeting.responsibleId || -1,
            )
            return {
                ...meeting,
                responsible,
            }
        }),
    )

    return {
        items: meetingsWithResponsibles,
        paginate: {
            page,
            limit,
            totalItems: meetings.length,
            totalPages: Math.ceil(meetings.length / limit),
        },
    }
}

export const updateMeeting = async (id: number, meeting: MeetingUpdate) => {
    // Verificar si la reunión existe
    const existingMeeting = await db
        .select({
            id: ReunionesDeComite.id,
            type: ReunionesDeComite.tipoDeReunionComite,
            date: ReunionesDeComite.fecha,
        })
        .from(ReunionesDeComite)
        .where(eq(ReunionesDeComite.id, id))

    if (existingMeeting.length === 0) {
        throw new AppError(404, 'Meeting not found')
    }

    if (meeting.franchiseId) {
        const franchise = await db
            .select({
                id: Franquicias.id,
                name: Franquicias.nombre,
            })
            .from(Franquicias)
            .where(eq(Franquicias.id, meeting.franchiseId))

        if (franchise.length < 1) {
            throw new AppError(400, "This franchise doesn't exists")
        }
    }

    await db.transaction(async (tx) => {
        // Actualizar la reunión
        await tx
            .update(ReunionesDeComite)
            .set({
                tipoDeReunionComite: meeting.type,
                observacion: meeting.notes,
                fecha: new Date(
                    meeting.date ?? existingMeeting[0].date,
                ).toISOString(),
                idResponsable: meeting.responsibleId,
                idFranquicia: meeting.franchiseId,
            })
            .where(eq(ReunionesDeComite.id, id))
            .returning()

        // Actualizar los voluntarios que asisten
        if (meeting.volunteersIds) {
            // Eliminar los registros existentes en Asisten
            await tx.delete(Asisten).where(eq(Asisten.idReunionComite, id))

            // Insertar los nuevos registros en Asisten
            meeting.volunteersIds.forEach(async (volunteerId) => {
                await tx.insert(Asisten).values({
                    idReunionComite: id,
                    idVoluntario: volunteerId,
                })
            })
        }
    })

    // Devolver la reunión actualizada
    return await getMeetingById(id)
}

export const deleteMeeting = async (id: number) => {
    // Verificar si la reunión existe
    const existingMeeting = await db
        .select({
            id: ReunionesDeComite.id,
            type: ReunionesDeComite.tipoDeReunionComite,
        })
        .from(ReunionesDeComite)
        .where(eq(ReunionesDeComite.id, id))

    if (existingMeeting.length === 0) {
        throw new AppError(404, 'Meeting not found')
    }

    // Eliminar la reunión y los registros relacionados en Asisten
    await db.transaction(async (tx) => {
        await tx.delete(Asisten).where(eq(Asisten.idReunionComite, id))
        await tx.delete(ReunionesDeComite).where(eq(ReunionesDeComite.id, id))
    })

    return { message: 'Meeting deleted successfully' }
}
