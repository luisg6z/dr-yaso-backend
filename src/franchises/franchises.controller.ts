import { Request, Response } from "express";
import { createFranchise, deleteFranchise, getAllFranchises, getFranchiseById, updateFranchise } from "./franchises.service";
import { idParamSchema } from "../types";


export const createFranchiseHandler = async (req: Request, res: Response) => {
    try {
        const franchise = req.body;
        res.status(201).json({
            data: await createFranchise(franchise)
        })
    } catch (error) {
        res.status(500).json({
            message: "Error creating franchise",
            details: error,
        })
    }
}

export const getAllFranchisesHandler = async (_req: Request, res: Response) => {
    try {
        res.status(200).json({
            data: await getAllFranchises(),
        })
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving franchises",
            details: error,
        })
    }
}

export const getFranchiseByIdHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const parsedId = idParamSchema.parse(+id);
        res.status(200).json({
            data: await getFranchiseById(parsedId),
        })
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving franchise",
            details: error,
        })
    }
}

export const updateFranchiseHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const franchise = req.body;
        const parsedId = idParamSchema.parse(+id);
        res.status(200).json({
            data: await updateFranchise(parsedId, franchise),
        })
    } catch (error) {
        res.status(500).json({
            message: "Error updating franchise",
            details: error,
        })
    }
}

export const deleteFranchiseHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const parsedId = idParamSchema.parse(+id);
        res.status(200).json({
            data: await deleteFranchise(parsedId),
        })
    } catch (error) {
        res.status(500).json({
            message: "Error deleting franchise",
            details: error,
        })
    }
}