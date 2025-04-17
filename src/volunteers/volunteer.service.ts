import { eq, desc } from "drizzle-orm";
import { VolunteerCreate, VolunteerUpdate } from "./volunteer.schemas";
import { db } from "../db/db";
import { Voluntarios } from "../db/schemas/Voluntarios";
import { DetallesVoluntarios } from "../db/schemas/DetallesVoluntarios";
import { Franquicias } from "../db/schemas/Franquicias";
import { Pertenecen } from "../db/schemas/Pertenecen";

export const createVolunteer = async (volunteer: VolunteerCreate) => {
  if (volunteer.franchiseId) {
    const franchise = await db
      .select()
      .from(Franquicias)
      .where(eq(Franquicias.id, volunteer.franchiseId));

    if (franchise.length < 1) throw { message: "Franchise not found" };
  }

  const [newVolunteer] = await db
    .insert(Voluntarios)
    .values({
      nombres: volunteer.firstName,
      apellidos: volunteer.lastName,
      tipoCedula: volunteer.idType,
      numeroCedula: volunteer.idNumber,
      fechaNacimiento: new Date(volunteer.birthDate),
      profesion: volunteer.profession,
      estatus: volunteer.status,
      genero: volunteer.gender,
    })
    .returning({
      id: Voluntarios.id,
    });

  if (!newVolunteer) throw new Error("Error creating volunteer");

  //Insert into DetallesVoluntarios using the newVolunteer.id
  await db.insert(DetallesVoluntarios).values({
    idVoluntario: newVolunteer.id,
    tipoSangre: volunteer.bloodType,
    estadoCivil: volunteer.maritalStatus,
    telefonos: volunteer.phoneNumbers,
    nombrePayaso: volunteer.clownName,
    tallaCamisa: volunteer.shirtSize,
    tieneCamisaConLogo: volunteer.hasShirtWithLogo,
    tieneBataConLogo: volunteer.hasCoatWithLogo,
    nombreContactoEmergencia: volunteer.emergencyContactName,
    telefonoContactoEmergencia: volunteer.emergencyContactPhone,
    alergias: volunteer.allergies,
    discapacidad: volunteer.disability,
    observacion: volunteer.notes,
    facebook: volunteer.facebook,
    x: volunteer.x,
    instagram: volunteer.instagram,
    tiktok: volunteer.tikTok,
  });

  //Insert into Pertenecen using the newVolunteer.id and franchiseId
  await db.insert(Pertenecen).values({
    idVoluntario: newVolunteer.id,
    idFranquicia: volunteer.franchiseId,
    fechaHoraIngreso: new Date(),
  });
};

// export const getAllVolunteers = async () => {
//   return await db
//     .select({
//       id: Voluntarios.id,
//       description: Voluntarios.descripcion,
//       franchiseId: Voluntarios.idFranquicia,
//     })
//     .from(Voluntarios);
// };

export const getVolunteerById = async (id: number) => {
  return await db
    .select({
      id: Voluntarios.id,
      firstName: Voluntarios.nombres,
      lastName: Voluntarios.apellidos,
      idType: Voluntarios.tipoCedula,
      idNumber: Voluntarios.numeroCedula,
      birthDate: Voluntarios.fechaNacimiento,
      profession: Voluntarios.profesion,
      status: Voluntarios.estatus,
      gender: Voluntarios.genero,
      bloodType: DetallesVoluntarios.tipoSangre,
      maritalStatus: DetallesVoluntarios.estadoCivil,
      phoneNumbers: DetallesVoluntarios.telefonos,
      clownName: DetallesVoluntarios.nombrePayaso,
      shirtSize: DetallesVoluntarios.tallaCamisa,
      hasShirtWithLogo: DetallesVoluntarios.tieneCamisaConLogo,
      hasCoatWithLogo: DetallesVoluntarios.tieneBataConLogo,
      allergies: DetallesVoluntarios.alergias,
      disability: DetallesVoluntarios.discapacidad,
      notes: DetallesVoluntarios.observacion,
      socialMedia: {
        facebook: DetallesVoluntarios.facebook,
        x: DetallesVoluntarios.x,
        instagram: DetallesVoluntarios.instagram,
        tikTok: DetallesVoluntarios.tiktok,
      },
      emergencyContact: {
        name: DetallesVoluntarios.nombreContactoEmergencia,
        phone: DetallesVoluntarios.telefonoContactoEmergencia,
      },
      franchise: {
        id: Pertenecen.idFranquicia,
        name: Franquicias.nombre, // Join with Franquicias to get the name
      },
    })
    .from(Voluntarios)
    .where(eq(Voluntarios.id, id))
    .innerJoin(
      DetallesVoluntarios,
      eq(DetallesVoluntarios.idVoluntario, Voluntarios.id)
    )
    .innerJoin(Pertenecen, eq(Pertenecen.idVoluntario, Voluntarios.id))
    .innerJoin(
      Franquicias,
      eq(Franquicias.id, Pertenecen.idFranquicia) // Join with Franquicias to get franchise details
    )
    .orderBy(desc(Pertenecen.fechaHoraIngreso)) // Ensure the latest franchise is selected
    .limit(1); // Only get the most recent franchise
};

// export const updateVolunteer = async (
//   id: number,
//   Volunteer: VolunteerUpdate
// ) => {
//   const VolunteerToUpdate = await getVolunteerById(id);
//   if (VolunteerToUpdate.length < 1) throw new Error("Volunteer not found");

//   if (Volunteer.franchiseId) {
//     const existing = await db
//       .select()
//       .from(Voluntarios)
//       .where(eq(Voluntarios.idFranquicia, Volunteer.franchiseId));

//     if (existing.length < 1) throw { message: "Franchise not found" };
//   }

//   return await db
//     .update(Voluntarios)
//     .set({
//       descripcion: Volunteer.description,
//       idFranquicia: Volunteer.franchiseId,
//     })
//     .where(eq(Voluntarios.id, id))
//     .returning();
// };

// export const deleteVolunteer = async (id: number) => {
//   const existingVolunteer = await getVolunteerById(id);
//   if (existingVolunteer.length < 1) throw { message: "Volunteer not found" };

//   return await db.delete(Voluntarios).where(eq(Voluntarios.id, id)).returning();
// };
