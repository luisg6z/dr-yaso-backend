import { RequestHandler } from 'express'
import { visitsReportFiltersSchema } from './report.schemas'
import {
    getVisitsReportData,
    generateExcelVisitsReport,
    generatePdfVisitsReport,
} from './report.service'

export const visitsReportController: RequestHandler = async (req, res, next) => {
    try {
        const parsed = visitsReportFiltersSchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid body',
                errors: parsed.error.flatten(),
            })
            return
        }
        const filters = parsed.data
        const data = await getVisitsReportData(filters)

        if (!data.items || data.items.length === 0) {
            if (filters.format === 'json') {
                res.json({
                    ...data,
                    message: 'Sin visitas en el rango seleccionado',
                })
                return
            }
        }

        if (filters.format === 'json') {
            res.json(data)
            return
        }

        if (filters.format === 'excel') {
            const buf = await generateExcelVisitsReport(data)
            const start = filters.dateRange.startDate.toISOString().slice(0, 10)
            const end = filters.dateRange.endDate.toISOString().slice(0, 10)
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            )
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="reporte-visitas-${start}-${end}.xlsx"`,
            )
            res.send(buf)
            return
        }

        if (filters.format === 'pdf') {
            const buf = await generatePdfVisitsReport(data)
            const start = filters.dateRange.startDate.toISOString().slice(0, 10)
            const end = filters.dateRange.endDate.toISOString().slice(0, 10)
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="reporte-visitas-${start}-${end}.pdf"`,
            )
            res.send(buf)
            return
        }

        res.json(data)
    } catch (err) {
        next(err)
        return
    }
}
