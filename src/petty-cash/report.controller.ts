import { Request, Response } from 'express'
import { pettyCashReportSchema } from './report.schemas'
import {
    getPettyCashReportData,
    generateExcelPettyCashReport,
    generatePdfPettyCashReport,
} from './report.service'

export const getReport = async (req: Request, res: Response) => {
    try {
        const body = pettyCashReportSchema.parse(req.body)
        const data = await getPettyCashReportData(body)

        if (!data.pettyCash) {
            res.status(404).json({ message: 'Caja Chica not found' })
            return
        }

        if (data.items.length === 0) {
            res.status(404).json({
                message: 'No movements found for this criteria',
            })
            return
        }

        if (body.format === 'excel') {
            const buffer = await generateExcelPettyCashReport(data)
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            )
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=reporte_caja_${data.pettyCash.codCaja}.xlsx`,
            )
            res.send(buffer)
            return
        }

        if (body.format === 'pdf') {
            const buffer = await generatePdfPettyCashReport(data)
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=reporte_caja_${data.pettyCash.codCaja}.pdf`,
            )
            res.send(buffer)
            return
        }

        res.json(data)
    } catch (error) {
        console.error(error)
        if (error instanceof Error && error.name === 'ZodError') {
            res.status(400).json({ message: 'Invalid input', details: error })
        } else {
            res.status(500).json({ message: 'Internal server error' })
        }
    }
}
