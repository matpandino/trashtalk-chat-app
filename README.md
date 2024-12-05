# TrashTalk

Video demonstration: [https://youtu.be/SmTXhhTYMT4](https://youtu.be/oiEtJt-uRSU)
<p align="center">
<img width="400px" src="https://github.com/user-attachments/assets/0d3811d9-878c-4407-a0e5-97a1d22c14b7">
</p>

### Notes 

Due to limited time, I had to cut some shortcuts that impacted code quality. Here are some areas where there is room for improvement / notes to consider:

*Overall*
- **GIT**: To save time I started comitting to the main branch at some point of the project. This is not a good practice and should not be tolerated in serious projects. Usually I create a PR for each chore/feature/fix with a description of the change
- **.env Support**: The project currently lacks full support for environment variables using a `.env` file.
- **TRPC**: I've noticed middle project that if I used trpc to integrate api/frontend it would probably speed the proccess of building this challenge
- **Typescript Integration**: TypeScript Integration: When the Prisma generate command is executed, it automatically exports all Prisma types. This allows the frontend to directly import the types from the backend repository, adding robustness and consistency to TypeScript support

*Mobile App*
- **Componentization**: Some components on the App still need to be refactored for better reusability.
- **Websocket**: Websocket connection can be improved. Features like auto reconnection can be added.
- **Storybook**: My intent was to add storybook + unit test when neeeded

*API*
- **SQLITE**: I opted to use sqlite to save time and avoid the setup of a local database just for a MVP/Challenge project;
- **In Memory WebSockets**: I opted to save user WebSockets connections in memory. I could use something like Redis to store connections but this would increase the project complexity;
- **API Architecture**: The current API architecture is functional but could be further optimized. Refactoring it into a more modular structure, with better separation of concerns, would enhance maintainability and scalability.
- **API tests**: Currently there is no testing at all on the api side. Adding test for the common use cases is important to catch possible bugs and enforce business rules 
- **API Image Upload to S3**: Even though image uploading is working locally. It could directly upload to s3 and save the url of the uploaded image.
- **Login Token / Auth middleware**: Currently, the token is the user ID. While this is sufficient to identify the user making the request, it can be enhanced for better security and scalability.

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
