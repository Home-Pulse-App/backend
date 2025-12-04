# Home Pulse Server

The Home-Pulse backend is responsible for:
- Managing users, houses, rooms, and IoT devices
- Receiving real-time sensor data from MQTT topics
- Storing device data in MongoDB via Mongoose
- Exposing a secure REST API for the frontend
- Serving WebSocket/MQTT-driven updates

---

## 🚀 Overview

This service acts as the bridge between your IoT devices and the Home-Pulse frontend.

**Flow:**

IoT Device → MQTT Broker → Backend → MongoDB → Frontend (3D view)

---

## 📂 Project Structure

backend/
├── src/
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ ├── utils/
│ ├── app.ts
│ └── server.ts
├── tests/
├── .env.example
└── package.json

---

## ⚙️ Requirements

- **Node.js 18+**
- **MongoDB** (local or cloud)
- **MQTT Broker** (Mosquitto, EMQX, or hosted)
- **npm** or **yarn**

---
## 🧩 Environment Variables

Your `.env` file must include:

PORT=3000

'#'Mongo

MONGO_URI=mongodb://localhost:27017/homepulse

'#' MQTT Broker

MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=
MQTT_PASSWORD=

JWT

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
---

## 🧱 MongoDB Setup

The backend uses **Mongoose** to handle:

- Users
- Houses
- Rooms
- Devices
- Sensor readings (optional depending on your model)

---

## 📡 MQTT Setup

The backend connects to the broker defined in `.env` and subscribes to:

homepulse/{deviceId}/data
homepulse/{deviceId}/status

---

## ▶️ Running the Backend

```bash
npm install
npm run dev

```

### The backend exposes:

http://localhost:3000/api — REST API

http://localhost:3000/api-docs — Swagger UI

## 🔐 Authentication

Authentication is handled with JWT.

### Flow:

- Create user
- Login → receive JWT
- Attach token in Authorization: Bearer <token>
- Access protected routes

## 📚 API Documentation

### API endpoints include:

/auth → create user, login, refresh
/houses → CRUD
/rooms → CRUD
/devices → CRUD + assign to rooms
/sensor → real-time device updates

Full list is in: http://localhost:3000/api-docs

## 🔌 Device Lifecycle

- Device connects to MQTT
- Publishes sensor data
- Backend receives it via MQTT client
- Backend updates MongoDB + broadcasts to frontend

## 🧪 Testing

```bash
npm run test
```

### Unit tests use:

- Jest or Vitest
- Supertest for API routes

## 🚀 Deployment

### You can deploy via:

- Docker (recommended)
- PM2 + Node
- Railway / Render / Fly.io
- Raspberry Pi (local server)