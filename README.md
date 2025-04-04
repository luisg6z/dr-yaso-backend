# DR Yaso - API

API que permite hacer acciones desde la sistema web administrativo
de Dr Yaso

## Cómo configurar la base de datos

1. Crea en un gestor de base de datos Postgres una base de datos con el nombre `yasodb`.

2. Crea un archivo `.env` en la raíz del proyecto con las siguientes
variables de entorno:


```bash
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_basedatos
```

También se encuentran en el archivo .env.template en la raiz del proyecto.

3. Crea o actualiza el esquema de la base de datos ejecutando 
```bash
npm run db:push
```

## Cómo empezar con el desarrollo

Asegúrate de tener la versión más reciente de [Node.js](https://nodejs.org/) instalada.

1. Instala las dependencias:

```bash
npm install
```

2. Inicia el servidor de desarrollo:

```bash
npm run start:dev
```

3. Realiza consultas sobre la api `http://localhost:3000`.

