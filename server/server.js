//run nmp before running this file
//npm i express cors body-parser dotenv

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const express = require("express")
const app = express()
const cors = require("cors");
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get('/*', (req, res) => {
    res.status(404).json({ message: '404' })
})

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
})