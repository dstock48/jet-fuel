const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);


describe('Client-side Routes', () => {
  it('should return the static HTML file', (done) => {
    chai.request(server)
    .get('/')
    .end((err, response) => {
      response.should.have.status(200);
      response.should.be.html;

      done();
    });
  });
});


describe('API Routes', () => {
  // runs just once before all tests in the 'describe' block
  before((done) => {
    // run migrations
    done();
  })

  // runs before each and every 'it' block
  beforeEach((done) => {
    // run seed file(s)
    done();
  })

  describe('GET /api/v1/students', () => {
    it('should return all of the students', (done) => {
      chai.request(server)
      .get('/api/v1/students')
      .end((err, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.equal(3);
        response.body[0].should.have.property('lastname');
        response.body[0].lastname.should.equal('Turing');

        done();
      });
    });
  });

  describe('POST /api/v1/links', () => {
    it('should create a new link', (done) => {
      chai.request(server)
      .post('/api/v1/links')
      .send({
        long_url: '',
        title: '',
        folder_id: true
      })
      .end((err, response) => {

        chai.request(server)
        .get('/api/v1/links')
        .end((err, response) => {

          done();
        })
      });
    });
    it('should not create a new link with missing data', (done) => {
      chai.request(server)
      .post('/api/v1/links')
      .send({
        long_url: '',
        title: '',
        // 'folder_id' has been left out
      })
      .end((err, response) => {
        response.should.have.status(422);
        response.body.error.should.equal('You are missing data!');
        done();
      })
    });
  });



});
