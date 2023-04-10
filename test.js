const assert = require('assert');
const app = require('/app.js');
const request = require('supertest')(app);

describe('GET /', function() {
    it('should return the login.ejs view', function(done) {
      request.get('/')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          assert.equal(res.text, 'login.ejs');
          done();
        });
    });
  });
  
