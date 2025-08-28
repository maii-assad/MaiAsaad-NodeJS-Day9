// "fs" is a built-in Node.js module (File System)
// It allows us to read and write files on the computer
//read data from JSON file or save new data into it
const fs = require('fs');
/**
 * Load users from JSON file
 *
 * @param {string} dbFile
 *     This is the path to the json file
 */
function loadUsers(users, dbFile) {
    //نفس فكرة loadTasks لكن مع users.json 
    try {
        const data = fs.readFileSync(dbFile, 'utf-8')
        return JSON.parse(data)
    }
    catch {
        return []
    }
}

/**
 * Load tasks from JSON file
 *
 * @param {string} dbFile
 *     This is the path to the json file
 */
function loadTasks(tasks, dbFile) {
    // نحمسل التاساكات و يخزنها جوا الاراى tasks فى السيؤفر
    try {
        const data = fs.readFileSync(dbFile, 'utf-8')
        const jsonData = JSON.parse(data)
        tasks.push(...jsonData)
    }
    catch (error) {
        console.error("Error loading tasks : ", error)
    }
}

/**
 * Save tasks to JSON file
 *
 * @param {string} dbFile
 *     This is the path to the json file
 */
function saveTasks(tasks, dbFile) {
    // اى تعديل على التاسكات يروح يتسجل قى ملف tasks.json
    try {
        fs.writeFileSync(dbFile, JSON.stringify(tasks, null, 2))
    }
    catch (error) {
        console.error("Error saving tasks : ", error)
    }
}

/**
 * Save users to JSON file
 *
 * @param {string} dbFile
 *     This is the path to the json file
 */
function saveUsers(users, dbFile) {
    //نفس فكرة saveTasks لكن مع المستخدمين
    try {
        fs.writeFileSync(dbFile, JSON.stringify(users, null, 2))
    }
    catch (error) {
        console.error("Error saving users : ", error)
    }
}

/**
 * This function will save logged in user to a file named "data/loggedInUser.json"
 *
 * @param {{username: string, email: string, role: 'ADMIN' | 'USER'}} user
 *     This is the user object that will be saved to the file
 */
function saveLoggedInUser(user) {
    try {
        fs.writeFileSync('data/loggedInUser.json', JSON.stringify(user, null, 2))
    }
    catch (error) {
        console.error("Error saving logged in user : ", error)
    }
}


/**
 * This function will load logged in user from a file named "data/loggedInUser.json"
 * if file does not exist or file is empty it will return null
 *
 * @returns {{username: string, email: string, role: 'ADMIN' | 'USER'} | null} user
 *     This is the user object that will be loaded from the file or null
 *     if file does not exist or file is empty
 */
function loadLoggedInUser() {
    try {
        if (!fs.existsSync('data/loggedInUser.json')){ // عشان لو الملف مش موجود
            return null
        }
        const data = fs.readFileSync('data/loggedInUser.json', 'utf-8') // يقرا الملف
        if(!data.trim()){ // عشان لو الملف فارغ
            return null
        }
        const jsonData = JSON.parse(data) // يحول الملف الى json
        return jsonData
    }
    catch (error) {
        console.error("Error loading logged in user : ", error)
        return null
    }
}


module.exports = {
    loadUsers,
    loadTasks,
    saveTasks,
    saveUsers,
    saveLoggedInUser,
    loadLoggedInUser
};
