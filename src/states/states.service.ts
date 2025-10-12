import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { AppError } from '../common/errors/errors'
import { Estados } from '../db/schemas/Estados'
import { Paises } from '../db/schemas/Paises'

export const getStatesByCountryId = async (id: number) => {
    const country = await db
        .select({ id: Paises.id })
        .from(Paises)
        .where(eq(Paises.id, id))
        .limit(1)

    if (country.length < 1) {
        throw new AppError(400, 'Country not found')
    }

    return await db
        .select({
            id: Estados.id,
            name: Estados.nombre,
        })
        .from(Estados)
        .where(eq(Estados.idPais, id))
}
