import { eq, and, sql } from 'drizzle-orm'
import { db } from '../db/db'
import { MovimientosCaja } from '../db/schemas/MovimientosCaja'
import { CajasChicas } from '../db/schemas/CajasChicas'
import { Franquicias } from '../db/schemas/Franquicias'
import { AppError } from '../common/errors/errors'
import { CashMovementCreate } from './cash-movements.schemas'
import { Pagination } from '../types/types'

export const createCashMovement = async (movement: CashMovementCreate) => {
    return await db.transaction(async (tx) => {
        // 1. Get Petty Cash to check existence and current balance
        const pettyCash = await tx
            .select()
            .from(CajasChicas)
            .where(eq(CajasChicas.id, movement.pettyCashId))
            .then((rows) => rows[0])

        if (!pettyCash) throw new AppError(404, 'Petty Cash not found')

        // 2. Calculate new balance
        const currentBalance = Number(pettyCash.saldo)
        const newBalance =
            currentBalance + Number(movement.income) - Number(movement.expense)

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

        return {
            id: newMovement.id,
            date: movement.date,
            observation: movement.observation,
            income: movement.income,
            expense: movement.expense,
            pettyCashId: movement.pettyCashId,
        }
    })
}

export const getAllCashMovements = async (
    pagination: Pagination,
    franchiseId?: number,
) => {
    const { page, limit, status } = pagination
    const offset = (page - 1) * limit

    const whereCondition = and(
        franchiseId ? eq(CajasChicas.idFranquicia, franchiseId) : undefined,
        status === 'active'
            ? eq(Franquicias.estaActivo, true)
            : status === 'inactive'
              ? eq(Franquicias.estaActivo, false)
              : undefined,
    )

    const movements = await db
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
        .innerJoin(Franquicias, eq(Franquicias.id, CajasChicas.idFranquicia))
        .where(whereCondition)
        .limit(limit)
        .offset(offset)

    const totalItems = await db
        .select({ count: sql<number>`count(*)` })
        .from(MovimientosCaja)
        .innerJoin(CajasChicas, eq(CajasChicas.id, MovimientosCaja.idCaja))
        .innerJoin(Franquicias, eq(Franquicias.id, CajasChicas.idFranquicia))
        .where(whereCondition)
        .then((rows) => Number(rows[0].count))

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
        .then((rows) => rows[0])

    if (!movement) throw new AppError(404, 'Movement not found')

    return movement
}
