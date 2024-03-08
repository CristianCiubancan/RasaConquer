using System;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;
using System.Threading;
using StackExchange.Redis;

class Program
{
    static void Main(string[] args)
    {
        ConnectionMultiplexer redis = ConnectionMultiplexer.Connect("localhost");
        IDatabase db = redis.GetDatabase();
        var factory = new ConnectionFactory() { HostName = "localhost", UserName = "user", Password = "password" };

        using (var connection = factory.CreateConnection())
        using (var channel = connection.CreateModel())
        {
            channel.QueueDeclare(queue: "accountQueue",
                                 durable: false,
                                 exclusive: false,
                                 autoDelete: false,
                                 arguments: null);

            Console.WriteLine(" Press [enter] to exit.");
            while (!Console.KeyAvailable) // Keep running until a key is pressed
            {
                var startDate = DateTime.Now;

                var message = new { Id = Guid.NewGuid().ToString(), Date = startDate, Type = "Account" };
                var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));
                var timeBeforeRedis = DateTime.Now;
                db.KeyExists(message.Id);
                var timeAfterRedis = DateTime.Now;
                db.KeyExists(message.Id);
                db.KeyExists(message.Id);
                db.KeyExists(message.Id);
                db.KeyExists(message.Id);
                db.KeyExists(message.Id);
                db.KeyExists(message.Id);
                var timeAfterRedisTotal = timeAfterRedis - timeBeforeRedis;
                Console.WriteLine($"Redis time: {timeAfterRedisTotal.TotalMilliseconds}");
                // lets log if the id exists
                // Console.WriteLine($"The id exists {db.KeyExists(message.Id)}", db.KeyExists(message.Id));

                channel.BasicPublish(exchange: "",
                                     routingKey: "accountQueue",
                                     basicProperties: null,
                                     body: body);

                // Console.WriteLine(" [x] Sent {0}", JsonSerializer.Serialize(message));

                Thread.Sleep(2000); // Sleep for 2 seconds before sending the next message
            }
        }
    }
}
