import { Injectable } from '@nestjs/common';
import { getManager } from 'typeorm';

@Injectable()
export class AttendanceService {
  getAttendance(from: number, to: number, studentId: string) {
    return /*getManager().query(*/`
      SELECT 
          s.real_name,
          s.job_number AS student_id,
          s.remark,
          MIN(t.timestamp) AS check_in,
          MAX(t.timestamp) AS check_out
      FROM
          subject s
              LEFT JOIN
          (SELECT 
              e.subject_id, e.timestamp
          FROM
              event e
          WHERE
              e.timestamp > ${from}
                  AND e.timestamp < ${to}
                  AND e.subject_id IS NOT NULL) t ON t.subject_id = s.id
      WHERE
          s.id = 10128
      GROUP BY s.id
      ORDER BY s.id;
    `;
  }
}