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

        return newMovement
    })
}

export const getAllAccountMovements = async (pagination: Pagination, franchiseId?: number) => {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    let query = db
        .select({
            id: MovimientosCuentas.id,
            date: MovimientosCuentas.fecha,
            referenceNumber: MovimientosCuentas.nroReferencia,
            movementType: MovimientosCuentas.tipoMovimiento,
            observation: MovimientosCuentas.observacion,
            income: MovimientosCuentas.ingresos,
            expense: MovimientosCuentas.egresos,
            balanceAfter: MovimientosCuentas.saldoPosterior,
            accountId: MovimientosCuentas.idCuenta,
            accountNumber: CuentasBancarias.codCuenta,
        })
        .from(MovimientosCuentas)
        .innerJoin(CuentasBancarias, eq(CuentasBancarias.id, MovimientosCuentas.idCuenta))

    if (franchiseId) {
        query = query.where(eq(CuentasBancarias.idFranquicia, franchiseId)) as any
    }

    const movements = await query.limit(limit).offset(offset)

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
        items: movements,
        paginate: {
            page,
            limit,
            totalItems,
            totalPages,
        },
    }
}

export const getAccountMovementById = async (id: number) => {
    const movement = await db
        .select({
            id: MovimientosCuentas.id,
            date: MovimientosCuentas.fecha,
            referenceNumber: MovimientosCuentas.nroReferencia,
            movementType: MovimientosCuentas.tipoMovimiento,
            observation: MovimientosCuentas.observacion,
            income: MovimientosCuentas.ingresos,
            expense: MovimientosCuentas.egresos,
            balanceAfter: MovimientosCuentas.saldoPosterior,
            accountId: MovimientosCuentas.idCuenta,
            accountNumber: CuentasBancarias.codCuenta,
            franchiseId: CuentasBancarias.idFranquicia, // for permission check
        })
        .from(MovimientosCuentas)
        .innerJoin(CuentasBancarias, eq(CuentasBancarias.id, MovimientosCuentas.idCuenta))
        .where(eq(MovimientosCuentas.id, id))
        .then(rows => rows[0])

    if (!movement) throw new AppError(404, 'Movement not found')

    return movement
}
