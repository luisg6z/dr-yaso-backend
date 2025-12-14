import { pgTable, serial, integer, date, varchar, pgEnum } from 'drizzle-orm/pg-core'
import { Voluntarios } from './Voluntarios'
import { Franquicias } from './Franquicias'

export const estadoTraspasoEnum = pgEnum('estadoTraspaso', [
    'pendiente',
    'aprobado',
    'rechazada',
])

export const Traspasos = pgTable('Traspasos', {
    id: serial('id').primaryKey(),
    idVoluntario: integer('idVoluntario')
        .references(() => Voluntarios.id)
        .notNull(),
    idFranquiciaOrigen: integer('idFranquiciaOrigen')
        .references(() => Franquicias.id)
        .notNull(),
    idFranquiciaDestino: integer('idFranquiciaDestino')
        .references(() => Franquicias.id)
        .notNull(),
    fecha: date('fecha').notNull(),
    estado: estadoTraspasoEnum('estado').notNull().default('pendiente'),
    motivo: varchar('motivo').notNull(),
    observacion: varchar('observacion'),
})
