// Express Server Entry Point
const express = require('express');
const { loadTasks, loadUsers, saveTasks, saveLoggedInUser, loadLoggedInUser } = require('./bouns');
const app = express();
const PORT = 6060;

// Local Database
const tasks = [];
const users = [];

loadTasks(tasks, "data/tasks.json");
loadUsers(users, "data/users.json");
const loggedInUSer = loadLoggedInUser(users, "data/loggedInUser.json");

// Middleware
app.use(express.json());

// Routes
app.get('/api/tasks', (req, res) => {
    // should get all tasks from tasks array
    res.json(tasks)
});

app.get('/api/tasks/search', (req, res) => {
    // query string should contain keyword and we should search in tasks array using this keyword
    // If the keyword exists on title or description we should respond with this task
    const { keyword } = req.query
    if (!keyword) {
        return res.json({ error: 'Keyword is required' })
    }
    const result = tasks.filter(task => task.title.includes(keyword) || task.description.includes(keyword))
    res.json(result)
});

// YOU MUST BE LOGGED IN TO DO IT
app.post('/api/tasks', (req, res) => {
    // body should contain these info title, description
    const { title, description, priority } = req.body
    if (!title || !description || !priority) {
        return res.json({
             error: 'Title, description, and priority are required!!' 
        })
    }
    const loggedInUser = loadLoggedInUser()
    if (!loggedInUser) {
        return res.status(401).json({ 
            error: 'You must be logged in to create a task' 
        })
    }
    const task = {
        title: "", // GET TITLE VALUE FROM request body,
        description: "", // GET DESCRIPTION VALUE FROM request body,
        priority: "", // GET PRIORTY VALUE FROM request body,
        username: "", // GET USERNAME FROM THE USER CURRENTLY LOGGED IN
    }
    const newTask = { title, description, priority }
    tasks.push(newTask)
    res.status(201).json(newTask) // Respond with the new created task
    // priority(high, low, medium) + the username who created the task
    // KEEP THIS CODE AFTER ADDING TASK TO TASKS ARRAY
    saveTasks(tasks, "data/tasks.json");
    // YOU MUST BE LOGGED IN TO DO IT OR YOU ARE THE CREATOR OF THE TASK
});

app.delete('/api/tasks/', (req, res) => {
    // request should contain id of task to delete
    const id = req.query.id;

    if (!id) {
        return res.status(400).json({
             error : 'Id is required' 
        })
    }

    if(!loggedInUser()){
        return res.status(400).json({
            error : "You must be Logged in"
        })
    } 
// find ths task before delete it
    const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

    if (loggedInUser().role !== 'ADMIN' && loggedInUser().username !== username) {
        return res.status(400).json({ 
            error: "You must be admin to delete a task"
        })
    }

    const updateTasks = tasks.filter(t => t.id !== id);
    tasks.push(...updateTasks);
    res.json({
        message : "Task deleted!"
    })
    // KEEP THIS CODE AFTER ADDING TASK TO TASKS ARRAY
    saveTasks(tasks, "data/tasks.json");
});

app.get("/profile", (req, res)  => {
    // we get query string from req and search user in users array
    const { username, email } = req.query
    if (!username && !email) {
        return res.status(400).json({
             error: 'Username or email is required!!' 
        })
    }
    // search for a user
    const user = users.find(user => user.username === username || user.email === email)
    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
});

// YOU MUST BE LOGGED IN AND HAVE ADMIN ROLE TO DO IT
app.delete("/profile", (req, res)  => {
    // we get query string from req and search user in users array then delete this user
    const { username} = req.query

    if (!username) {
        return res.status(400).json({
             error: 'Username is required!!' 
        })
    }

    // make sure that this is the admin
    if (!loggedInUser() || !loggedInUser().role == 'ADMIN') {
        return res.status(400).json({
            error : "You are not admin"
        })
    }

    // make sure that user is exist
    const user = users.findIndex(user => user.username === username)
    if (!user) {
        return res.status(404).json({ 
            error: 'User not found'
         })
    }

    const updateUsers = users.filter(u => u.username !== username);
    users.push(...updateUsers);
    res.json({
        message : "User deleted!"
    })
    saveUsers(users, "data/users.json");
});

app.post("/register", (req, res)  => {
    // body should contain these info username, email, password, role (ADMIN or USER)
    const { username, email, password, role } = req.body
    if (!username || !email || !password) {
        return res.json({
             error: 'Username, email, and password are required!!' 
        })
    }
    // check if user already exist 
    const exist = users.find(user => user.username === username || user.email === email)
    if (exist) {
        return res.status(404).json({ error: 'User already exists' })
    }
    // add new user  
    const newUser = { username, email, password, role }
    users.push(newUser)
    res.json(newUser) 
    // KEEP THIS CODE AFTER ADDING USER TO USERS ARRAY
    saveUsers(users, "data/users.json");
});

app.post("/login", (req, res)  => {
    // body should contain these info username or email, password
    const { username, email, password } = req.body
    if ((!username && !email) || !password) {
        return res.json({
             error: 'Username, email, and password are required!!' 
        })
    }  
    res.json({ message: 'Login successful' })
    // After logging user data will be saved into a file named "data/loggedInUser.json"
    // And we will use this file to check authentication for users in specifiec routes
    // search for user
    const user = users.find(user => user.username === req.body.username || user.email === req.body.username);
    if (!user) {
        return res.status(401).json({ message: "User Not Found" });
    }
    if (user.password !== req.body.password) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    // save logged in user
    saveLoggedInUser({
        username : user.username,
        email : user.email,
        role : user.role
    });
    res.json({
        message : "Login successful", user
    })
});

// Logout
app.post("/logout", (req, res) => {
    try {
        fs.writeFileSync('data/loggedInUser.json', "null");
        res.json({ message: "Logged out successfully" });
    } 
    catch (error) {
        console.error("Error logging out:", error);
        res.status(500).json({ error: "Failed to logout" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//http://localhost:6060