const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const TASKS_FILE = path.join(__dirname, 'data', 'tasks.json');

app.use(cors());
app.use(express.json());

// Helper function to read tasks from file safely
async function readTasks() {
  try {
    const exists = await fs.pathExists(TASKS_FILE);
    if (!exists) {
      // If file doesn't exist, create it with empty array
      await fs.outputJson(TASKS_FILE, []);
      return [];
    }
    const data = await fs.readJson(TASKS_FILE);
    if (!Array.isArray(data)) throw new Error('Tasks data corrupted');
    return data;
  } catch (err) {
    throw new Error('Error reading tasks: ' + err.message);
  }
}

// Helper function to write tasks to file
async function writeTasks(tasks) {
  try {
    await fs.writeJson(TASKS_FILE, tasks, { spaces: 2 });
  } catch (err) {
    throw new Error('Error writing tasks: ' + err.message);
  }
}

// Task validation
function validateTaskInput({ title, priority }) {
  const allowedPriorities = ['low', 'medium', 'high', 'urgent'];
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return 'Title is required and cannot be blank';
  }
  if (!priority || !allowedPriorities.includes(priority.toLowerCase())) {
    return `Priority must be one of: ${allowedPriorities.join(', ')}`;
  }
  return null;
}

// POST /api/tasks
app.post('/api/tasks', async (req, res) => {
  const { title, description = '', priority } = req.body;

  const validationError = validateTaskInput({ title, priority });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const tasks = await readTasks();

    const newTask = {
      taskId: 'TASK-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      priority: priority.toLowerCase(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    await writeTasks(tasks);

    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load tasks' });
  }
});

// Error handler middleware for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Task API listening on port ${PORT}`);
});
