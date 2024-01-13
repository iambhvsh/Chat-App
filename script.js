// If you fork this, please change this database link to your own.
var fb = new Firebase("https://chat-app-1b1c5-default-rtdb.firebaseio.com/");
var messages = fb.child("messages");
var btn = $('button');
var wrap = $('.wrapper');
var input = $('input.message');
var usernameInput = $('input.username');

var user = [];

// Check if username is in local storage on page load
$(document).ready(function() {
    var storedUsername = localStorage.getItem('username');
    if (storedUsername) {
        user.push(storedUsername);
        $('.initModal').css('display', 'none');
    } else {
        // Show the screen to enter the username
        $('.initModal').css('display', 'block');
    }
});

(function($) {
    $.sanitize = function(input) {
        var output = input.replace(/<script[^>]*?>.*?<\/script>/gi, '').
                        replace(/<[\/\!]*?[^<>]*?>/gi, '').
                        replace(/<style[^>]*?>.*?<\/style>/gi, '').
                        replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
        return output;
    };
})(jQuery);

usernameInput.on('keyup', function(e) {
    if (e.keyCode === 13 && usernameInput.val().length > 0) {
        var getTxt = usernameInput.val();
        user.push(getTxt);
        usernameInput.val('');

        // Store username in local storage
        localStorage.setItem('username', getTxt);

        $('.initModal').css('display', 'none');
        console.log(user);
    }
});

input.on('keyup', function(e) {
    var curUsername = user.join();
    if (e.keyCode === 13 && input.val().length > 0) {
        var getTxt = input.val();
        messages.push({
            user: curUsername,
            message: getTxt
        });
        input.val('');
    }
});

messages.limitToLast(100).on("child_added", function(snap) {
    wrap.append('<li><span>' + $.sanitize(snap.val().user) + ':</span> ' + $.sanitize(snap.val().message) + '</li>');
    window.scrollTo(0, document.body.scrollHeight);
});
