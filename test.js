const assert = require('assert');
const app = require('./app');
const request = require('supertest')(app);

describe('GET /', function() {
  it('should return the login.ejs view', function(done) {
    request.get('/')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        // Check for the unique input element with ID 'username'
        assert(res.text.includes('<input type="text" class="form-control" id="username" name="username" required>'));
        // Alternatively, check for the 'Login' text within an <h1> tag
        // assert(res.text.includes('<h1 class="text-center my-4">Login</h1>'));
        done();
      });
  });
});
