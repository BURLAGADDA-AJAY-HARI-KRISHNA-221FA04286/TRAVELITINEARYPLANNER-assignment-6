const http = require("http");
const fs = require("fs");
const path = require("path");
const { URLSearchParams } = require("url");
const port = 8222;

// File paths for different pages
const filePathFirst = path.join(__dirname, "view", "index.html");
const filePathLogin = path.join(__dirname, "view", "login.html");
const filePathRegister = path.join(__dirname, "view", "register.html");
const filePathFind = path.join(__dirname, "view", "location.html");
const filePathServices = path.join(__dirname, "view", "services.html");

// File to store user data
const dataFile = path.join(__dirname, "users.json");

// Load existing users or initialize an empty array if the file doesn't exist
let users = [];
if (fs.existsSync(dataFile)) {
    try {
        const rawData = fs.readFileSync(dataFile);
        users = JSON.parse(rawData);
    } catch (error) {
        console.error("Error reading users.json:", error);
    }
} else {
    // Create an empty file if it doesn't exist
    fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
}

// Creating the server
const api = http.createServer((req, res) => {
    // Routing logic

    // Handle registration form submission
    if (req.url === "/register/submit" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            const formData = new URLSearchParams(body);
            const name = formData.get("fullname");
            const email = formData.get("email");
            const password = formData.get("password");

            // Check if the email is already registered
            const userExists = users.find(user => user.email === email);

            if (userExists) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "User already registered. Please login." }));
            } else {
                // Register the user
                users.push({ name, email, password });

                try {
                    fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
                    console.log("User registered:", { name, email });
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Registration successful. You can now log in." }));
                } catch (error) {
                    console.error("Error writing to users.json:", error);
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Error saving user data." }));
                }
            }
        });
    }

    // Handle login form submission
    else if (req.url === "/login" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            const formData = new URLSearchParams(body);
            const email = formData.get("email");
            const password = formData.get("password");

            // Check if the email exists in the user data
            const user = users.find(user => user.email === email);

            if (!user) {
                // Return error message if user is not found
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "You have not been registered." }));
            } else if (user.password !== password) {
                // Return error message if password is incorrect
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Incorrect password." }));
            } else {
                // Successful login
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "You have logged in successfully." }));
            }
        });
    }

    // Serve first page
    else if (req.url === "/" || req.url === "/index.html") {
        res.setHeader("Content-Type", "text/html");
        fs.readFile(filePathFirst, "utf8", (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end("Error loading first page");
                console.error(err);
            } else {
                res.end(data);
            }
        });
    }
    // Serve services page
    else if (req.url === "/services" || req.url === "/services.html") {
        res.setHeader("Content-Type", "text/html");
        fs.readFile(filePathServices, "utf8", (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end("Error loading services page");
                console.error(err);
            } else {
                res.end(data);
            }
        });
    }
    // Serve location page
    else if (req.url === "/location" || req.url === "/location.html") {
        res.setHeader("Content-Type", "text/html");
        fs.readFile(filePathFind, "utf8", (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end("Error loading location page");
                console.error(err);
            } else {
                res.end(data);
            }
        });
    }
    // Serve register page
    else if (req.url === "/register" || req.url === "/register.html") {
        res.setHeader("Content-Type", "text/html");
        fs.readFile(filePathRegister, "utf8", (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end("Error loading register page");
                console.error(err);
            } else {
                res.end(data);
            }
        });
    }
    // Serve login page
    else if (req.url === "/login" || req.url === "/login.html") {
        res.setHeader("Content-Type", "text/html");
        fs.readFile(filePathLogin, "utf8", (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end("Error loading login page");
                console.error(err);
            } else {
                res.end(data);
            }
        });
    }
    // 404 for undefined routes
    else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("Page not found");
    }
});

// Start the server
api.listen(port, function () {
    console.log("Server running on port", port);
});
