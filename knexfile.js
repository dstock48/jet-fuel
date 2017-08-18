// Update with your config settings.

module.exports = {

  development: {
    client: 'pg', // tells knex that we're using a postgres SQL DB
    connection: 'postgres://localhost/jetfuel', // connection path do the DB
    migrations: {
      directory: './db/migrations' // location of migrations files
    },
    seeds: {
      directory: './db/seeds/dev' // location of seed file
    },
    useNullAsDefault: true // fills any empty columns with a null value
  },

  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://localhost/jetfueltest',
    useNullAsDefault: true,
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/test/seeds'
    }
  },

  // staging: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL + `?ssl=true`,
    migrations: {
      directory: './db/migrations'
    },
    useNullAsDefault: true
  }

};
