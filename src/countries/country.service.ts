import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { Paises } from '../db/schemas/Paises'
import { Pagination } from '../types/types'

export const getAllCountries = async (pagination: Pagination) => {
    const { page, limit } = pagination

    const offset = (page - 1) * limit

    const countries = await db
        .select({
            id: Paises.id,
            name: Paises.nombre,
        })
        .from(Paises)
        .limit(limit)
        .offset(offset)

    const totalItems = await db.$count(Paises)
    const totalPages = Math.ceil(totalItems / limit)

    return {
        items: countries,
        paginate: {
            page,
            limit,
            totalItems,
            totalPages,
        },
    }
}

export const getCountryById = async (id: number) => {
    return await db
        .select({
            id: Paises.id,
            name: Paises.nombre,
        })
        .from(Paises)
        .where(eq(Paises.id, id))
}
