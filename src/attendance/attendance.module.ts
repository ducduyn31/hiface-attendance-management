import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { createConnection } from 'typeorm';
import { AttendanceService } from './attendance.service';

@Module({
  controllers: [AttendanceController],
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () =>
        await createConnection({
          type: 'mysql',
          host: process.env.DATABASE_HOST,
          port: +process.env.DATABASE_PORT,
          username: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_NAME,
          synchronize: false,
        }),
    },
    AttendanceService,
  ],
})
export class AttendanceModule {}
