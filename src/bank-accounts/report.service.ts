import { db } from '../db/db'
import { MovimientosCuentas, tipoMovimientoEnum } from '../db/schemas/MovimientosCuentas'
import { CuentasBancarias } from '../db/schemas/CuentasBancarias'
import { eq, and, gte, lte, inArray, asc } from 'drizzle-orm'
import { BankReportFilters } from './report.schemas'

type BankReportRow = {
    idMovimiento: number
    fecha: string
    referencia: string
    tipoMovimiento: string
    observacion: string
    ingreso: number
    egreso: number
    saldo: number
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
    return tipo === tipoMovimientoEnum.enumValues[0] // Transferencia
        || tipo === tipoMovimientoEnum.enumValues[1] // Pago Móvil
        || tipo === tipoMovimientoEnum.enumValues[2] // Depósito
}

export const getBankReportData = async (filters: BankReportFilters) => {
    const { rangoFechas, cuentaBancariaId, tiposMovimiento } = filters

    const condiciones = [
        eq(MovimientosCuentas.idCuenta, cuentaBancariaId),
        gte(MovimientosCuentas.fecha, rangoFechas.fechaInicio),
        lte(MovimientosCuentas.fecha, rangoFechas.fechaFin),
    ]
    if (tiposMovimiento && tiposMovimiento.length > 0) {
        condiciones.push(inArray(MovimientosCuentas.tipoMovimiento, tiposMovimiento))
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
        .where(and(...condiciones))
        .orderBy(asc(MovimientosCuentas.fecha))

    // Build running saldo using ingresos/egresos per row
    let runningSaldo = 0
    const items: BankReportRow[] = rows.map((r) => {
        const ingresoValue = Number(r.ingresos)
        const egresoValue = Number(r.egresos)
        // If DB has a single monto field, we could derive using tipoMovimiento, but schema already has ingresos/egresos.
        const ingreso = isIngreso(r.tipoMovimiento) ? ingresoValue : 0
        const egreso = isIngreso(r.tipoMovimiento) ? 0 : egresoValue
        runningSaldo = runningSaldo + ingreso - egreso
        return {
            idMovimiento: r.id,
            fecha: formatDate(new Date(r.fecha)),
            referencia: r.nroReferencia,
            tipoMovimiento: r.tipoMovimiento,
            observacion: r.observacion,
            ingreso,
            egreso,
            saldo: runningSaldo,
        }
    })

    const totalIngresos = items.reduce((s, it) => s + it.ingreso, 0)
    const totalEgresos = items.reduce((s, it) => s + it.egreso, 0)
    const saldoFinal = items.length > 0 ? items[items.length - 1].saldo : 0

    // basic account metadata
    const cuenta = await db
        .select({
            id: CuentasBancarias.id,
            codCuenta: CuentasBancarias.codCuenta,
            tipoMoneda: CuentasBancarias.tipoMoneda,
        })
        .from(CuentasBancarias)
        .where(eq(CuentasBancarias.id, cuentaBancariaId))

    return {
        filtros: filters,
        cuenta: cuenta[0] ?? null,
        items,
        resumen: {
            totalIngresos,
            totalEgresos,
            saldoFinal,
        },
    }
}

const currencySymbol = (code?: string) => {
    switch (code) {
        case 'USD': return '$'
        case 'EUR': return '€'
        case 'VES': return 'Bs.'
        default: return ''
    }
}

export const generateExcelBankReport = async (data: Awaited<ReturnType<typeof getBankReportData>>) => {
    const ExcelJS = (await import('exceljs')).default
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Reporte Bancario')

    const titulo = `Reporte de Movimientos - Cuenta ${data.cuenta?.codCuenta ?? ''} (${data.cuenta?.tipoMoneda ?? ''})`
    ws.addRow([titulo])
    ws.addRow([`Rango: ${formatDate(data.filtros.rangoFechas.fechaInicio)} - ${formatDate(data.filtros.rangoFechas.fechaFin)}`])
    ws.addRow([''])

    ws.columns = [
        { header: 'ID', key: 'idMovimiento', width: 10 },
        { header: 'Fecha', key: 'fecha', width: 12 },
        { header: 'Referencia', key: 'referencia', width: 16 },
        { header: 'Tipo', key: 'tipoMovimiento', width: 18 },
        { header: 'Observación', key: 'observacion', width: 25 },
        { header: `Ingreso (${data.cuenta?.tipoMoneda ?? ''})`, key: 'ingreso', width: 14 },
        { header: `Egreso (${data.cuenta?.tipoMoneda ?? ''})`, key: 'egreso', width: 14 },
        { header: `Saldo (${data.cuenta?.tipoMoneda ?? ''})`, key: 'saldo', width: 14 },
    ] as any

    data.items.forEach((it) => {
        const row = ws.addRow(it)
        ;['ingreso', 'egreso', 'saldo'].forEach((k) => {
            const c = row.getCell(ws.columns!.findIndex((col: any) => col.key === k) + 1)
            c.numFmt = '#,##0.00'
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        })
    })

    ws.addRow([''])
    ws.addRow(['', '', '', '', `Total Ingresos (${data.cuenta?.tipoMoneda ?? ''})`, data.resumen.totalIngresos, '', ''])
    ws.addRow(['', '', '', '', `Total Egresos (${data.cuenta?.tipoMoneda ?? ''})`, '', data.resumen.totalEgresos, ''])
    ws.addRow(['', '', '', '', `Saldo Final (${data.cuenta?.tipoMoneda ?? ''})`, '', '', data.resumen.saldoFinal])

    const buf = await wb.xlsx.writeBuffer()
    return buf as Buffer
}

export const generatePdfBankReport = async (data: Awaited<ReturnType<typeof getBankReportData>>) => {
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
            { text: `Reporte de Movimientos - Cuenta ${data.cuenta?.codCuenta ?? ''} (${data.cuenta?.tipoMoneda ?? ''})`, style: 'header' },
            { text: `Rango: ${formatDate(data.filtros.rangoFechas.fechaInicio)} - ${formatDate(data.filtros.rangoFechas.fechaFin)}`, margin: [0, 0, 0, 10] },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', '*', '*', 'auto', 'auto', 'auto'],
                    body: [
                        ['ID', 'Fecha', 'Referencia', 'Tipo', 'Observación', `Ingreso (${data.cuenta?.tipoMoneda ?? ''})`, `Egreso (${data.cuenta?.tipoMoneda ?? ''})`, `Saldo (${data.cuenta?.tipoMoneda ?? ''})`],
                        ...data.items.map((it) => [
                            it.idMovimiento,
                            it.fecha,
                            it.referencia,
                            it.tipoMovimiento,
                            it.observacion,
                            `${currencySymbol(data.cuenta?.tipoMoneda)} ${it.ingreso.toFixed(2)}`,
                            `${currencySymbol(data.cuenta?.tipoMoneda)} ${it.egreso.toFixed(2)}`,
                            `${currencySymbol(data.cuenta?.tipoMoneda)} ${it.saldo.toFixed(2)}`,
                        ]),
                    ],
                },
                layout: 'lightHorizontalLines',
            },
            { text: ' ', margin: [0, 0, 0, 6] },
            { text: `Total Ingresos: ${currencySymbol(data.cuenta?.tipoMoneda)} ${data.resumen.totalIngresos.toFixed(2)}` },
            { text: `Total Egresos: ${currencySymbol(data.cuenta?.tipoMoneda)} ${data.resumen.totalEgresos.toFixed(2)}` },
            { text: `Saldo Final: ${currencySymbol(data.cuenta?.tipoMoneda)} ${data.resumen.saldoFinal.toFixed(2)}` },
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
