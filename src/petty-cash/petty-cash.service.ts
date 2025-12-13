import { eq, and } from 'drizzle-orm'
import { db } from '../db/db'
import { CajasChicas } from '../db/schemas/CajasChicas'
import { Voluntarios } from '../db/schemas/Voluntarios'
import { Franquicias } from '../db/schemas/Franquicias'
import { AppError } from '../common/errors/errors'
import { PettyCashCreate, PettyCashUpdate } from './petty-cash.schemas'
import { Pagination } from '../types/types'

// TODO: Implement franchise verification
const verifyFranchiseAccess = (userFranchiseId: number | undefined, targetFranchiseId: number, userRole: string) => {
    if (userRole === 'Superusuario') return
    if (userFranchiseId !== targetFranchiseId) {
        throw new AppError(403, 'Unauthorized access to this franchise data')
    }
}

export const createPettyCash = async (pettyCash: PettyCashCreate) => {
    const existingPettyCash = await db
        .select()
        .from(CajasChicas)
        .where(eq(CajasChicas.codCaja, pettyCash.code))

    if (existingPettyCash.length > 0) {
        throw new AppError(409, 'Petty Cash with this code already exists')
    }

    // Verify responsible exists and belongs to franchise? (Optional but good practice)
    const responsible = await db
        .select()
        .from(Voluntarios)
        .where(eq(Voluntarios.id, pettyCash.responsibleId))
        .then(rows => rows[0])

    if (!responsible) throw new AppError(404, 'Responsible volunteer not found')

    const [newPettyCash] = await db
        .insert(CajasChicas)
        .values({
            codCaja: pettyCash.code,
            nombre: pettyCash.name,
            tipoMoneda: pettyCash.currency,
            idFranquicia: pettyCash.franchiseId,
            idResponsable: pettyCash.responsibleId,
            saldo: '0',
        })
        .returning()

    if (!newPettyCash) throw new AppError(500, 'Error creating petty cash')

    return getPettyCashById(newPettyCash.id)
}

export const getAllPettyCash = async (pagination: Pagination, franchiseId?: number) => {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    const whereCondition = franchiseId ? eq(CajasChicas.idFranquicia, franchiseId) : undefined

    const pettyCashList = await db
        .select({
            id: CajasChicas.id,
            code: CajasChicas.codCaja,
            name: CajasChicas.nombre,
            balance: CajasChicas.saldo,
            currency: CajasChicas.tipoMoneda,
            franchiseId: CajasChicas.idFranquicia,
            responsibleId: CajasChicas.idResponsable,
            responsibleName: Voluntarios.nombres, // Simplified, maybe concat names
            franchiseName: Franquicias.nombre,
        })
        .from(CajasChicas)
        .innerJoin(Voluntarios, eq(Voluntarios.id, CajasChicas.idResponsable))
        .innerJoin(Franquicias, eq(Franquicias.id, CajasChicas.idFranquicia))
        .where(whereCondition)
        .limit(limit)
        .offset(offset)

    const totalItems = await db.$count(CajasChicas, whereCondition)
    const totalPages = Math.ceil(totalItems / limit)

    return {
        items: pettyCashList,
        paginate: {
            page,
            limit,
            totalItems,
            totalPages,
        },
    }
}

export const getPettyCashById = async (id: number) => {
    const pettyCash = await db
        .select({
            id: CajasChicas.id,
            code: CajasChicas.codCaja,
            name: CajasChicas.nombre,
            balance: CajasChicas.saldo,
            currency: CajasChicas.tipoMoneda,
            franchiseId: CajasChicas.idFranquicia,
            responsibleId: CajasChicas.idResponsable,
            responsibleName: Voluntarios.nombres,
            franchiseName: Franquicias.nombre,
        })
        .from(CajasChicas)
        .innerJoin(Voluntarios, eq(Voluntarios.id, CajasChicas.idResponsable))
        .innerJoin(Franquicias, eq(Franquicias.id, CajasChicas.idFranquicia))
        .where(eq(CajasChicas.id, id))
        .then((rows) => rows[0])

    if (!pettyCash) throw new AppError(404, 'Petty Cash not found')

    return pettyCash
}

export const updatePettyCash = async (id: number, pettyCashUpdate: PettyCashUpdate) => {
    const existingPettyCash = await getPettyCashById(id)
    if (!existingPettyCash) throw new AppError(404, 'Petty Cash not found')

    const updateData: any = {}
    if (pettyCashUpdate.code) updateData.codCaja = pettyCashUpdate.code
    if (pettyCashUpdate.name) updateData.nombre = pettyCashUpdate.name
    if (pettyCashUpdate.currency) updateData.tipoMoneda = pettyCashUpdate.currency
    if (pettyCashUpdate.franchiseId) updateData.idFranquicia = pettyCashUpdate.franchiseId
    if (pettyCashUpdate.responsibleId) updateData.idResponsable = pettyCashUpdate.responsibleId

    // If no fields to update, return existing
    if (Object.keys(updateData).length === 0) return existingPettyCash

    const [updatedPettyCash] = await db
        .update(CajasChicas)
        .set(updateData)
        .where(eq(CajasChicas.id, id))
        .returning()

    if (!updatedPettyCash) throw new AppError(500, 'Error updating petty cash')

    return getPettyCashById(id)
}

export const deletePettyCash = async (id: number) => {
    const existingPettyCash = await getPettyCashById(id)
    if (!existingPettyCash) throw new AppError(404, 'Petty Cash not found')

    // Check for movements or other constraints if needed (schema has restrict on delete usually)

    await db.delete(CajasChicas).where(eq(CajasChicas.id, id))

    return { message: 'Petty Cash deleted successfully' }
}
