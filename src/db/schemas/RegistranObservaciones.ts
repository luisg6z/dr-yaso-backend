import { pgTable, integer, varchar, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { Voluntarios } from './Voluntarios'
import { Usuarios } from './Usuarios'

// Tabla: RegistranObservaciones
// PK compuesta: idUsuario + idVoluntario + fechaHoraRegistro
export const RegistranObservaciones = pgTable(
    'RegistranObservaciones',
    {
        idUsuario: integer('idUsuario')
            .notNull()
            .references(() => Usuarios.id, {
                onUpdate: 'cascade',
                onDelete: 'restrict',
            }),
        idVoluntario: integer('idVoluntario')
            .notNull()
            .references(() => Voluntarios.id, {
                onUpdate: 'cascade',
                onDelete: 'restrict',
            }),
        fechaHoraRegistro: timestamp('fechaHoraRegistro', {
            withTimezone: false,
        })
            .notNull()
            .default(sql`now()`),
        observacion: varchar('observacion', { length: 200 }).notNull(),
    },
    (table) => {
        return {
            pk: {
                name: 'registran_observaciones_pk',
                columns: [
                    table.idUsuario,
                    table.idVoluntario,
                    table.fechaHoraRegistro,
                ],
            },
        }
    },
)

export type RegistranObservacionesRow = {
    idUsuario: number
    idVoluntario: number
    fechaHoraRegistro: Date
    observacion: string
}
