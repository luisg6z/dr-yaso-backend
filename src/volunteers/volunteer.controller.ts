import { Request, Response } from "express";
import { createVolunteer, getVolunteerById } from "./volunteer.service";
import { idParamSchema } from "../types";

export const createVolunteerHandler = async (req: Request, res: Response) => {
  try {
    const Volunteer = req.body;
    res.status(201).json({
      data: await createVolunteer(Volunteer),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating Volunteer",
      details: error,
    });
  }
};

// export const getAllVolunteersHandler = async (
//   _req: Request,
//   res: Response
// ) => {
//   try {
//     res.status(200).json({
//       data: await getAllVolunteers(),
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error retrieving Volunteers",
//       details: error,
//     });
//   }
// };

export const getVolunteerByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseId = idParamSchema.parse(+id);
    res.status(200).json({
      data: await getVolunteerById(parseId),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving Volunteer",
      details: error,
    });
  }
};

// export const updateVolunteerHandler = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const Volunteer = req.body;
//     const parseId = idParamSchema.parse(+id);

//     res.status(200).json({
//       data: await updateVolunteer(parseId, Volunteer),
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error updating Volunteer",
//       details: error,
//     });
//   }
// };

// export const deleteVolunteerHandler = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const parseId = idParamSchema.parse(+id);
//     res.status(200).json({
//       data: await deleteVolunteer(parseId),
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error deleting Volunteer",
//       details: error,
//     });
//   }
// };
