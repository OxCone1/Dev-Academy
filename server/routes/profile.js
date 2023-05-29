const express = require('express');
const router = express.Router()
const passport = require('../middleware/auth');
const { createToken } = require('../middleware/auth');
const { dB } = require('../middleware/connectToDB');

router.post('/login', passport.authenticate('local', { session: false }), async (req, res) => {
    const token = await createToken(req.user);
    res.status(200).json({ token: token })
});

router.post('/verify', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const userCollection = (await dB()).collection("users")
    const user = await userCollection.findOne({ id: req.user.id })
    if (user) {
        res.status(200).json({ message: "User verified" })
    }
    else {
        res.status(401).json({ message: "User not found" })
    }
})

module.exports = router;