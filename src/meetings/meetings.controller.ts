import { Request, Response } from "express";
import {
  createMeeting,
  deleteMeeting,
  getAllMeetings,
  getMeetingById,
  updateMeeting,
} from "./meetings.service";
import { idParamSchema, Pagination } from "../types/types";
import { AppError } from "../common/errors/errors";
import { createMeetingSchema } from "./meetings.schema";
import { z } from "zod";

export const createMeetingHandler = async (req: Request, res: Response) => {
  try {
    const meeting = createMeetingSchema.parse(req.body); // Valida el cuerpo de la solicitud
    const createdMeeting = await createMeeting(meeting);
    res.status(201).json({ items: createdMeeting });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation error",
        details: error.errors,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        details: error,
      });
    }
  }
};

export const getAllMeetingsHandler = async (req: Request, res: Response) => {
  try {
    const pagination: Pagination = {
      page: +(req.query.page || 1),
      limit: +(req.query.limit || 10),
    };
    res.status(200).json(await getAllMeetings(pagination));
  } catch (error) {
    if (!res.headersSent) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          message: error.message,
          details: error.details,
        });
      }
      res.status(500).json({
        message: "Internal server error",
        details: error,
      });
    }
  }
};

export const getMeetingByIdHandler = async (req: Request, res: Response) => {
  try {
    const parsedId = idParamSchema.parse(+req.params.id);
    res.status(200).json({
      items: await getMeetingById(parsedId),
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
        message: "Internal server error",
        details: error,
      });
    }
  }
};

export const updateMeetingHandler = async (req: Request, res: Response) => {
  try {
    const parsedId = idParamSchema.parse(+req.params.id);
    res.status(200).json({
      items: await updateMeeting(parsedId, req.body),
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
        message: "Internal server error",
        details: error,
      });
    }
  }
};

export const deleteMeetingHandler = async (req: Request, res: Response) => {
  try {
    const parsedId = idParamSchema.parse(+req.params.id);
    res.status(200).json({
      items: await deleteMeeting(parsedId),
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
        message: "Internal server error",
        details: error,
      });
    }
  }
};
