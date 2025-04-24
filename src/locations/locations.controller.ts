import { Request, Response } from "express";
import {
  createLocation,
  deleteLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
} from "./location.service";
import { idParamSchema } from "../types/types";
import { Pagination } from "../types/types";
import { AppError } from "../common/errors/errors";

export const createLocationHandler = async (req: Request, res: Response) => {
  try {
    const location = req.body;
    res.status(201).json({
      data: await createLocation(location),
    });
  } catch (error) {
    if (!res.headersSent) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          message: error.message,
          details: error.details,
        });
      }
      res.status(500).json({
        message: "Error creating location",
        details: error,
      });
    }
  }
};

export const getAllLocationsHandler = async (_req: Request, res: Response) => {
  try {
    const pagination: Pagination = {
      page: +(_req.query.page || 1),
      limit: +(_req.query.limit || 10),
    };

    res.status(200).json(await getAllLocations(pagination));
  } catch (error) {
    if (!res.headersSent) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          message: error.message,
          details: error.details,
        });
      }
      res.status(500).json({
        message: "Error retrieving locations",
        details: error,
      });
    }
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
    if (!res.headersSent) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          message: error.message,
          details: error.details,
        });
      }
      res.status(500).json({
        message: "Error retreaving location",
        details: error,
      });
    }
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
    if (!res.headersSent) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          message: error.message,
          details: error.details,
        });
      }
      res.status(500).json({
        message: "Error updating location",
        details: error,
      });
    }
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
    if (!res.headersSent) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          message: error.message,
          details: error.details,
        });
      }
      res.status(500).json({
        message: "Error deleting location",
        details: error,
      });
    }
  }
};
