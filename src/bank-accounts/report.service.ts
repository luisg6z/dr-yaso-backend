import { db } from '../db/db'
import {
    MovimientosCuentas,
    tipoMovimientoEnum,
} from '../db/schemas/MovimientosCuentas'
import { CuentasBancarias } from '../db/schemas/CuentasBancarias'
import { eq, and, gte, lte, inArray, asc } from 'drizzle-orm'
import { BankReportFilters } from './report.schemas'

type BankReportRow = {
    movementId: number
    date: string
    reference: string
    movementType: string
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

const isIngreso = (tipo: string) => {
    // Classify movimientos: ingresos vs egresos
    // Based on enum in schema: ['Transferencia','Pago Móvil','Depósito','Retiro','Cheque','Tarjeta']
    return (
        tipo === tipoMovimientoEnum.enumValues[0] || // Transferencia
        tipo === tipoMovimientoEnum.enumValues[1] || // Pago Móvil
        tipo === tipoMovimientoEnum.enumValues[2]
    ) // Depósito
}

export const getBankReportData = async (filters: BankReportFilters) => {
    const { dateRange, bankAccountId, franchiseId, movementTypes } = filters

    const condiciones = [
        gte(MovimientosCuentas.fecha, dateRange.startDate),
        lte(MovimientosCuentas.fecha, dateRange.endDate),
    ]

    if (bankAccountId) {
        condiciones.push(eq(MovimientosCuentas.idCuenta, bankAccountId))
    }

    if (franchiseId) {
        condiciones.push(eq(CuentasBancarias.idFranquicia, franchiseId))
    }

    if (movementTypes && movementTypes.length > 0) {
        condiciones.push(
            inArray(
                MovimientosCuentas.tipoMovimiento,
                movementTypes as unknown as (typeof tipoMovimientoEnum.enumValues)[number][],
            ),
        )
    }

    const rows = await db
        .select({
            id: MovimientosCuentas.id,
            fecha: MovimientosCuentas.fecha,
            nroReferencia: MovimientosCuentas.nroReferencia,
            tipoMovimiento: MovimientosCuentas.tipoMovimiento,
            observacion: MovimientosCuentas.observacion,
            ingresos: MovimientosCuentas.ingresos,
            egresos: MovimientosCuentas.egresos,
        })
        .from(MovimientosCuentas)
        .leftJoin(
            CuentasBancarias,
            eq(MovimientosCuentas.idCuenta, CuentasBancarias.id),
        )
        .where(and(...condiciones))
        .orderBy(asc(MovimientosCuentas.fecha))

    // Build running balance using income/expense per row
    let runningBalance = 0
    const items: BankReportRow[] = rows.map((r) => {
        const incomeValue = Number(r.ingresos)
        const expenseValue = Number(r.egresos)
        // If DB has a single monto field, we could derive using tipoMovimiento, but schema already has ingresos/egresos.
        const income = isIngreso(r.tipoMovimiento) ? incomeValue : 0
        const expense = isIngreso(r.tipoMovimiento) ? 0 : expenseValue
        runningBalance = runningBalance + income - expense
        return {
            movementId: r.id,
            date: formatDate(new Date(r.fecha)),
            reference: r.nroReferencia,
            movementType: r.tipoMovimiento,
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
    const accountQuery = db
        .select({
            id: CuentasBancarias.id,
            codCuenta: CuentasBancarias.codCuenta,
            tipoMoneda: CuentasBancarias.tipoMoneda,
        })
        .from(CuentasBancarias)

    if (bankAccountId) {
        accountQuery.where(eq(CuentasBancarias.id, bankAccountId as number))
    } else if (franchiseId) {
        accountQuery.where(eq(CuentasBancarias.idFranquicia, franchiseId as number))
    } else {
        // If neither is provided, don't show account-specific header info
    }

    const account = await accountQuery

    return {
        filters,
        account: account[0] ?? null,
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

export const generateExcelBankReport = async (
    data: Awaited<ReturnType<typeof getBankReportData>>,
) => {
    const ExcelJS = (await import('exceljs')).default
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Reporte Bancario')

    const titulo = `Reporte de Movimientos - Cuenta ${data.account?.codCuenta ?? ''} (${data.account?.tipoMoneda ?? ''})`
    ws.addRow([titulo])
    ws.addRow([
        `Rango: ${formatDate(data.filters.dateRange.startDate)} - ${formatDate(data.filters.dateRange.endDate)}`,
    ])
    ws.addRow([''])

    ws.columns = [
        { header: 'ID', key: 'movementId', width: 10 },
        { header: 'Fecha', key: 'date', width: 12 },
        { header: 'Referencia', key: 'reference', width: 16 },
        { header: 'Tipo', key: 'movementType', width: 18 },
        { header: 'Observación', key: 'observation', width: 25 },
        {
            header: `Ingreso (${data.account?.tipoMoneda ?? ''})`,
            key: 'income',
            width: 14,
        },
        {
            header: `Egreso (${data.account?.tipoMoneda ?? ''})`,
            key: 'expense',
            width: 14,
        },
        {
            header: `Saldo (${data.account?.tipoMoneda ?? ''})`,
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
        '',
        `Total Ingresos (${data.account?.tipoMoneda ?? ''})`,
        data.summary.totalIncome,
        '',
        '',
    ])
    ws.addRow([
        '',
        '',
        '',
        '',
        `Total Egresos (${data.account?.tipoMoneda ?? ''})`,
        '',
        data.summary.totalExpenses,
        '',
    ])
    ws.addRow([
        '',
        '',
        '',
        '',
        `Saldo Final (${data.account?.tipoMoneda ?? ''})`,
        '',
        '',
        data.summary.finalBalance,
    ])

    const buf = await wb.xlsx.writeBuffer()
    return buf as unknown as Buffer
}

export const generatePdfBankReport = async (
    data: Awaited<ReturnType<typeof getBankReportData>>,
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
                text: `Reporte de Movimientos - Cuenta ${data.account?.codCuenta ?? ''} (${data.account?.tipoMoneda ?? ''})`,
                style: 'header',
            },
            {
                text: `Rango: ${formatDate(data.filters.dateRange.startDate)} - ${formatDate(data.filters.dateRange.endDate)}`,
                margin: [0, 0, 0, 10],
            },
            {
                table: {
                    headerRows: 1,
                    widths: [
                        'auto',
                        'auto',
                        'auto',
                        '*',
                        '*',
                        'auto',
                        'auto',
                        'auto',
                    ],
                    body: [
                        [
                            'ID',
                            'Fecha',
                            'Referencia',
                            'Tipo',
                            'Observación',
                            `Ingreso (${data.account?.tipoMoneda ?? ''})`,
                            `Egreso (${data.account?.tipoMoneda ?? ''})`,
                            `Saldo (${data.account?.tipoMoneda ?? ''})`,
                        ],
                        ...data.items.map((it) => [
                            it.movementId,
                            it.date,
                            it.reference,
                            it.movementType,
                            it.observation,
                            `${currencySymbol(data.account?.tipoMoneda)} ${it.income.toFixed(2)}`,
                            `${currencySymbol(data.account?.tipoMoneda)} ${it.expense.toFixed(2)}`,
                            `${currencySymbol(data.account?.tipoMoneda)} ${it.balance.toFixed(2)}`,
                        ]),
                    ],
                },
                layout: 'lightHorizontalLines',
            },
            { text: ' ', margin: [0, 0, 0, 6] },
            {
                text: `Total Ingresos: ${currencySymbol(data.account?.tipoMoneda)} ${data.summary.totalIncome.toFixed(2)}`,
            },
            {
                text: `Total Egresos: ${currencySymbol(data.account?.tipoMoneda)} ${data.summary.totalExpenses.toFixed(2)}`,
            },
            {
                text: `Saldo Final: ${currencySymbol(data.account?.tipoMoneda)} ${data.summary.finalBalance.toFixed(2)}`,
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
