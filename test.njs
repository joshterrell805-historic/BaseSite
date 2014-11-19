var google = require('googleapis'),
    Promise = require('promise'),
    _ = require('underscore'),
    url = require('url');
/*

var OAuth2 = google.auth.OAuth2;
var scopes = ['https://www.googleapis.com/auth/plus.me'];
var oauth2Client = new OAuth2("95921165782-lr5jda9p8fq65ps9ofk2qb832e1csfo4.apps.googleusercontent.com", "Z3mUI_Om38XFbUZkZeJactsX", "http://joshterrell.com/oauth2callback");

var url = oauth2Client.generateAuthUrl({
  access_type: 'online',
  scope: scopes,
  state: "shindig",
});

console.log(url);
oauth2Client.getToken('4/wR8-fgu0aymMRYzleJ2X4IoKAvj_2b-emZAwokrr3oA.8sPWIliIv-gR3nHq-8bbp1uccJiVkwI', function(err, tokens) {
  if (err)
    throw err;
  else
    console.log(tokens);
});
*/

var cookie = require('cookie');
var c = cookie.serialize('csrf', 'some value', {
  'secure': true,
});

console.log(c);
