import { integer, numeric, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { Franquicias } from "./Franquicias";
import { tipoMonedaEnum } from "./CuentasBancarias";
import { Voluntarios } from "./Voluntarios";


export const CajasChicas = pgTable('CajasChicas', {
    id: serial().primaryKey(),
    codCaja: varchar({ length: 20 }).notNull().unique(),
    nombre: varchar({ length: 100 }).notNull(),
    saldo: numeric({ precision: 10, scale: 2 }).notNull().default('0'),
    tipoMoneda: tipoMonedaEnum().notNull(),
    idFranquicia: integer().notNull().references(() => Franquicias.id, {
        onUpdate: 'cascade',
        onDelete: 'restrict',
    }),
    idResponsable: integer().notNull().references(() => Voluntarios.id, {
        onUpdate: 'cascade',
        onDelete: 'restrict',
    }),
})