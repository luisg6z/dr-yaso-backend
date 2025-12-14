import { pgTable, integer } from 'drizzle-orm/pg-core'
import { Productos } from './Productos'
import { Franquicias } from './Franquicias'

export const TienenStock = pgTable('TienenStock', {
    idProducto: integer('idProducto')
        .notNull()
        .references(() => Productos.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    idFranquicia: integer('idFranquicia')
        .notNull()
        .references(() => Franquicias.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    stockActual: integer('stockActual').notNull().default(0),
}, (table) => {
    return {
        pk: { columns: [table.idProducto, table.idFranquicia] },
    }
})

export type TienenStockRow = {
    idProducto: number
    idFranquicia: number
    stockActual: number
}