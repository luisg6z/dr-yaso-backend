import { db } from '../db/db'
import { MovimientosInventario } from '../db/schemas/MovimientosInventario'
import { TienenStock } from '../db/schemas/TienenStock'
import { Usuarios } from '../db/schemas/Usuarios'
import { eq, and, desc, sql } from 'drizzle-orm'
import { MovementCreate } from './inventory.schemas'
import { AppError } from '../common/errors/errors'
import { Pagination } from '../types/types'

export const createInventoryMovement = async (
    data: MovementCreate,
    idUsuario: number,
) => {
    // Paso A: Consultar estado actual desde TienenStock
    const [current] = await db
        .select({ stockActual: TienenStock.stockActual })
        .from(TienenStock)
        .where(
            and(
                eq(TienenStock.idProducto, data.idProducto),
                eq(TienenStock.idFranquicia, data.idFranquicia),
            ),
        )
        .limit(1)

    const prevSaldo = current?.stockActual ?? 0

    // Paso B: Calcular nuevo saldo
    let nuevoSaldo = prevSaldo
    if (data.tipoMovimiento === 'Entrada') {
        nuevoSaldo = prevSaldo + data.cantidad
    } else {
        nuevoSaldo = prevSaldo - data.cantidad
        if (nuevoSaldo < 0) {
            throw new AppError(400, 'Saldo insuficiente para salida')
        }
    }

    // Paso C: Guardar en transacción - actualizar TienenStock y registrar movimiento
    const row = await db.transaction(async (tx) => {
        const existing = await tx
            .select()
            .from(TienenStock)
            .where(
                and(
                    eq(TienenStock.idProducto, data.idProducto),
                    eq(TienenStock.idFranquicia, data.idFranquicia),
                ),
            )

        if (existing.length === 0) {
            await tx
                .insert(TienenStock)
                .values({
                    idProducto: data.idProducto,
                    idFranquicia: data.idFranquicia,
                    stockActual: nuevoSaldo,
                })
        } else {
            await tx
                .update(TienenStock)
                .set({ stockActual: nuevoSaldo })
                .where(
                    and(
                        eq(TienenStock.idProducto, data.idProducto),
                        eq(TienenStock.idFranquicia, data.idFranquicia),
                    ),
                )
        }

        const [movement] = await tx
            .insert(MovimientosInventario)
            .values({
                tipoMovimiento: data.tipoMovimiento,
                cantidad: data.cantidad,
                saldoFinal: nuevoSaldo,
                observacion: data.observacion,
                idProducto: data.idProducto,
                idFranquicia: data.idFranquicia,
                idUsuario,
            })
            .returning()

        return movement
    })

    return row
}

export const getMovementsForProductFranchise = async (
    productId: number,
    franchiseId: number,
    pagination: Pagination,
) => {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    const rows = await db
        .select({
            id: MovimientosInventario.id,
            tipoMovimiento: MovimientosInventario.tipoMovimiento,
            cantidad: MovimientosInventario.cantidad,
            saldoFinal: MovimientosInventario.saldoFinal,
            fechaHora: MovimientosInventario.fechaHora,
            observacion: MovimientosInventario.observacion,
            idProducto: MovimientosInventario.idProducto,
            idFranquicia: MovimientosInventario.idFranquicia,
            idUsuario: MovimientosInventario.idUsuario,
            usuarioNombre: Usuarios.nombre,
        })
        .from(MovimientosInventario)
        .leftJoin(Usuarios, eq(MovimientosInventario.idUsuario, Usuarios.id))
        .where(
            and(
                eq(MovimientosInventario.idProducto, productId),
                eq(MovimientosInventario.idFranquicia, franchiseId),
            ),
        )
        .orderBy(desc(MovimientosInventario.fechaHora))
        .limit(limit)
        .offset(offset)
    const result = await db.execute<{ count: number }>(
        sql`SELECT COUNT(*)::int AS count FROM ${MovimientosInventario} WHERE ${MovimientosInventario.idProducto} = ${productId} AND ${MovimientosInventario.idFranquicia} = ${franchiseId}`,
    )
    const count = result.rows[0]?.count ?? 0

    return {
        items: rows,
        paginate: {
            page,
            limit,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
        },
    }
}
