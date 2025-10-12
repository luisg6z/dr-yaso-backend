import { pgTable, integer, primaryKey, pgEnum } from 'drizzle-orm/pg-core'
import { Visitas } from './Visitas'
import { Voluntarios } from './Voluntarios'

export const responsabilitiesEnum = pgEnum('Responsabilidades', [
    'Pasillero',
    'Payaso',
    'Coordinador',
])

export const Realizan = pgTable(
    'Realizan',
    {
        idVisita: integer('idVisita').references(() => Visitas.id, {
            onUpdate: 'cascade',
            onDelete: 'restrict',
        }),
        idVoluntario: integer('idVoluntario').references(() => Voluntarios.id, {
            onUpdate: 'cascade',
            onDelete: 'restrict',
        }),
        responsabilidad: responsabilitiesEnum('Responsabilidades').notNull(),
    },
    (table) => [
        {
            pk: primaryKey({ columns: [table.idVisita, table.idVoluntario] }),
        },
    ],
)
