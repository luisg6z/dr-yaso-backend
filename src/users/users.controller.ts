import { Request, Response } from "express";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "./users.service";
import { idParamSchema, Pagination } from "../types/types";


export const createUserHandler = async (req: Request, res: Response) => {
    try {
        res.status(201).json({
            data: await createUser(req.body)
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            details: error,
        })
    }
}

export const getAllUsersHandler = async (req: Request, res: Response) => {
    try {
        const pagination: Pagination = {
            page: +(req.query.page || 1),
            limit: +(req.query.limit || 10),
        }
        res.status(200).json(await getAllUsers(pagination))
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            details: error,
        })
    }
}

export const getUserByIdHandler = async (req: Request, res: Response) => {
    try {
        const parsedId = idParamSchema.parse(+req.params.id);
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
        const parsedId = idParamSchema.parse(+req.params.id);
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
        const parsedId = idParamSchema.parse(+req.params.id);
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

