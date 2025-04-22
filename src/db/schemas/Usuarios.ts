import { integer } from "drizzle-orm/pg-core";
import { pgTable, varchar, serial, text, pgEnum } from "drizzle-orm/pg-core";
import { Franquicias } from "./Franquicias";

export const tipoUsuarioEnum = pgEnum("TipoUsuario", [
  "Superusuario",
  "Comite",
  "Registrador de visita",
  "Coordinador",
]);

export const Usuarios = pgTable("Usuarios", {
  id: serial().primaryKey(),
  nombre: varchar({ length: 100 }).notNull(),
  "contraseña": text().notNull(),
  tipo: tipoUsuarioEnum("TipoUsuario").notNull(),
  correo: varchar({ length: 120 }),
  idFranquicia: integer("idFranquicia").references(() => Franquicias.id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
});
