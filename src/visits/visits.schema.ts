import { z } from 'zod'
import { tiposVisitasEnum } from '../db/schemas/Visitas'

/**
 * @swagger
 * components:
 *   schemas:
 *     VisitLocation:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *
 *     VisitVolunteer:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         idNumber:
 *           type: string
 *         idType:
 *           type: string
 *         status:
 *           type: string
 *         clownName:
 *           type: string
 *           nullable: true
 *
 *     Visit:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         type:
 *           type: string
 *           description: Tipo de visita
 *         observations:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         directBeneficiaries:
 *           type: integer
 *           minimum: 0
 *         indirectBeneficiaries:
 *           type: integer
 *           minimum: 0
 *         healthPersonnelCount:
 *           type: integer
 *           minimum: 0
 *         location:
 *           $ref: '#/components/schemas/VisitLocation'
 *
 *     VisitDetails:
 *       allOf:
 *         - $ref: '#/components/schemas/Visit'
 *         - type: object
 *           properties:
 *             coordinator:
 *               oneOf:
 *                 - $ref: '#/components/schemas/VisitVolunteer'
 *                 - type: array
 *                   description: Puede venir [] si no existe coordinador
 *                   items: {}
 *             clowns:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VisitVolunteer'
 *             hallways:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VisitVolunteer'
 *
 *     VisitCreate:
 *       type: object
 *       required:
 *         - type
 *         - observation
 *         - date
 *         - directBeneficiaries
 *         - indirectBeneficiaries
 *         - healthPersonnelCount
 *       properties:
 *         type:
 *           type: string
 *           description: Tipo de visita (según enum del backend)
 *         observation:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la visita (ISO). Se guarda como `fechaHora`.
 *         directBeneficiaries:
 *           type: integer
 *           minimum: 0
 *         indirectBeneficiaries:
 *           type: integer
 *           minimum: 0
 *         healthPersonnelCount:
 *           type: integer
 *           minimum: 0
 *         locationId:
 *           type: integer
 *         coordinatorId:
 *           type: integer
 *         clownsIds:
 *           type: array
 *           items:
 *             type: integer
 *         hallwaysIds:
 *           type: array
 *           items:
 *             type: integer
 *
 *     VisitUpdate:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *         observation:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la visita (ISO). Se guarda como `fechaHora`.
 *         directBeneficiaries:
 *           type: integer
 *           minimum: 0
 *         indirectBeneficiaries:
 *           type: integer
 *           minimum: 0
 *         healthPersonnelCount:
 *           type: integer
 *           minimum: 0
 *         locationId:
 *           type: integer
 *         coordinatorId:
 *           type: integer
 *         clownsIds:
 *           type: array
 *           items:
 *             type: integer
 *         hallwaysIds:
 *           type: array
 *           items:
 *             type: integer
 */

export const visitsSchema = z.object({
    id: z.number().int().positive(),
    type: z.enum(tiposVisitasEnum.enumValues),
    observation: z.string().max(200),
    // Representa `fechaHora` (timestamp). Acepta ISO date-time o solo fecha (YYYY-MM-DD).
    date: z
        .union([z.string().datetime(), z.string().date()])
        .default(() => new Date().toISOString()),
    directBeneficiaries: z.number().int().min(0),
    indirectBeneficiaries: z.number().int().min(0),
    healthPersonnelCount: z.number().int().min(0),
    locationId: z.number().int().positive().optional(),
})

export const createVisitSchema = visitsSchema.omit({ id: true }).merge(
    z.object({
        coordinatorId: z.number().int().positive().optional(),
        clownsIds: z.array(z.number().int().positive()).optional(),
        hallwaysIds: z.array(z.number().int().positive()).optional(),
    }),
)
export const updateVisitSchema = createVisitSchema.partial()

export type Visit = z.infer<typeof visitsSchema>
export type VisitCreate = z.infer<typeof createVisitSchema>
export type VisitUpdate = z.infer<typeof updateVisitSchema>
