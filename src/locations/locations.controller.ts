import { Request, Response } from "express";
import {
  createLocation,
  deleteLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
} from "./location.service";
import { idParamSchema } from "../types";

export const createLocationHandler = async (req: Request, res: Response) => {
  try {
    const location = req.body;
    res.status(201).json({
      data: await createLocation(location),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating location",
      details: error,
    });
  }
};

export const getAllLocationsHandler = async (
  _req: Request,
  res: Response
) => {
  try {
    res.status(200).json({
      data: await getAllLocations(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving Locations",
      details: error,
    });
  }
};

export const getLocationByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseId = idParamSchema.parse(+id);
    res.status(200).json({
      data: await getLocationById(parseId),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving Location",
      details: error,
    });
  }
};

export const updateLocationHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const location = req.body;
    const parseId = idParamSchema.parse(+id);

    res.status(200).json({
      data: await updateLocation(parseId, location),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating Location",
      details: error,
    });
  }
};

export const deleteLocationHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseId = idParamSchema.parse(+id);
    res.status(200).json({
      data: await deleteLocation(parseId),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting Location",
      details: error,
    });
  }
};
