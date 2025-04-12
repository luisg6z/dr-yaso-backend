import { integer, pgTable, varchar, serial, text, check } from "drizzle-orm/pg-core";
import { Franquicias } from "./Franquicias";
import { sql } from "drizzle-orm";

export const Usuarios = pgTable("Usuarios", {
  id: serial().primaryKey(),
  nombre: varchar({ length: 100 }).notNull(),
  "contraseña": text().notNull(),
  tipo: varchar({length: 30}).notNull(),
  correo: varchar({length: 120}),
  idFranquicia: integer("idFranquicia").references(() => Franquicias.id, {onUpdate: 'cascade', onDelete: 'restrict'})
},
(table) =>
[
    check("tipoCheck",sql`${table.tipo} IN ('Superusuario','Comite','Registrador de visita','Coordinador')`)
]
);

