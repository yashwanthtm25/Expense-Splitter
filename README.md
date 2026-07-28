# Forgot Password Assignment

## Objective

Build a secure MERN authentication system from scratch with a complete **Forgot Password** and **Reset Password** workflow.

The application should allow users to register, log in, authenticate using JWT, and securely reset their password via an email link using Nodemailer.

---

# Learning Objectives

By the end of this assignment, you should understand:

- User Authentication using JWT
- Password Hashing using bcrypt
- Password Reset Workflow
- Cryptographically Secure Tokens
- Email Integration using Nodemailer
- Environment Variables
- Token Expiration
- Backend Security Best Practices
- Full Stack Integration (React + Express + MongoDB)

---

# Project Structure

Only the following project structure has been provided:

```text
forgot-password-assignment/
├── client/
├── server/
└── README.md
```

No source code has been provided.

You are expected to build the complete application from scratch by following the requirements in this document.

---

# Assignment Scope

This assignment requires you to implement a complete and secure MERN authentication system, including:

- User Registration
- User Login
- Password Hashing using bcrypt
- JWT-based Authentication
- Protected Routes
- MongoDB Integration
- Forgot Password Functionality
- Reset Password Functionality
- Email Integration using Nodemailer

You are responsible for:

- Designing the project structure
- Building the backend APIs
- Creating the frontend pages
- Connecting the frontend with the backend
- Implementing secure authentication
- Following backend security best practices

The focus of this assignment is not only functionality but also writing clean, secure, and maintainable code.

---

# Project Setup

## Prerequisites

Ensure the following are installed on your system:

- Node.js (v18 or above)
- MongoDB
- Git
- Visual Studio Code

---

## Backend Setup

Navigate to the `server` folder.

```bash
cd server

npm init -y
```

Install the required dependencies:

```bash
npm install express mongoose cors dotenv bcrypt jsonwebtoken nodemailer
```

Install development dependencies:

```bash
npm install --save-dev nodemon
```

Create a `.env` file inside the `server` folder.

```env
PORT=5000

MONGO_URI=

JWT_SECRET=

EMAIL_USER=

EMAIL_PASS=

CLIENT_URL=http://localhost:5173
```

Update the `package.json` scripts.

```json
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js"
}
```

---

## Frontend Setup

Navigate to the `client` folder.

```bash
cd ../client

npm create vite@latest . -- --template react
```

Install dependencies:

```bash
npm install
```

Install additional packages:

```bash
npm install axios react-router-dom react-hot-toast
```

Run the frontend.

```bash
npm run dev
```

---

## Run the Backend

Navigate back to the `server` folder.

```bash
cd ../server

npm run dev
```

---

# Features to Implement

## 1. User Authentication

Implement the following authentication features:

- User Registration
- User Login
- Password Hashing using bcrypt
- JWT Authentication
- Protected Routes

---

## 2. Forgot Password API

Create the endpoint:

```
POST /api/auth/forgot-password
```

### Request Body

```json
{
  "email": "user@example.com"
}
```

### Expected Behaviour

- Validate the email address.
- Check whether the user exists.
- Generate a cryptographically secure random token using the Node.js `crypto` module.
- Store the reset token in the database.
- Store an expiry time (e.g., 15 minutes).
- Send a password reset email containing the reset link.

---

## 3. Email Integration

Use **Nodemailer** to send password reset emails.

The email should contain a reset link similar to:

```
http://localhost:5173/reset-password/<token>
```

The email should also clearly mention:

- The link expiry time.
- That the link should not be shared.
- That the user can ignore the email if they did not request a password reset.

---

## 4. Reset Password API

Create the endpoint:

```
POST /api/auth/reset-password/:token
```

### Request Body

```json
{
  "password": "newPassword"
}
```

### Expected Behaviour

- Validate the reset token.
- Check whether the token has expired.
- Hash the new password using bcrypt.
- Update the user's password.
- Remove the reset token after successful password reset.

---

## 5. Database Changes

Modify your User schema to support password reset by storing:

- Reset Password Token
- Reset Token Expiry Time

You may choose appropriate field names and data types.

---

## 6. Frontend

Create the following pages.

### Registration Page

Include:

- Name
- Email
- Password
- Register Button

---

### Login Page

Include:

- Email
- Password
- Login Button
- Forgot Password Link

---

### Forgot Password Page

Include:

- Email Input
- Send Reset Link Button

---

### Reset Password Page

Include:

- New Password
- Confirm Password
- Reset Password Button

---

# Validation

Implement proper validation.

## Registration

- Name is required.
- Email is required.
- Email must be valid.
- Password must meet your chosen security requirements.

---

## Login

- Email is required.
- Password is required.

---

## Forgot Password

- Email is required.
- Email format must be valid.
- Handle cases where the user does not exist.

---

## Reset Password

- Password is required.
- Confirm Password is required.
- Passwords must match.
- Invalid token handling.
- Expired token handling.

---

# Security Requirements

Implement the following security best practices:

- Never store plain text passwords.
- Always hash passwords using bcrypt.
- Generate reset tokens using the Node.js `crypto` module.
- Reset tokens must expire automatically.
- Clear the reset token after a successful password reset.
- Do not reveal whether an email exists unnecessarily.
- Never hardcode credentials or secrets.
- Store all sensitive information inside the `.env` file.
- Validate all user inputs before processing requests.

---

# Environment Variables

Create a `.env` file inside the `server` folder.

```env
PORT=5000

MONGO_URI=

JWT_SECRET=

EMAIL_USER=

EMAIL_PASS=

CLIENT_URL=http://localhost:5173
```

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/auth/forgot-password` | Generate a password reset token |
| POST | `/api/auth/reset-password/:token` | Reset the user's password |

---

# Expected Flow

1. User registers.
2. User logs in successfully.
3. User clicks **Forgot Password**.
4. User enters their registered email.
5. Backend generates a secure reset token.
6. Backend sends a password reset email.
7. User clicks the reset link.
8. User enters a new password.
9. Backend validates the token.
10. Password is updated.
11. Reset token is removed.
12. User logs in with the new password.

---

# Bonus Tasks

Complete any of the following.

## Easy

- Show a loading spinner while sending the email.
- Disable buttons while requests are in progress.
- Display success and error notifications using `react-hot-toast`.

---

## Medium

- Prevent multiple password reset requests within one minute.
- Hash the reset token before storing it in the database.
- Add password strength validation.

---

## Hard

- Send a professionally styled HTML email.
- Allow users to request another reset link after expiry.
- Log password reset events.
- Implement refresh tokens for authentication.

---

# Submission Requirements

Push your completed project to GitHub.

Your repository should include:

- Complete source code
- A well-written `README.md`
- Proper Git commit history
- Working authentication system
- Working Forgot Password flow
- Working Reset Password flow
- A `.env.example` file (do **not** commit your actual `.env`)

---

