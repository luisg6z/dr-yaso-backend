CREATE TABLE "Cargos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(60) NOT NULL,
	"descripcion" varchar(120),
	CONSTRAINT "Cargos_nombre_unique" UNIQUE("nombre")
);
--> statement-breakpoint
CREATE TABLE "Ciudades" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"idEstado" integer
);
--> statement-breakpoint
CREATE TABLE "detalles_voluntarios" (
	"id_voluntario" integer PRIMARY KEY NOT NULL,
	"tipo_sangre" "TipoSangre" NOT NULL,
	"estado_civil" "estado_civil" NOT NULL,
	"telefono" char NOT NULL,
	"nombre_payaso" varchar(50) NOT NULL,
	"talla_camisa" varchar(10) NOT NULL,
	"tiene_camisa_con_logo" boolean NOT NULL,
	"tiene_bata_con_logo" boolean NOT NULL,
	"nombre_contacto_emergencia" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Estados" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"idPais" integer
);
--> statement-breakpoint
CREATE TABLE "Franquicias" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"direccion" varchar(120) NOT NULL,
	"telefono" varchar(12) NOT NULL,
	"correo" varchar(60) NOT NULL,
	"idCiudad" integer,
	"idCoordinador" integer,
	CONSTRAINT "Franquicias_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "Paises" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	CONSTRAINT "Paises_nombre_unique" UNIQUE("nombre")
);
--> statement-breakpoint
CREATE TABLE "Usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"contraseña" text NOT NULL,
	"TipoUsuario" "TipoUsuario" NOT NULL,
	"correo" varchar(120)
);
--> statement-breakpoint
CREATE TABLE "Voluntarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombres" varchar(100) NOT NULL,
	"apellidos" varchar(100) NOT NULL,
	"TipoCedula" "TipoCedula" NOT NULL,
	"numeroCedula" varchar(9) NOT NULL,
	"fechaNacimiento" timestamp NOT NULL,
	"profesion" varchar(40) NOT NULL,
	"Estatus" "Estatus" NOT NULL,
	"Generos" "Generos" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Ciudades" ADD CONSTRAINT "Ciudades_idEstado_Estados_id_fk" FOREIGN KEY ("idEstado") REFERENCES "public"."Estados"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "detalles_voluntarios" ADD CONSTRAINT "detalles_voluntarios_id_voluntario_Voluntarios_id_fk" FOREIGN KEY ("id_voluntario") REFERENCES "public"."Voluntarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Estados" ADD CONSTRAINT "Estados_idPais_Paises_id_fk" FOREIGN KEY ("idPais") REFERENCES "public"."Paises"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Franquicias" ADD CONSTRAINT "Franquicias_idCiudad_Ciudades_id_fk" FOREIGN KEY ("idCiudad") REFERENCES "public"."Ciudades"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Franquicias" ADD CONSTRAINT "Franquicias_idCoordinador_Voluntarios_id_fk" FOREIGN KEY ("idCoordinador") REFERENCES "public"."Voluntarios"("id") ON DELETE restrict ON UPDATE cascade;