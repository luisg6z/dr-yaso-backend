import { db } from './db'
import { Ciudades } from './schemas/Ciudades'
import { Estados } from './schemas/Estados'
import { Paises } from './schemas/Paises'
import { Tienen } from './schemas/Tienen'
import {
    Voluntarios,
    tipoDocumentoEnum,
    estatusEnum,
    generoEnum,
} from './schemas/Voluntarios'
import { Cargos } from './schemas/Cargos'
import {
    DetallesVoluntarios,
    tipoSangreEnum,
    estadoCivilEnum,
    tallaCamisaEnum,
} from './schemas/DetallesVoluntarios'
import { Franquicias } from './schemas/Franquicias'
import { Usuarios, tipoUsuarioEnum } from './schemas/Usuarios'
import { hash } from 'bcrypt'
import { Pertenecen } from './schemas/Pertenecen'
import { Bancos } from './schemas/Bancos'
import { Locaciones } from './schemas/Locaciones'
import { Productos } from './schemas/Productos'
import { TienenStock } from './schemas/TienenStock'
import { CajasChicas } from './schemas/CajasChicas'
import { MovimientosCaja } from './schemas/MovimientosCaja'
import { ResponsablesCuentas } from './schemas/ResponsablesCuentas'
import { CuentasBancarias, tipoMonedaEnum } from './schemas/CuentasBancarias'
import { MovimientosCuentas, tipoMovimientoEnum } from './schemas/MovimientosCuentas'
import { Visitas, tiposVisitasEnum } from './schemas/Visitas'
import { ReunionesDeComite, tipoReunionComiteEnum } from './schemas/ReunionesDeComite'
import { Realizan, responsabilitiesEnum } from './schemas/Realizan'
import { Asisten } from './schemas/Asisten'

