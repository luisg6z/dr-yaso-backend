import { RequestHandler } from 'express'
import { stockReportSchema } from './report.schemas'
import {
    getStockReportData,
    generateExcelReport,
    generatePdfReport,
} from './report.service'

export const generateStockReportController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const parsed = stockReportSchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({
                message: 'Parámetros inválidos',
                errors: parsed.error.flatten(),
            })
            return
        }
        const data = await getStockReportData(parsed.data)
        if (parsed.data.format === 'json') {
            res.json(data)
            return
        }
        if (parsed.data.format === 'excel') {
            // normalize nullable string fields to empty string so they match expected StockReportRow shape
            const normalized = {
                ...data,
                items: data.items.map((item) => ({
                    ...item,
                    nombreArticulo: item.nombreArticulo ?? '',
                    nombreSede: item.nombreSede ?? '',
                    usuarioNombre: item.usuarioNombre ?? '',
                })),
            }
            const buffer = await generateExcelReport(normalized, parsed.data)
            // Build filename with date range
            const inicio = parsed.data.datesRange?.startDate
                ? new Date(parsed.data.datesRange.startDate)
                : null
            const fin = parsed.data.datesRange?.finishDate
                ? new Date(parsed.data.datesRange.finishDate)
                : null
            const fmt = (d: Date) =>
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            const name = `reporte-movimientos${inicio ? '-' + fmt(inicio) : ''}${fin ? '-' + fmt(fin) : ''}.xlsx`
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            )
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${name}"`,
            )
            res.send(buffer)
            return
        }
        if (parsed.data.format === 'pdf') {
            // normalize nullable string fields to empty string so they match expected StockReportRow shape
            const normalized = {
                ...data,
                items: data.items.map((item) => ({
                    ...item,
                    nombreArticulo: item.nombreArticulo ?? '',
                    nombreSede: item.nombreSede ?? '',
                    usuarioNombre: item.usuarioNombre ?? '',
                })),
            }
            const buffer = await generatePdfReport(normalized, parsed.data)
            const inicio = parsed.data.datesRange?.startDate
                ? new Date(parsed.data.datesRange.startDate)
                : null
            const fin = parsed.data.datesRange?.finishDate
                ? new Date(parsed.data.datesRange.finishDate)
                : null
            const fmt = (d: Date) =>
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            const name = `reporte-movimientos${inicio ? '-' + fmt(inicio) : ''}${fin ? '-' + fmt(fin) : ''}.pdf`
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${name}"`,
            )
            res.send(buffer)
            return
        }
        res.json(data)
        return
    } catch (err) {
        next(err)
        return
    }
}
