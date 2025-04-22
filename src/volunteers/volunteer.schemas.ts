import { z } from "zod";

export const VolunteerSchema = z.object({
  id: z.number().int().positive(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  idType: z.enum(["V", "E"]),
  idNumber: z.string().min(1).max(12),
  birthDate: z.string().min(1).max(30),
  profession: z.string().min(1).max(60),
  franchiseId: z.number().int().positive(),
  franchiseName: z.string().min(1).max(100),
  status: z.enum(["Activo", "Desvinculado", "De permiso"]),
  gender: z.enum(["Masculino", "Femenino", "Otro"]),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  maritalStatus: z.enum([
    "Soltero/a",
    "Casado/a",
    "Divorciado/a",
    "Viudo/a",
    "Unión Libre",
  ]),
  phoneNumbers: z.array(z.string().min(1).max(20)),
  clownName: z.string().min(1).max(120),
  shirtSize: z
    .enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"]),
  hasShirtWithLogo: z.boolean(),
  hasCoatWithLogo: z.boolean(),
  allergies: z.string().min(1).max(200).optional(),
  disability: z.string().min(1).max(200).optional(),
  notes: z.string().min(1).max(200).optional(),
  facebook: z.string().min(1).max(200).optional(),
  x: z.string().min(1).max(200).optional(),
  instagram: z.string().min(1).max(200).optional(),
  tikTok: z.string().min(1).max(200).optional(),
  emergencyContactName: z.string().min(1).max(60).optional(),
  emergencyContactPhone: z.string().min(1).max(20).optional(),
});

export const createVolunteerSchema = VolunteerSchema.omit({ id: true, franchiseName: true });
export const updateVolunteerSchema = createVolunteerSchema.partial();

export type Volunteer = z.infer<typeof VolunteerSchema>;

export type VolunteerCreate = z.infer<typeof createVolunteerSchema>;

export type VolunteerUpdate = z.infer<typeof updateVolunteerSchema>;
