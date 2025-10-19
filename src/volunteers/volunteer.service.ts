import { eq, and, isNull } from 'drizzle-orm'
import { VolunteerCreate, VolunteerUpdate } from './volunteer.schemas'
import { db } from '../db/db'
import { Voluntarios } from '../db/schemas/Voluntarios'
import { DetallesVoluntarios } from '../db/schemas/DetallesVoluntarios'
import { Franquicias } from '../db/schemas/Franquicias'
import { Pertenecen } from '../db/schemas/Pertenecen'
import { Pagination } from '../types/types'
import { AppError } from '../common/errors/errors'
import { Tienen } from '../db/schemas/Tienen'
import { Cargos } from '../db/schemas/Cargos'
import { Ciudades } from '../db/schemas/Ciudades'
import { Estados } from '../db/schemas/Estados'
import { Paises } from '../db/schemas/Paises'

export const createVolunteer = async (volunteer: VolunteerCreate) => {
    if (volunteer.franchiseId) {
        const franchise = await db
            .select()
            .from(Franquicias)
            .where(eq(Franquicias.id, volunteer.franchiseId))

        if (franchise.length < 1) throw new AppError(400, 'Franchise not found')
    }

    await db.transaction(async (tx) => {
        const [newVolunteer] = await tx
            .insert(Voluntarios)
            .values({
                nombres: volunteer.firstName,
                apellidos: volunteer.lastName,
                tipoDocumento: volunteer.idType,
                numeroDocumento: volunteer.idNumber,
                fechaNacimiento: new Date(volunteer.birthDate),
                profesion: volunteer.profession,
                estatus: volunteer.status,
                genero: volunteer.gender,
            })
            .returning({
                id: Voluntarios.id,
            })

        if (!newVolunteer) throw new AppError(500, 'Error creating volunteer')

        //Insert into DetallesVoluntarios using the newVolunteer.id
        await tx.insert(DetallesVoluntarios).values({
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
            direccion: volunteer.direction,
            idCiudad: volunteer.cityId,
        })

        //Insert into Pertenecen using the newVolunteer.id and franchiseId
        await tx.insert(Pertenecen).values({
            idVoluntario: newVolunteer.id,
            idFranquicia: volunteer.franchiseId,
            fechaHoraIngreso: new Date(),
        })

        if (volunteer.occupations) {
            volunteer.occupations.forEach(async (occupation: { id: number; isMain: boolean }) => {
                await tx.insert(Tienen).values({
                    idVoluntario: newVolunteer.id,
                    idCargo: occupation.id,
                    esCargoPrincipal: occupation.isMain,
                })
            })
        }
    })
}

