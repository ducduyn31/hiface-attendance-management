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
          host: 'localhost',
          port: 3307,
          username: 'root',
          password: 'root',
          database: 'koala_online',
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: false,
        }),
    },
    AttendanceService,
  ],
})
export class AttendanceModule {}
