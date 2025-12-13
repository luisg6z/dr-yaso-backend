import { z } from 'zod'
/**
 * @swagger
 * components:
 *   schemas:
 *     Volunteer:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         idType:
 *           type: string
 *           enum: [V, E]
 *         idNumber:
 *           type: string
 *         birthDate:
 *           type: string
 *         profession:
 *           type: string
 *         franchiseId:
 *           type: integer
 *         franchiseName:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Activo, Desvinculado, De permiso]
 *         gender:
 *           type: string
 *           enum: [Masculino, Femenino, Otro]
 *         bloodType:
 *           type: string
 *           enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *         maritalStatus:
 *           type: string
 *           enum: [Soltero/a, Casado/a, Divorciado/a, Viudo/a, Unión Libre]
 *         phoneNumbers:
 *           type: array
 *           items:
 *             type: string
 *         clownName:
 *           type: string
 *         shirtSize:
 *           type: string
 *           enum: [XS, S, M, L, XL, XXL, XXXL, XXXXL]
 *         hasShirtWithLogo:
 *           type: boolean
 *         hasCoatWithLogo:
 *           type: boolean
 *         allergies:
 *           type: string
 *         disability:
 *           type: string
 *         notes:
 *           type: string
 *         facebook:
 *           type: string
 *         x:
 *           type: string
 *         instagram:
 *           type: string
 *         tikTok:
 *           type: string
 *         emergencyContactName:
 *           type: string
 *         emergencyContactPhone:
 *           type: string
 *         occupations:
 *           type: array
 *           items:
 *             type: integer
 *         direction:
 *           type: object
 *           properties:
 *             direction:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             country:
 *               type: string
 */
export const VolunteerSchema = z.object({
    id: z.number().int().positive(),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    idType: z.enum(['V', 'E']),
    idNumber: z.string().min(1).max(12),
    birthDate: z.string().min(1).max(30),
    profession: z.string().min(1).max(60),
    franchiseId: z.number().int().positive(),
    franchiseName: z.string().min(1).max(100),
    status: z.enum(['Activo', 'Desvinculado', 'De permiso']),
    gender: z.enum(['Masculino', 'Femenino', 'Otro']),
    bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    maritalStatus: z.enum([
        'Soltero/a',
        'Casado/a',
        'Divorciado/a',
        'Viudo/a',
        'Unión Libre',
    ]),
    phoneNumbers: z.array(z.string().min(1).max(20)),
    clownName: z.string().min(1).max(120),
    shirtSize: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL']),
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
    occupations: z.array(z.number().positive()).optional(),
    direction: z.string().min(1).max(200).optional(),
    cityId: z.number().int().positive().optional(),
})
/**
 * @swagger
 * components:
 *   schemas:
 *     VolunteerCreate:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - idType
 *         - idNumber
 *         - birthDate
 *         - profession
 *         - franchiseId
 *         - status
 *         - gender
 *         - bloodType
 *         - maritalStatus
 *         - phoneNumbers
 *         - clownName
 *         - shirtSize
 *         - hasShirtWithLogo
 *         - hasCoatWithLogo
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         idType:
 *           type: string
 *           enum: [V, E]
 *         idNumber:
 *           type: string
 *         birthDate:
 *           type: string
 *         profession:
 *           type: string
 *         franchiseId:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [Activo, Desvinculado, De permiso]
 *         gender:
 *           type: string
 *           enum: [Masculino, Femenino, Otro]
 *         bloodType:
 *           type: string
 *           enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *         maritalStatus:
 *           type: string
 *           enum: [Soltero/a, Casado/a, Divorciado/a, Viudo/a, Unión Libre]
 *         phoneNumbers:
 *           type: array
 *           items:
 *             type: string
 *         clownName:
 *           type: string
 *         shirtSize:
 *           type: string
 *           enum: [XS, S, M, L, XL, XXL, XXXL, XXXXL]
 *         hasShirtWithLogo:
 *           type: boolean
 *         hasCoatWithLogo:
 *           type: boolean
 *         allergies:
 *           type: string
 *         disability:
 *           type: string
 *         notes:
 *           type: string
 *         facebook:
 *           type: string
 *         x:
 *           type: string
 *         instagram:
 *           type: string
 *         tikTok:
 *           type: string
 *         emergencyContactName:
 *           type: string
 *         emergencyContactPhone:
 *           type: string
 *         occupations:
 *           type: array
 *           items:
 *             type: integer
 *         direction:
 *           type: string
 *         cityId:
 *           type: integer
 *       example:
 *         firstName: "María"
 *         lastName: "Pérez"
 *         idType: "V"
 *         idNumber: "12345678"
 *         birthDate: "1990-05-15"
 *         profession: "Médico"
 *         franchiseId: 1
 *         status: "Activo"
 *         gender: "Femenino"
 *         bloodType: "O+"
 *         maritalStatus: "Soltero/a"
 *         phoneNumbers: ["04141234567", "04161234567"]
 *         clownName: "Payasita Risa"
 *         shirtSize: "M"
 *         hasShirtWithLogo: true
 *         hasCoatWithLogo: false
 *         allergies: "Ninguna"
 *         disability: "ceguera"
 *         notes: "Voluntaria desde 2022"
 *         facebook: "maria.perez"
 *         x: "mariaperez"
 *         instagram: "mariaperez"
 *         tikTok: "mariaperez"
 *         emergencyContactName: "Juan Pérez"
 *         emergencyContactPhone: "04141231234"
 *         occupations: [1, 2]
 *         direction: "Calle Falsa 123, Ciudad"
 *         cityId: 1
 */
