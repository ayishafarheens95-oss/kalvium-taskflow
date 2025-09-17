# TaskFlow API

## Overview

A backend API to manage tasks and productivity workflows.

## How to Run Locally

1. Clone the repo
2. Run `npm install`
3. Run `npm start`
4. API runs at `http://localhost:3000`

## API Endpoints

### Create a New Task

- **POST** `/api/tasks`
- **Body JSON:**
  ```json
  {
    "title": "Task title",
    "description": "Optional description",
    "priority": "low" | "medium" | "high" | "urgent"
  }
