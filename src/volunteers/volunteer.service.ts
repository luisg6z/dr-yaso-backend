import { eq, and, isNull, ne } from 'drizzle-orm'
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

    // Validación previa de coordinador único (fuera de la tx)
    if (volunteer.franchiseId && volunteer.occupations?.length) {
        const coordinatorId = await getCoordinatorCargoId()
        const hasCoordinator = volunteer.occupations.some(o => o.id === coordinatorId)
        if (hasCoordinator) {
            const exists = await existsCoordinatorInFranchise(volunteer.franchiseId, coordinatorId)
            if (exists) {
                throw new AppError(
                    409,
                    'Ya existe un coordinador activo en esta franquicia. Actualiza el cargo del voluntario y vuelve a intentarlo.',
                )
            }
        }
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

// Helper to map volunteer row + occupations to response object
const mapVolunteer = (
    row: {
        Voluntarios: typeof Voluntarios.$inferSelect
        DetallesVoluntarios: typeof DetallesVoluntarios.$inferSelect
        Pertenecen: typeof Pertenecen.$inferSelect | null
        Franquicias: typeof Franquicias.$inferSelect | null
        Ciudades: typeof Ciudades.$inferSelect | null
        Estados: typeof Estados.$inferSelect | null
        Paises: typeof Paises.$inferSelect | null
    },
    occupations: any[],
) => {
    return {
        id: row.Voluntarios.id,
        firstName: row.Voluntarios.nombres,
        lastName: row.Voluntarios.apellidos,
        idType: row.Voluntarios.tipoDocumento,
        idNumber: row.Voluntarios.numeroDocumento,
        birthDate: row.Voluntarios.fechaNacimiento,
        profession: row.Voluntarios.profesion,
        status: row.Voluntarios.estatus,
        gender: row.Voluntarios.genero,
        bloodType: row.DetallesVoluntarios.tipoSangre,
        maritalStatus: row.DetallesVoluntarios.estadoCivil,
        phoneNumbers: row.DetallesVoluntarios.telefonos,
        clownName: row.DetallesVoluntarios.nombrePayaso,
        shirtSize: row.DetallesVoluntarios.tallaCamisa,
        hasShirtWithLogo: row.DetallesVoluntarios.tieneCamisaConLogo,
        hasCoatWithLogo: row.DetallesVoluntarios.tieneBataConLogo,
        allergies: row.DetallesVoluntarios.alergias,
        disability: row.DetallesVoluntarios.discapacidad,
        socialMedia: {
            facebook: row.DetallesVoluntarios.facebook,
            x: row.DetallesVoluntarios.x,
            instagram: row.DetallesVoluntarios.instagram,
            tikTok: row.DetallesVoluntarios.tiktok,
        },
        direction: {
            direction: row.DetallesVoluntarios.direccion,
            city: row.Ciudades?.nombre,
            state: row.Estados?.nombre,
            country: row.Paises?.nombre,
        },
        emergencyContact: {
            name: row.DetallesVoluntarios.nombreContactoEmergencia,
            phone: row.DetallesVoluntarios.telefonoContactoEmergencia,
        },
        franchise: row.Franquicias
            ? {
                id: row.Franquicias.id,
                name: row.Franquicias.nombre,
            }
            : null,
        occupations: occupations,
    }
}

// Queries for reusability if needed, but current usage is ad-hoc selects.
// Let's stick to modifying the existing methods to use the mapper.

export const getAllVolunteers = async (pagination: Pagination) => {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    const rows = await db
        .select({
            Voluntarios: Voluntarios,
            DetallesVoluntarios: DetallesVoluntarios,
            Pertenecen: Pertenecen,
            Franquicias: Franquicias,
            Ciudades: Ciudades,
            Estados: Estados,
            Paises: Paises,
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
                isNull(Pertenecen.fechaHoraEgreso),
            ),
        )
        .leftJoin(Franquicias, eq(Franquicias.id, Pertenecen.idFranquicia))
        .leftJoin(Ciudades, eq(Ciudades.id, DetallesVoluntarios.idCiudad))
        .leftJoin(Estados, eq(Estados.id, Ciudades.idEstado))
        .leftJoin(Paises, eq(Paises.id, Estados.idPais))
        .limit(limit)
        .offset(offset)

    const volunteers = await Promise.all(
        rows.map(async (row) => {
            const vcharges = await db
                .select({
                    occupationId: Cargos.id,
                    volunteerId: Tienen.idVoluntario,
                    name: Cargos.descripcion,
                    isMain: Tienen.esCargoPrincipal,
                })
                .from(Tienen)
                .innerJoin(Cargos, eq(Cargos.id, Tienen.idCargo))
                .where(eq(Tienen.idVoluntario, row.Voluntarios.id))

            const occupations = vcharges.map((e) => ({
                id: e.occupationId,
                name: e.name,
                isMain: e.isMain,
            }))

            return mapVolunteer(row, occupations)
        }),
    )

    const totalItems = await db.$count(Voluntarios)
    const totalPages = Math.ceil(totalItems / limit)

    return {
        items: volunteers,
        paginate: {
            page,
            limit,
            totalItems,
            totalPages,
        },
    }
}

export const getAllVolunteersForFranchise = async (franchiseId: number) => {
    const rows = await db
        .select({
            Voluntarios: Voluntarios,
            DetallesVoluntarios: DetallesVoluntarios,
            Pertenecen: Pertenecen,
            Franquicias: Franquicias,
            Ciudades: Ciudades,
            Estados: Estados,
            Paises: Paises,
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
                isNull(Pertenecen.fechaHoraEgreso),
            ),
        )
        .innerJoin(Franquicias, eq(Franquicias.id, Pertenecen.idFranquicia))
        .leftJoin(Ciudades, eq(Ciudades.id, DetallesVoluntarios.idCiudad))
        .leftJoin(Estados, eq(Estados.id, Ciudades.idEstado))
        .leftJoin(Paises, eq(Paises.id, Estados.idPais))
        .where(eq(Franquicias.id, franchiseId))

    const volunteers = await Promise.all(
        rows.map(async (row) => {
            const vcharges = await db
                .select({
                    occupationId: Cargos.id,
                    volunteerId: Tienen.idVoluntario,
                    name: Cargos.descripcion,
                    isMain: Tienen.esCargoPrincipal,
                })
                .from(Tienen)
                .innerJoin(Cargos, eq(Cargos.id, Tienen.idCargo))
                .where(eq(Tienen.idVoluntario, row.Voluntarios.id))

            const occupations = vcharges.map((e) => ({
                id: e.occupationId,
                name: e.name,
                isMain: e.isMain,
            }))
            return mapVolunteer(row, occupations)
        }),
    )

    return {
        items: volunteers,
    }
}

export const getVolunteerById = async (id: number) => {
    const row = await db
        .select({
            Voluntarios: Voluntarios,
            DetallesVoluntarios: DetallesVoluntarios,
            Pertenecen: Pertenecen,
            Franquicias: Franquicias,
            Ciudades: Ciudades,
            Estados: Estados,
            Paises: Paises,
        })
        .from(Voluntarios)
        .where(eq(Voluntarios.id, id))
        .innerJoin(
            DetallesVoluntarios,
            eq(DetallesVoluntarios.idVoluntario, Voluntarios.id),
        )
        .leftJoin(
            Pertenecen,
            and(
                eq(Pertenecen.idVoluntario, Voluntarios.id),
                isNull(Pertenecen.fechaHoraEgreso),
            ),
        )
        .leftJoin(Franquicias, eq(Franquicias.id, Pertenecen.idFranquicia))
        .leftJoin(Ciudades, eq(Ciudades.id, DetallesVoluntarios.idCiudad))
        .leftJoin(Estados, eq(Estados.id, Ciudades.idEstado))
        .leftJoin(Paises, eq(Paises.id, Estados.idPais))
        .then((rows) => rows[0])

    if (!row) return null

    const vcharges = await db
        .select({
            occupationId: Cargos.id,
            name: Cargos.descripcion,
            isMain: Tienen.esCargoPrincipal,
        })
        .from(Tienen)
        .innerJoin(Cargos, eq(Cargos.id, Tienen.idCargo))
        .where(eq(Tienen.idVoluntario, id))

    const occupations = vcharges.map((e) => ({
        id: e.occupationId,
        name: e.name,
        isMain: e.isMain,
    }))

    return mapVolunteer(row, occupations)
}


export const updateVolunteer = async (
    id: number,
    volunteer: VolunteerUpdate,
) => {
    // Verificar si el voluntario existe
    const existingVolunteer = await getVolunteerById(id)
    if (!existingVolunteer) throw new AppError(404, 'Volunteer not found')

    // Validación previa de coordinador único (fuera de la tx)
    if (volunteer.occupations?.length) {
        const coordinatorId = await getCoordinatorCargoId()
        const hasCoordinator = volunteer.occupations.some(o => o.id === coordinatorId)
        if (hasCoordinator) {
            const targetFranchiseId = volunteer.franchiseId ?? existingVolunteer.franchise?.id

            if (!targetFranchiseId) {
                // If it's still null, validation fails or we skip? 
                // "El voluntario no tiene franquicia asignada" logic is here.
                throw new AppError(
                    400,
                    'El voluntario no tiene franquicia asignada. No se puede validar el coordinador único.'
                )
            }
            const exists = await existsCoordinatorInFranchise(targetFranchiseId, coordinatorId, id)
            if (exists) {
                // ...
                throw new AppError(
                    409,
                    'Ya existe un coordinador activo en esta franquicia. Actualiza el cargo del voluntario y vuelve a intentarlo.',
                )
            }
        }
    }

    // Actualizar la tabla Voluntarios
    await db.transaction(async (tx) => {
        await tx
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
        await tx
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
            existingVolunteer.franchise?.id &&
            volunteer.franchiseId !== existingVolunteer.franchise.id
        ) {
            // Update the current franchise's exit date
            await tx
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
            await tx.delete(Tienen).where(eq(Tienen.idVoluntario, id))

            volunteer.occupations.forEach(async (occupation: { id: number; isMain: boolean }) => {
                await db.insert(Tienen).values({
                    idVoluntario: id,
                    idCargo: occupation.id,
                    esCargoPrincipal: occupation.isMain,
                })
            })
        }

    })

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

// Helper: obtiene el id del cargo "Coordinador" usando db 
const getCoordinatorCargoId = async (): Promise<number> => {
    const [cargo] = await db
        .select({ id: Cargos.id })
        .from(Cargos)
        .where(eq(Cargos.nombre, 'Coordinador'))
    if (!cargo) throw new AppError(500, 'Coordinator cargo not found')
    return cargo.id
}

// Helper: verifica si existe coordinador activo en la franquicia usando db 
const existsCoordinatorInFranchise = async (
    franchiseId: number,
    coordinatorCargoId: number,
    excludeVolunteerId?: number,
): Promise<boolean> => {
    if (!franchiseId) return false

    const existing = await db
        .select({ volunteerId: Voluntarios.id })
        .from(Tienen)
        .innerJoin(Voluntarios, eq(Voluntarios.id, Tienen.idVoluntario))
        .innerJoin(
            Pertenecen,
            and(
                eq(Pertenecen.idVoluntario, Voluntarios.id),
                isNull(Pertenecen.fechaHoraEgreso),
            ),
        )
        .where(
            and(
                eq(Pertenecen.idFranquicia, franchiseId),
                eq(Tienen.idCargo, coordinatorCargoId),
                excludeVolunteerId ? ne(Voluntarios.id, excludeVolunteerId) : eq(Voluntarios.id, Voluntarios.id),
            ),
        )

    return existing.length > 0
}
