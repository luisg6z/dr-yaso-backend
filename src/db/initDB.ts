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
import { CuentasBancarias } from './schemas/CuentasBancarias'
import { MovimientosCuentas } from './schemas/MovimientosCuentas'
import { ResponsablesCuentas } from './schemas/ResponsablesCuentas'

const initDB = async () => {
    console.log('Starting database initialization...')

    await db.transaction(async (tx) => {
        try {
            // Clear databases
            await tx.delete(MovimientosCuentas)
            await tx.delete(CuentasBancarias)
            await tx.delete(Bancos)
            await tx.delete(ResponsablesCuentas)
            await tx.delete(Tienen)
            await tx.delete(Usuarios)
            await tx.delete(Pertenecen)
            await tx.delete(Franquicias)
            await tx.delete(DetallesVoluntarios)
            await tx.delete(Voluntarios)
            await tx.delete(Cargos)
            await tx.delete(Ciudades)
            await tx.delete(Estados)
            await tx.delete(Paises)

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
            await tx.execute('ALTER SEQUENCE "CuentasBancarias_id_seq" RESTART WITH 1')
            await tx.execute('ALTER SEQUENCE "MovimientosCuentas_id_seq" RESTART WITH 1')
            await tx.execute('ALTER SEQUENCE "ResponsablesCuentas_id_seq" RESTART WITH 1')

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
                    estatus: estatusEnum.enumValues[1], // "Desvinculado"
                    genero: generoEnum.enumValues[1], // "Femenino"
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
            const volunteerDetails = [
                {
                    idVoluntario: 1,
                    tipoSangre: tipoSangreEnum.enumValues[0], // "A+"
                    estadoCivil: estadoCivilEnum.enumValues[0], // "Soltero/a"
                    telefonos: ['+584141234567'],
                    nombrePayaso: 'Payaso Feliz',
                    tallaCamisa: tallaCamisaEnum.enumValues[2], // "M"
                    tieneCamisaConLogo: true,
                    tieneBataConLogo: true,
                    nombreContactoEmergencia: 'Ana Pérez',
                    telefonoContactoEmergencia: '+584141234568',
                    alergias: 'Ninguna',
                    discapacidad: 'Ninguna',
                    observacion: 'Experiencia en eventos infantiles',
                    facebook: 'payasofeliz',
                    x: 'payasofeliz',
                    instagram: 'payasofeliz',
                    tiktok: 'payasofeliz',
                },
            ]

            await tx
                .insert(DetallesVoluntarios)
                .values(volunteerDetails)
                .returning()
            console.log('Volunteer details inserted successfully.')
            //#end region

            //#region Tienen
            console.log('Linking volunteers with positions...')
            const volunteerPositions = [
                {
                    idVoluntario: 1,
                    idCargo: 1,
                    esCargoPrincipal: true, // "Coordinador"
                },
            ]

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
            ]

            await tx.insert(Franquicias).values(franchises).returning()
            console.log('Franchises inserted successfully.')
            //#end region

            //#region Pertenecen
            console.log('Linking volunteers to franchises...')

            const VolunteerBelongsToFranchise = [
                {
                    idVoluntario: 1,
                    idFranquicia: 1,
                    fechaHoraIngreso: new Date()
                },
                {
                    idVoluntario: 2,
                    idFranquicia: 1,
                    fechaHoraIngreso: new Date()
                }
            ]

            await tx.insert(Pertenecen).values(VolunteerBelongsToFranchise).returning()
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
        } catch (error) {
            console.error('Transaction failed', error)
            throw error
        }
    })
}

    ; (async () => {
        await initDB()
    })()
