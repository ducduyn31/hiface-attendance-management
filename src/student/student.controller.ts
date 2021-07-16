import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { StudentService } from './student.service';

@Controller('student')
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Get('list')
  async listStudents(@Req() request: Request) {
    const { school, dob, name, class: clazz } = request.query;

    const result = await this.studentService.findStudent(
      school as string,
      clazz as string,
      dob as string,
      name as string,
    );



    return result;
  }
}
