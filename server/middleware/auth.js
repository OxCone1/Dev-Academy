const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dB } = require("./connectToDB");

async function returnByUsername(username) {
    const db = await dB();
    const users = db.collection("users");
    const user = await users.findOne({ username: username });
    return user;
}

let jwtSecret = null;
if (process.env.JWTKEY === undefined) {
    console.log("JWTKEY not found in environment variables. Server might not work properly.")
} else {
    jwtSecret = process.env.JWTKEY;
}

let parameters = {}

parameters.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
parameters.secretOrKey = jwtSecret

passport.use(new LocalStrategy(
    async function (userName, password, done) {
        let user;
        try {
            user = await returnByUsername(userName)
            if (!user) {
                return done(null, false);
            }
        } catch (e) {
            return done(e);
        }

        let match = await bcrypt.compare(password, user.password)

        if (!match) {
            return done(null, false);
        }

        return done(null, user);
    }
));

passport.use(new JwtStrategy(parameters, async function (jwt_payload, done) {
    console.log("Processing JWT payload for token content:")
    console.log(jwt_payload);
    let user;

    const now = Date.now() / 1000
    if (jwt_payload.exp > now) {
        console.log("JWT token is valid")
        try {
            user = await returnByUsername(jwt_payload.username)
            if (!user) {
                return done(null, false);
            }
            else{
                done(null, jwt_payload)
            }
        } catch (e) {
            return done(e);
        }
    }
    else {
        done(null, false)
    }
}));

async function createToken(payload) {
    const parametersEx = {
        expiresIn: "1d"
    }
    let token = jwt.sign(payload, jwtSecret, parametersEx)
    return token
}


module.exports = passport;
module.exports.createToken = createToken;