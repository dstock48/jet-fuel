process.env.NODE_ENV = 'test'

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

chai.use(chaiHttp);


// CLIENT SIDE ROUTES
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

  it('should redirect from a shortened URL to a long URL', (done) => {
    chai.request(server)
    .get('/shrt/c4ed952b')
    .end((err, response) => {
      response.redirects[0].should.equal('https://www.google.com/')
    });

    chai.request(server)
    .get('/shrt/fee9d4bf')
    .end((err, response) => {
      response.redirects[0].should.equal('https://www.twitter.com/')

      done();
    });
  });

});



// API ROUTES
describe('API Routes', () => {

  beforeEach((done) => {
    database.migrate.rollback()
    .then(() => {
      database.migrate.latest()
      .then(() => {
        database.seed.run()
        .then(() => {
          done();
        })
      });
    });
  });

  // FOLDER ENDPOINT TESTS
  describe('GET /api/v1/folders', () => {

    it('should return all of the folders', (done) => {
      chai.request(server)
      .get('/api/v1/folders')
      .end((err, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.equal(2);
        response.body[0].should.have.property('folder_name');
        response.body[0].folder_name.should.equal('Search Engines');
        response.body[1].folder_name.should.equal('Social Media');

        done();
      });
    });

    it('should return an error status if you do not hit the correct endpoint', (done) => {
      chai.request(server)
      .get('/api/v1/folder') // 'folder' is wrong. should be 'folders'
      .end((err, response) => {
        response.should.have.status(404);

        done();
      });
    });

  });

  describe('POST /api/v1/folders', () => {

    it('should create a new folder', (done) => {
      chai.request(server)
      .post('/api/v1/folders')
      .send({
        folder_name: 'Code Stuff'
      })
      .end((err, response) => {
        response.should.have.status(201);
        response.should.be.json;
        response.body.should.be.a('object');
        response.body.should.have.property('created_at');

        response.body.should.have.property('folder_name');
        response.body.folder_name.should.equal('Code Stuff');

        chai.request(server)
        .get('/api/v1/folders')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body.length.should.equal(3);
          response.body[2].should.have.property('created_at');

          response.body[2].should.have.property('folder_name');
          response.body[2].folder_name.should.equal('Code Stuff');

          done();
        })
      });
    });

    it('should not create a new folder with missing data', (done) => {
      chai.request(server)
      .post('/api/v1/folders')
      .send({
        folder_name: null
      })
      .end((err, response) => {
        response.should.have.status(422);
        response.body.error.should.equal('Missing required parameter: folder_name');

        done();
      })
    });

    it('should not create a folder with a duplicate name', (done) => {
      chai.request(server)
      .post('/api/v1/folders')
      .send({
        folder_name: 'Social Media'
      })
      .end((err, response) => {
        response.should.have.status(500);
        response.body.err.detail.should.equal('Key (folder_name)=(Social Media) already exists.');

        done();
      })
    });

  });



  // LINK ENDPOINT TESTS
  describe('GET /api/v1/links', () => {

    it('should return all of the links', (done) => {
      chai.request(server)
      .get('/api/v1/links')
      .end((err, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.equal(5);
        response.body[0].should.have.property('created_at');

        response.body[0].should.have.property('folder_id');
        response.body[0].folder_id.should.equal(1);
        response.body[4].folder_id.should.equal(2);

        response.body[0].should.have.property('title');
        response.body[0].title.should.equal('Google Homepage');
        response.body[4].title.should.equal('Twitter');

        response.body[0].should.have.property('long_url');
        response.body[0].long_url.should.equal('https://www.google.com');
        response.body[4].long_url.should.equal('https://www.twitter.com');

        response.body[0].should.have.property('short_url');
        response.body[0].short_url.should.equal('c4ed952b');
        response.body[4].short_url.should.equal('fee9d4bf');

        done();
      });
    });

    it('should return an error status if you do not hit the correct endpoint', (done) => {
      chai.request(server)
      .get('/api/v1/link') // 'link' is wrong. should be 'links'
      .end((err, response) => {
        response.should.have.status(404);

        done();
      });
    });

  });

  describe('POST /api/v1/links', () => {
    it('should create a new link', (done) => {
      chai.request(server)
      .post('/api/v1/links')
      .send({
        long_url: 'https://www.duckduckgo.com/',
        title: 'DuckDuckGo',
        folder_id: 1
      })
      .end((err, response) => {
        response.should.have.status(201);
        response.should.be.json;
        response.body.should.be.a('object');
        response.body.should.have.property('created_at');

        response.body.should.have.property('folder_id');
        response.body.folder_id.should.equal(1);

        response.body.should.have.property('title');
        response.body.title.should.equal('DuckDuckGo');

        response.body.should.have.property('long_url');
        response.body.long_url.should.equal('https://www.duckduckgo.com/');

        response.body.should.have.property('short_url');
        response.body.short_url.should.equal('39f979e5');

        chai.request(server)
        .get('/api/v1/links')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body.length.should.equal(6);
          response.body[5].should.have.property('created_at');

          response.body[5].should.have.property('folder_id');
          response.body[5].folder_id.should.equal(1);

          response.body[5].should.have.property('title');
          response.body[5].title.should.equal('DuckDuckGo');

          response.body[5].should.have.property('long_url');
          response.body[5].long_url.should.equal('https://www.duckduckgo.com/');

          response.body[5].should.have.property('short_url');
          response.body[5].short_url.should.equal('39f979e5');

          done();
        })
      });
    });

    it('should not create a new link with missing data', (done) => {
      chai.request(server)
      .post('/api/v1/links')
      .send({
        long_url: 'https://www.duckduckgo.com/',
        title: 'DuckDuckGo'
        // folder_id has been left out
      })
      .end((err, response) => {
        response.should.have.status(422);
        response.body.error.should.equal('Missing required parameter: folder_id');

        done();
      })
    });

  });



});
