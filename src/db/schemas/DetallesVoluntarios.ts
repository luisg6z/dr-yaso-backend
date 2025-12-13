import { pgTable, varchar, integer, pgEnum, boolean } from 'drizzle-orm/pg-core'
import { Voluntarios } from './Voluntarios'
import { Ciudades } from './Ciudades'

export const tipoSangreEnum = pgEnum('TipoSangre', [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
])

export const estadoCivilEnum = pgEnum('EstadoCivil', [
    'Soltero/a',
    'Casado/a',
    'Divorciado/a',
    'Viudo/a',
    'Unión Libre',
])

export const tallaCamisaEnum = pgEnum('TallasCamisa', [
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    'XXXL',
    'XXXXL',
])

export const DetallesVoluntarios = pgTable('DetallesVoluntarios', {
    idVoluntario: integer('idVoluntario')
        .references(() => Voluntarios.id, {
            onUpdate: 'cascade',
            onDelete: 'cascade',
        })
        .primaryKey(),
    tipoSangre: tipoSangreEnum('tipoSangre').notNull(),
    estadoCivil: estadoCivilEnum('estadoCivil').notNull(),
    telefonos: varchar({ length: 20 }).array().notNull().default([]),
    nombrePayaso: varchar('nombrePayaso', { length: 120 }).notNull(),
    tallaCamisa: tallaCamisaEnum('tallaCamisa').notNull(),
    tieneCamisaConLogo: boolean('tieneCamisaConLogo').notNull(),
    tieneBataConLogo: boolean('tieneBataConLogo').notNull(),
    nombreContactoEmergencia: varchar('nobreContactoEmergencia', {
        length: 60,
    }),
    telefonoContactoEmergencia: varchar('telefonoContactoEmergencia', {
        length: 20,
    }),
    alergias: varchar({ length: 200 }),
    discapacidad: varchar({ length: 200 }),
    facebook: varchar({ length: 200 }),
    x: varchar({ length: 200 }),
    instagram: varchar({ length: 200 }),
    tiktok: varchar({ length: 200 }),
    direccion: varchar({ length: 200 }),
    idCiudad: integer('idCiudad').references(() => Ciudades.id, {
        onUpdate: 'cascade',
        onDelete: 'restrict',
    }),
})
