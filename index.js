require("dotenv").config();
const handler = require("serve-handler");
const cookieParser = require("cookie-parser");

const port = process.env.PORT;
const user = process.env.USER;
const pass = process.env.PASSWORD;
const path = require("path");
const express = require("express");
const { authMiddleware, setCookie } = require("./auth");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(authMiddleware);

app.get("/login", (_, response) => {
  return response.sendFile(path.join(__dirname, "/login.html"));
});

app.post("/login", async (request, response) => {
  if (user === request.body.name && pass === request.body.password) {
    await setCookie(response);
    response.redirect("/");
  } else {
    response.redirect(401, "/login");
  }
});

app.use((request, response) => {
  return handler(request, response, {
    public: process.env.PUBLIC_PATH,
    rewrites: [{ source: "/login", destination: "/login.html" }],
  });
});

app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`);
});
