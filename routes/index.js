const router = require('express').Router();
const auth = require('./auth');
const User = require('../models').User;

router.get("/", (req, res) => {
  res.sendFile(__dirname + '/../public/index.html');
});

router.use("/auth", auth);

router.get("/authorized", (req, res) => {
  if(req.auth.isLoggedIn) {
    User.findById(req.auth.userId).then((user)=>{
      res.render("authorized", {user});
    });
  } else {
      res.render("authorized");
  }
});

router.get("/revoked", (req, res) => {
  res.render("revoked");
});

router.get("/refreshed", (req, res) => {
  res.render("refreshed");
});

module.exports = router;