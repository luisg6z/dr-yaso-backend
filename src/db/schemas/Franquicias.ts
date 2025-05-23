import { integer, pgTable, varchar, serial, boolean } from "drizzle-orm/pg-core";
import { Ciudades } from "./Ciudades";
import { Voluntarios } from "./Voluntarios";

export const Franquicias = pgTable("Franquicias", {
  id: serial().primaryKey(),
  rif: varchar({ length: 12 }).notNull(),
  nombre: varchar({ length: 100 }).notNull(),
  direccion: varchar({ length: 120 }).notNull(),
  telefono: varchar({ length: 12 }).notNull(),
  correo: varchar({ length: 60 }).notNull(),
  estaActivo: boolean().notNull().default(true),
  idCiudad: integer("idCiudad").references(() => Ciudades.id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
  idCoordinador: integer("idCoordinador").references(() => Voluntarios.id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
});
