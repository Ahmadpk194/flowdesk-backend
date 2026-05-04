import { TypeOrmModuleOptions } from "@nestjs/typeorm";


export const databaseConfig = (): TypeOrmModuleOptions => ({
    type: 'postgres',
    url: process.env.DB_URI,

    autoLoadEntities: true,

    synchronize: true,

    ssl: {
        rejectUnauthorized: false
    }
})