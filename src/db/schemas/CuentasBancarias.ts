import { integer, numeric, pgEnum, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { Bancos } from "./Bancos";
import { ResponsablesCuentas } from "./ResponsablesCuentas";
import { Franquicias } from "./Franquicias";

export const tipoMonedaEnum = pgEnum('tipoMoneda', ['VES', 'USD', 'EUR'])

export const CuentasBancarias = pgTable('CuentasBancarias', {
    id: serial().primaryKey(),
    codCuenta: varchar({ length: 20 }).notNull().unique(),
    tipoMoneda: tipoMonedaEnum().notNull(),
    saldo: numeric({ precision: 10, scale: 2 }).notNull().default('0'),
    idResponsable: integer().notNull().references(() => ResponsablesCuentas.id, {
        onUpdate: 'cascade',
        onDelete: 'restrict',
    }),
    codBanco: varchar({ length: 4 }).references(() => Bancos.cod, {
        onUpdate: 'cascade',
        onDelete: 'restrict',
    }),
    idFranquicia: integer().notNull().references(() => Franquicias.id, {
        onUpdate: 'cascade',
        onDelete: 'restrict',
    }),
})