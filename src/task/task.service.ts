import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class TaskService {
  constructor(@InjectQueue('tasks') private taskQueue: Queue) {
    this.synchronizeES();
  }

  @Cron('0 0 * * * *')
  synchronizeES() {
    new Logger('TaskCron').log('Starting synchronization task');
    this.taskQueue.add('synchronize_es');
  }

  @Cron('0 0 2 * * *')
  cleanCompletedTasks() {
    new Logger('TaskCron').log('Starting cleaning completed tasks');
    this.taskQueue.clean(1);
  }
}
