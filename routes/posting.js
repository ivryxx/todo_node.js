const express = require("express");
const Posters = require("../schemas/poster");
const CommentDB = require("../schemas/comment");
const SignUpDB = require("../schemas/signUp");
const router = express.Router();
const CryptoJS = require("crypto-js");
const authMiddleware = require("../middleware/auth-middleware");
const res = require("express/lib/response");
const { send } = require("process");

// 게시글 작성페이지 내려주기
router.get("/posting", (req, res) => {
  const path = require("path");
  res.sendFile(path.join(__dirname + "/../public/posting.html"));
});

// 클라에서입력한 정보 >> DB로 올리기
router.post("/posting", async (req, res) => {
  const { Name, Pw, Title, Content } = req.body;

  const moment = require("moment");
  require("moment-timezone");
  moment.tz.setDefault("Asia/Seoul");
  const NowDate = String(moment().format("YYYY-MM-DD HH:mm:ss"));

  const PostId = CryptoJS.SHA256(NowDate)["words"][0];
  const existPostId = await Posters.find({ PostId });

  // 같은 ID가 DB에 있다면
  if (existPostId.length) {
    return res.json({ msg: "예상치 못한 오류입니다." });
  }

  res.json({ msg: "게시글이 등록이 완료되었습니다!" });
  await Posters.create({ Title, Content, PostId, NowDate, Name, Pw });
});

// 게시글 수정페이지html 내려주기
router.get("/edit", (req, res) => {
  const path = require("path");
  res.sendFile(path.join(__dirname + "/../public/edit.html"));
});

// 게시글 수정페이지 수정전 원본데이터 내려주기
router.get("/edit/Data", async (req, res) => {
  const PostId = req.query.PostId;
  const detail_info = await Posters.find({ PostId });
  res.json(detail_info);
});

// 게시글 수정하기
router.post("/edit", async (req, res) => {
  const { PostId, Pw, Title, Content } = req.body;

  var today = new Date();
  var NowDate = today.toLocaleString();
  // PostId와 Pw를 기준으로 Data 받아오기
  const existPostId_Pw = await Posters.find({ PostId, Pw });

  // PostId와 Pw가 일치하는 Data가 없을경우
  if (existPostId_Pw.length === 0) {
    return res.json({ msg: "비밀번호가 일치 하지 않습니다." });
  }

  res.json({ msg: "게시글 수정이 완료되었습니다." });
  await Posters.updateOne({ PostId }, { $set: { Title, Content, NowDate } });
});

// 게시글 삭제하기
router.post("/delete", async (req, res) => {
  const { PostId, Pw } = req.body;

  // PostId와 Pw를 기준으로 Data 받아오기
  const existPostId_Pw = await Posters.find({ PostId, Pw });

  // PostId와 Pw가 일치하는 Data가 없을경우
  if (existPostId_Pw.length === 0) {
    return res.json({ msg: "비밀번호가 일치 하지 않습니다." });
  }

  res.json({ msg: "게시글 삭제가 완료되었습니다." });
  await Posters.deleteOne({ PostId });
});

// 댓글 >> DB로 올리기 (완료)
router.post("/postingComment", authMiddleware, async (req, res) => {
  const { Comment, PostId } = req.body;

  if (!Comment.length) {
    return res.json({ msg: "댓글 내용이 없습니다. 작성후 등록해 주세요." });
  }

  // 사용자 브라우저에서 보낸 쿠키를 인증미들웨어통해 user변수 생성
  const { user } = res.locals; // NickName: ##, Pw: ##, _id: ##

  // 현재시간으로 댓글의 ID 생성
  const moment = require("moment");
  require("moment-timezone");
  moment.tz.setDefault("Asia/Seoul");
  const NowDate = String(moment().format("YYYY-MM-DD HH:mm:ss"));
  const CommentId = CryptoJS.SHA256(NowDate)["words"][0];

  // 해당 댓글의 ID가 DB에 있는지 조회
  const existCommentId = await CommentDB.find({ CommentId });
  // const UserId = user._id.toString()
  const UserId = user.NickName;

  // 같은 댓글 ID가 DB에 있다면 오류발생
  if (existCommentId.length) {
    return res.json({ msg: "예상치 못한 오류입니다." });
  }

  res.json({ msg: "댓글이 등록이 완료되었습니다!" });
  await CommentDB.create({ NowDate, Comment, CommentId, PostId, UserId });
});

// DB >> 댓글 내려주기
router.get("/lookupComment", async (req, res) => {
  const PostId = req.query.PostId;
  const comment_info = await CommentDB.find({ PostId });
  const sorted_total_ls = comment_info.sort((a, b) =>
    a.NowDate > b.NowDate ? -1 : 1
  );
  res.json(sorted_total_ls);
});

// 댓글 수정버튼 누르면 인증미들웨어로 보내서 검증하기
router.post("/updateCommentAuth", authMiddleware, async (req, res) => {
  const { UserId } = req.body;
  const myLoginId = res.locals.user.NickName;

  console.log(UserId, myLoginId);

  if (myLoginId !== UserId) {
    return res.status(400).send("실패!");
  }

  res.send("인정합니당");
});

// 댓글 수정페이지html 내려주기
router.get("/updateComment", (req, res) => {
  const path = require("path");
  res.sendFile(path.join(__dirname + "/../public/updateComment.html"));
});

// 댓글 수정전 원본데이터 내려주기
router.get("/updateCommentData", async (req, res) => {
  const PostId = req.query.PostId;
  const CommentId = req.query.CommentId;
  const Comment_info = await CommentDB.find({ $and: [{ PostId, CommentId }] });

  res.json(Comment_info);
});

// 댓글 수정하기
router.post("/updateComment", async (req, res) => {
  const { CommentId, PostId, Comment } = req.body;

  // 현재시간 생성
  const moment = require("moment");
  require("moment-timezone");
  moment.tz.setDefault("Asia/Seoul");
  const NowDate = String(moment().format("YYYY-MM-DD HH:mm:ss"));

  // CommentId와 PostId를 기준으로 Data 받아오기
  const exist_PostId_CommentId = await CommentDB.find({
    $and: [{ PostId, CommentId }],
  });

  // PostId와 Pw가 일치하는 Data가 없을경우
  if (exist_PostId_CommentId.length === 0) {
    return res.json({ msg: "본인의 댓글이 아닙니다." });
  }

  res.json({ msg: "댓글 수정이 완료되었습니다." });
  await CommentDB.updateOne({ CommentId }, { $set: { Comment, NowDate } });
});

// 댓글 삭제하기
router.post("/deleteComment", async (req, res) => {
  const { CommentId, PostId } = req.body;

  // 현재시간 생성
  const moment = require("moment");
  require("moment-timezone");
  moment.tz.setDefault("Asia/Seoul");
  const NowDate = String(moment().format("YYYY-MM-DD HH:mm:ss"));

  // CommentId와 PostId를 기준으로 Data 받아오기
  const exist_PostId_CommentId = await CommentDB.find({
    $and: [{ PostId, CommentId }],
  });

  // PostId와 Pw가 일치하는 Data가 없을경우
  if (exist_PostId_CommentId.length === 0) {
    return res.json({ msg: "본인의 댓글이 아닙니다." });
  }

  res.json({ msg: "댓글 삭제가 완료되었습니다." });
  await CommentDB.deleteOne({ CommentId });
});

module.exports = router;
