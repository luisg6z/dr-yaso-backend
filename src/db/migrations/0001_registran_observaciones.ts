import { sql } from 'drizzle-orm'
import { db } from '../db'

// Migration: create RegistranObservaciones table with composite PK and FKs
export default async function up() {
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "RegistranObservaciones" (
            "idUsuario" INTEGER NOT NULL,
            "idVoluntario" INTEGER NOT NULL,
            "fechaHoraRegistro" TIMESTAMP NOT NULL DEFAULT NOW(),
            "observacion" VARCHAR(200) NOT NULL,
            CONSTRAINT registran_observaciones_pk PRIMARY KEY ("idUsuario", "idVoluntario", "fechaHoraRegistro"),
            CONSTRAINT registran_observaciones_usuario_fk FOREIGN KEY ("idUsuario") REFERENCES "Usuarios"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
            CONSTRAINT registran_observaciones_voluntario_fk FOREIGN KEY ("idVoluntario") REFERENCES "Voluntarios"("id") ON UPDATE CASCADE ON DELETE RESTRICT
        );
    `)
}

export async function down() {
    await db.execute(sql`DROP TABLE IF EXISTS "RegistranObservaciones";`)
}
