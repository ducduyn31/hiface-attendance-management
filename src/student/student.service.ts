import { HttpException, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class StudentService {
  constructor(private es: ElasticsearchService) {}

  async findStudent(school: string, clazz: string, dob: string, name: string) {
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

      const maxScore = result.body.hits.max_score;

      return result.body?.hits?.hits
        ?.filter((doc) => doc._score >= maxScore * 0.9)
        .map((doc) => ({
          id: doc._source.index,
          name: doc._source.name,
          class: doc._source.class,
          dob: doc._source.dob,
          school: doc._source.school,
        }));
    } catch (e) {
      if (e.message.includes('[parse_exception]'))
        throw new HttpException('dob format must be yyyy-MM-dd', 400);
    }
  }
}
