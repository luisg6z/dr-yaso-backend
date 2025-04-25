import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../db/db";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { Usuarios } from "../db/schemas/Usuarios";
import { LoginSchema } from "./auth.schemas";
import { AppError } from "../common/errors/errors";


export const login = async (data: LoginSchema) => {
    const user = await db
    .select({
        id: Usuarios.id,
        name: Usuarios.nombre,
        password: Usuarios.contraseña,
        role: Usuarios.tipo,
        email: Usuarios.correo,
    })
    .from(Usuarios)
    .where(eq(Usuarios.nombre, data.name));

    if (!user[0]) {
        throw new AppError(404, "User not found", "User not found in the database");
    }

    const isPasswordValid = await bcrypt.compare(
        data.password,
        user[0].password
    )

    if (!isPasswordValid) {
        throw new AppError(401, "Invalid password", "The provided password is incorrect");
    }

    const token = jwt.sign({
        name: user[0].name,
        role: user[0].role,
        email: user[0].email,
    }, process.env.JWT_SECRET as string, {
        expiresIn: parseInt(process.env.JWT_EXPIRATION_TIME || "3600", 10) || "1h",
    })
    return {
        token: token,
        id: user[0].id,
        name: user[0].name,
        role: user[0].role,
    }
}