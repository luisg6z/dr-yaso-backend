import { eq } from "drizzle-orm";
import { LocationCreate, LocationUpdate } from "./locations.schemas";
import { db } from "../db/db";
import { Locaciones } from "../db/schemas/Locaciones";
import { Franquicias } from "../db/schemas/Franquicias";

export const createLocation = async (location: LocationCreate) => {
  if (location.franchiseId) {
    const franchise = await db
      .select()
      .from(Franquicias)
      .where(eq(Franquicias.id, location.franchiseId));

    if (franchise.length < 1) throw { message: "Franchise not found" };
  }

  return await db
    .insert(Locaciones)
    .values({
      descripcion: location.description,
      idFranquicia: location.franchiseId,
    })
    .returning();
};

export const getAllLocations = async () => {
  return await db
    .select({
      id: Locaciones.id,
      description: Locaciones.descripcion,
      franchiseId: Locaciones.idFranquicia,
    })
    .from(Locaciones);
};

export const getLocationById = async (id: number) => {
  return await db
    .select({
      id: Locaciones.id,
      description: Locaciones.descripcion,
      franchiseId: Locaciones.idFranquicia,
    })
    .from(Locaciones)
    .where(eq(Locaciones.id, id));
};

export const updateLocation = async (id: number, location: LocationUpdate) => {
  const locationToUpdate = await getLocationById(id);
  if (locationToUpdate.length < 1) throw new Error("Location not found");

  if (location.franchiseId) {
    const existing = await db
      .select()
      .from(Locaciones)
      .where(eq(Locaciones.idFranquicia, location.franchiseId));

    if (existing.length < 1) throw { message: "Franchise not found" };
  }

  return await db
    .update(Locaciones)
    .set({
      descripcion: location.description,
      idFranquicia: location.franchiseId,
    })
    .where(eq(Locaciones.id, id))
    .returning();
};

export const deleteLocation = async (id: number) => {
  const existingLocation = await getLocationById(id);
  if (existingLocation.length < 1) throw { message: "Location not found" };

  return await db.delete(Locaciones).where(eq(Locaciones.id, id)).returning();
};
