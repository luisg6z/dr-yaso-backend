import { db } from '../db/db'
import { MovimientosCaja } from '../db/schemas/MovimientosCaja'
import { CajasChicas } from '../db/schemas/CajasChicas'
import { eq, and, gte, lte, asc } from 'drizzle-orm'
import { PettyCashReportFilters } from './report.schemas'

type PettyCashReportRow = {
    movementId: number
    date: string
    observation: string
    income: number
    expense: number
    balance: number
}

const formatDate = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
}

export const getPettyCashReportData = async (
    filters: PettyCashReportFilters,
) => {
    const { dateRange, pettyCashId, franchiseId } = filters

    const condiciones = [
        gte(MovimientosCaja.fecha, dateRange.startDate),
        lte(MovimientosCaja.fecha, dateRange.endDate),
    ]

    if (pettyCashId) {
        condiciones.push(eq(MovimientosCaja.idCaja, pettyCashId))
    }

    if (franchiseId) {
        condiciones.push(eq(CajasChicas.idFranquicia, franchiseId))
    }

    const rows = await db
        .select({
            id: MovimientosCaja.id,
            fecha: MovimientosCaja.fecha,
            observacion: MovimientosCaja.observacion,
            ingresos: MovimientosCaja.ingresos,
            egresos: MovimientosCaja.egresos,
        })
        .from(MovimientosCaja)
        .leftJoin(CajasChicas, eq(MovimientosCaja.idCaja, CajasChicas.id))
        .where(and(...condiciones))
        .orderBy(asc(MovimientosCaja.fecha))

    // Build running balance using income/expense per row
    let runningBalance = 0
    const items: PettyCashReportRow[] = rows.map((r) => {
        const income = Number(r.ingresos)
        const expense = Number(r.egresos)
        runningBalance = runningBalance + income - expense
        return {
            movementId: r.id,
            date: formatDate(new Date(r.fecha)),
            observation: r.observacion,
            income,
            expense,
            balance: runningBalance,
        }
    })

    const totalIncome = items.reduce((s, it) => s + it.income, 0)
    const totalExpenses = items.reduce((s, it) => s + it.expense, 0)
    const finalBalance = items.length > 0 ? items[items.length - 1].balance : 0

    // basic account metadata
    const pettyCashQuery = db
        .select({
            id: CajasChicas.id,
            codCaja: CajasChicas.codCaja,
            nombre: CajasChicas.nombre,
            tipoMoneda: CajasChicas.tipoMoneda,
        })
        .from(CajasChicas)

    if (pettyCashId) {
        pettyCashQuery.where(eq(CajasChicas.id, pettyCashId as number))
    } else if (franchiseId) {
        pettyCashQuery.where(eq(CajasChicas.idFranquicia, franchiseId as number))
    }

    const pettyCashResult = await pettyCashQuery

    return {
        filters,
        pettyCash: pettyCashResult[0] ?? null,
        items,
        summary: {
            totalIncome,
            totalExpenses,
            finalBalance,
        },
    }
}

const currencySymbol = (code?: string) => {
    switch (code) {
        case 'USD':
            return '$'
        case 'EUR':
            return '€'
        case 'VES':
            return 'Bs.'
        default:
            return ''
    }
}

