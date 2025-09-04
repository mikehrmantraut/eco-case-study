# Eco Case Study - RabbitMQ Publisher-Consumer

Bu proje, RabbitMQ ile haberleşen .NET Core Publisher ve React Native Consumer uygulamalarını içerir. Mesaj gönderme ve alma işlemlerini gerçek zamanlı olarak gerçekleştirebilen bir sistem oluşturulmuştur.

## 🏗️ Proje Yapısı

```
eco-case-study/
├── docker-compose.yml          # RabbitMQ Docker konfigürasyonu
├── rabbitmq/                   # RabbitMQ konfigürasyon dosyaları
│   ├── rabbitmq.conf           # RabbitMQ sunucu konfigürasyonu
│   └── definitions.json        # Exchange, queue ve kullanıcı tanımları
├── Publisher/                  # .NET Core Console Uygulaması
│   ├── Program.cs              # Ana program kodu
│   └── Publisher.csproj        # Proje dosyası
└── Consumer/                   # React Native Uygulaması
    ├── App.js                  # Ana uygulama bileşeni
    ├── components/             # UI bileşenleri
    │   ├── ConnectionStatus.js # Bağlantı durumu göstergesi
    │   ├── MessageFilter.js    # Mesaj filtreleme bileşeni
    │   ├── MessageItem.js      # Tekil mesaj gösterimi
    │   ├── MessageList.js      # Mesaj listesi
    │   └── MessageStats.js     # Mesaj istatistikleri
    ├── services/               # Servis katmanı
    │   └── RabbitMQService.js  # RabbitMQ bağlantı ve mesaj işlemleri
    ├── theme.js                # Uygulama teması ve stilleri
    └── package.json            # NPM paket konfigürasyonu
```

## 📋 Sistem Gereksinimleri

- **Docker ve Docker Compose** - RabbitMQ sunucusu için
- **.NET 8.0 SDK** - Publisher uygulaması için
- **Node.js (v16+)** - Consumer uygulaması için
- **Expo CLI** - React Native uygulaması için
- **Mobil cihaz veya emülatör** - Consumer uygulamasını test etmek için

## 🚀 Kurulum ve Çalıştırma

### 1. RabbitMQ Kurulumu

```bash
# İlk kurulumda definitions dosyasını oluştur (eğer yoksa)
cp rabbitmq/definitions.template.json rabbitmq/definitions.json

# Docker container'ları başlat
docker-compose up -d

# Logları kontrol et
docker-compose logs -f rabbitmq
```

RabbitMQ başlatıldıktan sonra management arayüzüne erişebilirsiniz:
- **URL:** http://localhost:15672
- **Kullanıcı:** admin
- **Şifre:** admin123

### 2. Publisher Uygulamasını Çalıştırma (.NET Core)

```bash
# Publisher klasörüne git
cd Publisher

# Uygulamayı derle
dotnet build

# Uygulamayı çalıştır
dotnet run
```

Publisher uygulaması çalıştığında, komut satırı arayüzü üzerinden farklı türlerde mesajlar gönderebilirsiniz:
- **1** - Bilgi mesajı gönder
- **2** - Uyarı mesajı gönder
- **3** - Başarı mesajı gönder
- **4** - Alarm mesajı gönder
- **5** - Otomatik mesaj göndermeyi başlat/durdur
- **6** - Bağlantıyı kapat ve çık

### 3. Consumer Uygulamasını Çalıştırma (React Native)

```bash
# Consumer klasörüne git
cd Consumer

# Bağımlılıkları yükle
npm install

# Uygulamayı başlat
npm start
```

Expo geliştirici araçları başladıktan sonra:
- QR kodunu mobil cihazınızdaki Expo Go uygulamasıyla tarayabilir
- Android emülatörü için `a` tuşuna basabilir
- iOS simülatörü için `i` tuşuna basabilir

#### RabbitMQ Bağlantı Ayarları (Consumer)

