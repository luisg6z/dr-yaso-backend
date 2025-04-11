import {  pgTable, varchar, serial } from "drizzle-orm/pg-core";

export const Cargos = pgTable("Cargos", {
  id: serial().primaryKey(),
  nombre: varchar({ length: 60 }).notNull().unique(),
  descripcion: varchar({length: 120}),
});
