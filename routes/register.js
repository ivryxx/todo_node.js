// const express = require("express");
// const res = require("express/lib/response");
// const signUp = require("../schemas/signUp");
// const router = express.Router();
// const User = require("../models/user");
// const { body, validationResult } = require("express-validator");

// // 회원가입 페이지 내려주기
// router.get("/signUp", async (req, res) => {
//   const path = require("path");
//   res.sendFile(path.join(__dirname + "/../public/signUp.html"));
// });

// // 회원가입 유효성 검사 //
// router.post(
//   "/signUpCheck",
//   // notEmpty: 비어있으면 컷!, trim: 공백없애기, isLength: 문자길이지정, isAlphanumeric: 숫자, 문자 있는지 체크
//   body("NickName").notEmpty().trim().isLength({ min: 3 }).isAlphanumeric(),

//   // 비밀번호는 `최소 4자 이상이며, 닉네임과 같은 값이 포함된 경우 회원가입에 실패`로 만들기
//   body("Pw")
//     .notEmpty()
//     .trim()
//     .isLength({ min: 4 })
//     .custom((value, { req }) => {
//       if (value.includes(req.body.NickName)) {
//         throw new Error("비밀번호에 닉네임이 포함되어 있습니다.");
//       }
//       return true;
//     }),

//   // 비밀번호와 비밀번호 확인이 정확하게 일치하는지 확인
//   body("PwConfirm").custom((value, { req }) => {
//     if (value !== req.body.Pw) {
//       throw new Error("비밀번호와 비밀번호확인이 동일한지 확인해주세요.");
//     }
//     return true;
//   }),

//   // 에러 핸들링 함수
//   async (req, res) => {
//     // Finds the validation errors in this request and wraps them in an object with handy functions
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     // 문제없으면 DB에 저장
//     const { NickName, Pw } = req.body;
//     const existNickName = await signUp.find({ NickName });

//     if (existNickName.length) {
//       return res.status(400).send({ msg: "이미 가입되어있는 닉네임입니다." });
//     }

//     res.json({ msg: "회원가입이 완료 되었습니다." });
//     await signUp.create({ NickName, Pw });
//   }
// );
// module.exports = router;
