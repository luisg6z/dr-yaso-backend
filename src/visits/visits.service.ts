import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { Visitas } from "../db/schemas/Visitas";
import { Pagination } from "../types";
import { VisitCreate, VisitUpdate } from "./visits.schema";
import { Realizan } from "../db/schemas/Realizan";
import { Locaciones } from "../db/schemas/Locaciones";
import { Voluntarios } from "../db/schemas/Voluntarios";


export const createVisit = async (visit: VisitCreate) => {

    if(visit.locationId){
        const location = await db.select({
            id: Visitas.idLocacion,
            name: Visitas.idLocacion,
        })
        .from(Visitas)
        .where(eq(Visitas.idLocacion, visit.locationId));

        if(location.length < 1) throw new Error("Location not found");
    }

    const date = new Date(visit.date);

    const data = await db.transaction(async (tx) =>{
        
        const createdVisit = await tx.insert(Visitas)
        .values({
            tipo: visit.type,
            observacion: visit.observation,
            fechaHora: date,
            beneficiariosDirectos: visit.directBeneficiaries,
            beneficiariosIndirectos: visit.indirectBeneficiaries,
            cantPersonalDeSalud: visit.healthPersonnelCount,
            idLocacion: visit.locationId,
        })
        .returning();

        await tx.insert(Realizan)
        .values({
            idVisita: createdVisit[0].id,
            idVoluntario: visit.coordinatorId,
            responsabilidad: "Coordinador",
        });


        if(visit.clownsIds){
            visit.clownsIds.forEach( element => {
                tx.insert(Realizan)
                .values({
                    idVisita: createdVisit[0].id,
                    idVoluntario: element,
                    responsabilidad: "Payaso",
                })
            });
        }

        if(visit.hallwaysIds){
            visit.hallwaysIds.forEach( element => {
                tx.insert(Realizan)
                .values({
                    idVisita: createdVisit[0].id,
                    idVoluntario: element,
                    responsabilidad: "Pasillero",
                })
            });
        }
    });

    return data;
}

export const getVisitById = async (id: number) => {

    console.log("id", id);
    

    const visit = await db
    .select({
        id: Visitas.id,
        type: Visitas.tipo,
        observations: Visitas.observacion,
        date: Visitas.fechaHora,
        directBeneficiaries: Visitas.beneficiariosDirectos,
        indirectBeneficiaries: Visitas.beneficiariosIndirectos,
        healthPersonnelCount: Visitas.cantPersonalDeSalud,
        location: {
            id: Locaciones.id,
            name: Locaciones.descripcion,
        },
        voluntarios: {
            id: Voluntarios.id,
            firstName: Voluntarios.nombres,
            lastName: Voluntarios.apellidos,
            idNumber: Voluntarios.numeroCedula,
            idType: Voluntarios.tipoCedula,
            status: Voluntarios.estatus,
            responsibility: Realizan.responsabilidad,
        },

    })
    .from(Visitas)
    .leftJoin(Locaciones, eq(Locaciones.id, Visitas.idLocacion))
    .leftJoin(Realizan, eq(Realizan.idVisita, Visitas.id))
    .leftJoin(Voluntarios, eq(Voluntarios.id, Realizan.idVoluntario))
    .where(eq(Visitas.id, id));

    console.log(visit);

    return visit

    // if (visit.length === 0) {
    //     throw new Error("Visit not found");
    // }

    // const clowns = visit.filter(visit => visit.voluntarios.responsibility === "Payaso");
    // const hallways = visit.filter(visit => visit.voluntarios.responsibility === "Pasillero");
    // const coordinators = visit.filter(visit => visit.voluntarios.responsibility === "Coordinador");

    // return visit.map(visit => ({
    //     id: visit.id,
    //     type: visit.type,
    //     observations: visit.observations,
    //     date: visit.date,
    //     directBeneficiaries: visit.directBeneficiaries,
    //     indirectBeneficiaries: visit.indirectBeneficiaries,
    //     healthPersonnelCount: visit.healthPersonnelCount,
    //     location: visit.location,
    //     clowns: clowns.map(clown => ({
    //         id: clown.voluntarios.id,
    //         firstName: clown.voluntarios.firstName,
    //         lastName: clown.voluntarios.lastName,
    //         idNumber: clown.voluntarios.idNumber,
    //         idType: clown.voluntarios.idType,
    //         status: clown.voluntarios.status,
    //     })),
    //     hallways: hallways.map(hallway => ({
    //         id: hallway.voluntarios.id,
    //         firstName: hallway.voluntarios.firstName,
    //         lastName: hallway.voluntarios.lastName,
    //         idNumber: hallway.voluntarios.idNumber,
    //         idType: hallway.voluntarios.idType,
    //         status: hallway.voluntarios.status,
    //     })),
    //     coordinator: {
    //         id: coordinators[0].voluntarios.id,
    //         firstName: coordinators[0].voluntarios.firstName,
    //         lastName: coordinators[0].voluntarios.lastName,
    //         idNumber: coordinators[0].voluntarios.idNumber,
    //         idType: coordinators[0].voluntarios.idType,
    //         status: coordinators[0].voluntarios.status,
    //     }
    // }));
}

export const getAllVisits = async (pagination: Pagination) => {

    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const visits = await db
    .select({
        id: Visitas.id,
        type: Visitas.tipo,
        observations: Visitas.observacion,
        date: Visitas.fechaHora,
        directBeneficiaries: Visitas.beneficiariosDirectos,
        indirectBeneficiaries: Visitas.beneficiariosIndirectos,
        healthPersonnelCount: Visitas.cantPersonalDeSalud,
        locationId: Visitas.idLocacion,
    })
    .from(Visitas)
    .limit(limit)
    .offset(offset)

    return {
        items : visits,
        paginate: {
            page,
            limit,
            totalItems: visits.length,
            totalPages: Math.ceil(visits.length / limit),
        }
    }
}

export const updateVisit = async (id: number, visit: VisitUpdate) => {

    if(visit.locationId){
        const location = await db.select({
            id: Visitas.idLocacion,
            name: Visitas.idLocacion,
        })
        .from(Visitas)
        .where(eq(Visitas.idLocacion, visit.locationId));

        if(location.length < 1) throw new Error("Location not found");
    }

    const existingVisit = await getVisitById(id);
    if (existingVisit.length === 0) {
        throw new Error("Visit not found");
    }


    return await db.update(Visitas)
    .set({
        tipo: visit.type,
        observacion: visit.observation,
        fechaHora: visit.date ? new Date(visit.date) : undefined,
        beneficiariosDirectos: visit.directBeneficiaries,
        beneficiariosIndirectos: visit.indirectBeneficiaries,
        cantPersonalDeSalud: visit.healthPersonnelCount,
        idLocacion: visit.locationId,
    })
    .where(eq(Visitas.id, id))
    .returning();
}

export const deleteVisit = async (id: number) => {

    const existingVisit = await getVisitById(id);
    if (existingVisit.length === 0) {
        throw new Error("Visit not found");
    }

    return await db.delete(Visitas)
    .where(eq(Visitas.id, id))
    .returning();
}
