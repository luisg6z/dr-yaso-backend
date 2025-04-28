import {
  integer,
  pgTable,
  varchar,
  serial,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { Voluntarios } from "./Voluntarios";
import { Franquicias } from "./Franquicias";

export const tipoReunionComiteEnum = pgEnum("TiposReunionComite", [
  "Responsable de visita",

  "Redes Sociales",

  "Captación de recursos",

  "Administración y Contabilidad",

  "Formación",

  "Comité de convivencia y disciplina",
]);

export const ReunionesDeComite = pgTable("ReunionesDeComite", {
  id: serial().primaryKey(),
  fecha: date().notNull(),
  tipoDeReunionComite: tipoReunionComiteEnum("tipoDeReunionComite").notNull(),
  observacion: varchar({ length: 200 }),
  idResponsable: integer("idResponsable").references(() => Voluntarios.id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
  idFranquicia: integer("idFranquicia").references(() => Franquicias.id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }).notNull()
});
