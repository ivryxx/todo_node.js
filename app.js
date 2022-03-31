const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const authMiddleware = require("./middlewares/auth-middleware");

mongoose.connect("mongodb://localhost/shopping-demo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();

router.post("/users", async (req, res) => {
  const { nickname, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.status(400).send({
      errorMessage: "패스워드가 패스워드 확인란과 일치하지 않습니다.",
    });
    return;
  }

  const existUsers = await User.find({
    $or: [{ email }, { nickname }],
  });
  if (existUsers.length) {
    res.status(400).send({
      errorMessage: "이미 가입된 이메일 또는 닉네임이 있습니다.",
    });
    return;
  }

  const user = new User({ email, nickname, password });
  await user.save();

  res.status(201).send({});
});

router.post("/auth", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password }).exec();

  if (!user) {
    res.status(400).send({
      errorMessage: "이메일 또는 패스워드가 잘못되었습니다.",
    });
    return;
  }

  const token = jwt.sign({ userId: user.userId }, "my-secretkey");
  res.send({
    token,
  });
});

router.get("/users/me", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  console.log(user);
  res.send({
    user,
  });
});

app.use("/api", express.urlencoded({ extended: false }), router);
app.use(express.static("assets"));

app.get("/cart/", async (req, res) => {
  const articles = await article.find().sort({
    createdAt: "desc",
  });
  res.render("assets/, { articles: articles });
});

app.listen(8080, () => {
  console.log("서버가 요청을 받을 준비가 됐어요");
});
