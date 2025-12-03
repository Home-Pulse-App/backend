# Home Pulse Server

A robust backend server for the Home Pulse application, built with Express.js, TypeScript, and MongoDB.

## 🚀 Getting Started

### Installation

1. Clone the repository in GitHub
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install required dependencies:
   ```bash
   npm install
   ```

### Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Connection (Required)
MONGO_URI=mongodb://localhost:27017/homepulse

# Authentication (Required)
JWT_SECRET=your_super_secret_jwt_key

# MQTT Configuration 
MQTT_URL=mqtt://4.tcp.eu.ngrok.io:17511
```

### Running the Server

```bash
npm run dev
```
Runs the server with reloading on port 3000.


## 🔌 Connecting to the Server

### Base URL
The server runs on port **3000** by default.
- **Base API URL:** `http://localhost:3000/api`

### API Documentation
Interactive Swagger documentation is available at:
- **URL:** `http://localhost:3000/api-docs`

### Key Endpoints

| Resource | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| **Auth** | POST | `/api/auth/login` | Login to get JWT token |
| **Users** | POST | `/api/users` | Register a new user |
| **Homes** | GET | `/api/homes` | Get user's homes |
| **Devices** | GET | `/api/devices` | Get user's devices |
| **Data** | GET | `/api/device-data/:device` | Get sensor data |

### Authentication
Most endpoints require a Token: 
- You can generate it through registering & logging in via the Swagger Documentation.
```
"token": <your_jwt_token>
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```
Run integration tests:
```bash
npx vitest test/integration/<filename>
```