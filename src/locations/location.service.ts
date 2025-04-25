import { eq } from "drizzle-orm";
import { LocationCreate, LocationUpdate } from "./locations.schemas";
import { db } from "../db/db";
import { Locaciones } from "../db/schemas/Locaciones";
import { Franquicias } from "../db/schemas/Franquicias";
import { Pagination } from "../types/types";
import { AppError } from "../common/errors/errors";

export const createLocation = async (location: LocationCreate) => {
  if (location.franchiseId) {
    const franchise = await db
      .select()
      .from(Franquicias)
      .where(eq(Franquicias.id, location.franchiseId));

    if (franchise.length < 1) throw new AppError(400, "Franchise not found");
  }

  return await db
    .insert(Locaciones)
    .values({
      descripcion: location.description,
      idFranquicia: location.franchiseId,
    })
    .returning();
};

export const getAllLocations = async (pagination: Pagination) => {
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;

  const locations = await db
    .select({
      id: Locaciones.id,
      description: Locaciones.descripcion,
      franchise: {
        id: Franquicias.id,
        name: Franquicias.nombre,
      }
    })
    .from(Locaciones)
    .leftJoin(Franquicias, eq(Locaciones.idFranquicia, Franquicias.id))
    .limit(limit)
    .offset(offset);

  const totalItems = await db.$count(Locaciones);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    items: locations,
    paginate: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
};

export const getLocationById = async (id: number) => {
  return await db
    .select({
      id: Locaciones.id,
      description: Locaciones.descripcion,
      franchise: {
        id: Franquicias.id,
        name: Franquicias.nombre,
      }
    })
    .from(Locaciones)
    .leftJoin(Franquicias, eq(Locaciones.idFranquicia, Franquicias.id))
    .where(eq(Locaciones.id, id));
};

export const updateLocation = async (id: number, location: LocationUpdate) => {
  const locationToUpdate = await getLocationById(id);
  if (locationToUpdate.length < 1) throw new AppError(404, "Location not found");

  if (location.franchiseId) {
    const existing = await db
      .select()
      .from(Locaciones)
      .where(eq(Locaciones.idFranquicia, location.franchiseId));

    if (existing.length < 1) throw new AppError(400, "Franchise not found");
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
  if (existingLocation.length < 1) throw new AppError(404, "Location not found");

  return await db.delete(Locaciones).where(eq(Locaciones.id, id)).returning();
};
