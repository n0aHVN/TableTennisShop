import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import { expirationQueue } from '../../queues/expiration-queue';
import { ListenerAbstract, OrderCreatedEventInterface, SubjectsEnum } from '@tabletennisshop/common';

export class OrderCreatedListener extends ListenerAbstract<
  OrderCreatedEventInterface
> {
  subject: SubjectsEnum.OrderCreated = SubjectsEnum.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEventInterface['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

    await expirationQueue.add(
      {
        orderId: data._id
      },
      {
        delay,
      }
    );

    msg.ack();
  }
}
