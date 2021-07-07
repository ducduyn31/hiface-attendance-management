import { Controller, Get, Param, Query } from '@nestjs/common';
import { getManager } from 'typeorm';
import { AttendanceService } from './attendance.service';
import * as moment from 'moment';

@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get('daily')
  getDailyAttendance(@Query('student_code') studentCode) {
    const startDay = moment().startOf('day').unix();
    const endDay = moment().endOf('day').unix();

    return this.attendanceService.getAttendance(startDay, endDay, studentCode);
  }

  @Get('weekly')
  getWeeklyAttendance() {
    const manager = getManager();
    return manager.query(`SELECT * FROM subject LIMIT 10`);
  }
}