Consumer uygulamasında RabbitMQ sunucusuna bağlanmak için `services/RabbitMQService.js` dosyasındaki bağlantı ayarlarını kendi ortamınıza göre düzenlemeniz gerekebilir:

```javascript
// RabbitMQ Web STOMP settings
this.host = '192.168.1.22';  // RabbitMQ sunucu IP adresi
this.port = 15674;           // Web STOMP port
this.username = 'admin';     // Kullanıcı adı
this.password = 'admin123';  // Şifre
this.vhost = '/';            // Virtual host
```

> **Not:** Mobil cihazdan bağlanırken, RabbitMQ sunucusunun IP adresini bilgisayarınızın gerçek IP adresi olarak ayarlamanız gerekir. Localhost veya 127.0.0.1 çalışmayacaktır.

## 💡 Uygulama Özellikleri

### Publisher (.NET Core)
- Farklı türlerde mesaj gönderme (Bilgi, Uyarı, Başarı, Alarm)
- Otomatik mesaj gönderme modu
- Bağlantı durumu kontrolü
- Hata yönetimi

### Consumer (React Native)
- Gerçek zamanlı mesaj alma
- Mesaj filtreleme (türe göre)
- Mesaj arama (içerik ve gönderene göre)
- Mesaj istatistikleri
- Mesaj silme (kaydırarak)
- Yenile butonu ile manuel güncelleme
- Bağlantı durumu göstergesi
- Yeni mesaj bildirimi

## 🔧 Sorun Giderme

### RabbitMQ Bağlantı Sorunları

```bash
# Container durumunu kontrol et
docker ps

# RabbitMQ loglarını kontrol et
docker-compose logs rabbitmq

# Container'ı yeniden başlat
docker-compose restart rabbitmq
```

### WebSocket Bağlantı Hataları

Eğer Consumer uygulamasında WebSocket bağlantı hataları alıyorsanız:

1. RabbitMQ sunucusunun çalıştığından emin olun
2. Doğru IP adresi ve port kullandığınızı kontrol edin
3. Firewall ayarlarınızın WebSocket bağlantılarına izin verdiğinden emin olun
4. RabbitMQService.js dosyasındaki bağlantı ayarlarını kontrol edin

### Port Çakışması

Eğer 5672, 15672 veya 15674 portları kullanımdaysa, `docker-compose.yml` dosyasında port mapping'lerini değiştirin.

## 📡 Bağlantı Bilgileri

- **AMQP Port:** 5672
- **Management Port:** 15672
- **Web STOMP Port:** 15674
- **Username:** admin
- **Password:** admin123
- **Virtual Host:** /
- **Exchange:** eco.exchange
- **Queue:** eco.messages
- **Routing Key:** eco.message.route

## 🔒 Güvenlik Notları

⚠️ **ÖNEMLİ:** 
- `rabbitmq/definitions.json` dosyası password hash içerdiği için Git'e commit edilmez
- İlk kurulumda `definitions.template.json` dosyasından kopyalayın
- Production ortamında mutlaka güçlü şifreler kullanın
- Bu dosyayı asla public repository'lerde paylaşmayın

## 🌟 Geliştirme İpuçları

### Consumer Uygulaması (React Native)

- Mesaj listesi en yeni mesajlar üstte olacak şekilde sıralanır
- Filtreleme yapıldığında istatistikler filtrelenmiş mesajlara göre güncellenir
- Yenile butonu ile istediğiniz zaman mesaj listesini güncelleyebilirsiniz
- Mesajları kaydırarak silebilirsiniz
- Mesajlara tıklayarak içeriği genişletebilirsiniz

### Publisher Uygulaması (.NET Core)

- Otomatik mesaj gönderme modunu kullanarak sürekli test mesajları oluşturabilirsiniz
- Farklı mesaj türleri seçerek filtreleme özelliğini test edebilirsiniz
- Mesaj içeriğini kendiniz belirleyebilirsiniz