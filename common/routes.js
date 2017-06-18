const express = require('express');
const router = express.Router();

const home = require('./../controller/home');

router.get('/1', home.index);

// 每日的資料
router.get('/latest', home.getLatest);
/*
// 按日期查询
router.get('/day/:day', home.searchDate);
router.get('/month/:month', home.searchDate);

// 文章detail
router.get('/article/:aid', home.getArticle);

// 评论
router.get('/article/:aid/comments/count', home.getCmtCount);
router.get('/article/:aid/comments', home.getComments);

// 统计
router.get('/statistics', statis.index);
router.get('/statistics/month/:dmonth', statis.statisMonth);
router.get('/statistics/year/:dyear', statis.statisYear);
// 统计api
router.get('/api-statis/month/:dmonth', statis.searchDate);
router.get('/api-statis/year/:dyear', statis.searchDate);
router.get('/api-statis/articles/:aids', statis.searchArticles);



*/
module.exports = router;
