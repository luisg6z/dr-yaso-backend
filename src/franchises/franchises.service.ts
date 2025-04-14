import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { Voluntarios } from "../db/schemas/Voluntarios";
import { FranchiseCreate, FranchiseUpdate } from "./franchises.schemas";
import { Ciudades } from "../db/schemas/Ciudades";
import { Franquicias } from "../db/schemas/Franquicias";


export const createFranchise = async (franchise: FranchiseCreate) => {
    if(franchise.coordinatorId){
        const coordinator = await db.select({
            id: Voluntarios.id,
            name: Voluntarios.nombres,
        })
        .from(Voluntarios)
        .where(eq(Voluntarios.id, franchise.coordinatorId));


        if(!coordinator) throw new Error("Coordinator not found");
    }

    if(franchise.cityId){
        const city = await db.select({
            id: Ciudades.id,
            name: Ciudades.nombre,
        }).from(Ciudades).where(eq(Ciudades.id, franchise.cityId));

        if(!city) throw new Error("City not found");
    }


    return await db.insert(Franquicias).values({
        nombre: franchise.name,
        rif: franchise.rif,
        direccion: franchise.address,
        telefono: franchise.phone,
        correo: franchise.email,
        idCiudad: franchise.cityId,
        idCoordinador: franchise.coordinatorId,
    }).returning();
}

export const getAllFranchises = async () => {
    return await db.select({
        id: Franquicias.id,
        rif: Franquicias.rif,
        name: Franquicias.nombre,
        address: Franquicias.direccion,
        phone: Franquicias.telefono,
        email: Franquicias.correo,
        isActive: Franquicias.estaActivo,
        cityId: Franquicias.idCiudad,
        coordinatorId: Franquicias.idCoordinador,
    }).from(Franquicias);
}

export const getFranchiseById = async (id: number) => {
    return await db.select({
        id: Franquicias.id,
        rif: Franquicias.rif,
        name: Franquicias.nombre,
        address: Franquicias.direccion,
        phone: Franquicias.telefono,
        email: Franquicias.correo,
        isActive: Franquicias.estaActivo,
        cityId: Franquicias.idCiudad,
        coordinatorId: Franquicias.idCoordinador,
    }).from(Franquicias).where(eq(Franquicias.id, id)).limit(1);
}

export const updateFranchise = async (id: number, franchise: FranchiseUpdate) => {
    
    const franchiseToUpdate = await getFranchiseById(id);
    if(franchiseToUpdate.length < 1) throw new Error("Franchise not found");

    if(franchise.coordinatorId){
        const coordinator = await db.select({
            id: Voluntarios.id,
            name: Voluntarios.nombres,
        })
        .from(Voluntarios)
        .where(eq(Voluntarios.id, franchise.coordinatorId));


        if(!coordinator) throw new Error("Coordinator not found");
    }

    if(franchise.cityId){
        const city = await db.select({
            id: Ciudades.id,
            name: Ciudades.nombre,
        }).from(Ciudades).where(eq(Ciudades.id, franchise.cityId));

        if(!city) throw new Error("City not found");
    }

    return await db.update(Franquicias).set({
        nombre: franchise.name,
        rif: franchise.rif,
        direccion: franchise.address,
        telefono: franchise.phone,
        correo: franchise.email,
        idCiudad: franchise.cityId,
        idCoordinador: franchise.coordinatorId,
    }).where(eq(Franquicias.id, id))
    .returning();
}

export const deleteFranchise = async (id: number) => {
    return await db.update(Franquicias)
    .set({
        estaActivo: false,
    })
    .where(eq(Franquicias.id, id))
    .returning();
}