const initDB = async () => {
    console.log('Starting database initialization...')

    await db.transaction(async (tx) => {
        try {
            // Clear all tables (truncate if they exist) to respect FK constraints
            const tablesToTruncate = [
                'MovimientosCuentas',
                'CuentasBancarias',
                'Bancos',
                'ResponsablesCuentas',
                'Tienen',
                'MovimientosInventario',
                'RegistranObservaciones',
                'Usuarios',
                'Pertenecen',
                'Franquicias',
                'DetallesVoluntarios',
                'Voluntarios',
                'Cargos',
                'Ciudades',
                'Estados',
                'Paises',
                'Productos',
                'TienenStock',
                'Locaciones',
                'ReunionesDeComite',
                'CajasChicas',
                'MovimientosCaja',
                'Traspasos',
                'Visitas',
                'Asisten',
                'Realizan',
            ]

            for (const table of tablesToTruncate) {
                await tx.execute(
                    `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_class WHERE relname = '${table}') THEN EXECUTE 'TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE'; END IF; END $$;`,
                )
            }

            //Restart sequences
            await tx.execute('ALTER SEQUENCE "Paises_id_seq" RESTART WITH 1')
            await tx.execute('ALTER SEQUENCE "Estados_id_seq" RESTART WITH 1')
            await tx.execute('ALTER SEQUENCE "Ciudades_id_seq" RESTART WITH 1')
            await tx.execute(
                'ALTER SEQUENCE "Voluntarios_id_seq" RESTART WITH 1',
            )
            await tx.execute('ALTER SEQUENCE "Cargos_id_seq" RESTART WITH 1')
            await tx.execute(
                'ALTER SEQUENCE "Franquicias_id_seq" RESTART WITH 1',
            )
            await tx.execute('ALTER SEQUENCE "Usuarios_id_seq" RESTART WITH 1')
            await tx.execute(
                'ALTER SEQUENCE "CuentasBancarias_id_seq" RESTART WITH 1',
            )
            await tx.execute(
                'ALTER SEQUENCE "MovimientosCuentas_id_seq" RESTART WITH 1',
            )
            await tx.execute(
                'ALTER SEQUENCE "MovimientosInventario_id_seq" RESTART WITH 1',
            )
            await tx.execute(
                'ALTER SEQUENCE "ResponsablesCuentas_id_seq" RESTART WITH 1',
            )

            //#region Paises
            console.log('Inserting predefined countries...')
            const countries = [
                { nombre: 'Venezuela' },
                { nombre: 'República Dominicana' },
                { nombre: 'Estados Unidos' },
            ]

            await tx.insert(Paises).values(countries).returning()
            console.log('Countries inserted successfully.')
            //#end region

            //#region Estados
            console.log('Inserting predefined states...')
            const states = [
                { nombre: 'Amazonas', idPais: 1 },
                { nombre: 'Anzoátegui', idPais: 1 },
                { nombre: 'Apure', idPais: 1 },
                { nombre: 'Aragua', idPais: 1 },
                { nombre: 'Barinas', idPais: 1 },
                { nombre: 'Bolívar', idPais: 1 },
                { nombre: 'Carabobo', idPais: 1 },
                { nombre: 'Cojedes', idPais: 1 },
                { nombre: 'Delta Amacuro', idPais: 1 },
                { nombre: 'Falcón', idPais: 1 },
                { nombre: 'Guárico', idPais: 1 },
                { nombre: 'Lara', idPais: 1 },
                { nombre: 'Mérida', idPais: 1 },
                { nombre: 'Miranda', idPais: 1 },
                { nombre: 'Monagas', idPais: 1 },
                { nombre: 'Nueva Esparta', idPais: 1 },
                { nombre: 'Portuguesa', idPais: 1 },
                { nombre: 'Sucre', idPais: 1 },
                { nombre: 'Táchira', idPais: 1 },
                { nombre: 'Trujillo', idPais: 1 },
                { nombre: 'Yaracuy', idPais: 1 },
                { nombre: 'Zulia', idPais: 1 },
                { nombre: 'Distrito Capital', idPais: 1 },

                { nombre: 'Azua', idPais: 2 },
                { nombre: 'Baoruco', idPais: 2 },
                { nombre: 'Barahona', idPais: 2 },
                { nombre: 'Dajabón', idPais: 2 },
                { nombre: 'Duarte', idPais: 2 },
                { nombre: 'Elías Piña', idPais: 2 },
                { nombre: 'El Seibo', idPais: 2 },
                { nombre: 'Hato Mayor', idPais: 2 },
                { nombre: 'Independencia', idPais: 2 },
                { nombre: 'La Altagracia', idPais: 2 },
                { nombre: 'La Romana', idPais: 2 },
                { nombre: 'La Vega', idPais: 2 },
                { nombre: 'María Trinidad Sánchez', idPais: 2 },
                { nombre: 'Monte Cristi', idPais: 2 },
                { nombre: 'Monte Plata', idPais: 2 },
                { nombre: 'Pedernales', idPais: 2 },
                { nombre: 'Peravia', idPais: 2 },
                { nombre: 'Puerto Plata', idPais: 2 },
                { nombre: 'Samaná', idPais: 2 },
                { nombre: 'San Cristóbal', idPais: 2 },
                { nombre: 'San José de Ocoa', idPais: 2 },
                { nombre: 'San Juan', idPais: 2 },
                { nombre: 'San Pedro de Macorís', idPais: 2 },
                { nombre: 'Santiago', idPais: 2 },
                { nombre: 'Santiago Rodríguez', idPais: 2 },
                { nombre: 'Santo Domingo', idPais: 2 },
                { nombre: 'Valverde', idPais: 2 },
                { nombre: 'Distrito Nacional', idPais: 2 },
                { nombre: 'Alabama', idPais: 3 },
                { nombre: 'Alaska', idPais: 3 },
                { nombre: 'Arizona', idPais: 3 },
                { nombre: 'Arkansas', idPais: 3 },
                { nombre: 'California', idPais: 3 },
                { nombre: 'Colorado', idPais: 3 },
                { nombre: 'Connecticut', idPais: 3 },
                { nombre: 'Delaware', idPais: 3 },
                { nombre: 'Florida', idPais: 3 },
                { nombre: 'Georgia', idPais: 3 },
                { nombre: 'Hawaii', idPais: 3 },
                { nombre: 'Idaho', idPais: 3 },
                { nombre: 'Illinois', idPais: 3 },
                { nombre: 'Indiana', idPais: 3 },
                { nombre: 'Iowa', idPais: 3 },
                { nombre: 'Kansas', idPais: 3 },
                { nombre: 'Kentucky', idPais: 3 },
                { nombre: 'Louisiana', idPais: 3 },
                { nombre: 'Maine', idPais: 3 },
                { nombre: 'Maryland', idPais: 3 },
                { nombre: 'Massachusetts', idPais: 3 },
                { nombre: 'Michigan', idPais: 3 },
                { nombre: 'Minnesota', idPais: 3 },
                { nombre: 'Mississippi', idPais: 3 },
                { nombre: 'Missouri', idPais: 3 },
                { nombre: 'Montana', idPais: 3 },
                { nombre: 'Nebraska', idPais: 3 },
                { nombre: 'Nevada', idPais: 3 },
                { nombre: 'New Hampshire', idPais: 3 },
                { nombre: 'New Jersey', idPais: 3 },
                { nombre: 'New Mexico', idPais: 3 },
                { nombre: 'New York', idPais: 3 },
                { nombre: 'North Carolina', idPais: 3 },
                { nombre: 'North Dakota', idPais: 3 },
                { nombre: 'Ohio', idPais: 3 },
                { nombre: 'Oklahoma', idPais: 3 },
                { nombre: 'Oregon', idPais: 3 },
                { nombre: 'Pennsylvania', idPais: 3 },
                { nombre: 'Rhode Island', idPais: 3 },
                { nombre: 'South Carolina', idPais: 3 },
                { nombre: 'South Dakota', idPais: 3 },
                { nombre: 'Tennessee', idPais: 3 },
                { nombre: 'Texas', idPais: 3 },
                { nombre: 'Utah', idPais: 3 },
                { nombre: 'Vermont', idPais: 3 },
                { nombre: 'Virginia', idPais: 3 },
                { nombre: 'Washington', idPais: 3 },
                { nombre: 'West Virginia', idPais: 3 },
                { nombre: 'Wisconsin', idPais: 3 },
                { nombre: 'Wyoming', idPais: 3 },
            ]

            await tx.insert(Estados).values(states).returning()
            console.log('States inserted successfully.')
            //#end region

            //#region Ciudades
            console.log('Inserting predefined cities...')
            const cities = [
                // Venezuela
                { nombre: 'Maracaibo', idEstado: 22 },
                { nombre: 'Puerto Ordaz', idEstado: 6 },
                { nombre: 'Ciudad Bolivar', idEstado: 6 },
                { nombre: 'Los Teques', idEstado: 11 },
                { nombre: 'Caracas', idEstado: 23 },
                { nombre: 'Valencia', idEstado: 7 },
                { nombre: 'Barquisimeto', idEstado: 12 },
                { nombre: 'San Cristóbal', idEstado: 19 },
                { nombre: 'Barcelona', idEstado: 2 },
                { nombre: 'Mérida', idEstado: 13 },
                { nombre: 'Cumaná', idEstado: 18 },
                { nombre: 'Maturín', idEstado: 15 },
                { nombre: 'Barinas', idEstado: 5 },
                { nombre: 'Coro', idEstado: 10 },
                { nombre: 'San Juan de los Morros', idEstado: 11 },
                { nombre: 'La Guaira', idEstado: 14 },
                { nombre: 'San Felipe', idEstado: 21 },
                { nombre: 'San Fernando de Apure', idEstado: 3 },
                { nombre: 'Trujillo', idEstado: 20 },
                { nombre: 'Guanare', idEstado: 17 },
                { nombre: 'San Carlos', idEstado: 8 },
                { nombre: 'Puerto Ayacucho', idEstado: 1 },
                { nombre: 'Tucupita', idEstado: 9 },
                { nombre: 'La Asunción', idEstado: 16 },

                // República Dominicana
                { nombre: 'Azua de Compostela', idEstado: 24 },
                { nombre: 'Sabana Yegua', idEstado: 24 },
                { nombre: 'Neiba', idEstado: 25 },
                { nombre: 'Tamayo', idEstado: 25 },
                { nombre: 'Barahona', idEstado: 26 },
                { nombre: 'Vicente Noble', idEstado: 26 },
                { nombre: 'Dajabón', idEstado: 27 },
                { nombre: 'Loma de Cabrera', idEstado: 27 },
                { nombre: 'San Francisco de Macorís', idEstado: 28 },
                { nombre: 'Castillo', idEstado: 28 },
                { nombre: 'Comendador', idEstado: 29 },
                { nombre: 'Bánica', idEstado: 29 },
                { nombre: 'El Seibo', idEstado: 30 },
                { nombre: 'Miches', idEstado: 30 },
                { nombre: 'Hato Mayor del Rey', idEstado: 31 },
                { nombre: 'Sabana de la Mar', idEstado: 31 },
                { nombre: 'Jimaní', idEstado: 32 },
                { nombre: 'Duvergé', idEstado: 32 },
                { nombre: 'Higüey', idEstado: 33 },
                { nombre: 'Punta Cana', idEstado: 33 },
                { nombre: 'La Romana', idEstado: 34 },
                { nombre: 'Guaymate', idEstado: 34 },
                { nombre: 'La Vega', idEstado: 35 },
                { nombre: 'Constanza', idEstado: 35 },
                { nombre: 'Nagua', idEstado: 36 },
                { nombre: 'Río San Juan', idEstado: 36 },
                { nombre: 'Monte Cristi', idEstado: 37 },
                { nombre: 'Guayubín', idEstado: 37 },
                { nombre: 'Monte Plata', idEstado: 38 },
                { nombre: 'Bayaguana', idEstado: 38 },
                { nombre: 'Pedernales', idEstado: 39 },
                { nombre: 'Oviedo', idEstado: 39 },
                { nombre: 'Baní', idEstado: 40 },
                { nombre: 'Nizao', idEstado: 40 },
                { nombre: 'Puerto Plata', idEstado: 41 },
                { nombre: 'Sosúa', idEstado: 41 },
                { nombre: 'Samaná', idEstado: 42 },
                { nombre: 'Las Terrenas', idEstado: 42 },
                { nombre: 'San Cristóbal', idEstado: 43 },
                { nombre: 'Haina', idEstado: 43 },
                { nombre: 'San José de Ocoa', idEstado: 44 },
                { nombre: 'Sabana Larga', idEstado: 44 },
                { nombre: 'San Juan de la Maguana', idEstado: 45 },
                { nombre: 'Las Matas de Farfán', idEstado: 45 },
                { nombre: 'San Pedro de Macorís', idEstado: 46 },
                { nombre: 'Consuelo', idEstado: 46 },
                { nombre: 'Santiago de los Caballeros', idEstado: 47 },
                { nombre: 'Tamboril', idEstado: 47 },
                { nombre: 'San Ignacio de Sabaneta', idEstado: 48 },
                { nombre: 'Monción', idEstado: 48 },
                { nombre: 'Santo Domingo Este', idEstado: 49 },
                { nombre: 'Santo Domingo Norte', idEstado: 49 },
                { nombre: 'Mao', idEstado: 50 },
                { nombre: 'Esperanza', idEstado: 50 },
                { nombre: 'Santo Domingo', idEstado: 51 },
                { nombre: 'Boca Chica', idEstado: 49 },

                // Estados Unidos
                { nombre: 'Birmingham', idEstado: 52 },
                { nombre: 'Montgomery', idEstado: 52 },
                { nombre: 'Anchorage', idEstado: 53 },
                { nombre: 'Fairbanks', idEstado: 53 },
                { nombre: 'Phoenix', idEstado: 54 },
                { nombre: 'Tucson', idEstado: 54 },
                { nombre: 'Little Rock', idEstado: 55 },
                { nombre: 'Fayetteville', idEstado: 55 },
                { nombre: 'Los Angeles', idEstado: 56 },
                { nombre: 'San Diego', idEstado: 56 },
                { nombre: 'Denver', idEstado: 57 },
                { nombre: 'Colorado Springs', idEstado: 57 },
                { nombre: 'Bridgeport', idEstado: 58 },
                { nombre: 'New Haven', idEstado: 58 },
                { nombre: 'Wilmington', idEstado: 59 },
                { nombre: 'Dover', idEstado: 59 },
                { nombre: 'Miami', idEstado: 60 },
                { nombre: 'Orlando', idEstado: 60 },
                { nombre: 'Atlanta', idEstado: 61 },
                { nombre: 'Savannah', idEstado: 61 },
                { nombre: 'Honolulu', idEstado: 62 },
                { nombre: 'Hilo', idEstado: 62 },
                { nombre: 'Boise', idEstado: 63 },
                { nombre: 'Meridian', idEstado: 63 },
                { nombre: 'Chicago', idEstado: 64 },
                { nombre: 'Springfield', idEstado: 64 },
                { nombre: 'Indianapolis', idEstado: 65 },
                { nombre: 'Fort Wayne', idEstado: 65 },
                { nombre: 'Des Moines', idEstado: 66 },
                { nombre: 'Cedar Rapids', idEstado: 66 },
                { nombre: 'Wichita', idEstado: 67 },
                { nombre: 'Overland Park', idEstado: 67 },
                { nombre: 'Louisville', idEstado: 68 },
                { nombre: 'Lexington', idEstado: 68 },
                { nombre: 'New Orleans', idEstado: 69 },
                { nombre: 'Baton Rouge', idEstado: 69 },
                { nombre: 'Portland', idEstado: 70 },
                { nombre: 'Lewiston', idEstado: 70 },
                { nombre: 'Baltimore', idEstado: 71 },
                { nombre: 'Annapolis', idEstado: 71 },
                { nombre: 'Boston', idEstado: 72 },
                { nombre: 'Worcester', idEstado: 72 },
                { nombre: 'Detroit', idEstado: 73 },
                { nombre: 'Grand Rapids', idEstado: 73 },
                { nombre: 'Minneapolis', idEstado: 74 },
                { nombre: 'Saint Paul', idEstado: 74 },
                { nombre: 'Jackson', idEstado: 75 },
                { nombre: 'Gulfport', idEstado: 75 },
                { nombre: 'Kansas City', idEstado: 76 },
                { nombre: 'St. Louis', idEstado: 76 },
                { nombre: 'Billings', idEstado: 77 },
                { nombre: 'Missoula', idEstado: 77 },
                { nombre: 'Omaha', idEstado: 78 },
                { nombre: 'Lincoln', idEstado: 78 },
                { nombre: 'Las Vegas', idEstado: 79 },
                { nombre: 'Reno', idEstado: 79 },
                { nombre: 'Manchester', idEstado: 80 },
                { nombre: 'Nashua', idEstado: 80 },
                { nombre: 'Newark', idEstado: 81 },
                { nombre: 'Jersey City', idEstado: 81 },
                { nombre: 'Albuquerque', idEstado: 82 },
                { nombre: 'Santa Fe', idEstado: 82 },
                { nombre: 'New York City', idEstado: 83 },
                { nombre: 'Buffalo', idEstado: 83 },
                { nombre: 'Charlotte', idEstado: 84 },
                { nombre: 'Raleigh', idEstado: 84 },
                { nombre: 'Fargo', idEstado: 85 },
                { nombre: 'Bismarck', idEstado: 85 },
                { nombre: 'Columbus', idEstado: 86 },
                { nombre: 'Cleveland', idEstado: 86 },
                { nombre: 'Oklahoma City', idEstado: 87 },
                { nombre: 'Tulsa', idEstado: 87 },
                { nombre: 'Portland', idEstado: 88 },
                { nombre: 'Salem', idEstado: 88 },
                { nombre: 'Philadelphia', idEstado: 89 },
                { nombre: 'Pittsburgh', idEstado: 89 },
                { nombre: 'Providence', idEstado: 90 },
                { nombre: 'Warwick', idEstado: 90 },
                { nombre: 'Charleston', idEstado: 91 },
                { nombre: 'Columbia', idEstado: 91 },
                { nombre: 'Sioux Falls', idEstado: 92 },
                { nombre: 'Rapid City', idEstado: 92 },
                { nombre: 'Nashville', idEstado: 93 },
                { nombre: 'Memphis', idEstado: 93 },
                { nombre: 'Houston', idEstado: 94 },
                { nombre: 'Austin', idEstado: 94 },
                { nombre: 'Salt Lake City', idEstado: 95 },
                { nombre: 'Provo', idEstado: 95 },
                { nombre: 'Burlington', idEstado: 96 },
                { nombre: 'Montpelier', idEstado: 96 },
                { nombre: 'Virginia Beach', idEstado: 97 },
                { nombre: 'Richmond', idEstado: 97 },
                { nombre: 'Seattle', idEstado: 98 },
                { nombre: 'Spokane', idEstado: 98 },
                { nombre: 'Charleston', idEstado: 99 },
                { nombre: 'Huntington', idEstado: 99 },
                { nombre: 'Milwaukee', idEstado: 100 },
                { nombre: 'Madison', idEstado: 100 },
                { nombre: 'Cheyenne', idEstado: 101 },
                { nombre: 'Casper', idEstado: 101 },
            ]

            await tx.insert(Ciudades).values(cities).returning()
            console.log('Cities inserted successfully.')
            //#end region

            //#region Bancos
            console.log('Inserting predefined banks...')
            const banks = [
                // Venezuela
                { cod: '0102', nombre: 'Banco de Venezuela' },
                { cod: '0105', nombre: 'Mercantil' },
                { cod: '0108', nombre: 'Provincial' },
                { cod: '0134', nombre: 'Banesco' },
                // USA
                { cod: 'JPMC', nombre: 'JPMorgan Chase' },
                { cod: 'BOFA', nombre: 'Bank of America' },
                { cod: 'WFC', nombre: 'Wells Fargo' },
                { cod: 'CITI', nombre: 'Citibank' },
                // República Dominicana
                { cod: '0001', nombre: 'Banco de Reservas' },
                { cod: '0002', nombre: 'Banco Popular' },
                { cod: '0003', nombre: 'Banco BHD' },
                { cod: '0004', nombre: 'Scotiabank' },
            ]

            await tx.insert(Bancos).values(banks).returning()
            console.log('Banks inserted successfully.')
            //#end region

            //#region Voluntarios
            console.log('Inserting predefined volunteers...')
            const volunteers = [
                // Franquicia 1 - Coordinador y 5 voluntarios
                {
                    nombres: 'Juan',
                    apellidos: 'Pérez',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0], // "V"
                    numeroDocumento: '12345678',
                    fechaNacimiento: new Date('1990-01-01'),
                    profesion: 'Ingeniero',
                    estatus: estatusEnum.enumValues[0], // "Activo"
                    genero: generoEnum.enumValues[0], // "Masculino"
                },
                {
                    nombres: 'María',
                    apellidos: 'Gómez',
                    tipoDocumento: tipoDocumentoEnum.enumValues[1], // "E"
                    numeroDocumento: '87654321',
                    fechaNacimiento: new Date('1985-05-15'),
                    profesion: 'Médico',
                    estatus: estatusEnum.enumValues[0], // "Activo"
                    genero: generoEnum.enumValues[1], // "Femenino"
                },
                {
                    nombres: 'Carlos',
                    apellidos: 'Rodríguez',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '11223344',
                    fechaNacimiento: new Date('1992-03-20'),
                    profesion: 'Enfermero',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[0],
                },
                {
                    nombres: 'Ana',
                    apellidos: 'Martínez',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '22334455',
                    fechaNacimiento: new Date('1988-07-10'),
                    profesion: 'Psicóloga',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[1],
                },
                {
                    nombres: 'Luis',
                    apellidos: 'Hernández',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '33445566',
                    fechaNacimiento: new Date('1995-11-25'),
                    profesion: 'Estudiante',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[0],
                },
                {
                    nombres: 'Carmen',
                    apellidos: 'López',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '44556677',
                    fechaNacimiento: new Date('1991-09-05'),
                    profesion: 'Contadora',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[1],
                },
                // Franquicia 2 - Coordinador y 5 voluntarios
                {
                    nombres: 'Roberto',
                    apellidos: 'Sánchez',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '55667788',
                    fechaNacimiento: new Date('1987-04-12'),
                    profesion: 'Administrador',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[0],
                },
                {
                    nombres: 'Patricia',
                    apellidos: 'Fernández',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '66778899',
                    fechaNacimiento: new Date('1993-06-18'),
                    profesion: 'Educadora',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[1],
                },
                {
                    nombres: 'Miguel',
                    apellidos: 'García',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '77889900',
                    fechaNacimiento: new Date('1989-02-28'),
                    profesion: 'Abogado',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[0],
                },
                {
                    nombres: 'Laura',
                    apellidos: 'Torres',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '88990011',
                    fechaNacimiento: new Date('1994-08-15'),
                    profesion: 'Comunicadora',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[1],
                },
                {
                    nombres: 'Diego',
                    apellidos: 'Ramírez',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '99001122',
                    fechaNacimiento: new Date('1996-12-03'),
                    profesion: 'Estudiante',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[0],
                },
                {
                    nombres: 'Sofía',
                    apellidos: 'Morales',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '10111213',
                    fechaNacimiento: new Date('1990-10-20'),
                    profesion: 'Diseñadora',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[1],
                },
                // Franquicia 3 - Coordinador y 5 voluntarios
                {
                    nombres: 'Andrés',
                    apellidos: 'Jiménez',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '14151617',
                    fechaNacimiento: new Date('1986-01-14'),
                    profesion: 'Ingeniero',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[0],
                },
                {
                    nombres: 'Valentina',
                    apellidos: 'Castro',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '18192021',
                    fechaNacimiento: new Date('1992-05-22'),
                    profesion: 'Médico',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[1],
                },
                {
                    nombres: 'Fernando',
                    apellidos: 'Ortega',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '22232425',
                    fechaNacimiento: new Date('1988-09-08'),
                    profesion: 'Profesor',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[0],
                },
                {
                    nombres: 'Isabella',
                    apellidos: 'Vargas',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '26272829',
                    fechaNacimiento: new Date('1993-03-16'),
                    profesion: 'Nutricionista',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[1],
                },
                {
                    nombres: 'Ricardo',
                    apellidos: 'Mendoza',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '30313233',
                    fechaNacimiento: new Date('1995-07-30'),
                    profesion: 'Estudiante',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[0],
                },
                {
                    nombres: 'Daniela',
                    apellidos: 'Rojas',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '34353637',
                    fechaNacimiento: new Date('1991-11-12'),
                    profesion: 'Terapeuta',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[1],
                },
                // Franquicia 4 - Coordinador y 5 voluntarios
                {
                    nombres: 'Javier',
                    apellidos: 'Silva',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '38394041',
                    fechaNacimiento: new Date('1987-06-07'),
                    profesion: 'Arquitecto',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[0],
                },
                {
                    nombres: 'Gabriela',
                    apellidos: 'Méndez',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '42434445',
                    fechaNacimiento: new Date('1994-02-19'),
                    profesion: 'Médico',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[1],
                },
                {
                    nombres: 'Alejandro',
                    apellidos: 'Cruz',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '46474849',
                    fechaNacimiento: new Date('1989-08-24'),
                    profesion: 'Ingeniero',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[0],
                },
                {
                    nombres: 'Natalia',
                    apellidos: 'Rivera',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '50515253',
                    fechaNacimiento: new Date('1992-12-11'),
                    profesion: 'Enfermera',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[1],
                },
                {
                    nombres: 'Sebastián',
                    apellidos: 'Ochoa',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '54555657',
                    fechaNacimiento: new Date('1996-04-26'),
                    profesion: 'Estudiante',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[0],
                },
                {
                    nombres: 'Camila',
                    apellidos: 'Vega',
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: '58596061',
                    fechaNacimiento: new Date('1990-10-09'),
                    profesion: 'Psicóloga',
                    estatus: estatusEnum.enumValues[0],
                    genero: generoEnum.enumValues[1],
                },
            ]

            await tx.insert(Voluntarios).values(volunteers).returning()
            console.log('Volunteers inserted successfully.')
            //#end region

            //#region Cargos
            console.log('Inserting predefined positions...')
            const positions = [
                {
                    nombre: 'Coordinador',
                    descripcion:
                        'Responsable de coordinar las actividades de la franquicia',
                },
                {
                    nombre: 'Voluntario',
                    descripcion: 'Miembro activo que realiza visitas',
                },
                {
                    nombre: 'Comité',
                    descripcion: 'Miembro del comité de la franquicia',
                },
            ]

            await tx.insert(Cargos).values(positions).returning()
            console.log('Positions inserted successfully.')
            //#end region

            //#region DetallesVoluntarios
            console.log('Inserting volunteer details...')
            const nombresPayasos = [
                'Payaso Feliz', 'Payaso Sonrisa', 'Payaso Alegría', 'Payaso Risitas',
                'Payaso Chispa', 'Payaso Burbuja', 'Payaso Estrella', 'Payaso Arcoíris',
                'Payaso Sol', 'Payaso Luna', 'Payaso Estrella', 'Payaso Magia',
                'Payaso Corazón', 'Payaso Rayo', 'Payaso Nube', 'Payaso Flor',
                'Payaso Mariposa', 'Payaso Delfín', 'Payaso Tigre', 'Payaso León',
                'Payaso Elefante', 'Payaso Mono', 'Payaso Oso', 'Payaso Panda'
            ]
            const tallas = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
            const tiposSangre = tipoSangreEnum.enumValues
            const estadosCiviles = estadoCivilEnum.enumValues

            const volunteerDetails = Array.from({ length: 24 }, (_, i) => ({
                idVoluntario: i + 1,
                tipoSangre: tiposSangre[i % tiposSangre.length] as any,
                estadoCivil: estadosCiviles[i % estadosCiviles.length],
                telefonos: [`+58414${String(123456 + i).padStart(6, '0')}`],
                nombrePayaso: nombresPayasos[i],
                tallaCamisa: tallaCamisaEnum.enumValues[i % tallas.length],
                tieneCamisaConLogo: i % 3 !== 0,
                tieneBataConLogo: i % 2 === 0,
                nombreContactoEmergencia: `Contacto ${i + 1}`,
                telefonoContactoEmergencia: `+58414${String(123456 + i + 100).padStart(6, '0')}`,
                alergias: i % 4 === 0 ? 'Polen' : 'Ninguna',
                discapacidad: 'Ninguna',
                facebook: `payaso${i + 1}`,
                x: `payaso${i + 1}`,
                instagram: `payaso${i + 1}`,
                tiktok: `payaso${i + 1}`,
            }))

            await tx
                .insert(DetallesVoluntarios)
                .values(volunteerDetails)
                .returning()
            console.log('Volunteer details inserted successfully.')
            //#end region

            //#region Tienen
            console.log('Linking volunteers with positions...')
            // Coordinadores (1, 7, 13, 19) tienen cargo 1, otros tienen cargo 2
            const volunteerPositions = []
            for (let i = 1; i <= 24; i++) {
                if (i === 1 || i === 7 || i === 13 || i === 19) {
                    // Coordinadores
                    volunteerPositions.push({
                        idVoluntario: i,
                        idCargo: 1, // Coordinador
                        esCargoPrincipal: true,
                    })
                } else {
                    // Voluntarios regulares
                    volunteerPositions.push({
                        idVoluntario: i,
                        idCargo: 2, // Voluntario
                        esCargoPrincipal: true,
                    })
                }
            }

            await tx.insert(Tienen).values(volunteerPositions).returning()
            console.log('Volunteer positions linked successfully.')
            //#end region

            //#region Franquicias
            console.log('Inserting franchises...')
            const franchises = [
                {
                    rif: 'J-123456789',
                    nombre: 'Dr. Yaso Maracaibo',
                    direccion: 'Av. Principal #123',
                    telefono: '04141234567',
                    correo: 'maracaibo@dryaso.com',
                    estaActivo: true,
                    idCiudad: 1,
                    idCoordinador: 1,
                },
                {
                    rif: 'J-234567890',
                    nombre: 'Dr. Yaso Caracas',
                    direccion: 'Av. Libertador #456',
                    telefono: '04121234567',
                    correo: 'caracas@dryaso.com',
                    estaActivo: true,
                    idCiudad: 5,
                    idCoordinador: 7,
                },
                {
                    rif: 'J-345678901',
                    nombre: 'Dr. Yaso Valencia',
                    direccion: 'Av. Bolívar #789',
                    telefono: '04141234568',
                    correo: 'valencia@dryaso.com',
                    estaActivo: true,
                    idCiudad: 6,
                    idCoordinador: 13,
                },
                {
                    rif: 'J-456789012',
                    nombre: 'Dr. Yaso Barquisimeto',
                    direccion: 'Av. Lara #321',
                    telefono: '04121234568',
                    correo: 'barquisimeto@dryaso.com',
                    estaActivo: true,
                    idCiudad: 7,
                    idCoordinador: 19,
                },
            ]

            await tx.insert(Franquicias).values(franchises).returning()
            console.log('Franchises inserted successfully.')
            //#end region

            //#region Pertenecen
            console.log('Linking volunteers to franchises...')

            const VolunteerBelongsToFranchise = []
            // 6 voluntarios por franquicia
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 6; j++) {
                    const volunteerId = i * 6 + j + 1
                    VolunteerBelongsToFranchise.push({
                        idVoluntario: volunteerId,
                        idFranquicia: i + 1,
                        fechaHoraIngreso: new Date(2023, 0, 1 + j * 10),
                    })
                }
            }

            await tx
                .insert(Pertenecen)
                .values(VolunteerBelongsToFranchise)
                .returning()
            console.log('Volunteers linked to franchises successfully.')

            //#endregion

            //#region Usuarios
            console.log('Inserting users...')

            const hashedAdminPassword = await hash('admin123', 10)
            const hashedCoordPassword = await hash('coord123', 10)
            const users = [
                {
                    nombre: 'admin',
                    contraseña: hashedAdminPassword,
                    tipo: tipoUsuarioEnum.enumValues[0], // "Superusuario"
                    correo: 'admin@dryaso.com',
                    idFranquicia: 1,
                },
                {
                    nombre: 'coordinador',
                    contraseña: hashedCoordPassword,
                    tipo: tipoUsuarioEnum.enumValues[3], // "Coordinador"
                    correo: 'coord@dryaso.com',
                    idFranquicia: 1,
                },
            ]

            await tx.insert(Usuarios).values(users).returning()
            console.log('Users inserted successfully.')
            //#end region

            //#region Locaciones
            console.log('Inserting locations...')
            const locations = []
            const descripcionesLocaciones = [
                ['Hospital Central', 'Clínica San José', 'Centro de Salud Norte'],
                ['Hospital Universitario', 'Clínica Los Rosales', 'Centro Médico Este'],
                ['Hospital del Sur', 'Clínica La Victoria', 'Centro de Salud Oeste'],
                ['Hospital Regional', 'Clínica El Paraíso', 'Centro Médico Central'],
            ]
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 3; j++) {
                    locations.push({
                        descripcion: descripcionesLocaciones[i][j],
                        idFranquicia: i + 1,
                    })
                }
            }
            await tx.insert(Locaciones).values(locations).returning()
            console.log('Locations inserted successfully.')
            //#end region

            //#region Visitas
            console.log('Inserting visits...')
            const visits = []
            const tiposVisita = tiposVisitasEnum.enumValues
            for (let i = 0; i < 4; i++) {
                const baseLocationId = i * 3 + 1
                for (let j = 0; j < 5; j++) {
                    visits.push({
                        tipo: tiposVisita[j % tiposVisita.length] as any,
                        observacion: `Visita ${j + 1} a ${descripcionesLocaciones[i][j % 3]}`,
                        fechaHora: new Date(2024, 0, 15 + j * 7, 10 + j, 0),
                        beneficiariosDirectos: 10 + j * 2,
                        beneficiariosIndirectos: 20 + j * 3,
                        cantPersonalDeSalud: 2 + (j % 2),
                        idLocacion: baseLocationId + (j % 3),
                    })
                }
            }
            await tx.insert(Visitas).values(visits).returning()
            console.log('Visits inserted successfully.')
            //#end region

            //#region Realizan
            console.log('Linking volunteers to visits...')
            const realizan = []
            const responsabilidades = responsabilitiesEnum.enumValues
            let visitIndex = 0
            for (let i = 0; i < 4; i++) {
                const baseVolunteerId = i * 6 + 1
                for (let j = 0; j < 5; j++) {
                    const visitId = visitIndex + 1
                    // 2-3 voluntarios por visita
                    const numVolunteers = 2 + (j % 2)
                    for (let k = 0; k < numVolunteers; k++) {
                        realizan.push({
                            idVisita: visitId,
                            idVoluntario: baseVolunteerId + (k % 6),
                            responsabilidad: responsabilidades[k % responsabilidades.length] as any,
                        })
                    }
                    visitIndex++
                }
            }
            await tx.insert(Realizan).values(realizan).returning()
            console.log('Volunteers linked to visits successfully.')
            //#end region

            //#region ReunionesDeComite
            console.log('Inserting committee meetings...')
            const meetings = []
            const tiposReunion = tipoReunionComiteEnum.enumValues
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    const fecha = new Date(2024, 0, 10 + j * 7)
                    meetings.push({
                        fecha: fecha.toISOString().split('T')[0], // Convert to date string
                        tipoDeReunionComite: tiposReunion[j % tiposReunion.length] as any,
                        observacion: `Reunión ${j + 1} del comité`,
                        idResponsable: i * 6 + 1, // Coordinador
                        idFranquicia: i + 1,
                    })
                }
            }
            await tx.insert(ReunionesDeComite).values(meetings).returning()
            console.log('Committee meetings inserted successfully.')
            //#end region

            //#region Asisten
            console.log('Linking volunteers to meetings...')
            const asisten = []
            let meetingIndex = 0
            for (let i = 0; i < 4; i++) {
                const baseVolunteerId = i * 6 + 1
                for (let j = 0; j < 4; j++) {
                    const meetingId = meetingIndex + 1
                    // 3-5 voluntarios por reunión
                    const numAttendees = 3 + (j % 3)
                    for (let k = 0; k < numAttendees; k++) {
                        asisten.push({
                            idReunionComite: meetingId,
                            idVoluntario: baseVolunteerId + (k % 6),
                        })
                    }
                    meetingIndex++
                }
            }
            await tx.insert(Asisten).values(asisten).returning()
            console.log('Volunteers linked to meetings successfully.')
            //#end region

            //#region CajasChicas
            console.log('Inserting petty cash accounts...')
            const pettyCashAccounts = []
            const monedas = tipoMonedaEnum.enumValues
            for (let i = 0; i < 4; i++) {
                pettyCashAccounts.push({
                    codCaja: `CC-${String(i + 1).padStart(3, '0')}`,
                    nombre: `Caja Chica ${['Maracaibo', 'Caracas', 'Valencia', 'Barquisimeto'][i]}`,
                    saldo: '500.00',
                    tipoMoneda: monedas[i % monedas.length] as any,
                    idFranquicia: i + 1,
                    idResponsable: i * 6 + 1, // Coordinador
                })
            }
            await tx.insert(CajasChicas).values(pettyCashAccounts).returning()
            console.log('Petty cash accounts inserted successfully.')
            //#end region

            //#region MovimientosCaja
            console.log('Inserting petty cash movements...')
            const cashMovements = []
            for (let i = 0; i < 4; i++) {
                const cajaId = i + 1
                let saldoActual = 500.00
                for (let j = 0; j < 5; j++) {
                    const esIngreso = j % 2 === 0
                    const monto = 50 + j * 25
                    if (esIngreso) {
                        saldoActual += monto
                    } else {
                        saldoActual -= monto
                    }
                    cashMovements.push({
                        fecha: new Date(2024, 0, 5 + j * 5, 9, 0),
                        observacion: esIngreso ? `Ingreso ${j + 1}` : `Egreso ${j + 1}`,
                        ingresos: esIngreso ? monto.toString() : '0',
                        egresos: esIngreso ? '0' : monto.toString(),
                        saldoPosterior: saldoActual.toFixed(2),
                        idCaja: cajaId,
                    })
                }
            }
            await tx.insert(MovimientosCaja).values(cashMovements).returning()
            console.log('Petty cash movements inserted successfully.')
            //#end region

            //#region ResponsablesCuentas
            console.log('Inserting account responsibles...')
            const accountResponsibles = []
            for (let i = 0; i < 4; i++) {
                accountResponsibles.push({
                    tipoDocumento: tipoDocumentoEnum.enumValues[0],
                    numeroDocumento: `V${String(20000000 + i).padStart(8, '0')}`,
                    nombres: ['Roberto', 'Patricia', 'Andrés', 'Javier'][i],
                    apellidos: ['Sánchez', 'Fernández', 'Jiménez', 'Silva'][i],
                })
            }
            await tx.insert(ResponsablesCuentas).values(accountResponsibles).returning()
            console.log('Account responsibles inserted successfully.')
            //#end region

            //#region CuentasBancarias
            console.log('Inserting bank accounts...')
            const bankAccounts = []
            const codigosBancos = ['0102', '0105', '0108', '0134'] // Bancos venezolanos
            for (let i = 0; i < 4; i++) {
                bankAccounts.push({
                    codCuenta: `CB-${String(i + 1).padStart(3, '0')}`,
                    tipoMoneda: monedas[i % monedas.length] as any,
                    saldo: '10000.00',
                    idResponsable: i + 1,
                    codBanco: codigosBancos[i],
                    idFranquicia: i + 1,
                })
            }
            await tx.insert(CuentasBancarias).values(bankAccounts).returning()
            console.log('Bank accounts inserted successfully.')
            //#end region

            //#region MovimientosCuentas
            console.log('Inserting bank account movements...')
            const accountMovements = []
            const tiposMovimiento = tipoMovimientoEnum.enumValues
            for (let i = 0; i < 4; i++) {
                const cuentaId = i + 1
                let saldoActual = 10000.00
                for (let j = 0; j < 5; j++) {
                    const esIngreso = j % 2 === 0
                    const monto = 200 + j * 100
                    if (esIngreso) {
                        saldoActual += monto
                    } else {
                        saldoActual -= monto
                    }
                    accountMovements.push({
                        fecha: new Date(2024, 0, 3 + j * 6, 14, 0),
                        nroReferencia: `REF-${String(i + 1).padStart(2, '0')}-${String(j + 1).padStart(3, '0')}`,
                        tipoMovimiento: tiposMovimiento[j % tiposMovimiento.length] as any,
                        observacion: esIngreso ? `Depósito ${j + 1}` : `Pago ${j + 1}`,
                        ingresos: esIngreso ? monto.toString() : '0',
                        egresos: esIngreso ? '0' : monto.toString(),
                        saldoPosterior: saldoActual.toFixed(2),
                        idCuenta: cuentaId,
                    })
                }
            }
            await tx.insert(MovimientosCuentas).values(accountMovements).returning()
            console.log('Bank account movements inserted successfully.')
            //#end region

            //#region Productos
            console.log('Inserting products...')
            const productos = []
            const nombresProductos = [
                'Pelota de Fútbol', 'Muñeca', 'Carro de Juguete', 'Rompecabezas', 'Libro de Colorear',
                'Crayones', 'Lápices de Colores', 'Juego de Mesa', 'Títere', 'Globos',
                'Pinturas', 'Plastilina', 'Bloques de Construcción', 'Juego de Cartas', 'Yoyo',
                'Cometa', 'Trompo', 'Marioneta', 'Instrumento Musical', 'Juguetes Educativos'
            ]
            for (let i = 0; i < 20; i++) {
                productos.push({
                    nombre: nombresProductos[i],
                    descripcion: `Producto ${i + 1}: ${nombresProductos[i]} para actividades infantiles`,
                })
            }
            await tx.insert(Productos).values(productos).returning()
            console.log('Products inserted successfully.')
            //#end region

            //#region TienenStock
            console.log('Linking products to franchises...')
            const stock = []
            for (let i = 0; i < 4; i++) {
                // 5 productos por franquicia
                for (let j = 0; j < 5; j++) {
                    stock.push({
                        idProducto: i * 5 + j + 1,
                        idFranquicia: i + 1,
                        stockActual: 10 + j * 5,
                    })
                }
            }
            await tx.insert(TienenStock).values(stock).returning()
            console.log('Product stock linked to franchises successfully.')
            //#end region
        } catch (error) {
            console.error('Transaction failed', error)
            throw error
        }
    })
}

;(async () => {
    await initDB()
})()
