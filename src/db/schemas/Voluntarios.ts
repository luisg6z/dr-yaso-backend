import { pgTable, varchar, serial, char, pgEnum} from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";


export const tipoCedulaEnum = pgEnum("TipoCedula", [
    "V","E"
]);
export const estatusEnum = pgEnum("Estatus", [
    "Activo","Desvinculado","De permiso"
]);

export const generoEnum = pgEnum("Generos", [
     "Masculino", "Femenino", "Otro"
]);

export const Voluntarios = pgTable("Voluntarios", 
{
  id: serial().primaryKey(),
  nombres: varchar({ length: 100 }).notNull(),
  apellidos: varchar({length:100}).notNull(),
  tipoCedula: tipoCedulaEnum("tipoCedula").notNull(),
  numeroCedula: varchar("numeroCedula", {length: 9}).notNull(),
  fechaNacimiento: timestamp("fechaNacimiento").notNull(),
  profesion: varchar({length: 40}).notNull(),
  estatus: estatusEnum("estatus").notNull(),
  genero: generoEnum("generos").notNull()
}
);

