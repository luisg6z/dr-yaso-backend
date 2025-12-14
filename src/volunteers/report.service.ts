import { db } from '../db/db'
import { Voluntarios } from '../db/schemas/Voluntarios'
import { Visitas, tiposVisitasEnum } from '../db/schemas/Visitas'
import { Locaciones } from '../db/schemas/Locaciones'
import { Realizan } from '../db/schemas/Realizan'
import { Pertenecen } from '../db/schemas/Pertenecen'
import { Franquicias } from '../db/schemas/Franquicias'
import { and, eq, gte, lte, inArray, count, isNull } from 'drizzle-orm'
import { VolunteerAttendanceReportFilters } from './report.schemas'

export const getVolunteerAttendanceReportData = async (
    filters: VolunteerAttendanceReportFilters,
) => {
    const { dateRange, franchiseId, visitTypes } = filters

    // 1. Get Franchise Name
    const franchiseNameResult = await db
        .select({ name: Franquicias.nombre })
        .from(Franquicias)
        .where(eq(Franquicias.id, franchiseId))

    const franchiseName = franchiseNameResult[0]?.name || 'Desconocida'

    // 2. Get Visits for Franchise in Range
    const visitsConditions = [
        eq(Locaciones.idFranquicia, franchiseId),
        gte(Visitas.fechaHora, dateRange.startDate),
        lte(Visitas.fechaHora, dateRange.endDate),
    ]

    if (visitTypes && visitTypes.length > 0) {
        visitsConditions.push(
            inArray(
                Visitas.tipo,
                visitTypes as unknown as (typeof tiposVisitasEnum.enumValues)[number][],
            ),
        )
    }

    const franchiseVisits = await db
        .select({ id: Visitas.id })
        .from(Visitas)
        .innerJoin(Locaciones, eq(Visitas.idLocacion, Locaciones.id))
        .where(and(...visitsConditions))

    const totalFranchiseVisits = franchiseVisits.length
    const franchiseVisitIds = franchiseVisits.map((v) => v.id)

    // 3. Get Volunteers belonging to Franchise
    // We get volunteers who "belong" currently. 
    // Or should we get volunteers who have attended at least one visit?
    // Requirement implies list of volunteers with % compliance. 
    // Usually means all active volunteers.
    const franchiseVolunteers = await db
        .select({
            id: Voluntarios.id,
            firstName: Voluntarios.nombres,
            lastName: Voluntarios.apellidos,
            idNumber: Voluntarios.numeroDocumento,
        })
        .from(Voluntarios)
        .innerJoin(Pertenecen, eq(Pertenecen.idVoluntario, Voluntarios.id))
        .where(
            and(
                eq(Pertenecen.idFranquicia, franchiseId),
                isNull(Pertenecen.fechaHoraEgreso) // Assuming active volunteers
            )
        )

    // 4. Calculate Attendance per Volunteer
    // Can do this in loop or aggregation query. Loop is fine for <1000 volunteers generally.
    // Optimizing: Count Realizan entries for these volunteers in the visitIds list.

    let attendanceMap = new Map<number, number>()
    if (franchiseVisitIds.length > 0 && franchiseVolunteers.length > 0) {
        const attendanceCounts = await db
            .select({
                volunteerId: Realizan.idVoluntario,
                count: count(Realizan.idVisita),
            })
            .from(Realizan)
            .where(
                and(
                    inArray(Realizan.idVisita, franchiseVisitIds),
                    inArray(Realizan.idVoluntario, franchiseVolunteers.map(v => v.id))
                )
            )
            .groupBy(Realizan.idVoluntario)

        attendanceCounts.forEach(ac => {
            attendanceMap.set(ac.volunteerId!, ac.count)
        })
    }

    const items = franchiseVolunteers.map(vol => {
        const attended = attendanceMap.get(vol.id) || 0
        const percentage = totalFranchiseVisits > 0
            ? (attended / totalFranchiseVisits) * 100
            : 0

        return {
            id: vol.id,
            firstName: vol.firstName,
            lastName: vol.lastName,
            idNumber: vol.idNumber,
            attendedVisits: attended,
            percentage: Number(percentage.toFixed(2)),
            isLowAttendance: percentage < 25
        }
    })

    // Sort by percentage descending
    items.sort((a, b) => b.percentage - a.percentage)

    return {
        filters,
        franchiseName,
        totalFranchiseVisits,
        items
    }
}

export const generateExcelVolunteerAttendanceReport = async (
    data: Awaited<ReturnType<typeof getVolunteerAttendanceReportData>>,
) => {
    const ExcelJS = (await import('exceljs')).default
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Asistencia Voluntariado')

    ws.addRow(['Reporte de Asistencia de Voluntariado'])
    ws.addRow([`Sede: ${data.franchiseName}`])
    ws.addRow([
        `Rango: ${data.filters.dateRange.startDate.toLocaleDateString()} - ${data.filters.dateRange.endDate.toLocaleDateString()}`,
    ])
    ws.addRow([`Total Visitas Sede: ${data.totalFranchiseVisits}`])
    ws.addRow([''])

    ws.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nombres', key: 'firstName', width: 20 },
        { header: 'Apellidos', key: 'lastName', width: 20 },
        { header: 'Cédula', key: 'idNumber', width: 15 },
        { header: 'Visitas Asistidas', key: 'attendedVisits', width: 15 },
        { header: '% Asistencia', key: 'percentage', width: 15 },
    ] as any

    data.items.forEach((it) => {
        const row = ws.addRow(it)
        if (it.isLowAttendance) {
            row.getCell('percentage').fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFCCCC' }, // Light red/yellow
            }
        }
    })

    const buf = await wb.xlsx.writeBuffer()
    return buf as unknown as Buffer
}

export const generatePdfVolunteerAttendanceReport = async (
    data: Awaited<ReturnType<typeof getVolunteerAttendanceReportData>>,
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
            { text: 'Reporte de Asistencia de Voluntariado', style: 'header' },
            { text: `Sede: ${data.franchiseName}`, margin: [0, 5] },
            {
                text: `Rango: ${data.filters.dateRange.startDate.toLocaleDateString()} - ${data.filters.dateRange.endDate.toLocaleDateString()}`,
                margin: [0, 0, 0, 5],
            },
            {
                text: `Total Visitas Sede: ${data.totalFranchiseVisits}`,
                margin: [0, 0, 0, 10],
            },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', '*', '*', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            'ID',
                            'Nombres',
                            'Apellidos',
                            'Cédula',
                            'Visitas',
                            '%',
                        ],
                        ...data.items.map((it) => [
                            it.id,
                            it.firstName,
                            it.lastName,
                            it.idNumber,
                            it.attendedVisits,
                            {
                                text: `${it.percentage}%`,
                                color: it.isLowAttendance ? 'red' : 'black',
                                bold: it.isLowAttendance,
                            },
                        ]),
                    ],
                },
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
