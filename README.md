# 🏠 HomePulse Backend (API + MQTT + DB)

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-green)](#)  <!-- ajusta la versión -->
[![TypeScript](https://img.shields.io/badge/typescript-4.x-blue)](#)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Home-Pulse-App/backend/ci.yml?branch=main)](https://github.com/Home-Pulse-App/backend/actions)  <!-- si usáis GitHub Actions -->
[![Dependencies](https://img.shields.io/badge/dependencies-up%20to%20date-green)](#)
[![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D4.0-green)](#)
[![MQTT](https://img.shields.io/badge/mqtt-supported-blue)](#)

HomePulse Backend is the core of the smart-home platform.

It provides REST API endpoints, MQTT real-time processing, database storage, authentication, device management, and full Swagger documentation.

This backend communicates with ESP32 devices via MQTT and serves the frontend through REST API.

---

## ✨ Features

- Real-time IoT device monitoring (MQTT)
- ESP32 sensor data (temperature, humidity, motion, relay, etc.) from MQTT topics
- Full CRUD for Homes, Rooms, Devices
- JWT authentication
- MongoDB + Mongoose models
- REST API with validation
- Swagger API documentation
- Clean modular file structure

---

## 🗂 Project Structure

```
backend/
  └── src/
      ├── config/
      ├── controllers/
      ├── middlewares/
      ├── models/
      ├── routes/
      ├── utils/
      ├── validators/
      ├── db.ts
      ├── seed.ts
      ├── server.ts
      └── swagger.config.ts
```

Each folder is responsible for a clean separation of business logic:

- **controllers** – API logic
- **routes** – endpoints
- **models** – Mongoose schemas
- **middlewares** – validation/auth
- **validators** – request validation
- **utils** – helpers
- **config** – server configuration

---

## 📌 User Flow

After authentication, each user can:

- Create/manage **Homes**
- Create/manage **Rooms**
- Add devices to any room
- View real-time device data

---

### Homes

Users may create **any number of homes**.

Home actions:

- ➕ Add Home
- ❌ Delete Home
  Each home contains multiple rooms.

---

### Rooms

A room belongs to a home.
Users can create **unlimited rooms**.

Room actions:

- ➕ Add Room
- Upload 3D _splat file_
- ❌ Delete Room

Rooms act as containers for devices and 3D positioning.

---

### Devices

Devices are assigned directly to rooms.

Each device includes:

- Name
- Type
- Assigned room
- Online/offline state
- Live MQTT data

---

## 🔌 MQTT Communication

HomePulse uses **MQTT as the real-time backbone**.

### Device lifecycle

- Device connects to MQTT
- Publishes sensor data
- Backend receives it via MQTT client
- Backend updates MongoDB + broadcasts to frontend

### Data flow:

IoT Device → MQTT Broker → Backend → MongoDB → Frontend (3D view)

---

## 🔐 Authentication

- Login
- Registration
- Protected routes
- JWT stored securely

---

## 🛠 Tech Stack (Backend)

- Node.js
- Express
- MongoDB + Mongoose
- MQTT (Mosquitto / EMQX)
- JWT
- Swagger

Extra:

- MongoDB (local or cloud)
- MQTT broker

---

## 💻 Installation & Setup

### 🧬 Clone repo

```bash
git clone https://github.com/Home-Pulse-App/backend.git
cd backend
```

### 🧱 Backend setup

```bash
npm install
npm run dev
```

### 🧩 Environment variables

Your `.env` file must include:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/homepulse
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=
MQTT_PASSWORD=
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### 🍃 MongoDB setup

The backend uses **Mongoose** to handle:

- Users
- Houses
- Rooms
- Devices
- Sensor readings (optional depending on your model)

### 📡 MQTT setup

The backend connects to the broker defined in `.env` and subscribes to:

homepulse/{deviceId}/data
homepulse/{deviceId}/status

---

## 📘 API Documentation (Swagger)

The backend provides full Swagger documentation describing all API endpoints:

**What’s included:**

- Full endpoint list
- Request/response schemas
- Validation rules
- JWT authentication documentation
- Error codes
- Example inputs/outputs

**Access Swagger UI:**
`/api/docs`

Full list 🔗 : `http://localhost:3000/api-docs`

You can test APIs directly in the browser, explore descriptions, and validate integrations.

---

## 🧪 Testing

```bash
npm run test
```

### Unit tests use:

- Jest or Vitest
- Supertest for API routes

---

## 🚀 Deployment

### You can deploy via:

- Docker (recommended)
- PM2 + Node
- Railway / Render / Fly.io
- Raspberry Pi (local server)

