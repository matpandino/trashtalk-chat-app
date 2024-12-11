# TrashTalk

Video demonstration: [https://youtu.be/SmTXhhTYMT4](https://youtu.be/oiEtJt-uRSU)
<p align="center">
<img width="400px" src="https://github.com/user-attachments/assets/0d3811d9-878c-4407-a0e5-97a1d22c14b7">
</p>

## Project Structure with Turborepo

This monorepo is managed using [Turborepo](https://turbo.build/), which helps in organizing and optimizing the development process across multiple apps and packages. The repository is structured as follows:

```bash
/apps
  /native    # Main React Native application (Expo)
  /api       # Backend API server (Fastify + Prisma + SQLite + WebSocket)
````

### `apps/api`

The API is built with [Fastify](https://www.fastify.io/) and uses [Prisma](https://www.prisma.io/) for database management, with a file-based [SQLite](https://sqlite.org/) database.

### `apps/native`

The mobile app is built using [Expo](https://expo.dev/) and uses [Expo Router](https://expo.github.io/router/) for navigation.
- Expo Router handles navigation.
- Zustand library  to deal with state management.
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
    
     ```bash
     yarn
     ```
  
    The API will run on http://localhost:8080.

OR navigate to `apps/native` and `apps/api` and run `yarn` and `yarn dev` in separated terminals


## Architecture Diagram

Here is the diagram that I've built to help me visualize this project before building. It's not 100% accurate but I think it's a important step to start understanding a problem and creating a solution

<img width="100%" alt="image" src="https://github.com/user-attachments/assets/0bece351-7771-4450-b93b-4a209bd2f705">
<img width="100%" alt="image" src="https://github.com/user-attachments/assets/8a99d285-b164-4491-a552-c3394e7c0743">
