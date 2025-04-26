import { hash } from "bcrypt";

import { UserCreate, UserUpdate } from "./users.schema";
import { db } from "../db/db";
import { tipoUsuarioEnum, Usuarios } from "../db/schemas/Usuarios";
import { eq, ne } from "drizzle-orm";
import { Pagination } from "../types/types";
import { AppError } from "../common/errors/errors";
import { envs } from "../config/envs";
import { Franquicias } from "../db/schemas/Franquicias";


export const createUser = async (user: UserCreate) => {
    const hashedPassword = await hash(user.password, envs.saltRounds);

    
    const newUser = {
        ...user,
        password: hashedPassword,
    };

    return await db.insert(Usuarios)
    .values({
        nombre: newUser.name,
        "contraseña": newUser.password,
        tipo: newUser.type,
        correo: newUser.email,
        idFranquicia: newUser.franchiseId,
    })
    .returning();


}

export const getAllUsers = async (pagination: Pagination) => {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;
    const users = await db
    .select({
        id: Usuarios.id,
        name: Usuarios.nombre,
        type: Usuarios.tipo,
        email: Usuarios.correo,
        franchise: {
            id: Usuarios.idFranquicia,
            name: Franquicias.nombre,
        }
    })
    .from(Usuarios)
    .leftJoin(Franquicias, eq(Usuarios.idFranquicia, Franquicias.id))
    .limit(limit)
    .offset(offset);

    const totalItems = await db.$count(Usuarios);
    const totalPages = Math.ceil(totalItems / limit);

    return {
        items: users,
        paginate: {
            page,
            limit,
            totalItems,
            totalPages,
        }
    }
}

export const getAllUsersNoSudo = async (pagination: Pagination) => {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;
    const users = await db
    .select({
        id: Usuarios.id,
        name: Usuarios.nombre,
        type: Usuarios.tipo,
        email: Usuarios.correo,
        franchise: {
            id: Usuarios.idFranquicia,
            name: Franquicias.nombre,
        }
    })
    .from(Usuarios)
    .leftJoin(Franquicias, eq(Usuarios.idFranquicia, Franquicias.id))
    .where(ne(Usuarios.tipo, tipoUsuarioEnum.enumValues[0]))
    .limit(limit)
    .offset(offset);

    const totalItems = await db.$count(Usuarios);
    const totalPages = Math.ceil(totalItems / limit);

    return {
        items: users,
        paginate: {
            page,
            limit,
            totalItems,
            totalPages,
        }
    }
}

export const getUserById = async (id: number) => {
    return await db
    .select({
        id: Usuarios.id,
        name: Usuarios.nombre,
        type: Usuarios.tipo,
        email: Usuarios.correo,
        franchise: {
            id: Usuarios.idFranquicia,
            name: Franquicias.nombre,
        }
    })
    .from(Usuarios)
    .leftJoin(Franquicias, eq(Usuarios.idFranquicia, Franquicias.id))
    .where(eq(Usuarios.id, id))
}

export const updateUser = async (id: number, user: UserUpdate) => {

    const existingUser = await getUserById(id);

    if (existingUser.length === 0) {
        throw new AppError(404, "User not found");
    }

    if (user.password) {
        const hashedPassword = await hash(user.password, envs.saltRounds);

        return await db
        .update(Usuarios)
        .set({
            nombre: user.name,
            "contraseña": hashedPassword,
            correo: user.email,
            idFranquicia: user.franchiseId,
            tipo: user.type
        })
        .where(eq(Usuarios.id, id))
        .returning({
            id: Usuarios.id,
            name: Usuarios.nombre,
            type: Usuarios.tipo,
            email: Usuarios.correo,
            franchiseId: Usuarios.idFranquicia,
        })
    }

    return await db
    .update(Usuarios)
    .set({
        nombre: user.name,
        correo: user.email,
        idFranquicia: user.franchiseId,
    })
    .where(eq(Usuarios.id, id))
    .returning({
        id: Usuarios.id,
        name: Usuarios.nombre,
        type: Usuarios.tipo,
        email: Usuarios.correo,
        franchiseId: Usuarios.idFranquicia,
    });
}

export const deleteUser = async (id: number) => {

    const existingUser = await getUserById(id);

    if (existingUser.length === 0) {
        throw new AppError(404, "User not found");
    }

    return await db
    .delete(Usuarios)
    .where(eq(Usuarios.id, id))
    .returning();
}