import { eq, desc, and, isNull } from "drizzle-orm";
import { VolunteerCreate, VolunteerUpdate } from "./volunteer.schemas";
import { db } from "../db/db";
import { Voluntarios } from "../db/schemas/Voluntarios";
import { DetallesVoluntarios } from "../db/schemas/DetallesVoluntarios";
import { Franquicias } from "../db/schemas/Franquicias";
import { Pertenecen } from "../db/schemas/Pertenecen";
import { Pagination } from "../types";

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

export const getAllVolunteers = async (pagination: Pagination) => {
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;

  const volunteers = await db
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
    .innerJoin(
      DetallesVoluntarios,
      eq(DetallesVoluntarios.idVoluntario, Voluntarios.id)
    )
    .innerJoin(
      Pertenecen,
      and(
        eq(Pertenecen.idVoluntario, Voluntarios.id),
        isNull(Pertenecen.fechaHoraEgreso) // Filter where fechaHoraEgreso is NULL
      )
    )
    .innerJoin(
      Franquicias,
      eq(Franquicias.id, Pertenecen.idFranquicia) // Join with Franquicias to get franchise details
    )
    .limit(limit)
    .offset(offset);

  const totalItems = await db.$count(Voluntarios);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    items: volunteers,
    paginate: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
};

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
    .innerJoin(
      Pertenecen,
      and(
        eq(Pertenecen.idVoluntario, Voluntarios.id),
        isNull(Pertenecen.fechaHoraEgreso) // Filter where fechaHoraEgreso is NULL
      )
    )
    .innerJoin(
      Franquicias,
      eq(Franquicias.id, Pertenecen.idFranquicia) // Join with Franquicias to get franchise details
    );
};

export const updateVolunteer = async (
  id: number,
  volunteer: VolunteerUpdate
) => {
  // Verificar si el voluntario existe
  const [existingVolunteer] = await getVolunteerById(id);
  if (!existingVolunteer) throw new Error("Volunteer not found");

  // Actualizar la tabla Voluntarios
  await db
    .update(Voluntarios)
    .set({
      nombres: volunteer.firstName,
      apellidos: volunteer.lastName,
      tipoCedula: volunteer.idType,
      numeroCedula: volunteer.idNumber,
      fechaNacimiento: new Date(
        volunteer.birthDate ?? existingVolunteer.birthDate
      ),
      profesion: volunteer.profession,
      estatus: volunteer.status,
      genero: volunteer.gender,
    })
    .where(eq(Voluntarios.id, id));

  // Actualizar la tabla DetallesVoluntarios
  await db
    .update(DetallesVoluntarios)
    .set({
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
    })
    .where(eq(DetallesVoluntarios.idVoluntario, id));

  // Actualizar la tabla Pertenecen si franchiseId cambia
  if (
    volunteer.franchiseId &&
    existingVolunteer.franchise.id &&
    volunteer.franchiseId !== existingVolunteer.franchise.id
  ) {
    // Update the current franchise's exit date
    await db
      .update(Pertenecen)
      .set({
        fechaHoraEgreso: new Date(),
      })
      .where(
        and(
          eq(Pertenecen.idVoluntario, id),
          eq(Pertenecen.idFranquicia, existingVolunteer.franchise.id)
        )
      );

    // Insert a new record in Pertenecen for the new franchise
    await db.insert(Pertenecen).values({
      idVoluntario: id,
      idFranquicia: volunteer.franchiseId,
      fechaHoraIngreso: new Date(),
    });
  }

  // Devolver el voluntario actualizado en el mismo formato que getVolunteerById
  return await getVolunteerById(id);
};

export const deleteVolunteer = async (id: number) => {
  const existingVolunteer = await getVolunteerById(id);
  if (existingVolunteer.length < 1) throw { message: "Volunteer not found" };

  return await db.delete(Voluntarios).where(eq(Voluntarios.id, id)).returning();
};
