import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { AppError } from "../common/errors/errors";
import { Estados } from "../db/schemas/Estados";
import { Ciudades } from "../db/schemas/Ciudades";

export const getCitiesByStateId = async (id: number) => {
  const state = await db
    .select({ id: Estados.id })
    .from(Estados)
    .where(eq(Estados.id, id))
    .limit(1);

  if (state.length < 1) {
    throw new AppError(400, "State not found");
  }

  return await db
    .select({
      id: Ciudades.id,
      name: Ciudades.nombre,
    })
    .from(Ciudades)
    .where(eq(Ciudades.idEstado, id));
};
