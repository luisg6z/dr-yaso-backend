import { boolean, pgTable, integer, primaryKey } from 'drizzle-orm/pg-core'
import { Cargos } from './Cargos'
import { Voluntarios } from './Voluntarios'

export const Tienen = pgTable(
    'Tienen',
    {
        idCargo: integer('idCargo').references(() => Cargos.id, {
            onUpdate: 'cascade',
            onDelete: 'restrict',
        }),
        idVoluntario: integer('idVoluntario').references(() => Voluntarios.id, {
            onUpdate: 'cascade',
            onDelete: 'restrict',
        }),
        esCargoPrincipal: boolean('esCargoPrincipal').notNull(),
    },
    (table) => [
        {
            pk: primaryKey({ columns: [table.idCargo, table.idVoluntario] }),
        },
    ],
)
