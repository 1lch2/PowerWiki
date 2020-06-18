var el = $('.tabs').first()[0];
var instance = M.Tabs.init(el);

$(document).ready(function() {
    $('select').formSelect(); // built-in initialization method in materialize
    $('#signin').click(varifySignin);
    $('#signup').click(signUp);
    $('#reset-confirm').click(resetPwd);
    $('.modal').modal(); // modal initialization
});

// Check if a variable is empty
function isEmpty(v) {
    switch (typeof v) {
        case 'undefined':
            return true;
        case 'string':
            if (v.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length == 0) return true;
            break;
        case 'boolean':
            if (!v) return true;
            break;
        case 'object':
            if (null === v || v.length === 0) return true;
            for (var i in v) {
                return false;
            }
            return true;
    }
    return false;
}

//Verify input from sign-in page
function varifySignin() {
    var formdata = {
        email: $('#email').val(),
        password: $('#password').val()
    }

    // Verify input data
    if (isEmpty(formdata.email) || isEmpty(formdata.password)) {
        M.toast({ html: "Can not leave as empty!" })
        return false
    } else {
        console.log(formdata); // Test line

        // Post form data to contorller
        $.ajax({
            type: 'POST',
            url: '/signin',
            dataType: 'JSON',
            data: formdata,
            success: function(res) {
                if (res.loginStatus) {
                    window.location.href = '/main'
                } else {
                    //alert("Wrong username or password.")
                    M.toast({ html: "Wrong username or password." })
                }
            }
        })
    }
}


// Sign-up
function signUp() {
    var formdata = {
        email: $("#re_email").val(),
        password: $('#re_password').val(),
        firstname: $('#firstname').val(),
        lastname: $('#lastname').val(),
        question: $("#questions").val(),
        answer: $('#answer').val(),
    }

    if (isEmpty(formdata.email) || isEmpty(formdata.password)) {
        M.toast({ html: "Can not leave as empty!" })
        return false
    } else {
        $.ajax({
            type: 'POST',
            url: '/signup',
            dataType: 'JSON',
            data: formdata,
            success: function(res) {
                if (res.registerStatus) {
                    window.location.href = '/main'
                } else {
                    // alert('Sign-up failed.')
                    M.toast({ html: "Sign-up failed, please try again." })
                }
            }
        });
    }
}

// Reset password
function resetPwd() {
    var formdata = {
        email: $("#reset_email").val(),
        question: $("#reset_questions").val(),
        answer: $("#reset_answer").val(),
        old_pwd: $("#original").val(),
        new_pwd: $("#new_pass").val()
    }

    if (isEmpty(formdata.email) || isEmpty(formdata.old_pwd) || isEmpty(formdata.new_pwd)) {
        M.toast({ html: "Can not leave as empty!" })
        return false
    } else {
        $.ajax({
            type: 'POST',
            url: '/valreset',
            dataType: 'JSON',
            data: formdata,
            success: function(res) {

                if (res.resetStatus) {
                    window.location.href = '/'
                } else {
                    // alert('Sign-up failed.')
                    M.toast({ html: "Password reset failed, please try again." })

                }
            }
        });
    }
}
