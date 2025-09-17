// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises; // use promises version of fs
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Path to the tasks file
const tasksFilePath = path.join(__dirname, 'data', 'tasks.json');

// Helper function to read tasks file
async function readTasks() {
  try {
    const data = await fs.readFile(tasksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // If file does not exist or is corrupted, return empty array
    return [];
  }
}

// Helper function to write tasks file
async function writeTasks(tasks) {
  try {
    await fs.writeFile(tasksFilePath, JSON.stringify(tasks, null, 2));
  } catch (err) {
    throw new Error('Failed to save tasks');
  }
}

// POST /api/tasks - create a new task
app.post('/api/tasks', async (req, res) => {
  const { title, description = '', priority } = req.body;

  // Validate inputs
  if (!title || !priority) {
    return res.status(400).json({ error: 'Title and priority are required' });
  }

  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (!validPriorities.includes(priority.toLowerCase())) {
    return res.status(400).json({ error: `Priority must be one of: ${validPriorities.join(', ')}` });
  }

  // Create new task object
  const newTask = {
    taskId: `TASK-${Date.now()}`,
    title: title.trim(),
    description: description.trim(),
    priority: priority.toLowerCase(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    const tasks = await readTasks();
    tasks.push(newTask);
    await writeTasks(tasks);
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save task' });
  }
});

// GET /api/tasks - get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
