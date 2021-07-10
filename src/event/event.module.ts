import { Module } from '@nestjs/common';
import { CallbackController } from './callback/callback.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { createConnection } from 'typeorm';
import { EventService } from './event.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'student-recognized',
            brokers: ['localhost:9093'],
          },
        },
      },
    ]),
  ],
  controllers: [CallbackController],
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () =>
        await createConnection({
          type: 'mysql',
          host: 'localhost',
          port: 3307,
          username: 'root',
          password: 'root',
          database: 'koala_online',
          synchronize: false,
        }),
    },
    EventService,
  ],
})
export class EventModule {}
