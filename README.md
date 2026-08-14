# 💰 Expense Splitter

A full-stack MERN application for managing groups, splitting expenses, tracking balances, and settling payments between group members.

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

Search expenses by:

- Expense name
- Description

Filter expenses by:

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

### Frontend

- React
- React Router
- Axios
- React Hot Toast
- JavaScript
- HTML
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt

### Database

- MongoDB

---

## 🏗️ Project Structure

```text
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
