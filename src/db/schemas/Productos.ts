import { pgTable, serial, varchar } from 'drizzle-orm/pg-core'

export const Productos = pgTable('Productos', {
    id: serial('id').primaryKey(),
    nombre: varchar('nombre', { length: 50 }).notNull(),
    descripcion: varchar('descripcion', { length: 200 }).notNull(),
})

export type ProductoRow = {
    id: number
    nombre: string
    descripcion: string
}
