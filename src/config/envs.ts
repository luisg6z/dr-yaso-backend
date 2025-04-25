import "dotenv/config"
import * as joi from 'joi'

export interface IEnvVars {
    PORT: number
    DARABASE_URL: string
    JWT_SECRET: string
    JWT_EXPIRATION_TIME: string
    SALT_ROUNDS: number
}

const envSchema = joi.object({
    PORT: joi.number().required().default(3000),
    DATABASE_URL: joi.string().uri().required(),
    JWT_SECRET: joi.string().required(),
    JWT_EXPIRATION_TIME: joi.string().default('1h'),
    SALT_ROUNDS: joi.number().integer().default(10),
})
.unknown(true)

const { error, value} = envSchema.validate(process.env)

if(error) {
    throw new Error(`Config validation error: ${error.message}`)
}

const envVars = value

export const envs = {
    port: envVars.PORT,
    databaseUrl: envVars.DATABASE_URL,
    jwtSecret: envVars.JWT_SECRET,
    jwtExpirationTime: envVars.JWT_EXPIRATION_TIME,
    saltRounds: envVars.SALT_ROUNDS,
}