
exports.up = function(knex, Promise) {
  return Promise.all([
    // addes a new column to an existing table
    knex.schema.table('links', function(table) {
      table.string('title'); // creates column named 'id' auto-incrementing primary key
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('links', function(table) {
      table.dropColumn('title')
    })
  ]);
};
