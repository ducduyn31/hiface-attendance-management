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
            brokers: [process.env.KAFKA_SERVER],
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
          host: process.env.DATABASE_HOST,
          port: +process.env.DATABASE_PORT,
          username: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_NAME,
          synchronize: false,
        }),
    },
    EventService,
  ],
})
export class EventModule {}
