import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { StudentService } from './student.service';
import * as moment from 'moment';
import { StudentTokenRequest } from './dto/student-token-request';

@Controller('student')
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Get('list')
  async listStudents(@Req() request: Request) {
    new Logger('ListStudent', false).debug('Begin listing students');
    const { school, dob, name, class: clazz } = request.query;

    const result = await this.studentService.findStudent(
      school as string,
      clazz as string,
      dob as string,
      name as string,
    );

    const students = result.students;
    const count = result.students.length;

    if (count > 5)
      return {
        count,
      };
    else {
      new Logger('ListStudent', false).debug('Generate student tokens');
      const studentWithToken = await Promise.all(
        students.map(async (student) => ({
          ...student,
          id: await this.studentService.generateProfileAccessToken(student.id),
          score: undefined,
        })),
      );
      new Logger('ListStudent', true).debug(
        'Generate student tokens completed',
      );

      return {
        count,
        students: studentWithToken,
      };
    }
  }

  @Get('profile')
  async getStudentProfile(@Req() request: Request) {
    const { student_token: studentToken, encode } = request.query;
    new Logger(`StudentProfile-${studentToken}`, false).debug(
      `Begin getting student profile: ${studentToken}`,
    );

    const studentId = await this.studentService.getAndInvalidateStudentId(
      studentToken as string,
    );
    new Logger(`StudentProfile-${studentToken}`, true).debug(`Got student id`);

    if (!studentId) throw new HttpException('Student token is invalid', 400);

    const studentBaseProfile = await this.studentService.getStudent(
      studentId as string,
    );
    new Logger(`StudentProfile-${studentToken}`, true).debug(`Got student`);

    let base64Photo;
    if (encode === 'true') {
      base64Photo = await this.studentService.encodeStudentPhoto(
        process.env.STORAGE_URL + studentBaseProfile.portrait,
      );
      new Logger(`StudentProfile-${studentToken}`, true).debug(
        `Encoded profile image`,
      );
    }

    return {
      ...studentBaseProfile,
      portrait:
        encode === 'true'
          ? base64Photo
          : process.env.STORAGE_URL + studentBaseProfile.portrait,
      dob: moment(studentBaseProfile.dob).format('yyyy-MM-DD'),
      confirmation: await this.studentService.generateConfirmationToken(
        studentId as string,
      ),
    };
  }

  @Post('token')
  async getStudentToken(@Body() studentTokenRequest: StudentTokenRequest) {
    const studentId = await this.studentService.assertConfirmationToken(
      studentTokenRequest.confirmation,
    );
    if (!studentId)
      throw new HttpException('Confirmation code is invalid', 400);

    this.studentService.requestAuthorization(studentId as string);
    return this.studentService.generateAccessToken(studentId as string);
  }
}
