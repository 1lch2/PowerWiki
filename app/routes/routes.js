var express = require('express')
var index_controller = require('../controllers/index.controller.js')
var analytic_controller = require('../controllers/analytic.controller')
var router = express.Router()

// Login/Signup page contollers
router.get('/', index_controller.showLoginPage);
router.post('/signin', index_controller.signIn);
router.post('/signup', index_controller.signUp);
router.post('/valreset', index_controller.validateResetPwd);
router.get('/main', index_controller.mainPageTest);

// Analytic page controllers
router.get('/analytic/view_overall', analytic_controller.viewOverall);
router.get('/analytic/view_charts', analytic_controller.viewDistribution);
router.get('/analytic/get_all_articles', analytic_controller.getAllArticlesAndRevisions)
router.get('/analytic/view_individual', analytic_controller.getArticleInfo);
router.get('/analytic/update_article', analytic_controller.updateArticle);
router.get('/analytic/view_article_summary', analytic_controller.viewArticleSummary);
router.get('/analytic/get_reddit_posts', analytic_controller.getRedditPosts);
router.get('/analytic/get_individual_chart', analytic_controller.viewIndividualDistribution);
router.get('/analytics/get_all_author', analytic_controller.getAllAuthors);
router.get('/analytics/view_author', analytic_controller.viewArticleChangedByAuthor);

module.exports = router;