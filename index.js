const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.static("public"));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
const cors = require("cors");
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
let tried = false;
app.options("*", cors());
app.post("/login", (req, res) => {
  let txt = fs.readFileSync("./users.json", "utf-8");
  file = JSON.parse(txt);
  if (file.findIndex((a) => a.email == req.body.email) < 0) {
    file.push(req.body);
    file = JSON.stringify(file);
    fs.writeFileSync("./users.json", file);
    res.cookie("email", req.body.email, { maxAge: 1000 * 60 * 1 });
  } else {
    if (file.find((x) => (x.email == req.body.email)).password == req.body.password) {
      console.log(req.body);
      res.cookie("email", req.body.email, { maxAge: 1000 * 60 * 1 });
    }
  }
  tried = true;
  setTimeout(() => {
    tried = false;
  }, 1000 * 30);
  res.redirect("./");
});
app.get("/logged", (req, res) => {
  // console.log('kjj',req.cookies);

  res.send({ ...req.cookies, tried });
});
app.listen(process.env.PORT || 80, () => {
  console.log("server running at http://localhost:80");
});
