import { Module } from '@nestjs/common';
import { AttendanceModule } from './attendance/attendance.module';
import { EventModule } from './event/event.module';
import { ConfigModule } from '@nestjs/config';
import { StudentModule } from './student/student.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    AttendanceModule,
    EventModule,
    ConfigModule.forRoot(),
    StudentModule,
    TaskModule,
  ],
})
export class AppModule {}
