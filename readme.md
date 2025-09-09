# PrepBotAI API

A Node.js REST API for generating, managing, and exporting MCQs, with user authentication, subscriptions, and PDF export features.  
Built as a learning, portfolio, and potential product project.

---

## 🚀 Features

- User registration, login, JWT authentication
- MCQ generation (AI-powered), search, and submission
- PDF export of MCQs
- Subscription tiers (Free, Pro, Pro Plus) with usage limits
- Payment integration ready (Razorpay)
- Rate limiting, error handling, and input validation

---

## 🛠️ Tech Stack

- Node.js, Express.js
- MongoDB & Mongoose
- JWT for authentication
- Gemini AI for MCQ generation
- pdfkit/markdown-pdf for PDF export
- Razorpay (for payments)
- Joi for validation

---

## 📦 Setup

1. **Clone the repo**
   ```sh
   git clone https://github.com/Mayur-00/API-PrepBotAi.git
   cd prepBotAi-API
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   ACCESS_KEY=your_jwt_access_secret
   ACCESS_KEY_EXPIRY=1h
   REFRESH_TOKEN_KEY=your_jwt_refresh_secret
   REFRESH_TOKEN_KEY_EXPIRY=7d
   CORS_ORIGIN=http://localhost:3000
   GEMINI_API_KEY=your_gemini_api_key
   MODEL_NAME=your_gemini_model_name
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   NODE_ENV=development
   ```

4. **Run the server**
   ```sh
   npm start
   ```

---

## 📚 API Endpoints (Sample)

### Auth
- `POST /api/v1/auth/register` – Register user
- `POST /api/v1/auth/login` – Login user
- `POST /api/v1/auth/logout` – Logout user

### MCQ
- `POST /api/v1/mcq/generate` – Generate MCQs from text/PDF
- `GET /api/v1/mcq/getAllMcqs` – Get all MCQs (with pagination)
- `GET /api/v1/mcq/get?id=...` – Get a single MCQ
- `GET /api/v1/mcq/export/:id` – Export MCQ as PDF

### Subscription
- `POST /api/v1/subscription/subscribe` – Subscribe to a plan
- `POST /api/v1/subscription/verify-payment` – verify payment created by user
- `GET /api/v1/subscription/get-plans` – Get current subscription plans

### Analytics
- `GET /api/v1/analytics/user` – Get user stats

---

## 📝 Project Structure

```
src/
  controllers/      # Route handlers
  models/           # Mongoose schemas
  routes/           # Express routes
  services/         # Business logic (AI, PDF, payments)
  middlewares/      # Auth, error, subscription checks
  utils/            # Helpers, error classes, validation
```

---

## 🧑‍💻 Learning Outcomes

- Secure authentication and session management
- AI integration for content generation
- Usage-based subscription logic
- PDF export and file streaming
- Clean, modular codebase

---

