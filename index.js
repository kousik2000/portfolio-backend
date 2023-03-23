const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const cors = require("cors");

const bodyParser = require("body-parser");

const dbPath = path.join(__dirname, "portfolio.db");
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(5000, () => {
      console.log("Server Running at http://localhost:5000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/users/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      users`;
  const userArray = await db.all(getBooksQuery);
  response.send(userArray);
});

app.post("/signup/", async (request, response) => {
  const { username, name, password, gender } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
        users (username, name, password, gender) 
      VALUES 
        (
          '${username}', 
          '${name}',
          '${hashedPassword}', 
          '${gender}'
        )`;
    const dbResponse = await db.run(createUserQuery);
    const newUserId = dbResponse.lastID;
    response.send(`Created new user with ${newUserId}`);
  } else {
    response.status = 400;
    response.send("User already exists");
  }
});

// login api

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      response.send("Login Success!");
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});

//getting blog data

app.get("/blog/", async (request, response) => {
  const getBlogQuery = `
    SELECT
      *
    FROM
      blog`;
  const blogArray = await db.all(getBlogQuery);
  response.send(blogArray);
});

//getting portfolio data

app.get("/portfolio/", async (request, response) => {
  const getPortfolioQuery = `
    SELECT
      *
    FROM
      portfolio`;
  const portfolioArray = await db.all(getPortfolioQuery);
  response.send(portfolioArray);
});
