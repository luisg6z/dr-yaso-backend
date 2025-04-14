import { Request, Response } from "express";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "./users.service";
import { idParamSchema } from "../types";


export const createUserHandler = async (req: Request, res: Response) => {
    try {
        res.status(201).json({
            data: await createUser(req.body)
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal server error",
            details: error,
        })
    }
}

export const getAllUsersHandler = async (_req: Request, res: Response) => {
    try {
        res.status(200).json({
            data: await getAllUsers()
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            details: error,
        })
    }
}

export const getUserByIdHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const parsedId = idParamSchema.parse(+id);
        res.status(200).json({
            data: await getUserById(parsedId),
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            details: error,
        })
    }
}

export const updateUserHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const parsedId = idParamSchema.parse(+id);
        res.status(200).json({
            data: await updateUser(parsedId, req.body),
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            details: error,
        })
    }
}

export const deleteUserHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const parsedId = idParamSchema.parse(+id);
        res.status(200).json({
            data: await deleteUser(parsedId),
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            details: error,
        })
    }
}

