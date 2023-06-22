const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const contest = require("../controllers/contest-controllers");
const deserializer = require("../middlewares/deserializer");
const requireUser = require("../middlewares/require-user");

router.use(deserializer, requireUser);
router.post("/", contest.createData);
router.get("/", contest.getDatas);
router.get("/quest", contest.getQuests);
router.get("/quest/:idx", contest.getQuest);
router.patch("/", contest.setAnswer);
router.patch("/point", [check("point").isInt()], contest.setPoint);
router.patch("/reset", contest.resetData);
router.patch(
  "/update",
  [check("question").not().isEmpty(), check("point").isInt()],
  contest.update
);
router.patch("/reset/:idx", contest.resetQuest);
router.delete("/", contest.remove);

module.exports = router;
