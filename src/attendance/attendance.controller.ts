import { Controller, Get } from '@nestjs/common';

@Controller('attendance')
export class AttendanceController {
  @Get('daily')
  getDailyAttendance() {
    return {};
  }

  @Get('weekly')
  getWeeklyAttendance() {
    return {};
  }
}
