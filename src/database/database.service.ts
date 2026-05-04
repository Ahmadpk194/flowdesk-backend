import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit {
    private readonly logger = new Logger('Database');

    constructor(private dataSource: DataSource) { }

    onModuleInit() {
        if (this.dataSource.isInitialized) {
            this.logger.log('DB Connected Successfully!✅')
        } else {
            this.logger.error('DB NOT connected ❌');
        }
    }
}
