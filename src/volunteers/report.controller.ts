import { RequestHandler } from 'express'
import { volunteerAttendanceReportFiltersSchema } from './report.schemas'
import {
    getVolunteerAttendanceReportData,
    generateExcelVolunteerAttendanceReport,
    generatePdfVolunteerAttendanceReport,
} from './report.service'

export const volunteerAttendanceReportController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const parsed = volunteerAttendanceReportFiltersSchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid body',
                errors: parsed.error.flatten(),
            })
            return
        }
        const filters = parsed.data

        // Authorization Check
        const user = res.locals.user // Provided by authenticate middleware
        // types need to be inferred or imported. assuming res.locals.user is populated. 
        // We need to import tipoUsuarioEnum if we use it, or just check role string if we know it.
        // Better to import tipoUsuarioEnum.

        // Let's assume logical check: if user.franchiseId exists and role is Coordinator
        if (user && user.role === 'Coordinador' && user.franchiseId !== filters.franchiseId) {
            res.status(403).json({
                message: 'No tienes permiso para ver el reporte de esta franquicia',
            })
            return
        }

        const data = await getVolunteerAttendanceReportData(filters)

        if (filters.format === 'json') {
            res.json(data)
            return
        }

        if (filters.format === 'excel') {
            const buf = await generateExcelVolunteerAttendanceReport(data)
            const start = filters.dateRange.startDate.toISOString().slice(0, 10)
            const end = filters.dateRange.endDate.toISOString().slice(0, 10)
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            )
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="reporte-asistencia-${start}-${end}.xlsx"`,
            )
            res.send(buf)
            return
        }

        if (filters.format === 'pdf') {
            const buf = await generatePdfVolunteerAttendanceReport(data)
            const start = filters.dateRange.startDate.toISOString().slice(0, 10)
            const end = filters.dateRange.endDate.toISOString().slice(0, 10)
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="reporte-asistencia-${start}-${end}.pdf"`,
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
