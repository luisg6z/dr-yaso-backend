import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const franchise = pgTable("franchises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  userId: integer("userId").references(() => users.id),
});
