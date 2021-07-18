import { Injectable } from '@nestjs/common';
import { fromPromise } from 'rxjs/internal-compatibility';
import { Observable } from 'rxjs';
import { getManager } from 'typeorm';

@Injectable()
export class EventService {
  querySubjectDetail(subjectId: string): Observable<any> {
    return fromPromise(
      getManager()
        .query(
          `
        SELECT 
        extra_id as student_code,
        real_name as name
        FROM subject
        WHERE extra_id = ?
        `,
          [subjectId],
        )
        .then((result) => (!!result ? result[0] : {})),
    );
  }
}
