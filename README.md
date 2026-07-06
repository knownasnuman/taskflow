# 🚀 TaskFlow - Full Stack Project Management Application

<p align="center">
  <img src="mobile/assets/taskflowlogo.png" width="120" alt="TaskFlow App Icon" />
  <br>
  <b>React Native & Node.js tabanlı uçtan uca modern proje yönetim ve gerçek zamanlı iş takip mobil uygulaması.</b>
</p>

<p align="center">
  <a href="https://github.com/knownasnuman/taskflow/releases/tag/v1.0.0">
    <img src="https://img.shields.io/badge/Download-APK-green?style=for-the-badge&logo=android" alt="Download APK" />
  </a>
</p>

---

## 📝 Proje Hakkında (About The Project)

**TaskFlow**, takımların veya bireysel kullanıcıların projelerini, görevlerini ve süreçlerini modern bir arayüz üzerinden gerçek zamanlı olarak yönetebilmesi için geliştirilmiş full-stack bir mobil uygulamadır. 

Backend mimarisinde **Express, Prisma 7 ve Supabase (PostgreSQL)** entegrasyonu ile güçlü, güvenli ve ölçeklenebilir bir RESTful API tasarlandı. Mobil tarafta ise **Expo Router** mimarisi ve **Zustand** state yönetimi kullanılarak akıcı bir kullanıcı deneyimi hedeflendi. Uygulamanın en belirgin özelliklerinden biri, **Socket.IO** sayesinde Kanban board üzerindeki güncellemelerin anlık (real-time) olarak tüm cihazlara yansımasıdır.

---

## 📸 Ekran Görüntüleri (Screenshots)

<p align="center">
  <img src="screenshots/Screenshot_20260706_163006_TaskFlow.jpg" width="220" alt="Splash & Auth" />
  <img src="screenshots/Screenshot_20260706_163117_TaskFlow.jpg" width="220" alt="Profile" />
</p>

<p align="center">
  <img src="screenshots/Screenshot_20260706_163250_TaskFlow.jpg" width="220" alt="Projects" />     
  <img src="screenshots/Screenshot_20260706_163649_TaskFlow.jpg" width="220" alt="Create Task" />
</p>

<p align="center">
  <img src="screenshots/Screenshot_20260706_163748_TaskFlow.jpg" width="220" alt="Project Dashboard" />
  <img src="screenshots/Screenshot_20260706_163803_TaskFlow.jpg" width="220" alt="Calendar View" />
  <img src="screenshots/Screenshot_20260706_163521_One UI Home.jpg" width="220" alt="Notifications" />
</p>

---

## ✨ Özellikler (Features)

* 🔒 **Güvenli Kimlik Doğrulama & Yetkilendirme:** JWT tabanlı auth yapısı ve Rol Bazlı Yetkilendirme (RBAC).
* ⚡ **Gerçek Zamanlı Kanban Board:** Socket.IO entegrasyonu ile sürükle-bırak veya durum güncellemelerinde anlık veri senkronizasyonu.
* 📊 **Gelişmiş İstatistik Paneli:** Proje ve görevlerin tamamlanma oranlarını gösteren görsel grafikler ve analitik veri takibi.
* 🔑 **Güvenli Depolama:** Hassas verilerin ve kullanıcı token'larının cihaz üzerinde donanımsal şifrelemeyle saklanması için `Expo SecureStore` kullanımı.
* 🎨 **Custom UI & Pixel Art:** Özel olarak tasarlanmış pixel-art asset'ler ve modern, göz yormayan dark mode teması.
* 📅 **Takvim Entegrasyonu:** Görevlerin teslim tarihlerine (deadline) göre takvim üzerinden takibi.

---

## 🛠️ Kullanılan Teknolojiler (Tech Stack)

### Backend (Sunucu)
* **Runtime:** Node.js
* **Framework:** Express.js
* **ORM:** Prisma 7
* **Database:** Supabase (PostgreSQL)
* **Real-time:** Socket.IO
* **Authentication:** JSON Web Tokens (JWT) & bcrypt

### Mobile (Frontend)
* **Framework:** React Native (Expo)
* **Navigation:** Expo Router (File-based routing)
* **State Management:** Zustand
* **Network:** Axios
* **Secure Storage:** Expo SecureStore

### DevOps & Deployment
* **Backend Hosting:** Railway (Canlı ortam)
* **Mobile Build:** EAS (Expo Application Services) Build (Android APK)

---

## 🚀 Başlangıç (Getting Started)

Projeyi yerelde çalıştırmak için aşağıdaki adımları takip edebilirsiniz.

### Gereksinimler (Prerequisites)
* Node.js (v18+)
* npm veya yarn
* Expo Go uygulaması (fiziksel cihaz testleri için) ya da Android Emulator

### 1. Depoyu Klonlayın (Clone the Repository)
```bash
git clone [https://github.com/knownasnuman/taskflow.git](https://github.com/knownasnuman/taskflow.git)
cd taskflow
