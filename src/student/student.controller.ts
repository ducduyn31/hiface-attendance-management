import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('student')
export class StudentController {
  @Get('list')
  listStudents(@Req() request: Request) {
    const { school, clazz, dob, name } = request.query;


  }
}
