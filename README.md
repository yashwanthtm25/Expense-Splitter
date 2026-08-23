# Expense Splitter

A deployed full-stack expense management application that helps groups track shared expenses, split costs equally or unequally, manage members, monitor balances, and receive notifications about group and expense activities.

## ⚖️ Equal and Unequal Expense Splits

* **Equal splits:** Divide an expense evenly among selected group members.
* **Unequal splits:** Assign custom amounts to individual members based on their share.
* Track each member’s individual share and payment status.
* Support expense splitting based on the actual amount owed by each member.

## 🚀 Features

### 🔐 Authentication

* User registration and login
* JWT-based authentication
* Protected API routes
* Password hashing with bcrypt

### 👥 Group Management

* Create groups
* Add members using their email
* Remove members
* Leave groups
* Group admin management
* Transfer group administration
* Delete groups and their associated expenses

### 💰 Expense Management

* Create expenses within a group
* Split expenses equally or unequally between group members
* Support for custom expense shares
* Track who paid for an expense
* View individual shares
* Edit expenses
* Prevent editing expenses when a member has already paid
* Delete expenses according to payment status

### 💸 Payment Reporting

* Members can report that they have paid their share
* Track payment status for individual splits
* Store payment reporting timestamps
* Track when a payment was marked as paid
* Payment status is maintained independently for each member’s share

> Payments are reported in the application; the application does not directly process external payments such as PhonePe or Google Pay.

### 📊 Balance Tracking

* Calculate the amount a user owes
* Calculate the amount a user should receive
* Calculate the user’s net balance
* Track balances across group expenses
* Support balances from both equal and unequal expense splits

### 🔔 Notifications

Notifications are generated for important group and expense activities, including:

* Member added to a group
* Member removed from a group
* Member leaving a group
* Group name changes
* Group deletion
* Expense-related changes
* Payment reporting
* Other relevant group activities

Users can:

* View notifications
* See unread notification count
* Mark individual notifications as read
* Mark all notifications as read

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* React Router
* Axios
* React Hot Toast
* date-fns

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt

## 📁 Project Structure

```text
Expense-Splitter/
│
├── client/
│   ├── src/
│   └── ...
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── ...
│
├── .gitignore
└── README.md
```

## 🌐 Deployed Application

The application has been deployed and is available for use online.

Add your deployed application URL below:

```text
https://expense-splitter-6ujpr3hgx-legends-b3fc.vercel.app/
```

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yashwanthtm25/Expense-Splitter.git
cd Expense-Splitter
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

If your application uses additional environment variables, add them according to your local configuration.

For the frontend, create the required `.env` file and configure:

```env
VITE_API_URL=your_backend_url
```

**Do not commit ****`.env`**** files or secret credentials to GitHub.**

## ▶️ Running Locally

### Start the backend

```bash
cd server
npm run dev
```

or, depending on your package configuration:

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

### Start the frontend

In another terminal:

```bash
cd client
npm run dev
```

Vite will provide the frontend development URL.

## 🔄 Expense Payment Flow

The application tracks payment reporting for each individual expense split:

```text
UNPAID
   │
   │ "I Paid"
   ↓
REPORTED
   │
   │ Payment reported by member
   ↓
PAID
```

The actual money transfer can happen through external payment services such as PhonePe or Google Pay. The application is responsible for maintaining the reported payment state rather than processing the external transaction.

## 🔒 Business Rules

Some important rules implemented in the backend include:

* Only authorized group members can access group-related operations.
* Only the group admin can perform admin-level member management.
* Only the expense payer can edit an expense.
* Expenses cannot be freely modified after a member has already paid.
* Payment status is maintained separately for each expense split.
* Equal splits divide the total expense evenly among selected members.
* Unequal splits allow custom amounts for individual members.
* The total of all unequal shares must match the expense amount.
* Users cannot be added to a group more than once.
* Group administration can be transferred when required.
* Notifications are generated for relevant group and expense changes.

## 📌 Future Improvements

Possible future improvements include:

* Redis caching
* Real-time notifications using WebSockets
* Background jobs
* More comprehensive automated testing
* Improved audit/activity history
* Production monitoring and logging
* Continuous integration and deployment enhancements

## 👨‍💻 Author

**Yashwanth T M**

GitHub:
https://github.com/yashwanthtm25

---

Built as a deployed full-stack project to explore real-world expense management, equal and unequal expense splitting, authentication, authorization, business rules, payment reporting, and notification systems.
