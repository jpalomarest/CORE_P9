const Sequelize = require("sequelize");
const {models} = require("../models");
const Op = Sequelize.Op;
var ssn;

// Autoload el quiz asociado a :quizId
exports.load = (req, res, next, quizId) => {
/*app.get('/',(req,res)=>{
  ssn = req.session;
  ssn.randomPlay;
  ssn.score;
});*/
    models.quiz.findByPk(quizId)
    .then(quiz => {
        if (quiz) {
            req.quiz = quiz;
            next();
        } else {
            throw new Error('There is no quiz with id=' + quizId);
        }
    })
    .catch(error => next(error));
};


// GET /quizzes
exports.index = (req, res, next) => {
    models.quiz.findAll()
    .then(quizzes => {
        res.render('quizzes/index.ejs', {quizzes});
    })
    .catch(error => next(error));
};


// GET /quizzes/:quizId
exports.show = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/show', {quiz});
};


// GET /quizzes/new
exports.new = (req, res, next) => {

    const quiz = {
        question: "",
        answer: ""
    };

    res.render('quizzes/new', {quiz});
};

// POST /quizzes/create
exports.create = (req, res, next) => {

    const {question, answer} = req.body;

    const quiz = models.quiz.build({
        question,
        answer
    });

    // Saves only the fields question and answer into the DDBB
    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz created successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/new', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error creating a new Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/edit
exports.edit = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/edit', {quiz});
};


// PUT /quizzes/:quizId
exports.update = (req, res, next) => {

    const {quiz, body} = req;

    quiz.question = body.question;
    quiz.answer = body.answer;

    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz edited successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/edit', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error editing the Quiz: ' + error.message);
        next(error);
    });
};


// DELETE /quizzes/:quizId
exports.destroy = (req, res, next) => {

    req.quiz.destroy()
    .then(() => {
        req.flash('success', 'Quiz deleted successfully.');
        res.redirect('/quizzes');
    })
    .catch(error => {
        req.flash('error', 'Error deleting the Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/play
exports.play = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || '';

    res.render('quizzes/play', {
        quiz,
        answer
    });
};


// GET /quizzes/:quizId/check
exports.check = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || "";
    const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();

    res.render('quizzes/result', {
        quiz,
        result,
        answer
    });
};

//GET /quizzes/randomplay
exports.randomPlay = (req,res,next) => {
    ssn = req.session;
    const score = ssn.score || 0;
    if(score === 0){
        ssn.randomPlay = [];
    }
    models.quiz.findOne({
        where: {id: {[Op.notIn]: ssn.randomPlay}},
        order: [Sequelize.fn( 'RANDOM' ),]
    })
        .then(quiz => {
            if(!quiz){
                ssn.score = 0;
                return res.render('quizzes/random_nomore.ejs', {score});
            }else{
                return res.render('quizzes/random_play.ejs', {quiz,score} );
            }
        })
        .catch(error => {
            req.flash('error', 'Error asking next question: ' + error.message);
            next(error);
        });
};

//GET /quizzes/randomcheck/:quizId
exports.randomCheck = (req, res, next) => {
    ssn = req.session;
    const answer = req.query.answer;
    const quiz = req.quiz;
    let score = ssn.score || 0;

    let result = false;

    if(answer.toLowerCase().trim()===quiz.answer.toLowerCase().trim()){
        result = true;
        score++;
        ssn.score = score;
        ssn.randomPlay.push(quiz.id);
    }
    res.render('quizzes/random_result.ejs', {result,score,answer} );
};