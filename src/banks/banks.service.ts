import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { Bancos } from '../db/schemas/Bancos'
import { AppError } from '../common/errors/errors'
import { BankCreate, BankUpdate } from './banks.schemas'
import { Pagination } from '../types/types'

export const createBank = async (bank: BankCreate) => {
    const existingBank = await db
        .select()
        .from(Bancos)
        .where(eq(Bancos.cod, bank.cod))

    if (existingBank.length > 0) {
        throw new AppError(409, 'Bank with this code already exists')
    }

    const [newBank] = await db
        .insert(Bancos)
        .values({
            cod: bank.cod,
            nombre: bank.name,
        })
        .returning()

    if (!newBank) throw new AppError(500, 'Error creating bank')

    return {
        cod: newBank.cod,
        name: newBank.nombre,
    }
}

export const getAllBanks = async (pagination: Pagination) => {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    const banks = await db
        .select({
            cod: Bancos.cod,
            name: Bancos.nombre,
        })
        .from(Bancos)
        .limit(limit)
        .offset(offset)

    const totalItems = await db.$count(Bancos)
    const totalPages = Math.ceil(totalItems / limit)

    return {
        items: banks,
        paginate: {
            page,
            limit,
            totalItems,
            totalPages,
        },
    }
}

export const getBankByCod = async (cod: string) => {
    const bank = await db
        .select({
            cod: Bancos.cod,
            name: Bancos.nombre,
        })
        .from(Bancos)
        .where(eq(Bancos.cod, cod))
        .then((rows) => rows[0])

    if (!bank) throw new AppError(404, 'Bank not found')

    return bank
}

export const updateBank = async (cod: string, bank: BankUpdate) => {
    const existingBank = await getBankByCod(cod)
    if (!existingBank) throw new AppError(404, 'Bank not found')

    const [updatedBank] = await db
        .update(Bancos)
        .set({
            nombre: bank.name,
        })
        .where(eq(Bancos.cod, cod))
        .returning()

    if (!updatedBank) throw new AppError(500, 'Error updating bank')

    return {
        cod: updatedBank.cod,
        name: updatedBank.nombre,
    }
}

export const deleteBank = async (cod: string) => {
    const existingBank = await getBankByCod(cod)
    if (!existingBank) throw new AppError(404, 'Bank not found')

    await db.delete(Bancos).where(eq(Bancos.cod, cod))

    return { message: 'Bank deleted successfully' }
}
