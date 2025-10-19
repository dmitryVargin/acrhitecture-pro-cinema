import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';
import { logger } from '../logger';

export type GenericEvent = {
  id: string;
  type: string;
  timestamp: string; // ISO string
  payload: any;
};

export type EventResponse = {
  status: 'success';
  partition: number;
  offset: number;
  event: GenericEvent;
};

@Injectable()
export class EventsService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  private readonly brokers: string[];

  constructor() {
    const brokersEnv = process.env.KAFKA_BROKERS || 'kafka:9092';
    this.brokers = brokersEnv.split(',').map((b) => b.trim()).filter(Boolean);

    this.kafka = new Kafka({
      clientId: 'cinemaabyss-events-service',
      brokers: this.brokers,
      logLevel: logLevel.INFO,
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'events-service-group' });
  }

  async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();

    // Subscribe to topics and log consumed messages
    const topics = ['movie-events', 'user-events', 'payment-events'];
    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: true });
    }

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        await logger.info('[Kafka][Consumed]', {
          topic,
          partition,
          offset: message.offset,
          key: message.key?.toString(),
          value: message.value?.toString(),
          headers: this.headersToLoggable(message.headers),
        });
      },
    });
  }

  async onModuleDestroy() {
    await Promise.allSettled([
      this.consumer.disconnect(),
      this.producer.disconnect(),
    ]);
  }

  private headersToLoggable(headers?: Record<string, any> | null) {
    if (!headers) return undefined;
    const obj: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
      obj[k] = Buffer.isBuffer(v) ? v.toString() : String(v);
    }
    return obj;
  }

  private async publish(topic: string, event: GenericEvent): Promise<EventResponse> {
    const res = await this.producer.send({
      topic,
      messages: [
        {
          key: event.type,
          value: JSON.stringify(event),
          headers: { 'content-type': 'application/json' },
        },
      ],
    });

    const meta = res[0];
    const offset = Number(meta.baseOffset ?? meta.offset ?? '0');
    return {
      status: 'success',
      partition: meta.partition,
      offset,
      event,
    };
  }

  async publishMovie(event: GenericEvent) {
    return this.publish('movie-events', event);
  }

  async publishUser(event: GenericEvent) {
    return this.publish('user-events', event);
  }

  async publishPayment(event: GenericEvent) {
    return this.publish('payment-events', event);
  }
}