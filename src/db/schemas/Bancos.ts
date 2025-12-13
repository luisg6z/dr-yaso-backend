import { pgTable, varchar } from "drizzle-orm/pg-core";


export const Bancos = pgTable('Bancos', {
    cod: varchar({ length: 4 }).primaryKey(),
    nombre: varchar({ length: 100 }).notNull(),
})