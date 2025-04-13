import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { Visitas } from "./Visitas";
import { Voluntarios } from "./Voluntarios";

export const Realizan = pgTable(
  "Realizan",
  {
    idVisita: integer("idVisita").references(() => Visitas.id, {
      onUpdate: "cascade",
      onDelete: "restrict",
    }),
    idVoluntario: integer("idVoluntario").references(() => Voluntarios.id, {
      onUpdate: "cascade",
      onDelete: "restrict",
    }),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.idVisita, table.idVoluntario] }),
    },
  ]
);
