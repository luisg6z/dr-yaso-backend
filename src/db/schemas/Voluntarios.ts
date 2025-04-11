import { pgTable, varchar, serial, char, check} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

export const Voluntarios = pgTable("Voluntarios", 
{
  id: serial().primaryKey(),
  nombres: varchar({ length: 100 }).notNull(),
  apellidos: varchar({length:100}).notNull(),
  tipoCedula: char().notNull(),
  numeroCedula: varchar({length: 9}).notNull(),
  fechaNacimiento: timestamp().notNull(),
  profesion: varchar({length: 40}).notNull(),
  estatus: varchar({length: 20}).notNull(),
  genero: varchar({length:15}).notNull()
},
(table) => [
    check("tipoCedulaCheck",sql`${table.tipoCedula} IN ('V','E')`),
    check("estatusCheck", sql`${table.estatus} IN ('Activo','Desvinculado','De permiso')`),
    check("generoCheck",sql`${table.genero} IN ('Masculino', 'Femenino', 'Otro')`)
]
);

