# Eco Case Study - RabbitMQ Publisher-Consumer

Bu proje RabbitMQ ile haberleşen .NET Core Publisher ve React Native Consumer uygulamalarını içerir.

## 🏗️ Proje Yapısı

```
eco-case-study/
├── docker-compose.yml          # RabbitMQ Docker konfigürasyonu
├── rabbitmq/                   # RabbitMQ konfigürasyon dosyaları
│   ├── rabbitmq.conf
│   └── definitions.json
├── publisher/                  # .NET Core Console App (yakında)
└── consumer-mobile/            # React Native App (yakında)
```

## 🚀 Kurulum ve Çalıştırma

### 1. RabbitMQ Konfigürasyonu

```bash
# İlk kurulumda definitions dosyasını oluştur
cp rabbitmq/definitions.template.json rabbitmq/definitions.json

# Gerekirse definitions.json dosyasındaki password hash'i güncelle
# (Varsayılan: admin/admin123)
```

### 2. RabbitMQ'yu Başlatma

```bash
# Docker container'ları başlat
docker-compose up -d

# Logları kontrol et
docker-compose logs -f rabbitmq
```

### 2. RabbitMQ Management UI

RabbitMQ başlatıldıktan sonra management arayüzüne erişebilirsiniz:

- **URL:** http://localhost:15672
- **Kullanıcı:** admin
- **Şifre:** admin123

### 3. Bağlantı Bilgileri

- **AMQP Port:** 5672
- **Management Port:** 15672
- **Username:** admin
- **Password:** admin123
- **Virtual Host:** /
- **Exchange:** eco.exchange
- **Queue:** eco.messages
- **Routing Key:** eco.message.route

## 📋 Önceden Yapılandırılmış Kaynaklar

RabbitMQ başlatıldığında otomatik olarak şu kaynaklar oluşturulur:

- ✅ **Exchange:** `eco.exchange` (direct type)
- ✅ **Queue:** `eco.messages` (durable, TTL: 1 saat, Max Length: 1000)
- ✅ **Binding:** Exchange'den queue'ya routing
- ✅ **User:** admin kullanıcısı (administrator yetkili)

## 🔧 Geliştirme

### Sonraki Adımlar:
1. ✅ RabbitMQ Docker kurulumu
2. 🔄 .NET Core Publisher geliştirme
3. 🔄 React Native Consumer geliştirme
4. 🔄 UI/UX tasarımı
5. 🔄 Entegrasyon testleri

## 🐛 Sorun Giderme

### RabbitMQ bağlantı sorunları:
```bash
# Container durumunu kontrol et
docker ps

# RabbitMQ loglarını kontrol et
docker-compose logs rabbitmq

# Container'ı yeniden başlat
docker-compose restart rabbitmq
```

### Port çakışması:
Eğer 5672 veya 15672 portları kullanımdaysa, `docker-compose.yml` dosyasında port mapping'lerini değiştirin.

## 🔒 Güvenlik Notları

⚠️ **ÖNEMLİ:** 
- `rabbitmq/definitions.json` dosyası password hash içerdiği için Git'e commit edilmez
- İlk kurulumda `definitions.template.json` dosyasından kopyalayın
- Production ortamında mutlaka güçlü şifreler kullanın
- Bu dosyayı asla public repository'lerde paylaşmayın

