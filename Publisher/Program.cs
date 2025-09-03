using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using RabbitMQ.Client;
using Newtonsoft.Json;

namespace EcoPublisher
{
    public class MessageData
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Content { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public string Sender { get; set; } = "EcoPublisher";
        public string MessageType { get; set; } = "Info";
    }

    class Program
    {
        private const string QUEUE_NAME = "eco.messages";
        private const string HOST = "127.0.0.1";
        private const string USERNAME = "admin";
        private const string PASSWORD = "admin123";

        static void Main(string[] args)
        {
            Console.WriteLine("🌱 ECO Case Study - Message Publisher");
            Console.WriteLine("=====================================");
            
            try
            {
                var factory = new ConnectionFactory()
                {
                    HostName = HOST,
                    UserName = USERNAME,
                    Password = PASSWORD
                };

                using var connection = factory.CreateConnection();
                using var channel = connection.CreateModel();

                // Kuyruk oluştur (definitions.json'daki parametrelerle uyumlu)
                var queueArguments = new Dictionary<string, object>
                {
                    {"x-message-ttl", 3600000}, // 1 saat TTL
                    {"x-max-length", 1000}      // Maksimum 1000 mesaj
                };
                
                channel.QueueDeclare(
                    queue: QUEUE_NAME,
                    durable: true,
                    exclusive: false,
                    autoDelete: false,
                    arguments: queueArguments
                );

                Console.WriteLine($"✅ RabbitMQ bağlantısı başarılı! Kuyruk: {QUEUE_NAME}");
                Console.WriteLine("\n📝 Mesaj gönderme seçenekleri:");
                Console.WriteLine("1. Otomatik mesaj gönder (her 5 saniyede bir)");
                Console.WriteLine("2. Manuel mesaj gönder");
                Console.WriteLine("3. Çıkış");
                
                while (true)
                {
                    Console.Write("\nSeçiminizi yapın (1-3): ");
                    var choice = Console.ReadLine();

                    switch (choice)
                    {
                        case "1":
                            StartAutomaticMessaging(channel);
                            break;
                        case "2":
                            SendManualMessage(channel);
                            break;
                        case "3":
                            Console.WriteLine("👋 Çıkılıyor...");
                            return;
                        default:
                            Console.WriteLine("❌ Geçersiz seçim! Lütfen 1, 2 veya 3 girin.");
                            break;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Hata: {ex.Message}");
                Console.WriteLine("🔧 RabbitMQ'nun çalıştığından emin olun (docker-compose up -d)");
            }
        }

        private static void StartAutomaticMessaging(IModel channel)
        {
            Console.WriteLine("\n🤖 Otomatik mesaj gönderimi başladı. Durdurmak için herhangi bir tuşa basın...");
            
            var messageTypes = new[] { "Info", "Warning", "Success", "Update", "Alert" };
            var sampleMessages = new[]
            {
                "Yeni kullanıcı kaydı tamamlandı",
                "Sistem performansı optimal seviyede",
                "Günlük backup işlemi başarılı",
                "Yeni özellik devreye alındı",
                "Sunucu durumu kontrol edildi",
                "Veritabanı optimizasyonu tamamlandı",
                "Kullanıcı oturumu başlatıldı",
                "Sistem güncellemesi mevcut",
                "Güvenlik kontrolü başarılı",
                "API yanıt süresi iyileştirildi"
            };

            var random = new Random();
            int messageCount = 0;

            while (!Console.KeyAvailable)
            {
                var messageType = messageTypes[random.Next(messageTypes.Length)];
                var content = sampleMessages[random.Next(sampleMessages.Length)];
                
                var message = new MessageData
                {
                    Content = content,
                    MessageType = messageType,
                    Timestamp = DateTime.Now
                };

                SendMessage(channel, message);
                messageCount++;
                
                Console.WriteLine($"📤 Mesaj #{messageCount} gönderildi: {content} [{messageType}]");
                
                Thread.Sleep(5000); // 5 saniye bekle
            }
            
            Console.ReadKey(); // Tuşu tüket
            Console.WriteLine($"\n⏹️ Otomatik mesaj gönderimi durduruldu. Toplam {messageCount} mesaj gönderildi.");
        }

        private static void SendManualMessage(IModel channel)
        {
            Console.Write("\n💬 Göndermek istediğiniz mesajı yazın: ");
            var userMessage = Console.ReadLine();
            
            if (string.IsNullOrWhiteSpace(userMessage))
            {
                Console.WriteLine("❌ Boş mesaj gönderilemez!");
                return;
            }

            Console.WriteLine("\n📋 Mesaj tipi seçin:");
            Console.WriteLine("1. Info");
            Console.WriteLine("2. Warning");
            Console.WriteLine("3. Success");
            Console.WriteLine("4. Alert");
            
            Console.Write("Seçim (1-4, varsayılan: 1): ");
            var typeChoice = Console.ReadLine();
            
            var messageType = typeChoice switch
            {
                "2" => "Warning",
                "3" => "Success",
                "4" => "Alert",
                _ => "Info"
            };

            var message = new MessageData
            {
                Content = userMessage,
                MessageType = messageType,
                Timestamp = DateTime.Now
            };

            SendMessage(channel, message);
            Console.WriteLine($"✅ Mesaj başarıyla gönderildi! [{messageType}]");
        }

        private static void SendMessage(IModel channel, MessageData message)
        {
            var json = JsonConvert.SerializeObject(message, Formatting.Indented);
            var body = Encoding.UTF8.GetBytes(json);

            var properties = channel.CreateBasicProperties();
            properties.Persistent = true; // Mesajı kalıcı yap
            properties.MessageId = message.Id;
            properties.Timestamp = new AmqpTimestamp(((DateTimeOffset)message.Timestamp).ToUnixTimeSeconds());

            channel.BasicPublish(
                exchange: "",
                routingKey: QUEUE_NAME,
                basicProperties: properties,
                body: body
            );
        }
    }
}
