
exports.up = function(knex, Promise) {
  return Promise.all([
    // creates a new table with the name 'folders'
    // this table must be created first so that the links table can have foreign links referring to the folderes table
    knex.schema.createTable('folders', function(table) {
      table.increments('id').primary(); // creates column named 'id' auto-incrementing primary key
      table.string('folder_name'); // creates column the name 'folder_name'
      table.timestamps(true); // gives us a 'created-at' timestamp
    }),

    // creates a new table with the name 'links'
    knex.schema.createTable('links', function(table) {
      table.increments('id').primary(); // creates column named 'id' auto-incrementing primary key
      table.string('long_url'); // creates column with name 'long_url' to store the long inputed URL
      table.string('short_url'); // creates column with name 'short_url' to store the shortened URL
      table.timestamps(true); // gives us a 'created-at' timestamp
      table.integer('folder_id').unsigned(); // creates foreign key column with the name 'folder_id'
      table.foreign('folder_id').references('folders.id'); // defines the reference table
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    // removes the tables from the database
    // the links table must be removed first because the folders table is dependant upon it
    knex.schema.dropTable('links'),
    knex.schema.dropTable('folders')
  ]);
};
