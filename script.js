var fb = new Firebase("https://chat-app-1b1c5-default-rtdb.firebaseio.com/");
var messages = fb.child("messages");
var user = localStorage.getItem('username');

// Check if username is in local storage on page load
$(document).ready(function() {
  if (!user) {
    // Show the username modal if username is not in local storage
    $('#usernameModal').show();
  }
});

// Submit username handler
$('#submitUsername').on('click', function() {
  var username = $('#usernameInput').val();
  if (username.length > 0) {
    user = username;

    // Store username in local storage
    localStorage.setItem('username', username);

    // Upload username to Firebase
    fb.child("users").push({ username: username });

    // Hide username modal
    $('#usernameModal').hide();

    // Show clear username button
    $('#clearUsername').removeClass('hidden');
  }
});

// Clear username handler
$('#clearUsername').on('click', function() {
  if (user) {
    // Remove username from local storage
    localStorage.removeItem('username');

    // Remove username from Firebase
    fb.child("users").orderByChild("username").equalTo(user).once("value", function(snapshot) {
      snapshot.forEach(function(child) {
        fb.child("users").child(child.key).remove();
      });
    });

    // Clear username
    user = null;

    // Show username modal
    $('#usernameModal').show();

    // Hide clear username button
    $(this).addClass('hidden');
  }
});

// Sanitize function
(function($) {
  $.sanitize = function(input) {
    var output = input.replace(/<script[^>]*?>.*?<\/script>/gi, '').
    replace(/<[\/\!]*?[^<>]*?>/gi, '').
    replace(/<style[^>]*?>.*?<\/style>/gi, '').
    replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
    return output;
  };
})(jQuery);

// Message input handler
$('#message').on('keyup', function(e) {
  if (e.keyCode === 13 && $(this).val().length > 0) {
    var getTxt = $(this).val();
    var timestamp = new Date().toISOString();
    messages.push({
      user: user,
      message: getTxt,
      timestamp: timestamp
    });
    $(this).val('');
  }
});

// Firebase child added listener
messages.limitToLast(100).on("child_added", function(snap) {
  var message = snap.val();
  var isCurrentUser = message.user === user;

  // Format timestamp to display only the time
  var time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  var bubbleClass = isCurrentUser ? 'bg-blue-500 text-white rounded-br-none rounded-bl-lg' : 'bg-gray-300 text-black rounded-bl-none rounded-br-lg';

  var justifyClass = isCurrentUser ? 'justify-end' : 'justify-start';

  var messageHTML = '<li class="mb-2"><div class="flex ' + justifyClass + '"><div class="max-w-sm mx-2"><div class="rounded-lg px-4 py-2 ' + bubbleClass + '"><p class="text-sm">' + $.sanitize(message.message) + '</p><p class="text-xs text-black">' + message.user + ' • ' + time + '</p></div></div></div></li>';

  // Append the message HTML to the appropriate container
  $('#messages').append(messageHTML);

  // Scroll to the bottom of the message container
  window.scrollTo(0, document.body.scrollHeight);
});
