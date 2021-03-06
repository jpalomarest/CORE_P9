var express = require('express');
var router = express.Router();

const quizController = require('../controllers/quiz.js');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index.ejs');
});

// Author page.
router.get('/credits', (req, res, next) => {
  res.render('credits.ejs');
});


// Autoload for routes using :quizId
router.param('quizId', quizController.load);


// Routes for the resource /quizzes
router.get('/quizzes',                     quizController.index);
router.get('/quizzes/:quizId(\\d+)',       quizController.show);
router.get('/quizzes/new',                 quizController.new);
router.post('/quizzes',                    quizController.create);
router.get('/quizzes/:quizId(\\d+)/edit',  quizController.edit);
router.put('/quizzes/:quizId(\\d+)',       quizController.update);
router.delete('/quizzes/:quizId(\\d+)',    quizController.destroy);

router.get('/quizzes/:quizId(\\d+)/play',  quizController.play);
router.get('/quizzes/:quizId(\\d+)/check', quizController.check);

router.get('/quizzes/randomplay',quizController.randomPlay);
router.get('/quizzes/randomcheck/:quizId(\\d+)',quizController.randomCheck);

module.exports = router;
