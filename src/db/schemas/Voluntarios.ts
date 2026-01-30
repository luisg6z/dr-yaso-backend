import {
    pgTable,
    varchar,
    serial,
    pgEnum,
    uniqueIndex,
} from 'drizzle-orm/pg-core'
import { timestamp } from 'drizzle-orm/pg-core'

export const tipoDocumentoEnum = pgEnum('tipoDocumento', ['V', 'E', 'P'])
export const estatusEnum = pgEnum('Estatus', [
    'Activo',
    'Desvinculado',
    'De permiso',
])

export const generoEnum = pgEnum('Generos', ['Masculino', 'Femenino', 'Otro'])

export const Voluntarios = pgTable(
    'Voluntarios',
    {
        id: serial().primaryKey(),
        nombres: varchar({ length: 100 }).notNull(),
        apellidos: varchar({ length: 100 }).notNull(),
        tipoDocumento: tipoDocumentoEnum('tipoDocumento').notNull(),
        numeroDocumento: varchar('numeroDocumento', { length: 12 })
            .notNull()
            .unique(),
        fechaNacimiento: timestamp('fechaNacimiento').notNull(),
        profesion: varchar({ length: 60 }).notNull(),
        estatus: estatusEnum('estatus').notNull(),
        genero: generoEnum('generos').notNull(),
    },
    (table) => ({
        idx_voluntarios_numeroDocumento: uniqueIndex(
            'idx_voluntarios_numeroDocumento',
        ).on(table.numeroDocumento, table.tipoDocumento),
    }),
)
