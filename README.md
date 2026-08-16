# 💰 Expense Splitter

A full-stack **MERN** application for managing groups, splitting expenses, tracking balances, and settling payments between group members.

The application supports both equal and unequal expense splitting, payment tracking, group administration, balance summaries, expense search/filtering, and sorting.

---

## 🚀 Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Protected backend routes
- Authentication middleware

### 👥 Group Management
- Create groups
- View groups
- Edit group name
- Add members
- Remove members
- Leave a group
- Transfer admin privileges
- Delete a group when applicable
- Creator becomes the initial admin
- Admin controls are based on the current admin, not only the creator

### 💸 Expense Management
- Add expenses
- Edit expenses
- View group expenses
- Equal splitting
- Unequal/custom splitting
- Expense descriptions
- Expense names
- Expense amount validation
- Prevent invalid split totals

### 💳 Payment Tracking
- Track individual member payments
- Mark a member's split as paid
- Automatically consider the payer's split as paid
- Record payment date/time
- View payment history
- Prevent invalid payment operations

### 📊 Balance Summary
Track:
- Amount you owe
- Amount others owe you
- Net balance

### 🔎 Search & Filter
**Search expenses by:**
- Expense name
- Description

**Filter expenses by:**
- All
- You Paid
- You Owe
- You Received
- Paid

### ↕️ Expense Sorting
Sort expenses by:
- Newest
- Oldest
- Highest amount
- Lowest amount

---

## 🛠️ Tech Stack

**Frontend**
- React
- React Router
- Axios
- React Hot Toast
- JavaScript
- HTML
- CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt

**Database**
- MongoDB

---

## 🏗️ Project Structure

```
Expense-Splitter/
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── ...
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

## 🧠 Core Expense Logic

### Equal Split
For example, if an expense of ₹900 is shared between three members:

```
₹900 / 3 = ₹300
```

The splits become:

| Member   | Split |
|----------|-------|
| Member 1 | ₹300  |
| Member 2 | ₹300  |
| Member 3 | ₹300  |

### Unequal Split
Members can also have different split amounts.

**Example — Total Expense = ₹1000**

| Member   | Split |
|----------|-------|
| Member 1 | ₹200  |
| Member 2 | ₹500  |
| Member 3 | ₹300  |

The application validates that:
> Sum of all splits = Total expense amount

### 💳 Payment Logic
The payer does not owe themselves. Therefore, when an expense is created:

| Role          | `paid` status |
|---------------|----------------|
| Payer         | `true`         |
| Other members | `false`        |

**Example — Expense = ₹900**

| Member              | Split | Status  |
|---------------------|-------|---------|
| Yashwanth (Payer)   | ₹300  | Paid    |
| Rahul                | ₹300  | Pending |
| Arun                 | ₹300  | Pending |

The payer's `paid = true` represents that the payer has no amount to pay themselves — it does **not** represent an actual payment made to themselves.

When another member pays their split, that split is marked as paid and the payment time is recorded.

---

## 🔒 Authorization & Business Validation

Authentication and authorization are handled on the backend. Protected routes use authentication middleware to verify the logged-in user.

The backend performs business validations for operations such as:
- Accessing protected resources
- Group administration
- Adding and removing members
- Transferring admin privileges
- Leaving groups
- Deleting groups
- Adding expenses
- Editing expenses
- Marking expense splits as paid
- Validating split amounts
- Preventing invalid payment operations

> Frontend restrictions are used for user experience, while backend validation remains responsible for enforcing permissions and business rules.

---

## 👑 Group Administration

When a group is created, the creator becomes the initial admin.

The admin can:
- Add members
- Remove members
- Transfer admin privileges
- Perform other administrative group operations

The admin role is based on the group's current `admin` field rather than permanently depending on the creator — this allows administration to be transferred to another member.

---

## 💰 Balance Calculation

The application provides both group-level and user-level balance calculations.

**Amount You Owe**
The total amount of unpaid expense splits belonging to the current user.
```
Amount You Owe = Sum of your unpaid splits
```

**Amount You Receive**
The amount that other members still owe you when you are the payer.
```
Amount You Receive = Sum of unpaid member splits for your expenses
```

**Net Balance**
```
Net Balance = Amount You Receive − Amount You Owe
```

---

## 🔄 Expense Payment Flow

```
Create Expense
      │
      ▼
Create Splits
      │
      ├── Payer → paid = true
      │
      └── Members → paid = false
                    │
                    ▼
             Member makes payment
                    │
                    ▼
             Mark split as paid
                    │
                    ▼
               Record paidAt
                    │
                    ▼
              Update balances
```

## 🔎 Search & Filter Flow

```
All Expenses
      │
      ▼
Search by expense name / description
      │
      ▼
Apply Filter
      │
      ├── All
      ├── You Paid
      ├── You Owe
      ├── You Received
      └── Paid
      │
      ▼
Apply Sorting
      │
      ├── Newest
      ├── Oldest
      ├── Highest Amount
      └── Lowest Amount
      │
      ▼
