import { pgTable, varchar, serial} from "drizzle-orm/pg-core";

export const Paises = pgTable("Paises", {
  id: serial().primaryKey(),
  nombre: varchar({ length: 100 }).notNull().unique(),
});
