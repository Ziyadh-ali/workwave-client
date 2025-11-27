# WorkWave Company Portal

WorkWave is a company management portal designed to help administrators manage employees efficiently. The system consists of a **frontend client** (React/TypeScript/Vite) and a **backend API** (Node.js/Express), and is ideal for internal tool-style applications where users (employees) are managed exclusively by an admin.

## Table of Contents

- [Features](#features)
- [About the Project](#about-the-project)
- [Authentication Model](#authentication-model)
- [Admin Credentials](#admin-credentials)
- [Setup & Installation](#setup--installation)
  - [Backend: workwave-api](#backend-workwave-api)
  - [Frontend: workwave-client](#frontend-workwave-client)
- [Running Both Projects Together](#running-both-projects-together)
- [Usage Tips](#usage-tips)

---

## Features

- Admin manages users/employees.
- No signup page; employees are created by admin.
- Employees get login access after being added.
- Modern frontend built with React, TypeScript, and Vite.
- Secure backend API with Express (Node.js).
- Easy local setup!

---

## About the Project

The portal streamlines the process of employee management. Only the **admin** can add new users; there is no public signup route. Employees can log in once added by the admin.

You should set up both the frontend and backend locally for development.

---

## Authentication Model

- **No signup option**
- Login flow:
  1. **Admin** logs in using provided credentials.
  2. Admin adds employees.
  3. Employees receive credentials and can log in.
- Only admin can add (register) users.

---

## Admin Credentials

- **Admin Route (Login):** `/admin/login`  
  (Backend API endpoint for admin authentication)
- **Credentials:**
  - **Email:** `admin@gmail.com`
  - **Password:** `Admin@123`

Use these to access the admin dashboard and add users.

---

## Setup & Installation

Two repositories:
- **Frontend:** [`workwave-client`](https://github.com/Ziyadh-ali/workwave-client)
- **Backend:** [`workwave-api`](https://github.com/Ziyadh-ali/workwave-api)

### Backend: workwave-api

1. **Clone the backend repo:**
   ```sh
   git clone https://github.com/Ziyadh-ali/workwave-api.git
   cd workwave-api
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Setup environment variables:**
   - Create a `.env` file as required (see any example files in the repo).
   - You may need to specify database connection, port, JWT secret, etc.

4. **Run the backend server:**
   ```sh
   npm start
   ```
   or
   ```sh
   node index.js
   ```

   The backend typically runs on `http://localhost:5000` or whichever port is set.

---

### Frontend: workwave-client

1. **Clone the frontend repo:**
   ```sh
   git clone https://github.com/Ziyadh-ali/workwave-client.git
   cd workwave-client
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure connection to backend API:**
   - Set the backend API URL (default: `http://localhost:5000`) in your environment or config files.

4. **Run the frontend:**
   ```sh
   npm run dev
   ```

   This will start the app locally, usually on `http://localhost:5173` or as shown in your config.

---

## Running Both Projects Together

To run the full application:

- Start the backend API first.
- Then start the frontend client.
- Make sure the frontend is configured to communicate with the correct backend URL.

**Tip:** You may need to update environment/configuration files in the frontend to point to your backend (`REACT_APP_API_URL` or similar).

---

## Usage Tips

- Login as **admin** first (`admin@gmail.com` / `Admin@123`) to add employees.
- Employees can only log in after being added by admin.
- Protect your admin credentials!

---

## More

- For API endpoints & data models, see backend documentation or code.
- For customization (branding, features), modify both frontend and backend as needed.
