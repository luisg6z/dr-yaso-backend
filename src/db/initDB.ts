import { db } from "./db";
import { Ciudades } from "./schemas/Ciudades";
import { Estados } from "./schemas/Estados";
import { Paises } from "./schemas/Paises";
import {
  Voluntarios,
  tipoCedulaEnum,
  estatusEnum,
  generoEnum,
} from "./schemas/Voluntarios";
import { Cargos } from "./schemas/Cargos";
import {
  DetallesVoluntarios,
  tipoSangreEnum,
  estadoCivilEnum,
  tallaCamisaEnum,
} from "./schemas/DetallesVoluntarios";
import { Franquicias } from "./schemas/Franquicias";
import { Usuarios, tipoUsuarioEnum } from "./schemas/Usuarios";
import { hash } from "bcrypt";

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
        { nombre: "Amazonas", idPais: 1 },
        { nombre: "Anzoátegui", idPais: 1 },
        { nombre: "Apure", idPais: 1 },
        { nombre: "Aragua", idPais: 1 },
        { nombre: "Barinas", idPais: 1 },
        { nombre: "Bolívar", idPais: 1 },
        { nombre: "Carabobo", idPais: 1 },
        { nombre: "Cojedes", idPais: 1 },
        { nombre: "Delta Amacuro", idPais: 1 },
        { nombre: "Falcón", idPais: 1 },
        { nombre: "Guárico", idPais: 1 },
        { nombre: "Lara", idPais: 1 },
        { nombre: "Mérida", idPais: 1 },
        { nombre: "Miranda", idPais: 1 },
        { nombre: "Monagas", idPais: 1 },
        { nombre: "Nueva Esparta", idPais: 1 },
        { nombre: "Portuguesa", idPais: 1 },
        { nombre: "Sucre", idPais: 1 },
        { nombre: "Táchira", idPais: 1 },
        { nombre: "Trujillo", idPais: 1 },
        { nombre: "Yaracuy", idPais: 1 },
        { nombre: "Zulia", idPais: 1 },
        { nombre: "Distrito Capital", idPais: 1 },

        { nombre: "Azua", idPais: 2 },
        { nombre: "Baoruco", idPais: 2 },
        { nombre: "Barahona", idPais: 2 },
        { nombre: "Dajabón", idPais: 2 },
        { nombre: "Duarte", idPais: 2 },
        { nombre: "Elías Piña", idPais: 2 },
        { nombre: "El Seibo", idPais: 2 },
        { nombre: "Hato Mayor", idPais: 2 },
        { nombre: "Independencia", idPais: 2 },
        { nombre: "La Altagracia", idPais: 2 },
        { nombre: "La Romana", idPais: 2 },
        { nombre: "La Vega", idPais: 2 },
        { nombre: "María Trinidad Sánchez", idPais: 2 },
        { nombre: "Monte Cristi", idPais: 2 },
        { nombre: "Monte Plata", idPais: 2 },
        { nombre: "Pedernales", idPais: 2 },
        { nombre: "Peravia", idPais: 2 },
        { nombre: "Puerto Plata", idPais: 2 },
        { nombre: "Samaná", idPais: 2 },
        { nombre: "San Cristóbal", idPais: 2 },
        { nombre: "San José de Ocoa", idPais: 2 },
        { nombre: "San Juan", idPais: 2 },
        { nombre: "San Pedro de Macorís", idPais: 2 },
        { nombre: "Santiago", idPais: 2 },
        { nombre: "Santiago Rodríguez", idPais: 2 },
        { nombre: "Santo Domingo", idPais: 2 },
        { nombre: "Valverde", idPais: 2 },
        { nombre: "Distrito Nacional", idPais: 2 },
        { nombre: "Alabama", idPais: 3 },
        { nombre: "Alaska", idPais: 3 },
        { nombre: "Arizona", idPais: 3 },
        { nombre: "Arkansas", idPais: 3 },
        { nombre: "California", idPais: 3 },
        { nombre: "Colorado", idPais: 3 },
        { nombre: "Connecticut", idPais: 3 },
        { nombre: "Delaware", idPais: 3 },
        { nombre: "Florida", idPais: 3 },
        { nombre: "Georgia", idPais: 3 },
        { nombre: "Hawaii", idPais: 3 },
        { nombre: "Idaho", idPais: 3 },
        { nombre: "Illinois", idPais: 3 },
        { nombre: "Indiana", idPais: 3 },
        { nombre: "Iowa", idPais: 3 },
        { nombre: "Kansas", idPais: 3 },
        { nombre: "Kentucky", idPais: 3 },
        { nombre: "Louisiana", idPais: 3 },
        { nombre: "Maine", idPais: 3 },
        { nombre: "Maryland", idPais: 3 },
        { nombre: "Massachusetts", idPais: 3 },
        { nombre: "Michigan", idPais: 3 },
        { nombre: "Minnesota", idPais: 3 },
        { nombre: "Mississippi", idPais: 3 },
        { nombre: "Missouri", idPais: 3 },
        { nombre: "Montana", idPais: 3 },
        { nombre: "Nebraska", idPais: 3 },
        { nombre: "Nevada", idPais: 3 },
        { nombre: "New Hampshire", idPais: 3 },
        { nombre: "New Jersey", idPais: 3 },
        { nombre: "New Mexico", idPais: 3 },
        { nombre: "New York", idPais: 3 },
        { nombre: "North Carolina", idPais: 3 },
        { nombre: "North Dakota", idPais: 3 },
        { nombre: "Ohio", idPais: 3 },
        { nombre: "Oklahoma", idPais: 3 },
        { nombre: "Oregon", idPais: 3 },
        { nombre: "Pennsylvania", idPais: 3 },
        { nombre: "Rhode Island", idPais: 3 },
        { nombre: "South Carolina", idPais: 3 },
        { nombre: "South Dakota", idPais: 3 },
        { nombre: "Tennessee", idPais: 3 },
        { nombre: "Texas", idPais: 3 },
        { nombre: "Utah", idPais: 3 },
        { nombre: "Vermont", idPais: 3 },
        { nombre: "Virginia", idPais: 3 },
        { nombre: "Washington", idPais: 3 },
        { nombre: "West Virginia", idPais: 3 },
        { nombre: "Wisconsin", idPais: 3 },
        { nombre: "Wyoming", idPais: 3 },
      ];

      await tx.insert(Estados).values(states).returning();
      console.log("States inserted successfully.");
      //#end region

      //#region Ciudades
      console.log("Inserting predefined cities...");
      const cities = [
        { nombre: "Maracaibo", idEstado: 22 },
        { nombre: "Puerto Ordaz", idEstado: 6 },
        { nombre: "Ciudad Bolivar", idEstado: 6 },
        { nombre: "Los Teques", idEstado: 11 },
        { nombre: "Santo Domingo", idEstado: 51 },
        { nombre: "Miami", idEstado: 60 },
        { nombre: "Orlando", idEstado: 60 },
        { nombre: "Los Angeles", idEstado: 56 },
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
        {
          nombre: "Coordinador",
          descripcion:
            "Responsable de coordinar las actividades de la franquicia",
        },
        {
          nombre: "Voluntario",
          descripcion: "Miembro activo que realiza visitas",
        },
        {
          nombre: "Comité",
          descripcion: "Miembro del comité de la franquicia",
        },
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

      const hashedAdminPassword = await hash("admin123", 10);
      const hashedCoordPassword = await hash("coord123", 10);
      const users = [
        {
          nombre: "admin",
          contraseña: hashedAdminPassword,
          tipo: tipoUsuarioEnum.enumValues[0], // "Superusuario"
          correo: "admin@dryaso.com",
          idFranquicia: 1,
        },
        {
          nombre: "coordinador",
          contraseña: hashedCoordPassword,
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
