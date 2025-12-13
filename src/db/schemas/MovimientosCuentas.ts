import { integer, numeric, pgEnum, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { CuentasBancarias } from "./CuentasBancarias";

export const tipoMovimientoEnum = pgEnum('tipoMovimiento', ['Transferencia', 'Pago Móvil', 'Depósito', 'Retiro', 'Cheque', 'Tarjeta'])

export const MovimientosCuentas = pgTable('MovimientosCuentas', {
    id: serial().primaryKey(),
    fecha: timestamp().notNull(),
    nroReferencia: varchar({ length: 20 }).notNull(),
    tipoMovimiento: tipoMovimientoEnum().notNull(),
    observacion: varchar({ length: 30 }).notNull(),
    ingresos: numeric({ precision: 10, scale: 2 }).notNull().default('0'),
    egresos: numeric({ precision: 10, scale: 2 }).notNull().default('0'),
    saldoPosterior: numeric({ precision: 10, scale: 2 }).notNull().default('0'),
    idCuenta: integer().notNull().references(() => CuentasBancarias.id, {
        onUpdate: 'cascade',
        onDelete: 'restrict',
    }),
})