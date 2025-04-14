import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { Franquicias } from "./Franquicias";

export const Locaciones = pgTable("Locaciones", {
  id: serial().primaryKey(),
  descripcion: integer().notNull(),
  idFranquicia: integer().references(() => Franquicias.id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
});
