const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;
const FILE_UPLOAD_DIR = "uploads";
const LOG_FILE = "access.logs";


app.use((req, res, next) => {
    const logData = `${new Date().toISOString()} - ${req.method} ${req.url} - ${
        req.headers["user-agent"]
    }\n`;
    console.log(logData);
    fs.appendFile(LOG_FILE, logData, { flag: "a" })
        .then(() => next())
        .catch((err) => {
            console.error("Error writing to log file:", err);
            next();
        });
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
});


app.post("/createFile", async (req, res, next) => {
    try {
        const { filename, content, password } = req.body;
        if (!filename || !content) {
            return res
                .status(400)
                .send('Both "filename" and "content" are required.');
        }
        const filePath = path.join(FILE_UPLOAD_DIR, filename);
        await fs.writeFile(filePath, content);
        res.status(200).send("File created successfully.");
    } catch (err) {
        next(err);
    }
});


app.get("/getFiles", async (req, res, next) => {
    try {
        const files = await fs.readdir(FILE_UPLOAD_DIR);
        res.json(files);
    } catch (err) {
        next(err);
    }
});


app.get("/getFile", async (req, res, next) => {
    try {
        const { filename, password } = req.query;
        if (!filename) {
            return res.status(400).send("Filename parameter is required.");
        }
        const filePath = path.join(FILE_UPLOAD_DIR, filename);
        const fileContent = await fs.readFile(filePath, "utf8");
        res.send(fileContent);
    } catch (err) {
        next(err);
    }
});


app.put("/modifyFile", async (req, res, next) => {
    try {
        const { filename, content, password } = req.body;
        if (!filename || !content) {
            return res
                .status(400)
                .send('Both "filename" and "content" are required.');
        }
        const filePath = path.join(FILE_UPLOAD_DIR, filename);
        await fs.writeFile(filePath, content);
        res.status(200).send("File modified successfully.");
    } catch (err) {
        next(err);
    }
});

app.delete("/deleteFile", async (req, res, next) => {
    try {
        const { filename, password } = req.query;
        if (!filename) {
            return res.status(400).send("Filename parameter is required.");
        }
        const filePath = path.join(FILE_UPLOAD_DIR, filename);
        await fs.unlink(filePath);
        res.status(200).send("File deleted successfully.");
    } catch (err) {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});