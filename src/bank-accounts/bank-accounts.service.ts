import { eq, and, sql } from 'drizzle-orm'
import { db } from '../db/db'
import { CuentasBancarias } from '../db/schemas/CuentasBancarias'
import { ResponsablesCuentas } from '../db/schemas/ResponsablesCuentas'
import { Bancos } from '../db/schemas/Bancos'
import { Franquicias } from '../db/schemas/Franquicias'
import { AppError } from '../common/errors/errors'
import { BankAccountCreate, BankAccountUpdate } from './bank-accounts.schemas'
import { Pagination } from '../types/types'

export const createBankAccount = async (data: BankAccountCreate) => {
    // Check if account already exists
    const existingAccount = await db
        .select()
        .from(CuentasBancarias)
        .where(eq(CuentasBancarias.codCuenta, data.accountNumber))

    if (existingAccount.length > 0) {
        throw new AppError(409, 'Bank account with this number already exists')
    }

    // Verify Bank exists
    const bank = await db.select().from(Bancos).where(eq(Bancos.cod, data.bankCode)).then(rows => rows[0])
    if (!bank) throw new AppError(404, 'Bank not found')

    return await db.transaction(async (tx) => {
        // 1. Find or Create Responsible
        let responsibleId: number

        const existingResponsible = await tx
            .select()
            .from(ResponsablesCuentas)
            .where(eq(ResponsablesCuentas.numeroDocumento, data.responsible.documentNumber))
            .then(rows => rows[0])

        if (existingResponsible) {
            responsibleId = existingResponsible.id
            // Optionally update responsible details if provided? Let's assume we use existing one.
        } else {
            const [newResponsible] = await tx
                .insert(ResponsablesCuentas)
                .values({
                    tipoDocumento: data.responsible.documentType as any, // Cast to enum
                    numeroDocumento: data.responsible.documentNumber,
                    nombres: data.responsible.firstName,
                    apellidos: data.responsible.lastName,
                })
                .returning()

            if (!newResponsible) throw new AppError(500, 'Error creating responsible')
            responsibleId = newResponsible.id
        }

        // 2. Create Bank Account
        const [newAccount] = await tx
            .insert(CuentasBancarias)
            .values({
                codCuenta: data.accountNumber,
                tipoMoneda: data.currency,
                saldo: '0',
                idResponsable: responsibleId,
                codBanco: data.bankCode,
                idFranquicia: data.franchiseId,
            })
            .returning()

        if (!newAccount) throw new AppError(500, 'Error creating bank account')

        return {
            id: newAccount.id,
            accountNumber: newAccount.codCuenta,
            currency: newAccount.tipoMoneda,
            balance: newAccount.saldo,
            franchiseId: newAccount.idFranquicia,
            bankCode: newAccount.codBanco,
            responsibleId: newAccount.idResponsable,
        }
    })
}

const mapBankAccount = (row: {
    CuentasBancarias: typeof CuentasBancarias.$inferSelect
    Bancos: typeof Bancos.$inferSelect
    Franquicias: typeof Franquicias.$inferSelect
    ResponsablesCuentas: typeof ResponsablesCuentas.$inferSelect
}) => {
    return {
        id: row.CuentasBancarias.id,
        accountNumber: row.CuentasBancarias.codCuenta,
        currency: row.CuentasBancarias.tipoMoneda,
        balance: row.CuentasBancarias.saldo,
        franchiseId: row.CuentasBancarias.idFranquicia,
        bankCode: row.CuentasBancarias.codBanco,
        responsibleId: row.CuentasBancarias.idResponsable,
        bankName: row.Bancos.nombre,
        franchiseName: row.Franquicias.nombre,
        responsible: {
            id: row.ResponsablesCuentas.id,
            documentType: row.ResponsablesCuentas.tipoDocumento,
            documentNumber: row.ResponsablesCuentas.numeroDocumento,
            firstName: row.ResponsablesCuentas.nombres,
            lastName: row.ResponsablesCuentas.apellidos,
        },
    }
}

export const getAllBankAccounts = async (pagination: Pagination, franchiseId?: number) => {
    const { page, limit, status } = pagination
    const offset = (page - 1) * limit

    const whereCondition = and(
        franchiseId ? eq(CuentasBancarias.idFranquicia, franchiseId) : undefined,
        status === 'active'
            ? eq(Franquicias.estaActivo, true)
            : status === 'inactive'
                ? eq(Franquicias.estaActivo, false)
                : undefined,
    )

    const rows = await db
        .select()
        .from(CuentasBancarias)
        .innerJoin(Bancos, eq(Bancos.cod, CuentasBancarias.codBanco))
        .innerJoin(Franquicias, eq(Franquicias.id, CuentasBancarias.idFranquicia))
        .innerJoin(ResponsablesCuentas, eq(ResponsablesCuentas.id, CuentasBancarias.idResponsable))
        .where(whereCondition)
        .limit(limit)
        .offset(offset)

    const accounts = rows.map(mapBankAccount)

    const totalItems = await db
        .select({ count: sql<number>`count(*)` })
        .from(CuentasBancarias)
        .innerJoin(Franquicias, eq(Franquicias.id, CuentasBancarias.idFranquicia))
        .where(whereCondition)
        .then((rows) => Number(rows[0].count))

    const totalPages = Math.ceil(totalItems / limit)

    return {
        items: accounts,
        paginate: {
            page,
            limit,
            totalItems,
            totalPages,
        },
    }
}

export const getBankAccountById = async (id: number) => {
    const row = await db
        .select()
        .from(CuentasBancarias)
        .innerJoin(Bancos, eq(Bancos.cod, CuentasBancarias.codBanco))
        .innerJoin(Franquicias, eq(Franquicias.id, CuentasBancarias.idFranquicia))
        .innerJoin(ResponsablesCuentas, eq(ResponsablesCuentas.id, CuentasBancarias.idResponsable))
        .where(eq(CuentasBancarias.id, id))
        .then(rows => rows[0])

    if (!row) throw new AppError(404, 'Bank Account not found')

    return mapBankAccount(row)
}

export const updateBankAccount = async (id: number, data: BankAccountUpdate) => {
    const existingAccount = await getBankAccountById(id)
    if (!existingAccount) throw new AppError(404, 'Bank Account not found')

    return await db.transaction(async (tx) => {
        // Update Account details
        if (data.accountNumber || data.bankCode) {
            await tx
                .update(CuentasBancarias)
                .set({
                    codCuenta: data.accountNumber,
                    codBanco: data.bankCode,
                })
                .where(eq(CuentasBancarias.id, id))
        }

        // Update Responsible details if provided
        if (data.responsible) {
            await tx
                .update(ResponsablesCuentas)
                .set({
                    tipoDocumento: data.responsible.documentType as any,
                    numeroDocumento: data.responsible.documentNumber,
                    nombres: data.responsible.firstName,
                    apellidos: data.responsible.lastName,
                })
                .where(eq(ResponsablesCuentas.id, existingAccount.responsibleId))
        }

        return await getBankAccountById(id) // Return updated full object
    })
}

export const deleteBankAccount = async (id: number) => {
    const existingAccount = await getBankAccountById(id)
    if (!existingAccount) throw new AppError(404, 'Bank Account not found')

    await db.delete(CuentasBancarias).where(eq(CuentasBancarias.id, id))
    // We do NOT delete the responsible as they might be responsible for other accounts.

    return { message: 'Bank Account deleted successfully' }
}
