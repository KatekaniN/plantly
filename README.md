# Plantly

A plant care app built with Expo and React Native to help you keep your plants healthy and thriving.

## Features

- **Onboarding:** A simple and welcoming onboarding flow for new users.
- **Plant Identification:** Identify plants by taking a picture with your camera.
- **Plant Collection:** Keep a collection of your plants with detailed information.
- **Plant Care Guide:** Get tips and guides on how to care for your plants.
- **Watering Reminders:** Set up notifications to remind you when to water your plants.
- **Profile Management:** Manage your user profile and preferences.

## Tech Stack

- **React Native:** A framework for building native apps using React.
- **Expo:** A platform for making universal React applications.
- **Expo Router:** A file-based router for React Native and web applications.
- **Zustand:** A small, fast and scalable bearbones state-management solution.
- **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
- **Axios:** A promise-based HTTP client for the browser and Node.js.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js
- npm
- Expo CLI

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/KatekaniN/plantly.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

### Running the App

- **Start the development server:**
  ```sh
  npm start
  ```
- **Run on Android:**
  ```sh
  npm run android
  ```
- **Run on iOS:**
  ```sh
  npm run ios
  ```

## Project Structure

```
.
├── app/                  # Main application screens and navigation (using Expo Router)
│   ├── (tabs)/           # Tab navigator screens
│   ├── edit-plant/       # Screen for editing plant details
│   ├── plant-detail/     # Screen for viewing plant details
│   └── ...
├── assets/               # Images, fonts, and other static assets
├── components/           # Reusable components used throughout the app
├── contexts/             # React contexts for managing global state
├── services/             # Services for interacting with external APIs
├── store/                # Zustand store for state management
├── theme.ts              # Theme configuration (colours, fonts, etc.)
└── ...
```
