import { db } from '../db/db'
import { Visitas, tiposVisitasEnum } from '../db/schemas/Visitas'
import { Locaciones } from '../db/schemas/Locaciones'
import { and, gte, lte, inArray, asc, eq } from 'drizzle-orm'
import { VisitsReportFilters } from './report.schemas'

const formatDate = (d: Date) => {
    return d.toLocaleString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
}

export const getVisitsReportData = async (filters: VisitsReportFilters) => {
    const { dateRange, visitTypes } = filters

    const condiciones = [
        gte(Visitas.fechaHora, dateRange.startDate),
        lte(Visitas.fechaHora, dateRange.endDate),
    ]

    if (visitTypes && visitTypes.length > 0) {
        condiciones.push(
            inArray(
                Visitas.tipo,
                visitTypes as unknown as (typeof tiposVisitasEnum.enumValues)[number][],
            ),
        )
    }

    if (filters.franchiseId) {
        condiciones.push(eq(Locaciones.idFranquicia, filters.franchiseId))
    }

    const rows = await db
        .select({
            id: Visitas.id,
            fechaHora: Visitas.fechaHora,
            observacion: Visitas.observacion,
            beneficiariosDirectos: Visitas.beneficiariosDirectos,
            beneficiariosIndirectos: Visitas.beneficiariosIndirectos,
            cantPersonalDeSalud: Visitas.cantPersonalDeSalud,
            tipo: Visitas.tipo,
        })
        .from(Visitas)
        .leftJoin(Locaciones, eq(Visitas.idLocacion, Locaciones.id))
        .where(and(...condiciones))
        .orderBy(asc(Visitas.fechaHora))

    const items = rows.map((r) => ({
        id: r.id,
        dateTime: formatDate(new Date(r.fechaHora)),
        observation: r.observacion,
        directBeneficiaries: r.beneficiariosDirectos,
        indirectBeneficiaries: r.beneficiariosIndirectos,
        healthPersonnel: r.cantPersonalDeSalud,
        type: r.tipo,
    }))

    const totalDirectBeneficiaries = items.reduce(
        (s, it) => s + it.directBeneficiaries,
        0,
    )
    const totalIndirectBeneficiaries = items.reduce(
        (s, it) => s + it.indirectBeneficiaries,
        0,
    )
    const totalHealthPersonnel = items.reduce(
        (s, it) => s + it.healthPersonnel,
        0,
    )

    return {
        filters,
        items,
        summary: {
            totalDirectBeneficiaries,
            totalIndirectBeneficiaries,
            totalHealthPersonnel,
        },
    }
}

export const generateExcelVisitsReport = async (
    data: Awaited<ReturnType<typeof getVisitsReportData>>,
) => {
    const ExcelJS = (await import('exceljs')).default
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Reporte de Visitas')

    ws.addRow(['Reporte de Visitas'])
    ws.addRow([
        `Rango: ${data.filters.dateRange.startDate.toLocaleDateString()} - ${data.filters.dateRange.endDate.toLocaleDateString()}`,
    ])
    ws.addRow([''])

    ws.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Fecha y Hora', key: 'dateTime', width: 20 },
        { header: 'Tipo', key: 'type', width: 20 },
        { header: 'Observación', key: 'observation', width: 30 },
        {
            header: 'Benef. Directos',
            key: 'directBeneficiaries',
            width: 15,
        },
        {
            header: 'Benef. Indirectos',
            key: 'indirectBeneficiaries',
            width: 15,
        },
        {
            header: 'Personal Salud',
            key: 'healthPersonnel',
            width: 15,
        },
    ] as any

    data.items.forEach((it) => {
        ws.addRow(it)
    })

    ws.addRow([''])
    ws.addRow([
        '',
        '',
        '',
        'Totales:',
        data.summary.totalDirectBeneficiaries,
        data.summary.totalIndirectBeneficiaries,
        data.summary.totalHealthPersonnel,
    ])

    const buf = await wb.xlsx.writeBuffer()
    return buf as unknown as Buffer
}

export const generatePdfVisitsReport = async (
    data: Awaited<ReturnType<typeof getVisitsReportData>>,
) => {
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
        defaultStyle: { font: 'Helvetica', fontSize: 10 },
        content: [
            { text: 'Reporte de Visitas', style: 'header' },
            {
                text: `Rango: ${data.filters.dateRange.startDate.toLocaleDateString()} - ${data.filters.dateRange.endDate.toLocaleDateString()}`,
                margin: [0, 0, 0, 10],
            },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            'ID',
                            'Fecha/Hora',
                            'Tipo',
                            'Observación',
                            'B. Dir',
                            'B. Ind',
                            'P. Salud',
                        ],
                        ...data.items.map((it) => [
                            it.id,
                            it.dateTime,
                            it.type,
                            it.observation,
                            it.directBeneficiaries,
                            it.indirectBeneficiaries,
                            it.healthPersonnel,
                        ]),
                    ],
                },
            },
            { text: ' ', margin: [0, 10] },
            {
                table: {
                    body: [
                        [
                            'Total Beneficiarios Directos:',
                            data.summary.totalDirectBeneficiaries,
                        ],
                        [
                            'Total Beneficiarios Indirectos:',
                            data.summary.totalIndirectBeneficiaries,
                        ],
                        [
                            'Total Personal de Salud:',
                            data.summary.totalHealthPersonnel,
                        ],
                    ],
                },
                layout: 'noBorders',
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
