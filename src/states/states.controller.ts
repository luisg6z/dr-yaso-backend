import { Request, Response } from "express";
import { getStatesByCountryId } from "./states.service";
import { idParamSchema } from "../types/types";
import { AppError } from "../common/errors/errors";

export const getStatesByCountryIdHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const parseId = idParamSchema.parse(+id);
    res.status(200).json({
      data: await getStatesByCountryId(parseId),
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
