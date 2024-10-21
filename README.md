# TrashLab Mobile Challenge

Video demonstration: [https://youtu.be/aYACf8UAlf0](https://youtu.be/m1hZ5Hupr8Q)

## Project Structure with Turborepo

This monorepo is managed using [Turborepo](https://turbo.build/), which helps in organizing and optimizing the development process across multiple apps and packages. The repository is structured as follows:

```bash
/apps
  /app       # Main React Native application (Expo)
  /api       # Backend API server (Fastify + Prisma + SQLite + WebSocket)
````

### `apps/api`

The API is built with [Fastify](https://www.fastify.io/) and uses [Prisma](https://www.prisma.io/) for database management, with a file-based [SQLite](https://sqlite.org/) database.

- Fastify handles HTTP requests.
- Prisma manages the SQLite database.
- WebSocket enables real-time communication.

### `apps/app`

The mobile app is built using [Expo](https://expo.dev/) and uses [Expo Router](https://expo.github.io/router/) for navigation.
- Expo Router handles navigation.
- Used React Native Paper UI library to help with theme and componentization.

## Running the Project

To get started, follow these steps:

1. **Install dependencies:**

   Run the following command to install all the package dependencies:

   ```bash
   yarn
   ```
2. **Start the project in development mode:**

  To run the project in development mode, use the following command:
  
  bash
   ```bash
   yarn dev
   ```

The API will run on http://localhost:8080.



## Architecture Diagram

<img width="100%" alt="image" src="https://github.com/user-attachments/assets/0bece351-7771-4450-b93b-4a209bd2f705">
<img width="100%" alt="image" src="https://github.com/user-attachments/assets/8a99d285-b164-4491-a552-c3394e7c0743">
