import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core'
import { Franquicias } from './Franquicias'

export const Locaciones = pgTable('Locaciones', {
    id: serial().primaryKey(),
    descripcion: varchar({ length: 120 }).notNull(),
    idFranquicia: integer('idFranquicia')
        .references(() => Franquicias.id, {
            onUpdate: 'cascade',
            onDelete: 'restrict',
        })
        .notNull(),
})
