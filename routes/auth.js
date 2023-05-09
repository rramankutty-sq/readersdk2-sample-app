const router = require('express').Router();
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models').User;
const Op = require('sequelize').Op;

const CLIENT_ID = process.env.APPLICATION_ID;
const SECRET = process.env.SECRET;

function getState() {
  return (crypto.randomBytes(32)).toString('base64');
}

router.get("/authorize", (req, res) => {
    const squareAuthURL = "https://connect.squareup.com/oauth2/authorize?";
    // req.auth.state = getState(); // Setting our state to later verify we have a valid callback request

    res.redirect(
      squareAuthURL +
      `client_id=${CLIENT_ID}&` +
      `response_type=code&` +
      `scope=MERCHANT_PROFILE_READ&CUSTOMERS_READ&PAYMENTS_READ&PAYMENTS_WRITE&PAYMENTS_WRITE_IN_PERSON` +
      `session=false&` +
      `locale=en-US&`
    );
});

router.get("/callback", (req, res) => {
  const tokenURL = "https://connect.squareup.com/oauth2/token";
  const redirectURI = "https://readersdk2-oauth-example.glitch.me/auth/callback";

  if (req.query.state === req.auth.state) {
    axios
      .post(tokenURL, {
        client_id: CLIENT_ID,
        client_secret: SECRET,
        code: req.query.code,
        grant_type: 'authorization_code',
        redirect_uri: redirectURI
      })
      .then((token) => {
        // console.log(token.data.access_token);
      //Reader SDK is authorized by location - use v2Locations endpoint to find the relevant location
      //This can also be done in application
        axios.get("https://connect.squareup.com/v2/locations", {
          "headers": {
            "Authorization": `Bearer ${token.data.access_token}`
          }
        }).then((locations) => {
          console.log(locations)
          
          const loc = locations.data.locations[0].id; //Ideally should be replaced with a location selector, or choose the location designated "main"
          res.redirect(`readersdkdemo://?authorization_code=rsdk1&location_id=${loc}&access_token=${token.data.access_token}`);
        }).catch(error => {console.log(error);res.status(500).send(error.data)})
      })
      .catch(error => {
        console.log(error)
        res.status(500).send(error.data);
      });
  } else {
    res.redirect("/");
  }
});

router.get("/refresh", (req, res) => {
  if (req.auth.isLoggedIn) {
    User.findById(req.auth.userId).then((user) => {
      if (user) {
        axios.post(`https://connect.squareup.com/oauth2/token`, {
          client_id: CLIENT_ID,
          client_secret: SECRET,
          refresh_token: User.decryptToken(user.refreshToken),
          grant_type: 'refresh_token'
        }, {
          headers: {
            Authorization: `Bearer ${User.decryptToken(user.accessToken)}`
          }
        }).then((response) => {
          user.update({
            accessToken: User.encryptToken(response.data.access_token),
            tokenExp: response.data.expires_at
          }).then((user) => {
            res.redirect("/refreshed");
          });
        }).catch(error => console.log(error));
      }
    });
  } else {
    res.send("something bad happened");
  }
});

router.get("/revoke", (req, res) => {
  if (req.auth.isLoggedIn) {
    User.findById(req.auth.userId).then((user) => {
      if (user) {
        axios.post(`https://connect.squareup.com/oauth2/revoke`, {
          client_id: CLIENT_ID,
          access_token: User.decryptToken(user.accessToken)
        }, {
          headers: {
            Authorization: `Client ${SECRET}`
          }
        }).then((response) => {
          User.destroy({
            where: {
              id: {
                [Op.eq]: user.id
              }
            }
          }, {
            force: true
          }).then((user) => {
            req.auth.reset();
            res.redirect("/revoked");
          });
        }).catch(error => console.log(error));
      }
    });
  } else {
    res.send("something bad happened");
  }
});

module.exports = router;