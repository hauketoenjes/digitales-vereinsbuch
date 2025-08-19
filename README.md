# Digital Clubbook

A digital accounting system for treasurers in German clubs.

## Tech Stack

- **Frontend:** Next.js with shadcn/ui and Tailwind CSS for a modern and responsive user interface.
- **Backend:** Pocketbase as a lightweight backend solution for data management and authentication.

## Features

The project includes the following six epics with their respective goals:

1. **User Management:** Managing user accounts, roles, and permissions.
2. **Booking Management:** Recording and managing bookings and transactions.
3. **Receipt Upload:** Uploading and managing receipts for bookings.
4. **Dashboard:** Clear presentation of financial data and statistics.
5. **PDF Export:** Exporting booking data and reports as PDF.
6. **Search & Usability:** Efficient search functions and user-friendly operation.

## Getting Started

### Frontend

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start development server (runs on port 3000):

   ```bash
   pnpm dev
   ```

### Backend

The following Makefile commands are available:

- Start build:

  ```bash
  make build
  ```

- Start backend:

  ```bash
  make up
  ```

- Stop backend:

  ```bash
  make down
  ```

- Show logs:

  ```bash
  make logs
  ```

- Restart backend:

  ```bash
  make restart
  ```

## Deployment

The system can be self-hosted, either with Docker or in a secure cloud environment.
