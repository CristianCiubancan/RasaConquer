import amqp from "amqplib";
import Redis from "ioredis";

const redis = new Redis();

async function start() {
  const conn = await amqp.connect("amqp://user:password@localhost");
  const channel = await conn.createChannel();

  const queues = ["accountQueue", "gameQueue"];

  queues.forEach(async (queue) => {
    await channel.assertQueue(queue, { durable: false });
    console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

    channel.consume(
      queue,
      async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          const message = JSON.parse(messageContent);
          const messageId = message.Id;

          // Check if the ID already exists in Redis
          const exists = await redis.get(messageId);
      // Parse the date and force it into UTC by constructing a new Date object
      const receivedDate = new Date(message.Date);
      const startTimeUtc = Date.UTC(
        receivedDate.getUTCFullYear(),
        receivedDate.getUTCMonth(),
        receivedDate.getUTCDate(),
        receivedDate.getUTCHours(),
        receivedDate.getUTCMinutes(),
        receivedDate.getUTCSeconds(),
        receivedDate.getUTCMilliseconds()
      );

      // Get the current time in milliseconds since epoch in UTC
      const currentTimeUtc = Date.now();
      
      // Calculate the time difference
      const timeElapsed = currentTimeUtc - startTimeUtc;
      
      console.log(`[x] Received and processed message: ${messageContent}`);
      console.log(`startTime (UTC): ${new Date(startTimeUtc).toISOString()}`);
      console.log(`currentTime (UTC): ${new Date(currentTimeUtc).toISOString()}`);
      console.log(`timeElapsed: ${timeElapsed}ms`);

          if (!exists) {
            // Add the ID to Redis to mark it as seen
            await redis.set(messageId, "1", "EX", 60); // Expires after 60 seconds

            console.log(
              `[x] Received and processed message: ${messageContent}`
            );
          } else {
            console.log(`Duplicate ID: ${messageId}`);
          }
        }
      },
      {
        noAck: false,
      }
    );
  });
}

start().catch(console.warn);
