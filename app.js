const express = require("express");
const app = express();
const port = 3000;
const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

router.get("/contact-me", (req, res) => {
  res.sendFile(__dirname + "/contact-me.html");
});

router.get("about", (req, res) => {
  res.sendFile(__dirname + "/about.html");
});

router.use((req, res) => {
  res.status(404).sendFile(__dirname + "/404.html");
});

app.use("/", router);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