export const createVolunteerSchema = VolunteerSchema.omit({
    id: true,
    franchiseName: true,
})
/**
 * @swagger
 * components:
 *   schemas:
 *     VolunteerUpdate:
 *       type: object
 *       description: Esquema para actualización parcial de un voluntario. Ningún campo es obligatorio.
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         idType:
 *           type: string
 *           enum: [V, E]
 *         idNumber:
 *           type: string
 *         birthDate:
 *           type: string
 *         profession:
 *           type: string
 *         franchiseId:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [Activo, Desvinculado, De permiso]
 *         gender:
 *           type: string
 *           enum: [Masculino, Femenino, Otro]
 *         bloodType:
 *           type: string
 *           enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *         maritalStatus:
 *           type: string
 *           enum: [Soltero/a, Casado/a, Divorciado/a, Viudo/a, Unión Libre]
 *         phoneNumbers:
 *           type: array
 *           items:
 *             type: string
 *         clownName:
 *           type: string
 *         shirtSize:
 *           type: string
 *           enum: [XS, S, M, L, XL, XXL, XXXL, XXXXL]
 *         hasShirtWithLogo:
 *           type: boolean
 *         hasCoatWithLogo:
 *           type: boolean
 *         allergies:
 *           type: string
 *         disability:
 *           type: string
 *         notes:
 *           type: string
 *         facebook:
 *           type: string
 *         x:
 *           type: string
 *         instagram:
 *           type: string
 *         tikTok:
 *           type: string
 *         emergencyContactName:
 *           type: string
 *         emergencyContactPhone:
 *           type: string
 *         occupations:
 *           type: array
 *           items:
 *             type: integer
 *         direction:
 *           type: string
 *         cityId:
 *           type: integer
 *       example:
 *         firstName: "María"
 *         lastName: "Pérez"
 *         idType: "V"
 *         idNumber: "12345678"
 *         birthDate: "1990-05-15"
 *         profession: "Médico"
 *         franchiseId: 1
 *         status: "Activo"
 *         gender: "Femenino"
 *         bloodType: "O+"
 *         maritalStatus: "Soltero/a"
 *         phoneNumbers: ["04141234567", "04161234567"]
 *         clownName: "Payasita Risa"
 *         shirtSize: "M"
 *         hasShirtWithLogo: true
 *         hasCoatWithLogo: false
 *         allergies: "Ninguna"
 *         disability: "ceguera"
 *         notes: "Voluntaria desde 2022"
 *         facebook: "maria.perez"
 *         x: "mariaperez"
 *         instagram: "mariaperez"
 *         tikTok: "mariaperez"
 *         emergencyContactName: "Juan Pérez"
 *         emergencyContactPhone: "04141231234"
 *         occupations: [1, 2]
 *         direction: "Calle Falsa 123, Ciudad"
 *         cityId: 1
 */
export const updateVolunteerSchema = createVolunteerSchema.partial()

export type Volunteer = z.infer<typeof VolunteerSchema>

export type VolunteerCreate = z.infer<typeof createVolunteerSchema>

export type VolunteerUpdate = z.infer<typeof updateVolunteerSchema>
