import { pgTable, serial, varchar } from 'drizzle-orm/pg-core'
import { tipoDocumentoEnum } from './Voluntarios'

export const ResponsablesCuentas = pgTable('ResponsablesCuentas', {
    id: serial().primaryKey(),
    tipoDocumento: tipoDocumentoEnum('tipoDocumento').notNull(),
    numeroDocumento: varchar('numeroDocumento', { length: 12 })
        .notNull()
        .unique(),
    nombres: varchar('nombres', { length: 100 }).notNull(),
    apellidos: varchar('apellidos', { length: 100 }).notNull(),
})
