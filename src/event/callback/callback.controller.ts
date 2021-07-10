import { Body, Controller, Inject, OnModuleInit, Post } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { HifaceCallbackEvent } from './dto/hiface-callback-event';
import { EventService } from '../event.service';
import { mergeMap } from 'rxjs/operators';
import * as moment from 'moment';

@Controller('callback')
export class CallbackController implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private kafka: ClientKafka,
    private eventService: EventService,
  ) {}

  @Post()
  subjectRecognized(@Body() event: HifaceCallbackEvent) {
    this.eventService
      .querySubjectDetail(event.subject_id)
      .pipe(
        mergeMap((detail) => {
          if (detail) {
            return this.kafka.send('student_checked_event', {
              ...detail,
              timestamp: event.timestamp,
              timestamp_date: moment
                .unix(event.timestamp)
                .format('D-M-Y H:m:s'),
            });
          }
        }),
      )
      .subscribe();
    return 'ok';
  }

  onModuleInit(): any {
    this.kafka.subscribeToResponseOf('student_checked_event');
  }
}
