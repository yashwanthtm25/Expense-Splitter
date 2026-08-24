# Expense Splitter

A deployed full-stack expense management application that helps groups track shared expenses, split costs equally or unequally, manage members, monitor balances, search expenses by name and description, filter expenses by payment status, review payment histories, and receive notifications about group and expense activities.

## ⚖️ Equal and Unequal Expense Splits

* **Equal splits:** Divide an expense evenly among selected group members.
* **Unequal splits:** Assign custom amounts to individual members based on their share.
* Track each member’s individual share and payment status.
* Support expense splitting based on the actual amount owed by each member.
* Maintain a payment history for every expense.

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
* Leave group
* Group admin management
* Transfer group administration
* Delete groups and their associated expenses after all payments have been settled

### 💰 Expense Management

* Create expenses within a group
* Split expenses equally or unequally between group members
* Support for custom expense shares
* Track who paid for an expense
* View individual shares
* View the payment history for each expense
* Record payment-related activity over time
* Search expenses by expense name
* Search expenses by expense description
* Combine expense name and description searches with payment-status filters
* Filter expenses by:

  * **You Paid:** Expenses where you are the payer
  * **Paid:** Expenses where your share has been marked as paid
  * **You Owe:** Expenses where you still owe money
  * **You Received:** Expenses where another member owes you money
* Edit expenses
* Prevent editing expenses when a member has already paid or already reported
* Prevent deleting an expense if any member with a share greater than zero has reported or marked that share as paid

### 🔎 Expense Search and Filters

Expenses can be searched by:

* Expense name
* Expense description

Search results can be filtered by the user’s payment relationship with each expense:

* **You Paid:** Shows expenses paid by you.
* **Paid:** Shows expenses for which your share has been paid.
* **You Owe:** Shows expenses where you have an outstanding amount to pay.
* **You Received:** Shows expenses where another member owes you money.

Search and filters can be used together to quickly find relevant expenses. For example, users can search for a specific expense name or description and then filter the results to show only expenses they owe or expenses for which they have received money.

### 💸 Payment Reporting

* Members can report that they have paid their share
* Track payment status for individual splits
* Store payment reporting timestamps
* Track when a payment was marked as paid
* Maintain a separate payment history for each expense
* Record payment events and their timestamps
* Payment status is maintained independently for each member’s share

> Payments are reported in the application; the application does not directly process external payments such as PhonePe or Google Pay.

## 📊 Balance Summary

* Display the user’s overall balance summary on the dashboard.
* Show the total amount the user owes.
* Show the total amount the user should receive.
* Show the user’s net balance.
* Display a balance summary for the user inside each group.
* Track the user’s group-specific balances across all expenses.
* Support balance calculations for both equal and unequal expense splits.
* Reflect payment reports and completed payments in balance calculations.

## 🔔 Notifications

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

The application tracks payment reporting for each individual expense split and records every payment-related event in the expense’s payment history:

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

Each expense includes a payment history that can contain:

* The member who reported the payment
* The payment status
* The date and time of the payment report
* Other relevant payment-related activity

The actual money transfer can happen through external payment services such as PhonePe or Google Pay. The application is responsible for maintaining the reported payment state and payment history rather than processing the external transaction.

## 🔒 Business Rules

Some important rules implemented in the backend include:

* Only authorized group members can access group-related operations.
* Only the group admin can perform admin-level member management.
* Only the expense payer can edit an expense.
* Expenses cannot be freely modified after a member has already paid.
* Payment status is maintained separately for each expense split.
* Each expense maintains its own payment history.
* Equal splits divide the total expense evenly among selected members.
* Unequal splits allow custom amounts for individual members.
* The total of all unequal shares must match the expense amount.
* Expense searches match the expense name and description.
* Payment-status filters identify whether the user paid, has paid, owes money, or should receive money.
* Search terms and payment-status filters can be combined.
* Dashboard balances summarize the authenticated user’s balances across all groups.
* Each group displays a balance summary specific to the authenticated user.
* Users cannot be added to a group more than once.
* Members can leave a group when permitted by the group rules.
* When the group admin leaves, administration must be transferred to another member before leaving.
* Group admins can delete groups only after all payments associated with the group’s expenses have been settled.
* Deleting a group also deletes its associated expenses and related group data.
* An expense cannot be deleted if any member with a share greater than zero has reported or marked their share as paid.
* Group administration can be transferred when required.
* Notifications are generated for relevant group and expense changes.

## 📌 Future Improvements

Possible future improvements include:

* Redis caching
* Real-time notifications using WebSockets
* Background jobs
* More comprehensive automated testing
* Improved audit and activity history
* Enhanced payment history filtering and reporting
* Additional expense search options
* Production monitoring and logging
* Continuous integration and deployment enhancements

## 👨‍💻 Author

**Yashwanth T M**

GitHub:
https://github.com/yashwanthtm25

---

Built as a deployed full-stack project to explore real-world expense management, equal and unequal expense splitting, expense search and payment-status filtering, dashboard and group-level balance summaries, authentication, authorization, business rules, payment reporting, payment history tracking, and notification systems.
