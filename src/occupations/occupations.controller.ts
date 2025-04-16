import { Request, Response } from "express";
import { createOccupation } from "./occupations.service";

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
