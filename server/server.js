const { startUpInit } = require("./helpers/startUp");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/*", (req, res) => {
  res.status(404).json({ message: "404" });
});

const startServer = async () => {
  const PORT = process.env.PORT || 3002;

  try {
    await startUpInit(process.argv[2]);
  
    app.listen(PORT, () => {
      console.log(`Running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Error during startup: ${error}\nLaunch server with "-restore" parameter`);
    process.exit(1);
  }
};

startServer();

