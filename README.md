# 🏠 HomePulse – Backend (API + MQTT + DB)

HomePulse Backend is the core of the smart-home platform, providing REST API endpoints, MQTT real-time processing, WebSocket updates, database storage, authentication, device management, and full Swagger documentation.

This backend communicates with ESP32 devices via MQTT and serves the frontend through REST API + WebSockets.

---

## ✨ Features

- Real-time IoT device monitoring (MQTT)
- ESP32 sensor data (temperature, humidity, motion, relay, etc.)
- Full CRUD for Homes, Rooms, Devices
- JWT authentication
- MongoDB + Mongoose models
- REST API with validation
- WebSockets for live updates (Future)
- Swagger API documentation
- Clean modular file structure

---

## 🗂 Project Structure

```
server/
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

## 📌 Application Architecture Overview

### 1. User Flow
After authentication, each user can:
- Create/manage **Homes**
- Create/manage **Rooms**
- Add devices to any room
- View real-time device data
- Access WebSocket-powered live updates

---

### 2. Homes
Users may create **any number of homes**.

Home actions:
- ➕ Add Home
- ❌ Delete Home  
Each home contains multiple rooms.

---

### 3. Rooms
A room belongs to a home.  
Users can create **unlimited rooms**.

Room actions:
- ➕ Add Room  
- Upload 3D *splat file*  
- ❌ Delete Room  

Rooms act as containers for devices and 3D positioning.

---

### 4. Devices
Devices are assigned directly to rooms.

Supported types:
- Temperature sensor  
- Humidity sensor  
- Motion sensor  
- Smart plug / relay  
- Any custom MQTT-based sensor  

Each device includes:
- Name  
- Type  
- Assigned room  
- Online/offline state  
- Live MQTT data  

---

## 🔌 MQTT Communication

HomePulse uses **MQTT as the real-time backbone**.

### Data flow:
1. ESP32 publishes messages → MQTT topic  
2. Backend subscribes and listens  
3. Data saved to MongoDB  
4. WebSocket pushes updates to frontend  
5. Frontend renders updated values instantly  

Supports:
- Temperature / humidity updates  
- Motion events  
- Relay control  
- Device online/offline tracking  

---

## 🔐 Authentication

- User registration  
- Login  
- JWT token system  
- All user resources connected via userId  

---

## 🛠 Tech Stack (Backend)
- Node.js  
- Express  
- MongoDB + Mongoose  
- MQTT (Mosquitto / EMQX)  
- JWT  
- Swagger  
- WebSockets  

Extra:
- MongoDB (local or cloud)  
- MQTT broker  

---

## 💻 Installation & Setup

### 1. Clone
```bash
git clone <repo-url>
cd HomePulse
```

### 2. Backend setup
```bash
cd server
npm install
npm run dev
```

Environment variables:
```
MONGO_URI=
JWT_SECRET=
MQTT_URL=
```

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

You can test APIs directly in the browser, explore descriptions, and validate integrations.

---

## 📄 License

Private project – internal development only.