export const getAllVolunteers = async (pagination: Pagination) => {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    const volunteers = await db
        .select({
            id: Voluntarios.id,
            firstName: Voluntarios.nombres,
            lastName: Voluntarios.apellidos,
            idType: Voluntarios.tipoDocumento,
            idNumber: Voluntarios.numeroDocumento,
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
            direction: {
                direction: DetallesVoluntarios.direccion,
                city: Ciudades.nombre,
                state: Estados.nombre,
                country: Paises.nombre,
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
            eq(DetallesVoluntarios.idVoluntario, Voluntarios.id),
        )
        .leftJoin(
            Pertenecen,
            and(
                eq(Pertenecen.idVoluntario, Voluntarios.id),
                isNull(Pertenecen.fechaHoraEgreso), // Filter where fechaHoraEgreso is NULL
            ),
        )
        .leftJoin(
            Franquicias,
            eq(Franquicias.id, Pertenecen.idFranquicia), // Join with Franquicias to get franchise details
        )
        .leftJoin(Ciudades, eq(Ciudades.id, DetallesVoluntarios.idCiudad))
        .leftJoin(Estados, eq(Estados.id, Ciudades.idEstado))
        .leftJoin(Paises, eq(Paises.id, Estados.idPais))
        .limit(limit)
        .offset(offset)

    const volunteersWithOccupation = await Promise.all(
        volunteers.map(async (volunteer: any) => {
            const vcharges = await db
                .select({
                    volunteerId: Tienen.idVoluntario,
                    occupations: {
                        occupationId: Cargos.id,
                        volunteerId: Tienen.idVoluntario,
                        name: Cargos.descripcion,
                        isMain: Tienen.esCargoPrincipal,
                    },
                })
                .from(Tienen)
                .innerJoin(Cargos, eq(Cargos.id, Tienen.idCargo))
                .where(eq(Tienen.idVoluntario, volunteer.id))

            const chargesIds = vcharges.map((e) => e.occupations)

            return {
                ...volunteer,
                occupations: chargesIds,
            }
        }),
    )

    const totalItems = await db.$count(Voluntarios)
    const totalPages = Math.ceil(totalItems / limit)

    return {
        items: volunteersWithOccupation,
        paginate: {
            page,
            limit,
            totalItems,
            totalPages,
        },
    }
}

export const getAllVolunteersForFranchise = async (franchiseId: number) => {
    const volunteers = await db
        .select({
            id: Voluntarios.id,
            firstName: Voluntarios.nombres,
            lastName: Voluntarios.apellidos,
            idType: Voluntarios.tipoDocumento,
            idNumber: Voluntarios.numeroDocumento,
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
            direction: {
                direction: DetallesVoluntarios.direccion,
                city: Ciudades.nombre,
                state: Estados.nombre,
                country: Paises.nombre,
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
            eq(DetallesVoluntarios.idVoluntario, Voluntarios.id),
        )
        .innerJoin(
            Pertenecen,
            and(
                eq(Pertenecen.idVoluntario, Voluntarios.id),
                isNull(Pertenecen.fechaHoraEgreso), // Filter where fechaHoraEgreso is NULL
            ),
        )
        .innerJoin(
            Franquicias,
            eq(Franquicias.id, Pertenecen.idFranquicia), // Join with Franquicias to get franchise details
        )
        .leftJoin(Ciudades, eq(Ciudades.id, DetallesVoluntarios.idCiudad))
        .leftJoin(Estados, eq(Estados.id, Ciudades.idEstado))
        .leftJoin(Paises, eq(Paises.id, Estados.idPais))
        .where(eq(Franquicias.id, franchiseId))

    volunteers.forEach(async (volunteer: any) => {
        const vcharges = await db
            .select({
                volunteerId: Tienen.idVoluntario,
                occupations: {
                    occupationId: Cargos.id,
                    volunteerId: Tienen.idVoluntario,
                    name: Cargos.descripcion,
                    isMain: Tienen.esCargoPrincipal,
                },
            })
            .from(Tienen)
            .leftJoin(Cargos, eq(Cargos.id, Tienen.idCargo))
            .where(eq(Tienen.idVoluntario, volunteer.id))

        const chargesIds = vcharges.map((e) => e.occupations)

        console.log(chargesIds)

        volunteer.occupations = chargesIds || []

        console.log('Volunteers retrieved:', volunteers.length);
    })

    return {
        items: volunteers,
    }
}

export const getVolunteerById = async (id: number) => {
    // Primero obtenemos la información base del voluntario
    const volunteer = await db
        .select({
            id: Voluntarios.id,
            firstName: Voluntarios.nombres,
            lastName: Voluntarios.apellidos,
            idType: Voluntarios.tipoDocumento,
            idNumber: Voluntarios.numeroDocumento,
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
            direction: {
                direction: DetallesVoluntarios.direccion,
                city: Ciudades.nombre,
                state: Estados.nombre,
                country: Paises.nombre,
            },
            emergencyContact: {
                name: DetallesVoluntarios.nombreContactoEmergencia,
                phone: DetallesVoluntarios.telefonoContactoEmergencia,
            },
            franchise: {
                id: Pertenecen.idFranquicia,
                name: Franquicias.nombre,
            },
        })
        .from(Voluntarios)
        .where(eq(Voluntarios.id, id))
        .innerJoin(
            DetallesVoluntarios,
            eq(DetallesVoluntarios.idVoluntario, Voluntarios.id),
        )
        .innerJoin(
            Pertenecen,
            and(
                eq(Pertenecen.idVoluntario, Voluntarios.id),
                isNull(Pertenecen.fechaHoraEgreso),
            ),
        )
        .innerJoin(
            Franquicias,
            eq(Franquicias.id, Pertenecen.idFranquicia),
        )
        .leftJoin(Ciudades, eq(Ciudades.id, DetallesVoluntarios.idCiudad))
        .leftJoin(Estados, eq(Estados.id, Ciudades.idEstado))
        .leftJoin(Paises, eq(Paises.id, Estados.idPais))
        .then(rows => rows[0]) // Obtenemos solo un voluntario

    if (!volunteer) return null

    // Ahora obtenemos las ocupaciones del voluntario
    const vcharges = await db
        .select({
            occupationId: Cargos.id,
            name: Cargos.descripcion,
            isMain: Tienen.esCargoPrincipal,
        })
        .from(Tienen)
        .innerJoin(Cargos, eq(Cargos.id, Tienen.idCargo))
        .where(eq(Tienen.idVoluntario, id))

    return {
        ...volunteer,
        occupations: vcharges,
    }
}


export const updateVolunteer = async (
    id: number,
    volunteer: VolunteerUpdate,
) => {
    // Verificar si el voluntario existe
    const existingVolunteer = await getVolunteerById(id)
    if (!existingVolunteer) throw new AppError(404, 'Volunteer not found')

    // Actualizar la tabla Voluntarios
    await db
        .update(Voluntarios)
        .set({
            nombres: volunteer.firstName,
            apellidos: volunteer.lastName,
            tipoDocumento: volunteer.idType,
            numeroDocumento: volunteer.idNumber,
            fechaNacimiento: new Date(
                volunteer.birthDate ?? existingVolunteer.birthDate,
            ),
            profesion: volunteer.profession,
            estatus: volunteer.status,
            genero: volunteer.gender,
        })
        .where(eq(Voluntarios.id, id))

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
            direccion: volunteer.direction,
            idCiudad: volunteer.cityId,
        })
        .where(eq(DetallesVoluntarios.idVoluntario, id))

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
                    eq(Pertenecen.idFranquicia, existingVolunteer.franchise.id),
                ),
            )

        // Insert a new record in Pertenecen for the new franchise
        await db.insert(Pertenecen).values({
            idVoluntario: id,
            idFranquicia: volunteer.franchiseId,
            fechaHoraIngreso: new Date(),
        })
    }

    if (volunteer.occupations) {
        await db.delete(Tienen).where(eq(Tienen.idVoluntario, id))

        volunteer.occupations.forEach(async (occupation: { id: number; isMain: boolean }) => {
            await db.insert(Tienen).values({
                idVoluntario: id,
                idCargo: occupation.id,
                esCargoPrincipal: occupation.isMain,
            })
        })
    }

    // Devolver el voluntario actualizado en el mismo formato que getVolunteerById
    return await getVolunteerById(id)
}

export const deleteVolunteer = async (id: number) => {
    const existingVolunteer = await getVolunteerById(id)
    if (!existingVolunteer) throw { message: 'Volunteer not found' }

    return await db
        .delete(Voluntarios)
        .where(eq(Voluntarios.id, id))
        .returning()
}

export const getVolunteersByOccupation = async (occupationId: number) => {
    const volunteers = await db
        .select({
            id: Voluntarios.id,
            firstName: Voluntarios.nombres,
            lastName: Voluntarios.apellidos,
            idNumber: Voluntarios.numeroDocumento,
            idType: Voluntarios.tipoDocumento,
            status: Voluntarios.estatus,
            occupation: {
                id: Cargos.id,
                name: Cargos.descripcion,
            },
        })
        .from(Tienen)
        .leftJoin(Voluntarios, eq(Voluntarios.id, Tienen.idVoluntario))
        .leftJoin(Cargos, eq(Cargos.id, Tienen.idCargo))
        .where(eq(Cargos.id, occupationId))

    if (volunteers.length === 0) {
        throw new AppError(404, 'No se encontraron voluntarios para este cargo')
    }

    return {
        items: volunteers,
    }
}
