import { integer, pgTable, varchar, serial } from 'drizzle-orm/pg-core'
import { Paises } from './Paises'

export const Estados = pgTable('Estados', {
    id: serial().primaryKey(),
    nombre: varchar({ length: 100 }).notNull(),
    idPais: integer('idPais').references(() => Paises.id, {
        onUpdate: 'cascade',
        onDelete: 'restrict',
    }),
})
