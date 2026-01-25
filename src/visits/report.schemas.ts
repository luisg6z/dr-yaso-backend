import { z } from 'zod'
import { tiposVisitasEnum } from '../db/schemas/Visitas'

/**
 * @swagger
 * components:
 *   schemas:
 *     VisitsReportFilters:
 *       type: object
 *       required:
 *         - dateRange
 *       properties:
 *         dateRange:
 *           type: object
 *           required:
 *             - startDate
 *             - endDate
 *           properties:
 *             startDate:
 *               type: string
 *               format: date-time
 *             endDate:
 *               type: string
 *               format: date-time
 *         visitTypes:
 *           type: array
 *           items:
 *             type: string
 *           description: Tipos de visitas a incluir (opcional)
 *         franchiseId:
 *           type: integer
 *           description: Filtra por franquicia (opcional)
 *         format:
 *           type: string
 *           enum: [json, pdf, excel]
 *           default: json
 *
 *     VisitsReportItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         dateTime:
 *           type: string
 *         type:
 *           type: string
 *         observation:
 *           type: string
 *         directBeneficiaries:
 *           type: integer
 *         indirectBeneficiaries:
 *           type: integer
 *         healthPersonnel:
 *           type: integer
 *
 *     VisitsReportSummary:
 *       type: object
 *       properties:
 *         totalDirectBeneficiaries:
 *           type: integer
 *         totalIndirectBeneficiaries:
 *           type: integer
 *         totalHealthPersonnel:
 *           type: integer
 *
 *     VisitsReportResponse:
 *       type: object
 *       properties:
 *         filters:
 *           $ref: '#/components/schemas/VisitsReportFilters'
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VisitsReportItem'
 *         summary:
 *           $ref: '#/components/schemas/VisitsReportSummary'
 */

export const visitsReportFiltersSchema = z.object({
    dateRange: z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
    }),
    visitTypes: z.array(z.enum(tiposVisitasEnum.enumValues)).optional(),
    franchiseId: z.number().int().positive().optional(),
    format: z.enum(['json', 'pdf', 'excel']).default('json'),
})

export type VisitsReportFilters = z.infer<typeof visitsReportFiltersSchema>
