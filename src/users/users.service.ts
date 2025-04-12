import "dotenv/config";

import { hash } from "bcrypt";

import { UserCreate, UserUpdate } from "./users.schema";
import { db } from "../db/db";
import { Usuarios } from "../db/schemas/Usuarios";
import { eq } from "drizzle-orm";


export const createUser = async (user: UserCreate) => {
    const hashedPassword = await hash(user.password, Number(process.env.SALT_ROUNDS) || 10);
    
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

export const getAllUsers = async () => {
    return await db
    .select({
        id: Usuarios.id,
        name: Usuarios.nombre,
        password: Usuarios["contraseña"],
        type: Usuarios.tipo,
        email: Usuarios.correo,
        franchiseId: Usuarios.idFranquicia
    })
    .from(Usuarios);
}

export const getUserById = async (id: number) => {
    return await db
    .select({
        id: Usuarios.id,
        name: Usuarios.nombre,
        password: Usuarios["contraseña"],
        type: Usuarios.tipo,
        email: Usuarios.correo,
        franchiseId: Usuarios.idFranquicia
    })
    .from(Usuarios)
    .where(eq(Usuarios.id, id))
}

export const updateUser = async (id: number, user: UserUpdate) => {

    const existingUser = await getUserById(id);

    if (existingUser.length === 0) {
        throw new Error("User not found");
    }

    if (user.password) {
        const hashedPassword = await hash(user.password, Number(process.env.SALT_ROUNDS) || 10);

        return await db
        .update(Usuarios)
        .set({
            nombre: user.name,
            "contraseña": hashedPassword,
            correo: user.email,
            idFranquicia: user.franchiseId,
        })
        .where(eq(Usuarios.id, id))
    }

    return await db
    .update(Usuarios)
    .set({
        nombre: user.name,
        correo: user.email,
        idFranquicia: user.franchiseId,
    })
    .where(eq(Usuarios.id, id))
    .returning();
}

export const deleteUser = async (id: number) => {

    const existingUser = await getUserById(id);

    if (existingUser.length === 0) {
        throw new Error("User not found");
    }

    return await db
    .delete(Usuarios)
    .where(eq(Usuarios.id, id))
    .returning();
}