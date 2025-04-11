import { integer, pgTable, varchar, serial, unique } from "drizzle-orm/pg-core";
import { Estados } from "./Estados";

export const Ciudades = pgTable("Ciudades", {
  id: serial().primaryKey(),
  nombre: varchar({ length: 100 }).notNull(),
  idEstado: integer("idEstado").references(() => Estados.id,{onUpdate: 'cascade',onDelete: 'restrict'}),
});
