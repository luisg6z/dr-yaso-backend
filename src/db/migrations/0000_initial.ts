import { sql } from "drizzle-orm";
import { pgTable, serial, varchar, integer, timestamp, boolean, text, date, check, primaryKey } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";

// Enums
export const tipoCedulaEnum = pgEnum("TipoCedula", ["V", "E"]);
export const estatusEnum = pgEnum("Estatus", ["Activo", "Desvinculado", "De permiso"]);
export const generoEnum = pgEnum("Generos", ["Masculino", "Femenino", "Otro"]);
export const tipoSangreEnum = pgEnum("TipoSangre", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
export const estadoCivilEnum = pgEnum("EstadoCivil", ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Unión Libre"]);
export const tallaCamisaEnum = pgEnum("TallasCamisa", ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"]);
export const tipoUsuarioEnum = pgEnum("TipoUsuario", ["Superusuario", "Comite", "Registrador de visita", "Coordinador"]);
export const responsabilitiesEnum = pgEnum("Responsabilidades", ["Pasillero", "Payaso", "Coordinador"]);
export const tiposVisitasEnum = pgEnum("TiposVisita", ["Visita", "Actividad especial"]);
export const tipoReunionComiteEnum = pgEnum("TiposReunionComite", [
  "Responsable de visita",
  "Redes Sociales",
  "Captación de recursos",
  "Administración y Contabilidad",
  "Formación",
  "Comité de convivencia y disciplina"
]);

// Tablas
export const Paises = pgTable("Paises", {
  id: serial().primaryKey(),
  nombre: varchar({ length: 100 }).notNull().unique(),
});

export const Estados = pgTable("Estados", {
  id: serial().primaryKey(),
  nombre: varchar({ length: 100 }).notNull(),
  idPais: integer("idPais").references(() => Paises.id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
});

export const Ciudades = pgTable("Ciudades", {
  id: serial().primaryKey(),
  nombre: varchar({ length: 100 }).notNull(),
  idEstado: integer("idEstado").references(() => Estados.id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
});

export const Voluntarios = pgTable("Voluntarios", {
  id: serial().primaryKey(),
  nombres: varchar({ length: 100 }).notNull(),
  apellidos: varchar({ length: 100 }).notNull(),
  tipoCedula: tipoCedulaEnum("tipoCedula").notNull(),
  numeroCedula: varchar("numeroCedula", { length: 12 }).notNull(),
  fechaNacimiento: timestamp("fechaNacimiento").notNull(),
  profesion: varchar({ length: 60 }).notNull(),
  estatus: estatusEnum("estatus").notNull(),
  genero: generoEnum("generos").notNull(),
});

export const Cargos = pgTable("Cargos", {
  id: serial().primaryKey(),
  nombre: varchar({ length: 60 }).notNull().unique(),
  descripcion: varchar({ length: 120 }),
});

export const DetallesVoluntarios = pgTable("DetallesVoluntarios", {
  idVoluntario: integer("idVoluntario")
    .references(() => Voluntarios.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .primaryKey(),
  tipoSangre: tipoSangreEnum("tipoSangre").notNull(),
  estadoCivil: estadoCivilEnum("estadoCivil").notNull(),
  telefonos: varchar({ length: 20 }).array().notNull().default([]),
  nombrePayaso: varchar("nombrePayaso", { length: 120 }).notNull(),
  tallaCamisa: tallaCamisaEnum("tallaCamisa").notNull(),
  tieneCamisaConLogo: boolean("tieneCamisaConLogo").notNull(),
  tieneBataConLogo: boolean("tieneBataConLogo").notNull(),
  nombreContactoEmergencia: varchar("nobreContactoEmergencia", { length: 60 }),
  telefonoContactoEmergencia: varchar("telefonoContactoEmergencia", { length: 20 }),
  alergias: varchar({ length: 200 }),
  discapacidad: varchar({ length: 200 }),
  observacion: varchar({ length: 200 }),
  facebook: varchar({ length: 200 }),
  x: varchar({ length: 200 }),
  instagram: varchar({ length: 200 }),
  tiktok: varchar({ length: 200 }),
});

export const Franquicias = pgTable("Franquicias", {
  id: serial().primaryKey(),
  rif: varchar({ length: 12 }).notNull(),
  nombre: varchar({ length: 100 }).notNull(),
  direccion: varchar({ length: 120 }).notNull(),
  telefono: varchar({ length: 12 }).notNull(),
  correo: varchar({ length: 60 }).notNull(),
  estaActivo: boolean().notNull().default(true),
  idCiudad: integer("idCiudad").references(() => Ciudades.id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
  idCoordinador: integer("idCoordinador").references(() => Voluntarios.id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
});

export const Usuarios = pgTable("Usuarios", {
  id: serial().primaryKey(),
  nombre: varchar({ length: 100 }).notNull().unique(),
  "contraseña": text().notNull(),
  tipo: tipoUsuarioEnum("TipoUsuario").notNull(),
  correo: varchar({ length: 120 }).unique(),
  idFranquicia: integer("idFranquicia").references(() => Franquicias.id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
});

export const Locaciones = pgTable("Locaciones", {
  id: serial().primaryKey(),
  descripcion: varchar({length: 120}).notNull(),
  idFranquicia: integer("idFranquicia")
    .references(() => Franquicias.id, {
      onUpdate: "cascade",
      onDelete: "restrict",
    })
    .notNull(),
});

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
    check("beneficiariosDirectosCheck", sql`${table.beneficiariosDirectos} >=0`),
    check("beneficiariosIndirectosCheck", sql`${table.beneficiariosIndirectos} >=0`),
  ]
);

export const ReunionesDeComite = pgTable("ReunionesDeComite", {
  id: serial().primaryKey(),
  fecha: date().notNull(),
  tipoDeReunionComite: tipoReunionComiteEnum("tipoDeReunionComite").notNull(),
  observacion: varchar({ length: 200 }),
  idResponsable: integer("idResponsable").references(() => Voluntarios.id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
  idFranquicia: integer("idFranquicia").references(() => Franquicias.id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }).notNull()
});

// Tablas de relación
export const Tienen = pgTable(
  "Tienen",
  {
    idCargo: integer("idCargo").references(() => Cargos.id, {
      onUpdate: "cascade",
      onDelete: "restrict",
    }),
    idVoluntario: integer("idVoluntario").references(() => Voluntarios.id, {
      onUpdate: "cascade",
      onDelete: "restrict",
    }),
    esCargoPrincipal: boolean("esCargoPrincipal").notNull(),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.idCargo, table.idVoluntario] }),
    },
  ]
);

export const Pertenecen = pgTable(
  "Pertenecen",
  {
    idFranquicia: integer("idFranquicia").references(() => Franquicias.id, {
      onUpdate: "cascade",
      onDelete: "restrict",
    }),
    idVoluntario: integer("idVoluntario").references(() => Voluntarios.id, {
      onUpdate: "cascade",
      onDelete: "restrict",
    }),
    fechaHoraIngreso: timestamp("fechaHoraIngreso").notNull(),
    fechaHoraEgreso: timestamp("fechaHoraEgreso"),
  },
  (table) => [
    { pk: primaryKey({ columns: [table.idFranquicia, table.idVoluntario] }) },
    check("fechaHoraCheck", sql`${table.fechaHoraIngreso} < ${table.fechaHoraEgreso}`),
  ]
);

export const Asisten = pgTable(
  "Asisten",
  {
    idReunionComite: integer("idReunionComite").references(() => ReunionesDeComite.id, {
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
      pk: primaryKey({ columns: [table.idReunionComite, table.idVoluntario] }),
    },
  ]
);

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
    responsabilidad: responsabilitiesEnum("Responsabilidades").notNull(),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.idVisita, table.idVoluntario] }),
    },
  ]
); 