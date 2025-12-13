import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { MovimientosCaja } from '../db/schemas/MovimientosCaja'
import { CajasChicas } from '../db/schemas/CajasChicas'
import { AppError } from '../common/errors/errors'
import { CashMovementCreate } from './cash-movements.schemas'
import { Pagination } from '../types/types'

export const createCashMovement = async (movement: CashMovementCreate) => {
    const cashMovId = await db.transaction(async (tx) => {
        // 1. Get Petty Cash to check existence and current balance
        const pettyCash = await tx
            .select()
            .from(CajasChicas)
            .where(eq(CajasChicas.id, movement.pettyCashId))
            .then(rows => rows[0])

        if (!pettyCash) throw new AppError(404, 'Petty Cash not found')

        // 2. Calculate new balance
        const currentBalance = Number(pettyCash.saldo)
        const newBalance = currentBalance + Number(movement.income) - Number(movement.expense)

        // 3. Create Movement
        const [newMovement] = await tx
            .insert(MovimientosCaja)
            .values({
                fecha: new Date(movement.date),
                observacion: movement.observation,
                ingresos: movement.income.toString(),
                egresos: movement.expense.toString(),
                saldoPosterior: newBalance.toString(),
                idCaja: movement.pettyCashId,
            })
            .returning()

        if (!newMovement) throw new AppError(500, 'Error creating movement')

        // 4. Update Petty Cash Balance
        await tx
            .update(CajasChicas)
            .set({ saldo: newBalance.toString() })
            .where(eq(CajasChicas.id, movement.pettyCashId))

        return newMovement.id
    })

    return getCashMovementById(cashMovId)
}

export const getAllCashMovements = async (pagination: Pagination, franchiseId?: number) => {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    let query = db
        .select({
            id: MovimientosCaja.id,
            date: MovimientosCaja.fecha,
            observation: MovimientosCaja.observacion,
            income: MovimientosCaja.ingresos,
            expense: MovimientosCaja.egresos,
            balanceAfter: MovimientosCaja.saldoPosterior,
            pettyCashId: MovimientosCaja.idCaja,
            pettyCashName: CajasChicas.nombre,
        })
        .from(MovimientosCaja)
        .innerJoin(CajasChicas, eq(CajasChicas.id, MovimientosCaja.idCaja))

    if (franchiseId) {
        query = query.where(eq(CajasChicas.idFranquicia, franchiseId)) as any
    }

    const movements = await query.limit(limit).offset(offset)

    // Count query needs similar filtering
    let countQuery = db
        .select({ count: MovimientosCaja.id })
        .from(MovimientosCaja)
        .innerJoin(CajasChicas, eq(CajasChicas.id, MovimientosCaja.idCaja))

    if (franchiseId) {
        countQuery = countQuery.where(eq(CajasChicas.idFranquicia, franchiseId)) as any
    }

    const totalItems = (await countQuery).length // Not efficient for large datasets but works for now or use proper count approach
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

export const getCashMovementById = async (id: number) => {
    const movement = await db
        .select({
            id: MovimientosCaja.id,
            date: MovimientosCaja.fecha,
            observation: MovimientosCaja.observacion,
            income: MovimientosCaja.ingresos,
            expense: MovimientosCaja.egresos,
            balanceAfter: MovimientosCaja.saldoPosterior,
            pettyCashId: MovimientosCaja.idCaja,
            pettyCashName: CajasChicas.nombre,
            franchiseId: CajasChicas.idFranquicia, // Needed for permission check
        })
        .from(MovimientosCaja)
        .innerJoin(CajasChicas, eq(CajasChicas.id, MovimientosCaja.idCaja))
        .where(eq(MovimientosCaja.id, id))
        .then(rows => rows[0])

    if (!movement) throw new AppError(404, 'Movement not found')

    return movement
}
