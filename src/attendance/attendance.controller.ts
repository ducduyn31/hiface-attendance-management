import { Controller, Get, HttpException, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get('daily')
  getDailyAttendance(@Query('student_code') studentCode) {
    const startDay = moment().startOf('day').unix();
    const endDay = moment().endOf('day').unix();

    return this.attendanceService
      .getAttendance(startDay, endDay, studentCode)
      .pipe(map((result) => this.mapResult(result)));
  }

  @Get('weekly')
  getWeeklyAttendance(@Query('student_code') studentCode) {
    const startDay = moment().startOf('week').unix();
    const timeInDay = 60 * 60 * 24;

    const daysOfWeeks = [0, 1, 2, 3, 4, 5, 6].map(
      (offset) => startDay + offset * timeInDay,
    );

    return forkJoin(
      ...daysOfWeeks.map((start) =>
        this.attendanceService
          .getAttendance(start, start + timeInDay, studentCode)
          .pipe(map((result) => this.mapResult(result))),
      ),
    );
  }

  private mapResult(result: any): any {
    if (!result) throw new HttpException('No Result', 400);

    const DOW = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    return {
      day_of_week: !!result['check_in']
        ? DOW[moment.unix(result['check_in']).day()]
        : null,
      date: !!result['check_in']
        ? moment.unix(result['check_in']).format('D-M-Y')
        : null,
      ...result,
      checkin_date: !!result['check_in']
        ? moment.unix(result['check_in']).format('D-M-Y H:m:s')
        : null,
      checkout_date: !!result['check_out']
        ? moment.unix(result['check_out']).format('D-M-Y H:m:s')
        : null,
    };
  }
}
