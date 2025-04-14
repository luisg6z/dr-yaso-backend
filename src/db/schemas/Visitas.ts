import { sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  serial,
  pgEnum,
  varchar,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { Locaciones } from "./Locaciones";

export const tiposVisitasEnum = pgEnum("TiposVisita", [
  "Visita",
  "Actividad especial",
]);

export const Visitas = pgTable(
  "Visitas",
  {
    id: serial().primaryKey(),
    tipo: tiposVisitasEnum().notNull(),
    observacion: varchar({ length: 200 }).notNull(),
    fechaHora: timestamp().notNull(),
    beneficiariosDirectos: integer("beneficiariosDirectos").notNull(),
    beneficiariosIndirectos: integer("beneficiariosIndirectos").notNull(),
    cantPersonalDeSalud: integer("cantPersonalDeSalud").notNull(),
    idLocacion: integer("idLocacion").references(() => Locaciones.id, {
      onUpdate: "cascade",
      onDelete: "restrict",
    }),
  },
  (table) => [
    check(
      "beneficiariosDirectosCheck",
      sql`${table.beneficiariosDirectos} >=0`
    ),
    check(
      "beneficiariosIndirectosCheck",
      sql`${table.beneficiariosIndirectos} >=0`
    ),
  ]
);
