import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { getManager } from 'typeorm';

@Processor('tasks')
export class TaskProcessor {
  constructor(private es: ElasticsearchService) {}

  @Process({
    name: 'synchronize_es',
  })
  async synchronize(job: Job) {
    new Logger('ESSynchronize').log(`Executing task`);

    const result = await getManager().query(
      `SELECT 
             extra_id as id, 
             real_name as name, 
             department as school, 
             title as class, 
             birthday as dob
             FROM subject 
             WHERE extra_id IS NOT NULL;
             `,
    );
    new Logger('ESSynchronize', true).log(`Retrieves data`);

    for (const r of result) {
      await this.es.update({
        index: 'student',
        id: r.id,
        body: {
          doc: {
            index: r.id,
            name: r.name,
            school: r.school,
            class: r.class,
            dob: r.dob,
          },
          doc_as_upsert: true,
        },
      });
    }

    new Logger('ESSynchronize', true).log(`Updated data to ES`);
    new Logger('ESSynchronize', true).log(`Synchronization to ES completed`);
    await job.moveToCompleted();
    await job.finished();
  }
}
