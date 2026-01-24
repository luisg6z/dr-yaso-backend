import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { Voluntarios } from '../db/schemas/Voluntarios'
import { FranchiseCreate, FranchiseUpdate } from './franchises.schemas'
import { Ciudades } from '../db/schemas/Ciudades'
import { Franquicias } from '../db/schemas/Franquicias'
import { Pagination } from '../types/types'
import { Estados } from '../db/schemas/Estados'
import { Paises } from '../db/schemas/Paises'
import { AppError } from '../common/errors/errors'

export const createFranchise = async (franchise: FranchiseCreate) => {
    if (franchise.coordinatorId) {
        const coordinator = await db
            .select({
                id: Voluntarios.id,
                name: Voluntarios.nombres,
            })
            .from(Voluntarios)
            .where(eq(Voluntarios.id, franchise.coordinatorId))

        if (coordinator.length < 1)
            throw new AppError(400, 'Coordinator not found')
    }

    if (franchise.cityId) {
        const city = await db
            .select({
                id: Ciudades.id,
                name: Ciudades.nombre,
            })
            .from(Ciudades)
            .where(eq(Ciudades.id, franchise.cityId))

        if (city.length < 1) throw new AppError(400, 'City not found')
    }

    const [created] = await db
        .insert(Franquicias)
        .values({
            nombre: franchise.name,
            rif: franchise.rif,
            direccion: franchise.address,
            telefono: franchise.phone,
            correo: franchise.email,
            estaActivo: franchise.isActive ?? true,
            idCiudad: franchise.cityId,
            idCoordinador: franchise.coordinatorId,
        })
        .returning({ id: Franquicias.id })

    if (!created) throw new AppError(500, 'Error creating franchise')

    return await getFranchiseById(created.id)
}

export const getAllFranchises = async (pagination: Pagination) => {
    const { page, limit, status } = pagination
    const offset = (page - 1) * limit

    const whereCondition =
        status === 'active'
            ? eq(Franquicias.estaActivo, true)
            : status === 'inactive'
              ? eq(Franquicias.estaActivo, false)
              : undefined

    const franchises = await db
        .select({
            id: Franquicias.id,
            rif: Franquicias.rif,
            name: Franquicias.nombre,
            address: Franquicias.direccion,
            phone: Franquicias.telefono,
            email: Franquicias.correo,
            isActive: Franquicias.estaActivo,
            city: {
                id: Franquicias.idCiudad,
                name: Ciudades.nombre,
            },
            state: {
                id: Estados.id,
                name: Estados.nombre,
            },
            country: {
                id: Paises.id,
                name: Paises.nombre,
            },
            coordinator: {
                id: Franquicias.idCoordinador,
                firstName: Voluntarios.nombres,
                lastName: Voluntarios.apellidos,
            },
        })
        .from(Franquicias)
        .leftJoin(Voluntarios, eq(Franquicias.idCoordinador, Voluntarios.id))
        .leftJoin(Ciudades, eq(Franquicias.idCiudad, Ciudades.id))
        .leftJoin(Estados, eq(Ciudades.idEstado, Estados.id))
        .leftJoin(Paises, eq(Estados.idPais, Paises.id))
        .where(whereCondition)
        .limit(limit)
        .offset(offset)

    const totalItems = await db.$count(Franquicias, whereCondition)
    const totalPages = Math.ceil(totalItems / limit)

    return {
        items: franchises,
        paginate: {
            page,
            limit,
            totalItems,
            totalPages,
        },
    }
}

export const getUserFranchise = async (franchiseId: number) => {
    const franchise = await db
        .select({
            id: Franquicias.id,
            rif: Franquicias.rif,
            name: Franquicias.nombre,
            address: Franquicias.direccion,
            phone: Franquicias.telefono,
            email: Franquicias.correo,
            isActive: Franquicias.estaActivo,
            city: {
                id: Franquicias.idCiudad,
                name: Ciudades.nombre,
            },
            state: {
                id: Estados.id,
                name: Estados.nombre,
            },
            country: {
                id: Paises.id,
                name: Paises.nombre,
            },
            coordinator: {
                id: Franquicias.idCoordinador,
                firstName: Voluntarios.nombres,
                lastName: Voluntarios.apellidos,
            },
        })
        .from(Franquicias)
        .leftJoin(Voluntarios, eq(Franquicias.idCoordinador, Voluntarios.id))
        .leftJoin(Ciudades, eq(Franquicias.idCiudad, Ciudades.id))
        .leftJoin(Estados, eq(Ciudades.idEstado, Estados.id))
        .leftJoin(Paises, eq(Estados.idPais, Paises.id))
        .where(eq(Franquicias.id, franchiseId))

    return franchise
}

export const getFranchiseById = async (id: number) => {
    return await db
        .select({
            id: Franquicias.id,
            rif: Franquicias.rif,
            name: Franquicias.nombre,
            address: Franquicias.direccion,
            phone: Franquicias.telefono,
            email: Franquicias.correo,
            isActive: Franquicias.estaActivo,
            city: {
                id: Franquicias.idCiudad,
                name: Ciudades.nombre,
            },
            state: {
                id: Estados.id,
                name: Estados.nombre,
            },
            country: {
                id: Paises.id,
                name: Paises.nombre,
            },
            coordinator: {
                id: Franquicias.idCoordinador,
                firstName: Voluntarios.nombres,
                lastName: Voluntarios.apellidos,
            },
        })
        .from(Franquicias)
        .leftJoin(Voluntarios, eq(Franquicias.idCoordinador, Voluntarios.id))
        .leftJoin(Ciudades, eq(Franquicias.idCiudad, Ciudades.id))
        .leftJoin(Estados, eq(Ciudades.idEstado, Estados.id))
        .leftJoin(Paises, eq(Estados.idPais, Paises.id))
        .where(eq(Franquicias.id, id))
}

export const updateFranchise = async (
    id: number,
    franchise: FranchiseUpdate,
) => {
    const franchiseToUpdate = await getFranchiseById(id)
    if (franchiseToUpdate.length < 1)
        throw new AppError(404, 'Franchise not found')

    if (franchise.coordinatorId) {
        const coordinator = await db
            .select({
                id: Voluntarios.id,
                name: Voluntarios.nombres,
            })
            .from(Voluntarios)
            .where(eq(Voluntarios.id, franchise.coordinatorId))

        if (coordinator.length < 1)
            throw new AppError(400, 'Coordinator not found')
    }

    if (franchise.cityId) {
        const city = await db
            .select({
                id: Ciudades.id,
                name: Ciudades.nombre,
            })
            .from(Ciudades)
            .where(eq(Ciudades.id, franchise.cityId))

        if (city.length < 1) throw new AppError(400, 'City not found')
    }

    await db
        .update(Franquicias)
        .set({
            nombre: franchise.name,
            rif: franchise.rif,
            direccion: franchise.address,
            telefono: franchise.phone,
            correo: franchise.email,
            estaActivo: franchise.isActive,
            idCiudad: franchise.cityId,
            idCoordinador: franchise.coordinatorId,
        })
        .where(eq(Franquicias.id, id))

    return await getFranchiseById(id)
}

export const deleteFranchise = async (id: number) => {
    const existingFranchise = await getFranchiseById(id)
    if (existingFranchise.length === 0) {
        throw new AppError(404, 'Franchise not found')
    }
    await db
        .update(Franquicias)
        .set({
            estaActivo: false,
        })
        .where(eq(Franquicias.id, id))

    return await getFranchiseById(id)
}
