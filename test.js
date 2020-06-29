const express = require('express');
const passport = require('passport');
const IdentificatorStrategy = require('./index.js').Strategy;
const expresssession = require('express-session');
const cookieParser = require('cookie-parser');

const port = 8080;
const host = "http://localhost:"+port;
const identificatorHost = "https://identificator.xyz";

var app = express();
app.use(cookieParser());
app.use(expresssession({secret: "passportidentificatortest"}));

passport.use(new IdentificatorStrategy(
    {
        "identificatorHost": identificatorHost,
        "callbackURL": host+"/login/callback",
    },

    async (profile, cb) => {
        return cb(null, profile.id);
    }
));

passport.serializeUser(async function(profile, cb) {
    return cb(null, profile.id);
});

passport.deserializeUser(async function(id, cb) {
    IdentificatorStrategy.loadUserProfile(identificatorHost, id, cb);
});

app.use(passport.initialize());
app.use(passport.session());

app.get("/login", passport.authenticate("identificator"));
app.get("/login/callback", passport.authenticate('identificator', {failureRedirect: '/login/fail'}), (req, res) => res.redirect("/"));
app.get("/login/fail", (req, res) => res.send("There was an error logging in. <a href='/'>Try again?</a>"));
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});
app.get("/profile-info", (req, res) => res.send(req.user ? req.user : "You must be logged in to see your profile info. <a href='/login'>Login</a>"))
app.get("/", (req, res) => res.send(req.user ? "You're logged in. <a href='/profile-info'>View your profile info</a> <a href='/logout'>Log out</a>" : "<a href='/login'>Log in</a>"));

app.listen(port, () => console.log(`Web server started on port ${port}. Go to ${host} to test.`));