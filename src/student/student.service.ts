import {
  CACHE_MANAGER,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { nanoid, customAlphabet } from 'nanoid';
import { Cache } from 'cache-manager';
import { getManager } from 'typeorm';
import * as encodeImage from 'image-to-base64';

@Injectable()
export class StudentService {
  constructor(
    private es: ElasticsearchService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findStudent(school: string, clazz: string, dob: string, name: string) {
    new Logger('ListStudent', false).debug('Finding students');
    const buildAndQuery = () => {
      const query = [];

      const singularMatchCondition = (key: string, value: string) => ({
        match: {
          [key]: {
            query: value,
            fuzziness: 2,
            analyzer: 'vi_analyzer',
          },
        },
      });

      const dateCondition = (key: string, value: string) => ({
        range: {
          [key]: {
            gte: value,
            lte: value,
          },
        },
      });

      if (school) query.push(singularMatchCondition('school', school));
      if (clazz) query.push(singularMatchCondition('class', clazz));
      if (dob) query.push(dateCondition('dob', dob));
      if (name) query.push(singularMatchCondition('name', name));

      return query;
    };

    try {
      const result = await this.es.search({
        index: 'student',
        body: {
          query: {
            bool: {
              must: buildAndQuery(),
            },
          },
        },
      });
      new Logger('ListStudent', true).debug('Find students completed.');

      const maxScore = result.body.hits?.max_score;

      return result.body?.hits?.hits
        ?.filter((doc) => doc._score >= maxScore * 0.9)
        .map((doc) => ({
          id: doc._source.index,
          name: doc._source.name,
          class: doc._source.class,
          dob: doc._source.dob,
          school: doc._source.school,
          score: doc._score,
        }))
        .reduce(
          (accumulator, item) => {
            accumulator.students.push(item);
            return accumulator;
          },
          { maxScore, students: [] },
        );
    } catch (e) {
      if (e.message.includes('[parse_exception]'))
        throw new HttpException('dob format must be yyyy-MM-dd', 400);
      throw new HttpException(e.message, 400);
    }
  }

  async generateProfileAccessToken(studentId: string) {
    const token = nanoid(10);

    await this.cacheManager.set(token, studentId, { ttl: 300 });

    return token;
  }

  async getAndInvalidateStudentId(studentToken: string) {
    const id = await this.cacheManager.get(studentToken);
    this.cacheManager.del(studentToken);
    return id;
  }

  async getStudent(studentId: string) {
    return getManager()
      .query(
        `
        SELECT
        subject.real_name as name,
        subject.department as school,
        subject.title as class,
        subject.birthday as dob,
        photo.url as portrait
        FROM subject
        INNER JOIN photo
        ON subject.id = photo.subject_id
        WHERE subject.extra_id = ?;
        `,
        [studentId],
      )
      .then((result) => (!!result ? result[0] : {}));
  }

  async encodeStudentPhoto(url: string) {
    return await encodeImage(url);
  }

  async generateConfirmationToken(studentId: string) {
    const generate = await customAlphabet('0123456789', 6);
    const token = generate();
    this.cacheManager.set(`confirmation-${token}`, studentId, {
      ttl: 60,
    });

    return token;
  }

  async assertConfirmationToken(token: string) {
    return await this.cacheManager.get(`confirmation-${token}`);
  }

  async generateAccessToken(studentId: string) {
    return {
      access_token: studentId,
      access_token_ttl: -1,
      refresh_token: studentId,
      refresh_token_ttl: -1,
    };
  }

  async generateAuthorizationToken(studentId: string) {
    const generate = await customAlphabet('0123456789', 6);
    const token = generate();

    this.cacheManager.set(`authorization-${token}`, studentId, {
      ttl: 300,
    });

    return token;
  }

  async requestAuthorization(studentId: string, details?: string) {
    const phones = await getManager()
      .query(
        `
        SELECT
        subject.remark as parents
        FROM subject
        WHERE subject.extra_id = ?;
        `,
        [studentId],
      )
      .then((result) => (!!result ? result[0].parents.split('|') : []));

    const token = await this.generateAuthorizationToken(studentId);
    console.log(token);
  }
}
