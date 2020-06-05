var model = require('../models/models')
var crypto = require('crypto');

/*---------------------------
    Login page controllers.
---------------------------*/

// show login page
function showLoginPage(req, res) {
    res.render("index.ejs");
}

// Validation for reset password function.
function validateResetPwd(req, res) {
    var resetStat = false
    var reqdata = req.body;
    var md5_1 = crypto.createHash('md5');
    var md5_2 = crypto.createHash('md5');

    console.log("[reset pwd]" + JSON.stringify(reqdata))

    var userdata = {
        email: reqdata["email"],
        question: reqdata["question"],
        answer: reqdata["answer"],
        old_pwd: md5_1.update(reqdata["old_pwd"], 'utf8').digest('hex'),
        new_pwd: md5_2.update(reqdata["new_pwd"], 'utf8').digest('hex')
    }

    // TODO: DB query does not return a valid result
    model.user.resetPWD(userdata).then(function(result) {
        console.log("controller recieved: " + JSON.stringify(result));
        resetStat = true;
        req.session.loginStatus = false;
        res.send({ resetStatus: resetStat })
    })
}

// User sign-in.
function signIn(req, res) {
    let loginstat = false;
    var reqdata = req.body;
    var md5 = crypto.createHash('md5');

    console.log("[sign-in]" + JSON.stringify(reqdata))

    var userdata = {
        email: reqdata["email"],
        pwd: md5.update(reqdata["password"], 'utf8').digest('hex')
    }

    // Send query to DB
    model.user.signIn(userdata).then(function(re) {
        if (re.length > 0) {
            loginstat = true;
            req.session.loginStatus = loginstat;

            console.log("user login success: " + userdata.email)
            res.send({ loginStatus: loginstat })
        } else {
            console.log("user login failed: " + userdata.email)
            res.send({ loginStatus: loginstat })
        }
    }).catch(function(e) {
        console.log(e);
        res.send({ loginStatus: loginstat })
    });
}

// User sign-up.
function signUp(req, res) {
    let regStat = false;
    var reqdata = req.body;
    var md5 = crypto.createHash('md5');

    console.log("[sign-up]" + JSON.stringify(reqdata))

    var userdata = {
        email: reqdata["email"],
        pwd: md5.update(reqdata["password"], 'utf8').digest('hex'),
        firstname: reqdata["firstname"],
        lastname: reqdata["lastname"],
        question: reqdata["question"],
        answer: reqdata["answer"]
    }

    // Send query to DB
    model.user.signUp(userdata).then(function() {
        regStat = true;
        req.session.loginStatus = regStat;

        console.log("user sign-up: " + userdata.email)
        res.send({ registerStatus: regStat })
    }).catch(function(e) {
        console.log(e);
        res.send({ registerStatus: regStat })
    });
}


// Test main page
function mainPageTest(req, res) {
    if (req.session.loginStatus) {
        res.render("main.ejs");
    } else {
        var unauth = "<h1>You have not login yet!</h1>" +
            "<a href='/'>Jump to login</a>"
        res.status(401).send(unauth);
    }
}

// exports
module.exports = {
    showLoginPage,
    validateResetPwd,
    signIn,
    signUp,
    mainPageTest,
};