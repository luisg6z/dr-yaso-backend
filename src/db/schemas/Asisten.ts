import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { ReunionesDeComite } from "./ReunionesDeComite";
import { Voluntarios } from "./Voluntarios";

export const Asisten = pgTable(
  "Asisten",
  {
    idReunionComite: integer("idReunionComite").references(
      () => ReunionesDeComite.id,
      { onUpdate: "cascade", onDelete: "restrict" }
    ),
    idVoluntario: integer("idVoluntario").references(() => Voluntarios.id, {
      onUpdate: "cascade",
      onDelete: "restrict",
    }),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.idReunionComite, table.idVoluntario] }),
    },
  ]
);
