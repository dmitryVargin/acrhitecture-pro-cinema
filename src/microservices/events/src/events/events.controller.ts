import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { EventsService, GenericEvent } from './events.service';
import { MovieEventDto } from './dto/movie-event.dto';
import { UserEventDto } from './dto/user-event.dto';
import { PaymentEventDto } from './dto/payment-event.dto';

@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('health')
  @HttpCode(200)
  health() {
    return { status: true };
  }

  @Post('movie')
  async createMovieEvent(@Body() payload: MovieEventDto) {
    const event: GenericEvent = {
      id: `movie-${Date.now()}`,
      type: 'movie',
      timestamp: new Date().toISOString(),
      payload,
    };
    return this.eventsService.publishMovie(event);
  }

  @Post('user')
  async createUserEvent(@Body() payload: UserEventDto) {
    const event: GenericEvent = {
      id: `user-${Date.now()}`,
      type: 'user',
      timestamp: new Date().toISOString(),
      payload,
    };
    return this.eventsService.publishUser(event);
  }

  @Post('payment')
  async createPaymentEvent(@Body() payload: PaymentEventDto) {
    const event: GenericEvent = {
      id: `payment-${Date.now()}`,
      type: 'payment',
      timestamp: new Date().toISOString(),
      payload,
    };
    return this.eventsService.publishPayment(event);
  }
}