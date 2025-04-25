import { db } from "./db";
import { Ciudades } from "./schemas/Ciudades";
import { Estados } from "./schemas/Estados";
import { Paises } from "./schemas/Paises";
import { Voluntarios, tipoCedulaEnum, estatusEnum, generoEnum } from "./schemas/Voluntarios";
import { Cargos } from "./schemas/Cargos";
import { DetallesVoluntarios, tipoSangreEnum, estadoCivilEnum, tallaCamisaEnum } from "./schemas/DetallesVoluntarios";
import { Franquicias } from "./schemas/Franquicias";
import { Usuarios, tipoUsuarioEnum } from "./schemas/Usuarios";

const initDB = async () => {
  console.log("Starting database initialization...");

  await db.transaction(async (tx) => {
    try {
        // Clear databases
        await tx.delete(Ciudades);
        await tx.delete(Estados);
        await tx.delete(Paises);
        await tx.delete(Voluntarios);
        await tx.delete(Cargos);
        await tx.delete(DetallesVoluntarios);
        await tx.delete(Franquicias);
        await tx.delete(Usuarios);

        //Restart sequences
        await tx.execute('ALTER SEQUENCE "Paises_id_seq" RESTART WITH 1');
        await tx.execute('ALTER SEQUENCE "Estados_id_seq" RESTART WITH 1');
        await tx.execute('ALTER SEQUENCE "Ciudades_id_seq" RESTART WITH 1');
        await tx.execute('ALTER SEQUENCE "Voluntarios_id_seq" RESTART WITH 1');
        await tx.execute('ALTER SEQUENCE "Cargos_id_seq" RESTART WITH 1');
        await tx.execute('ALTER SEQUENCE "Franquicias_id_seq" RESTART WITH 1');
        await tx.execute('ALTER SEQUENCE "Usuarios_id_seq" RESTART WITH 1');

        //#region Paises
        console.log("Inserting predefined countries...");
        const countries = [
            { nombre: "Venezuela" },
            { nombre: "República Dominicana" },
            { nombre: "Estados Unidos" },
        ];

        await tx.insert(Paises).values(countries).returning();
        console.log("Countries inserted successfully.");
        //#end region

        //#region Estados
        console.log("Inserting predefined states...");
        const states = [
            { nombre: "Zulia", idPais: 1 },
            { nombre: "Miranda", idPais: 1 },
            { nombre: "La Altagracia", idPais: 2 },
            { nombre: "Santo Domingo", idPais: 2 },
            { nombre: "Florida", idPais: 3 },
            { nombre: "California", idPais: 3 },
        ];

        await tx.insert(Estados).values(states).returning();
        console.log("States inserted successfully.");
        //#end region

        //#region Ciudades
        console.log("Inserting predefined cities...");
        const cities = [
            { nombre: "Maracaibo", idEstado: 1 },
            { nombre: "Los Teques", idEstado: 2 },
            { nombre: "Santo Domingo", idEstado: 4 },
            { nombre: "Miami", idEstado: 5 },
            { nombre: "Los Angeles", idEstado: 6 },
        ];

        await tx.insert(Ciudades).values(cities).returning();
        console.log("Cities inserted successfully.");
        //#end region

        //#region Voluntarios
        console.log("Inserting predefined volunteers...");
        const volunteers = [
            {
                nombres: "Juan",
                apellidos: "Pérez",
                tipoCedula: tipoCedulaEnum.enumValues[0], // "V"
                numeroCedula: "12345678",
                fechaNacimiento: new Date("1990-01-01"),
                profesion: "Ingeniero",
                estatus: estatusEnum.enumValues[1], // "Activo"
                genero: generoEnum.enumValues[0], // "Masculino"
            },
            {
                nombres: "María",
                apellidos: "Gómez",
                tipoCedula: tipoCedulaEnum.enumValues[1], // "E"
                numeroCedula: "87654321",
                fechaNacimiento: new Date("1985-05-15"),
                profesion: "Médico",
                estatus: estatusEnum.enumValues[0], // "Desvinculado"
                genero: generoEnum.enumValues[1], // "Femenino"
            },
        ];

        await tx.insert(Voluntarios).values(volunteers).returning();
        console.log("Volunteers inserted successfully.");
        //#end region

        //#region Cargos
        console.log("Inserting predefined positions...");
        const positions = [
            { nombre: "Coordinador", descripcion: "Responsable de coordinar las actividades de la franquicia" },
            { nombre: "Voluntario", descripcion: "Miembro activo que realiza visitas" },
            { nombre: "Comité", descripcion: "Miembro del comité de la franquicia" },
        ];

        await tx.insert(Cargos).values(positions).returning();
        console.log("Positions inserted successfully.");
        //#end region

        //#region DetallesVoluntarios
        console.log("Inserting volunteer details...");
        const volunteerDetails = [
            {
                idVoluntario: 1,
                tipoSangre: tipoSangreEnum.enumValues[0], // "A+"
                estadoCivil: estadoCivilEnum.enumValues[0], // "Soltero/a"
                telefonos: ["+584141234567"],
                nombrePayaso: "Payaso Feliz",
                tallaCamisa: tallaCamisaEnum.enumValues[2], // "M"
                tieneCamisaConLogo: true,
                tieneBataConLogo: true,
                nombreContactoEmergencia: "Ana Pérez",
                telefonoContactoEmergencia: "+584141234568",
                alergias: "Ninguna",
                discapacidad: "Ninguna",
                observacion: "Experiencia en eventos infantiles",
                facebook: "payasofeliz",
                x: "payasofeliz",
                instagram: "payasofeliz",
                tiktok: "payasofeliz",
            },
        ];

        await tx.insert(DetallesVoluntarios).values(volunteerDetails).returning();
        console.log("Volunteer details inserted successfully.");
        //#end region

        //#region Franquicias
        console.log("Inserting franchises...");
        const franchises = [
            {
                rif: "J-123456789",
                nombre: "Dr. Yaso Maracaibo",
                direccion: "Av. Principal #123",
                telefono: "04141234567",
                correo: "maracaibo@dryaso.com",
                estaActivo: true,
                idCiudad: 1,
                idCoordinador: 1,
            },
        ];

        await tx.insert(Franquicias).values(franchises).returning();
        console.log("Franchises inserted successfully.");
        //#end region

        //#region Usuarios
        console.log("Inserting users...");
        const users = [
            {
                nombre: "admin",
                contraseña: "admin123", // En producción, esto debería estar hasheado
                tipo: tipoUsuarioEnum.enumValues[0], // "Superusuario"
                correo: "admin@dryaso.com",
                idFranquicia: 1,
            },
            {
                nombre: "coordinador",
                contraseña: "coord123", // En producción, esto debería estar hasheado
                tipo: tipoUsuarioEnum.enumValues[3], // "Coordinador"
                correo: "coord@dryaso.com",
                idFranquicia: 1,
            },
        ];

        await tx.insert(Usuarios).values(users).returning();
        console.log("Users inserted successfully.");
        //#end region

    } catch (error) {
      console.error("Transaction failed", error);
      throw error;
    }
  });
};

(async () => {
  await initDB();
})();