Display Expenses
```

---

## 🌐 API Documentation

**Base URL:** `/api`

All protected routes require a JWT token:
```
Authorization: Bearer <token>
```

### 🔐 Authentication API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Creates a new user account. |
| `POST` | `/api/auth/login` | Authenticates a user and returns authentication information. |
| `POST` | `/api/auth/forgot-password` | Initiates the forgot-password process. |
| `POST` | `/api/auth/reset-password/:token` | Resets the user's password using the reset token. |
| `GET`  | `/api/auth/getprofile` | 🔒 Returns the profile of the authenticated user. |

### 👥 Group API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST`   | `/api/groups` | 🔒 Creates a new group. The creator becomes the initial admin. |
| `GET`    | `/api/groups` | 🔒 Returns the groups that the logged-in user belongs to. |
| `GET`    | `/api/groups/:groupId` | 🔒 Returns details of a specific group. |
| `POST`   | `/api/groups/:groupId/members` | 🔒 Adds a member to a group. |
| `PATCH`  | `/api/groups/:groupId` | 🔒 Updates group details such as the group name. |
| `PATCH`  | `/api/groups/:groupId/admin` | 🔒 Transfers administrative privileges to another group member. |
| `DELETE` | `/api/groups/:groupId/leave` | 🔒 Allows the authenticated user to leave the group, subject to business rules. |
| `DELETE` | `/api/groups/:groupId/members/:userId` | 🔒 Removes a member from the group, subject to authorization and business rules. |
| `DELETE` | `/api/groups/:groupId` | 🔒 Deletes a group, subject to the application's group deletion rules. |

### 💸 Expense API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST`  | `/api/expenses/:groupId` | 🔒 Creates an expense inside a group. Supports equal and unequal splitting. |
| `GET`   | `/api/expenses/:groupId` | 🔒 Returns all expenses belonging to a group. |
| `PATCH` | `/api/expenses/:expenseId/pay/:userId` | 🔒 Marks a particular member's expense split as paid. |
| `GET`   | `/api/expenses/single/:expenseId` | 🔒 Returns details of a specific expense. |
| `PUT`   | `/api/expenses/edit/:expenseId` | 🔒 Updates an existing expense, validating split information per business rules. |
| `GET`   | `/api/expenses/:groupId/balance` | 🔒 Returns the balance information for a group. |
| `GET`   | `/api/expenses/getmybalance` | 🔒 Returns the authenticated user's overall balance information. |

🔒 = Protected route (requires JWT)

---

## ⚙️ Installation & Setup

### 🌐 Live Application

The Expense Splitter application is deployed and can be accessed here:

**Frontend:**
https://expense-splitter-87tqtbjh6-legends-b3fc.vercel.app/

**Backend:**
https://expense-splitter-y4zj.onrender.com/

The application uses:
- **Vercel** — Frontend hosting
- **Render** — Backend hosting
- **MongoDB Atlas** — Database

You can directly open the frontend URL and create an account to use the application.

---

### 💻 Run Locally

If you want to run the project on your own system, follow the steps below.

### 1. Clone the Repository
```bash
git clone https://github.com/yashwanthtm25/Expense-Splitter.git
cd Expense-Splitter
```

### 2. 🖥️ Backend Setup
```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory.

Example:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
RESEND_API_KEY=your_resend_api_key
```

Then start the backend:
```bash
npm start
# or, if nodemon is configured:
npm run dev
```

The backend will run on:
`http://localhost:5000`

### 3. 💻 Frontend Setup
Open another terminal:
```bash
cd client
npm install
```

Create a `.env` file inside the `client` directory:
```env
VITE_API_URL=http://localhost:5000
```

Then start the frontend:
```bash
npm run dev
```

Open the URL shown by Vite in the terminal.
Usually:
`http://localhost:5173`

---

## 🔐 Environment Variables

For security reasons, environment variables are not included in the repository.

### Backend
The `server/.env` file requires:

| Variable | Description |
|----------|-------------|
| `PORT` | Port on which the Express server runs |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key used for JWT authentication |
| `CLIENT_URL` | Frontend URL used for password reset links |
| `RESEND_API_KEY` | Resend API key used to send password reset emails |

### Frontend
The `client/.env` file requires:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

For local development:
```env
VITE_API_URL=http://localhost:5000
```

For the deployed application:
```env
VITE_API_URL=https://expense-splitter-y4zj.onrender.com
```

> ⚠️ Never commit `.env` files or API keys to GitHub. Make sure `.env` is included in `.gitignore`:
```
node_modules/
.env
```

---

## 🛡️ Security

The application uses several security mechanisms:
- JWT-based authentication
- Protected API routes
- Authentication middleware
- Password hashing with bcrypt
- Backend authorization
- Backend business validation
- Environment variables for sensitive configuration
- MongoDB/Mongoose validation
- CORS configuration

---

## 📚 Learning Outcomes

This project provided practical experience with:
- MERN stack development
- React application development
- REST API development
- JWT authentication & authorization
- Express middleware
- MongoDB data modeling & Mongoose
- MongoDB relationships using ObjectId references
- React Router & Axios
- React state management
- Backend business validation
- Expense calculations & unequal expense splitting
- Payment tracking
- Group administration
- Balance calculation
- Search, filtering, and sorting
- Error handling

---

## 🚧 Future Improvements

- Expense categories
- Category-wise spending summaries
- Charts and analytics
- Pagination for large expense lists
- Notifications (including email notifications)
- Recurring expenses
- Partial payments
- Improved mobile UI
- Advanced dashboard analytics

---

## 👨‍💻 Author

**Yashwanth T M**
Computer Science Engineering Student

---

## 📄 License

This project is created for educational and portfolio purposes.
