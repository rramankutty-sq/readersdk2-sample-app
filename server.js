// server.js
// where your node app starts

// init project
const sessions = require("client-sessions");
const express = require("express");
const app = express();
const routes = require("./routes/index.js");
const db = require("./models");
const ENCRYPT_KEY = process.env.ENCRYPT_KEY;

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

app.use(
  sessions({
    cookieName: "auth", // cookie name dictates the key name added to the request object
    secret: ENCRYPT_KEY, // should be a large unguessable string
    duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
    activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
  })
);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.set("view engine", "hbs");
app.set("json spaces", 2);

// http://expressjs.com/en/starter/basic-routing.html
app.use(routes);

// listen for requests :)
db.sequelize
  .sync
  // {
  //   force:true
  // }
  ()
  .then(() => {
    const listener = app.listen(process.env.PORT, () => {
      console.log("Your app is listening on port " + listener.address().port);
    });
  });
