import { Message, Stan } from "node-nats-streaming";
import { SubjectsEnum } from "../enums/event-subject.enum";

interface Event{
    subject: SubjectsEnum;
    data: any;
}

export abstract class ListenerAbstract<T extends Event> {
    abstract subject: T['subject'];
    // queueGroupName is the name of the group this listener belongs to
    abstract queueGroupName: string;
    abstract onMessage(data: T['data'], msg: any): void;

    protected client: Stan;
    protected ackWait = 5 * 1000; // 5 seconds

    constructor(client: Stan) {
        this.client = client;
    }

    subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable() // When the listener starts, it will receive all messages that have ever been published to the subject, not just new ones. Useful for replaying events.
      .setManualAckMode(true) // Handle ACK Mode Manually
      .setAckWait(this.ackWait) // Wait 5 seconds before resending the message
      // Assigns a durable name to the subscription.
      // This allows the server to remember the last acknowledged message for this listener,
      // so if it disconnects and reconnects,
      // it will only receive new messages (not ones it already processed).
      .setDurableName(this.queueGroupName); 
    }

    listen(){
        const subcriptions = this.client.subscribe(
            this.subject,
            this.queueGroupName,
            this.subscriptionOptions()
        )
        
        subcriptions.on("message", (msg: any) => {
            console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);
            const parsedData = this.parseMessage(msg);
            this.onMessage(parsedData, msg);
        });
    }

    parseMessage(msg: Message) {
        const data = msg.getData();
        return typeof data === 'string'
            ? JSON.parse(data)
            : JSON.parse(data.toString('utf8'));
    }
}