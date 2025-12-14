import { RequestHandler } from 'express'
import { bankReportFiltersSchema } from './report.schemas'
import {
    getBankReportData,
    generateExcelBankReport,
    generatePdfBankReport,
} from './report.service'

export const bankReportController: RequestHandler = async (req, res, next) => {
    try {
        const parsed = bankReportFiltersSchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({
                message: 'Invalid body',
                errors: parsed.error.flatten(),
            })
            return
        }
        const filters = parsed.data
        const data = await getBankReportData(filters)

        // Guard clauses: account must exist, and handle empty items gracefully
        if (!data.account) {
            res.status(404).json({
                message: 'Cuenta bancaria no encontrada',
                bankAccountId: filters.bankAccountId,
            })
            return
        }
        if (!data.items || data.items.length === 0) {
            if (filters.format === 'json') {
                res.json({
                    ...data,
                    message: 'Sin movimientos en el rango seleccionado',
                })
                return
            }
            // For excel/pdf, return a minimal document with header and no rows
        }

        if (filters.format === 'json') {
            res.json(data)
            return
        }

        if (filters.format === 'excel') {
            const buf = await generateExcelBankReport(data)
            const start = filters.dateRange.startDate.toISOString().slice(0, 10)
            const end = filters.dateRange.endDate.toISOString().slice(0, 10)
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            )
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="reporte-bancario-${start}-${end}.xlsx"`,
            )
            res.send(buf)
            return
        }

        if (filters.format === 'pdf') {
            const buf = await generatePdfBankReport(data)
            const start = filters.dateRange.startDate.toISOString().slice(0, 10)
            const end = filters.dateRange.endDate.toISOString().slice(0, 10)
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="reporte-bancario-${start}-${end}.pdf"`,
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
