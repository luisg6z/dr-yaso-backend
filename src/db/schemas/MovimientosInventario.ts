import { pgTable, serial, integer, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { Productos } from './Productos'
import { Franquicias } from './Franquicias'
import { Usuarios } from './Usuarios'

export const tipoMovimientoInventarioEnum = pgEnum('TipoMovimientoInventario', [
    'Entrada',
    'Salida',
])

export const MovimientosInventario = pgTable('MovimientosInventario', {
    id: serial('id').primaryKey(),
    tipoMovimiento: tipoMovimientoInventarioEnum('tipoMovimiento').notNull(),
    cantidad: integer('cantidad').notNull(),
    saldoFinal: integer('saldoFinal').notNull(),
    fechaHora: timestamp('fechaHora', { withTimezone: false }).notNull().default(sql`now()`),
    observacion: varchar('observacion', { length: 200 }).notNull(),
    idProducto: integer('idProducto').notNull().references(() => Productos.id, {
        onUpdate: 'cascade',
        onDelete: 'restrict',
    }),
    idFranquicia: integer('idFranquicia').notNull().references(() => Franquicias.id, {
        onUpdate: 'cascade',
        onDelete: 'restrict',
    }),
    idUsuario: integer('idUsuario').notNull().references(() => Usuarios.id, {
        onUpdate: 'cascade',
        onDelete: 'restrict',
    }),
})

export type MovimientoInventarioRow = {
    id: number
    tipoMovimiento: 'Entrada' | 'Salida'
    cantidad: number
    saldoFinal: number
    fechaHora: Date
    observacion: string
    idProducto: number
    idFranquicia: number
    idUsuario: number
}