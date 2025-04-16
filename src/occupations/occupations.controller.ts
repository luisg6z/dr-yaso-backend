import { Request, Response } from "express";
import {
  createOccupation,
  deleteOccupation,
  getAllOccupations,
  getOccupationById,
  updateOccupation,
} from "./occupations.service";
import { idParamSchema } from "../types";

export const createOccupationHandler = async (req: Request, res: Response) => {
  try {
    const Occupation = req.body;
    res.status(201).json({
      data: await createOccupation(Occupation),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating ocupation",
      details: error,
    });
  }
};

export const getAllOccupationsHandler = async (
  _req: Request,
  res: Response
) => {
  try {
    res.status(200).json({
      data: await getAllOccupations(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving occupations",
      details: error,
    });
  }
};

export const getOccupationByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseId = idParamSchema.parse(+id);
    res.status(200).json({
      data: await getOccupationById(parseId),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving occupation",
      details: error,
    });
  }
};

export const updateOccupationHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const occupation = req.body;
    const parseId = idParamSchema.parse(+id);

    res.status(200).json({
      data: await updateOccupation(parseId, occupation),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating occupation",
      details: error,
    });
  }
};

export const deleteOccupationHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseId = idParamSchema.parse(+id);
    res.status(200).json({
      data: await deleteOccupation(parseId),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting occupation",
      details: error,
    });
  }
};
