import { db } from '../db/db'
import { MovimientosInventario } from '../db/schemas/MovimientosInventario'
import { Productos } from '../db/schemas/Productos'
import { Franquicias } from '../db/schemas/Franquicias'
import { Usuarios } from '../db/schemas/Usuarios'
import { and, eq, inArray, gte, lte } from 'drizzle-orm'
import { StockReportFilters } from './report.schemas'

// Use dynamic import to avoid hard dependency unless needed at runtime
let ExcelJS: any
let PdfPrinter: any

const formatDate = (d: Date) => {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
    const day = pad(d.getDate())
    const month = pad(d.getMonth() + 1)
    const year = d.getFullYear()
    const hours = pad(d.getHours())
    const minutes = pad(d.getMinutes())
    return `${day}/${month}/${year} ${hours}:${minutes}`
}

export type StockReportRow = {
    idMovimiento: number
    nombreArticulo: string
    nombreSede: string
    tipoMovimiento: 'Entrada' | 'Salida'
    cantidad: number
    saldoFinal: number
    fechaHora: Date
    observacion: string
    usuarioNombre: string | null
}

export const getStockReportData = async (filters: StockReportFilters) => {
    const conditions: any[] = []

    if (filters.datesRange?.startDate) {
        conditions.push(
            gte(
                MovimientosInventario.fechaHora,
                new Date(filters.datesRange.startDate),
            ),
        )
    }
    if (filters.datesRange?.finishDate) {
        conditions.push(
            lte(
                MovimientosInventario.fechaHora,
                new Date(filters.datesRange.finishDate),
            ),
        )
    }
    if (filters.franchisesIds && filters.franchisesIds.length > 0) {
        conditions.push(
            inArray(MovimientosInventario.idFranquicia, filters.franchisesIds),
        )
    }
    if (filters.franchiseId) {
        conditions.push(
            eq(MovimientosInventario.idFranquicia, filters.franchiseId),
        )
    }
    if (filters.movementTypes && filters.movementTypes.length > 0) {
        conditions.push(
            inArray(
                MovimientosInventario.tipoMovimiento,
                filters.movementTypes,
            ),
        )
    }

    const rows = await db
        .select({
            idMovimiento: MovimientosInventario.id,
            nombreArticulo: Productos.nombre,
            nombreSede: Franquicias.nombre,
            tipoMovimiento: MovimientosInventario.tipoMovimiento,
            cantidad: MovimientosInventario.cantidad,
            saldoFinal: MovimientosInventario.saldoFinal,
            fechaHora: MovimientosInventario.fechaHora,
            observacion: MovimientosInventario.observacion,
            usuarioNombre: Usuarios.nombre,
        })
        .from(MovimientosInventario)
        .leftJoin(Productos, eq(MovimientosInventario.idProducto, Productos.id))
        .leftJoin(
            Franquicias,
            eq(MovimientosInventario.idFranquicia, Franquicias.id),
        )
        .leftJoin(Usuarios, eq(MovimientosInventario.idUsuario, Usuarios.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)

    const totalEntradas = rows
        .filter((r) => r.tipoMovimiento === 'Entrada')
        .reduce((acc, r) => acc + r.cantidad, 0)
    const totalSalidas = rows
        .filter((r) => r.tipoMovimiento === 'Salida')
        .reduce((acc, r) => acc + r.cantidad, 0)
    const saldoNeto = totalEntradas - totalSalidas

    return {
        items: rows,
        resumen: {
            totalEntradas,
            totalSalidas,
            saldoNeto,
        },
    }
}

export const generateExcelReport = async (
    data: { items: StockReportRow[]; resumen: any },
    filters?: StockReportFilters,
) => {
    if (!ExcelJS) {
        ExcelJS = (await import('exceljs')).default || (await import('exceljs'))
    }
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Movimientos de Inventario')

    // Title and filter summary
    const title = 'Reporte de Movimientos de Inventario'
    const rangeText =
        filters?.datesRange?.startDate || filters?.datesRange?.finishDate
            ? `Rango: ${filters?.datesRange?.startDate ? new Date(filters.datesRange.startDate).toLocaleDateString() : '—'} - ${filters?.datesRange?.finishDate ? new Date(filters.datesRange.finishDate).toLocaleDateString() : '—'}`
            : 'Rango: Todos'
    const sedesText = filters?.franchisesIds?.length
        ? `Sedes: ${filters.franchisesIds.join(', ')}`
        : 'Sedes: Todas'
    const tiposText = filters?.movementTypes?.length
        ? `Tipos: ${filters.movementTypes.join(', ')}`
        : 'Tipos: Entrada/Salida'

    sheet.addRow([title])
    sheet.getRow(1).font = { bold: true, size: 16 }
    sheet.addRow([rangeText])
    sheet.addRow([sedesText])
    sheet.addRow([tiposText])
    sheet.addRow([])

    // Define columns properly
    sheet.columns = [
        { header: 'ID Movimiento', key: 'idMovimiento', width: 15 },
        { header: 'Artículo', key: 'nombreArticulo', width: 25 },
        { header: 'Sede', key: 'nombreSede', width: 25 },
        { header: 'Tipo', key: 'tipoMovimiento', width: 12 },
        { header: 'Cantidad', key: 'cantidad', width: 12 },
        { header: 'Saldo Final', key: 'saldoFinal', width: 14 },
        { header: 'Fecha y Hora', key: 'fechaHora', width: 20 },
        { header: 'Observación', key: 'observacion', width: 30 },
        { header: 'Usuario', key: 'usuarioNombre', width: 20 },
    ]

    data.items.forEach((r) => {
        sheet.addRow({
            idMovimiento: r.idMovimiento,
            nombreArticulo: r.nombreArticulo,
            nombreSede: r.nombreSede,
            tipoMovimiento: r.tipoMovimiento,
            cantidad: r.cantidad,
            saldoFinal: r.saldoFinal,
            fechaHora: formatDate(new Date(r.fechaHora)),
            observacion: r.observacion,
            usuarioNombre: r.usuarioNombre ?? '',
        })
    })

    sheet.addRow([])
    sheet.addRow(['', '', '', 'Total Entradas', data.resumen.totalEntradas])
    sheet.addRow(['', '', '', 'Total Salidas', data.resumen.totalSalidas])
    sheet.addRow(['', '', '', 'Saldo Neto', data.resumen.saldoNeto])

    const buffer: Buffer = await workbook.xlsx.writeBuffer()
    return buffer
}

export const generatePdfReport = async (
    data: { items: StockReportRow[]; resumen: any },
    filters?: StockReportFilters,
) => {
    // pdfmake (server-side) requires font files. Update font paths to available .ttf files on your system.
    if (!PdfPrinter) {
        PdfPrinter =
            (await import('pdfmake')).default || (await import('pdfmake'))
    }
    // Use built-in PDF fonts via pdfkit (no file paths required)
    const fonts = {
        Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique',
        },
    }
    const printer = new PdfPrinter(fonts)

    const body = [
        [
            'ID Movimiento',
            'Artículo',
            'Sede',
            'Tipo',
            'Cantidad',
            'Saldo Final',
            'Fecha y Hora',
            'Observación',
            'Usuario',
        ],
        ...data.items.map((r) => [
            r.idMovimiento,
            r.nombreArticulo,
            r.nombreSede,
            r.tipoMovimiento,
            r.cantidad,
            r.saldoFinal,
            formatDate(new Date(r.fechaHora)),
            r.observacion,
            r.usuarioNombre ?? '',
        ]),
    ]

    const title = 'Reporte de Movimientos de Inventario'
    const rangeText =
        filters?.datesRange?.startDate || filters?.datesRange?.finishDate
            ? `Rango: ${filters?.datesRange?.startDate ? formatDate(new Date(filters.datesRange.startDate)).split(' ')[0] : '—'} - ${filters?.datesRange?.finishDate ? formatDate(new Date(filters.datesRange.finishDate)).split(' ')[0] : '—'}`
            : 'Rango: Todos'
    const sedesText = filters?.franchisesIds?.length
        ? `Sedes: ${filters.franchisesIds.join(', ')}`
        : 'Sedes: Todas'
    const tiposText = filters?.movementTypes?.length
        ? `Tipos: ${filters.movementTypes.join(', ')}`
        : 'Tipos: Entrada/Salida'

    const docDefinition = {
        content: [
            { text: title, style: 'header' },
            { text: rangeText, style: 'sub' },
            { text: sedesText, style: 'sub' },
            { text: tiposText, style: 'sub' },
            { text: '\n' },
            {
                table: {
                    headerRows: 1,
                    widths: [
                        'auto',
                        '*',
                        '*',
                        'auto',
                        'auto',
                        'auto',
                        'auto',
                        '*',
                        '*',
                    ],
                    body,
                },
            },
            { text: '\n' },
            {
                table: {
                    widths: ['*', 'auto'],
                    body: [
                        ['Total Entradas', data.resumen.totalEntradas],
                        ['Total Salidas', data.resumen.totalSalidas],
                        ['Saldo Neto', data.resumen.saldoNeto],
                    ],
                },
            },
        ],
        styles: {
            header: { fontSize: 18, bold: true },
            sub: { fontSize: 10, italics: true },
        },
        defaultStyle: { font: 'Helvetica' },
        pageOrientation: 'landscape',
    }

    const pdfDoc = printer.createPdfKitDocument(docDefinition)
    const chunks: Buffer[] = []
    return await new Promise<Buffer>((resolve) => {
        pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk))
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)))
        pdfDoc.end()
    })
}
