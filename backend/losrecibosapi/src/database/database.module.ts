import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { DatabaseService, PG_POOL } from './database.service.js';
import { createPoolConfig, readDatabaseEnv } from './pool-config.js';

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>): Pool =>
        new Pool(createPoolConfig(readDatabaseEnv(config))),
    },
    DatabaseService,
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
