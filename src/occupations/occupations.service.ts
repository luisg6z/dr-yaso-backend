import { eq } from 'drizzle-orm'
import { OccupationCreate, OccupationUpdate } from './occupations.schemas'
import { db } from '../db/db'
import { Cargos } from '../db/schemas/Cargos'
import { Pagination } from '../types/types'
import { AppError } from '../common/errors/errors'

export const createOccupation = async (Occupation: OccupationCreate) => {
    // Check if the name is unique
    const existing = await db
        .select()
        .from(Cargos)
        .where(eq(Cargos.nombre, Occupation.name))

    if (existing.length === 1) {
        throw new AppError(400, 'Occupation name already exists')
    }

    return await db
        .insert(Cargos)
        .values({
            nombre: Occupation.name,
            descripcion: Occupation.description,
        })
        .returning()
}

export const getAllOccupations = async (pagination: Pagination) => {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    const occupations = await db
        .select({
            id: Cargos.id,
            name: Cargos.nombre,
            description: Cargos.descripcion,
        })
        .from(Cargos)
        .limit(limit)
        .offset(offset)

    const totalItems = await db.$count(Cargos)
    const totalPages = Math.ceil(totalItems / limit)

    return {
        items: occupations,
        paginate: {
            page,
            limit,
            totalItems,
            totalPages,
        },
    }
}

export const getOccupationById = async (id: number) => {
    return await db
        .select({
            id: Cargos.id,
            name: Cargos.nombre,
            description: Cargos.descripcion,
        })
        .from(Cargos)
        .where(eq(Cargos.id, id))
}

export const updateOccupation = async (
    id: number,
    occupation: OccupationUpdate,
) => {
    const occupationToUpdate = await getOccupationById(id)
    if (occupationToUpdate.length < 1)
        throw new AppError(404, 'Occupation not found')

    if (occupation.name) {
        const existing = await db
            .select()
            .from(Cargos)
            .where(eq(Cargos.nombre, occupation.name))

        if (existing.length > 0)
            throw { message: 'Occupation name already exists' }
    }

    return await db
        .update(Cargos)
        .set({
            nombre: occupation.name,
            descripcion: occupation.description,
        })
        .where(eq(Cargos.id, id))
        .returning()
}

export const deleteOccupation = async (id: number) => {
    const existingOccupation = await getOccupationById(id)
    if (existingOccupation.length < 1)
        throw new AppError(404, 'Occupation not found')

    return await db.delete(Cargos).where(eq(Cargos.id, id)).returning()
}
