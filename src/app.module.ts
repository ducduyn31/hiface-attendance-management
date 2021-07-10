import { Module } from '@nestjs/common';
import { AttendanceModule } from './attendance/attendance.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [AttendanceModule, EventModule],
})
export class AppModule {}