export const generateExcelPettyCashReport = async (
    data: Awaited<ReturnType<typeof getPettyCashReportData>>,
) => {
    const ExcelJS = (await import('exceljs')).default
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Reporte Caja Chica')

    const titulo = `Reporte de Caja Chica - ${data.pettyCash?.nombre ?? ''} (${data.pettyCash?.codCaja ?? ''})`
    ws.addRow([titulo])
    ws.addRow([
        `Rango: ${formatDate(data.filters.dateRange.startDate)} - ${formatDate(data.filters.dateRange.endDate)}`,
    ])
    ws.addRow([''])

    ws.columns = [
        { header: 'ID', key: 'movementId', width: 10 },
        { header: 'Fecha', key: 'date', width: 12 },
        { header: 'Observación', key: 'observation', width: 30 },
        {
            header: `Ingreso (${data.pettyCash?.tipoMoneda ?? ''})`,
            key: 'income',
            width: 14,
        },
        {
            header: `Egreso (${data.pettyCash?.tipoMoneda ?? ''})`,
            key: 'expense',
            width: 14,
        },
        {
            header: `Saldo (${data.pettyCash?.tipoMoneda ?? ''})`,
            key: 'balance',
            width: 14,
        },
    ] as any

    data.items.forEach((it) => {
        const row = ws.addRow(it)
            ;['income', 'expense', 'balance'].forEach((k) => {
                const c = row.getCell(
                    ws.columns!.findIndex((col: any) => col.key === k) + 1,
                )
                c.numFmt = '#,##0.00'
                c.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                }
            })
    })

    ws.addRow([''])
    ws.addRow([
        '',
        '',
        '',
        `Total Ingresos (${data.pettyCash?.tipoMoneda ?? ''})`,
        data.summary.totalIncome,
        '',
        '',
    ])
    ws.addRow([
        '',
        '',
        '',
        `Total Egresos (${data.pettyCash?.tipoMoneda ?? ''})`,
        '',
        data.summary.totalExpenses,
        '',
    ])
    ws.addRow([
        '',
        '',
        '',
        `Saldo Final (${data.pettyCash?.tipoMoneda ?? ''})`,
        '',
        '',
        data.summary.finalBalance,
    ])

    const buf = await wb.xlsx.writeBuffer()
    return buf as unknown as Buffer
}

export const generatePdfPettyCashReport = async (
    data: Awaited<ReturnType<typeof getPettyCashReportData>>,
) => {
    // Use server-side pdfmake
    const PdfPrinter = (await import('pdfmake')).default

    const fonts = {
        Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique',
        },
    }

    const printer = new PdfPrinter(fonts)

    const docDef: any = {
        defaultStyle: { font: 'Helvetica' },
        content: [
            {
                text: `Reporte de Caja Chica - ${data.pettyCash?.nombre ?? ''} (${data.pettyCash?.codCaja ?? ''})`,
                style: 'header',
            },
            {
                text: `Rango: ${formatDate(data.filters.dateRange.startDate)} - ${formatDate(data.filters.dateRange.endDate)}`,
                margin: [0, 0, 0, 10],
            },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            'ID',
                            'Fecha',
                            'Observación',
                            `Ingreso (${data.pettyCash?.tipoMoneda ?? ''})`,
                            `Egreso (${data.pettyCash?.tipoMoneda ?? ''})`,
                            `Saldo (${data.pettyCash?.tipoMoneda ?? ''})`,
                        ],
                        ...data.items.map((it) => [
                            it.movementId,
                            it.date,
                            it.observation,
                            `${currencySymbol(data.pettyCash?.tipoMoneda)} ${it.income.toFixed(2)}`,
                            `${currencySymbol(data.pettyCash?.tipoMoneda)} ${it.expense.toFixed(2)}`,
                            `${currencySymbol(data.pettyCash?.tipoMoneda)} ${it.balance.toFixed(2)}`,
                        ]),
                    ],
                },
                layout: 'lightHorizontalLines',
            },
            { text: ' ', margin: [0, 0, 0, 6] },
            {
                text: `Total Ingresos: ${currencySymbol(data.pettyCash?.tipoMoneda)} ${data.summary.totalIncome.toFixed(2)}`,
            },
            {
                text: `Total Egresos: ${currencySymbol(data.pettyCash?.tipoMoneda)} ${data.summary.totalExpenses.toFixed(2)}`,
            },
            {
                text: `Saldo Final: ${currencySymbol(data.pettyCash?.tipoMoneda)} ${data.summary.finalBalance.toFixed(2)}`,
            },
        ],
        styles: { header: { fontSize: 14, bold: true } },
    }

    return new Promise<Buffer>((resolve, reject) => {
        const pdfDoc = printer.createPdfKitDocument(docDef)
        const chunks: Buffer[] = []
        pdfDoc.on('data', (chunk: any) => chunks.push(chunk))
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)))
        pdfDoc.on('error', (err: any) => reject(err))
        pdfDoc.end()
    })
}
