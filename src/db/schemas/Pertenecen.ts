import {
  pgTable,
  integer,
  primaryKey,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { Voluntarios } from "./Voluntarios";
import { Franquicias } from "./Franquicias";
import { sql } from "drizzle-orm";

export const Pertenecen = pgTable(
  "Pertenecen",
  {
    idFranquicia: integer("idFranquicia").references(() => Franquicias.id, {
      onUpdate: "cascade",
      onDelete: "restrict",
    }),
    idVoluntario: integer("idVoluntario").references(() => Voluntarios.id, {
      onUpdate: "cascade",
      onDelete: "restrict",
    }),
    fechaHoraIngreso: timestamp("fechaHoraIngreso").notNull(),
    fechaHoraEgreso: timestamp("fechaHoraEgreso"),
  },
  (table) => [
    { pk: primaryKey({ columns: [table.idFranquicia, table.idVoluntario] }) },

    check(
      "fechaHoraCheck",
      sql`${table.fechaHoraIngreso} < ${table.fechaHoraEgreso}`
    ),
  ]
);
