import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { MovimientosCuentas } from '../db/schemas/MovimientosCuentas'
import { CuentasBancarias } from '../db/schemas/CuentasBancarias'
import { AppError } from '../common/errors/errors'
import { AccountMovementCreate } from './account-movements.schemas'
import { Pagination } from '../types/types'

export const createAccountMovement = async (movement: AccountMovementCreate) => {
    return await db.transaction(async (tx) => {
        // 1. Get Bank Account to check existence and current balance
        const account = await tx
            .select()
            .from(CuentasBancarias)
            .where(eq(CuentasBancarias.id, movement.accountId))
            .then(rows => rows[0])

        if (!account) throw new AppError(404, 'Bank Account not found')

        // 2. Calculate new balance
        const currentBalance = Number(account.saldo)
        const newBalance = currentBalance + Number(movement.income) - Number(movement.expense)

        // 3. Create Movement
        const [newMovement] = await tx
            .insert(MovimientosCuentas)
            .values({
                fecha: new Date(movement.date),
                nroReferencia: movement.referenceNumber,
                tipoMovimiento: movement.movementType,
                observacion: movement.observation,
                ingresos: movement.income.toString(),
                egresos: movement.expense.toString(),
                saldoPosterior: newBalance.toString(),
                idCuenta: movement.accountId,
            })
            .returning()

        if (!newMovement) throw new AppError(500, 'Error creating movement')

        // 4. Update Account Balance
        await tx
            .update(CuentasBancarias)
            .set({ saldo: newBalance.toString() })
            .where(eq(CuentasBancarias.id, movement.accountId))

        return {
            id: newMovement.id,
            date: movement.date,
            referenceNumber: movement.referenceNumber,
            movementType: movement.movementType,
            observation: movement.observation,
            income: movement.income,
            expense: movement.expense,
            balanceAfter: newBalance,
            accountId: movement.accountId,
        }
    })
}

const mapAccountMovement = (row: {
    MovimientosCuentas: typeof MovimientosCuentas.$inferSelect
    CuentasBancarias: typeof CuentasBancarias.$inferSelect
}) => {
    return {
        id: row.MovimientosCuentas.id,
        date: row.MovimientosCuentas.fecha,
        referenceNumber: row.MovimientosCuentas.nroReferencia,
        movementType: row.MovimientosCuentas.tipoMovimiento,
        observation: row.MovimientosCuentas.observacion,
        income: Number(row.MovimientosCuentas.ingresos), // Drizzle returns numeric/decimal as string
        expense: Number(row.MovimientosCuentas.egresos),
        balanceAfter: Number(row.MovimientosCuentas.saldoPosterior),
        accountId: row.MovimientosCuentas.idCuenta,
        accountNumber: row.CuentasBancarias.codCuenta,
        franchiseId: row.CuentasBancarias.idFranquicia,
    }
}

export const getAllAccountMovements = async (pagination: Pagination, franchiseId?: number) => {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    let query = db
        .select()
        .from(MovimientosCuentas)
        .innerJoin(CuentasBancarias, eq(CuentasBancarias.id, MovimientosCuentas.idCuenta)) as any

    if (franchiseId) {
        query = query.where(eq(CuentasBancarias.idFranquicia, franchiseId))
    }

    const movements = await query.limit(limit).offset(offset)
    const formattedMovements = movements.map(mapAccountMovement)

    // Count query
    const countQueryBase = db
        .select({ count: MovimientosCuentas.id })
        .from(MovimientosCuentas)
        .innerJoin(CuentasBancarias, eq(CuentasBancarias.id, MovimientosCuentas.idCuenta))

    const countQuery = franchiseId
        ? countQueryBase.where(eq(CuentasBancarias.idFranquicia, franchiseId))
        : countQueryBase

    const totalItems = (await countQuery).length
    const totalPages = Math.ceil(totalItems / limit)

    return {
        items: formattedMovements,
        paginate: {
            page,
            limit,
            totalItems,
            totalPages,
        },
    }
}

export const getAccountMovementById = async (id: number) => {
    const result = await db
        .select()
        .from(MovimientosCuentas)
        .innerJoin(CuentasBancarias, eq(CuentasBancarias.id, MovimientosCuentas.idCuenta))
        .where(eq(MovimientosCuentas.id, id))
        .then(rows => rows[0])

    if (!result) throw new AppError(404, 'Movement not found')

    return mapAccountMovement(result)
}
