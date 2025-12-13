import { integer, numeric, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { CajasChicas } from "./CajasChicas";


export const MovimientosCaja = pgTable('MovimientosCaja', {
    id: serial().primaryKey(),
    fecha: timestamp().notNull(),
    observacion: varchar({ length: 30 }).notNull(),
    ingresos: numeric({ precision: 10, scale: 2 }).notNull().default('0'),
    egresos: numeric({ precision: 10, scale: 2 }).notNull().default('0'),
    saldoPosterior: numeric({ precision: 10, scale: 2 }).notNull().default('0'),
    idCaja: integer().notNull().references(() => CajasChicas.id, {
        onUpdate: 'cascade',
        onDelete: 'restrict',
    }),
})