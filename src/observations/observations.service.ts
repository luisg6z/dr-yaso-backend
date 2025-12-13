import { and, eq } from 'drizzle-orm'
import { db } from '../db/db'
import { RegistranObservaciones } from '../db/schemas/RegistranObservaciones'
import { AppError } from '../common/errors/errors'
import { Usuarios } from '../db/schemas/Usuarios'

export const createObservation = async (
    idUsuario: number,
    idVoluntario: number,
    observacion: string,
) => {
    if (!observacion || observacion.length === 0) {
        throw new AppError(400, 'La observación es requerida')
    }

    const [row] = await db
        .insert(RegistranObservaciones)
        .values({ idUsuario, idVoluntario, observacion })
        .returning()

    return row
}

export const getObservationsByVolunteer = async (idVoluntario: number) => {
    return await db
        .select({
            idUsuario: RegistranObservaciones.idUsuario,
            usuarioNombre: Usuarios.nombre,
            idVoluntario: RegistranObservaciones.idVoluntario,
            fechaHoraRegistro: RegistranObservaciones.fechaHoraRegistro,
            observacion: RegistranObservaciones.observacion,
        })
        .from(RegistranObservaciones)
        .innerJoin(Usuarios, eq(Usuarios.id, RegistranObservaciones.idUsuario))
        .where(eq(RegistranObservaciones.idVoluntario, idVoluntario))
        .orderBy(RegistranObservaciones.fechaHoraRegistro)
}

export const getObservationsByUser = async (idUsuario: number) => {
    return await db
        .select()
        .from(RegistranObservaciones)
        .where(eq(RegistranObservaciones.idUsuario, idUsuario))
}

export const updateObservation = async (
    idUsuario: number,
    idVoluntario: number,
    fechaHoraRegistro: Date,
    observacion: string,
) => {
    const result = await db
        .update(RegistranObservaciones)
        .set({ observacion })
        .where(
            and(
                eq(RegistranObservaciones.idUsuario, idUsuario),
                eq(RegistranObservaciones.idVoluntario, idVoluntario),
                eq(RegistranObservaciones.fechaHoraRegistro, fechaHoraRegistro),
            ),
        )
        .returning()
    if (result.length === 0) {
        throw new AppError(404, 'Observación no encontrada')
    }
    return result[0]
}

export const deleteObservation = async (
    idUsuario: number,
    idVoluntario: number,
    fechaHoraRegistro: Date,
) => {
    const result = await db
        .delete(RegistranObservaciones)
        .where(
            and(
                eq(RegistranObservaciones.idUsuario, idUsuario),
                eq(RegistranObservaciones.idVoluntario, idVoluntario),
                eq(RegistranObservaciones.fechaHoraRegistro, fechaHoraRegistro),
            ),
        )
        .returning()
    if (result.length === 0) {
        throw new AppError(404, 'Observación no encontrada')
    }
    return { deleted: true }
}