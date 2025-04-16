import { eq } from "drizzle-orm";
import { OccupationCreate } from "./occupations.schemas";
import { db } from "../db/db";
import { Cargos } from "../db/schemas/Cargos";

export const createOccupation = async (Occupation: OccupationCreate) => {
  // Check if the name is unique
  const existing = await db
    .select()
    .from(Cargos)
    .where(eq(Cargos.nombre, Occupation.name));


    if (existing.length === 1) {
      throw {
        message: "Occupation already exists"
      };
    }

  return await db
    .insert(Cargos)
    .values({
      nombre: Occupation.name,
      descripcion: Occupation.description,
    })
    .returning();
};
