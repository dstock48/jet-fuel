
exports.seed = function(knex, Promise) {

  return knex('links').del() // delete all links
    .then(() => knex('folders').del()) // delete all folders

    .then(() => {
      return Promise.all([
        knex('folders').insert({
          folder_name: 'Search Engines'
        }, 'id')
        .then( folder => {
          return knex('links').insert([
            {
              long_url: 'https://www.google.com',
              short_url: 'c4ed952b',
              title: 'Google Homepage',
              folder_id: folder[0]
            },
            {
              long_url: 'https://www.yahoo.com',
              short_url: 'f7a4b5f2',
              title: 'Yahoo! Homepage',
              folder_id: folder[0]
            },
            {
              long_url: 'https://www.bing.com',
              short_url: 'e174c3c0',
              title: 'Bing Homepage',
              folder_id: folder[0]
            }
          ])
        })
        .catch(error => console.log(`Error seeding data: ${error}`))
      ]) // end return Promise.all
    })

    .then( () => {
      return Promise.all([
        knex('folders').insert({
          folder_name: 'Social Media'
        }, 'id')
        .then( folder => {
          return knex('links').insert([
            {
              long_url: 'https://www.facebook.com',
              short_url: 'ed3dfe0a',
              title: 'Facebook',
              folder_id: folder[0]
            },
            {
              long_url: 'https://www.twitter.com',
              short_url: 'fee9d4bf',
              title: 'Twitter',
              folder_id: folder[0]
            }
          ])
        })
        .catch(error => console.log(`Error seeding data: ${error}`))
      ]) // end return Promise.all
    })
    .then(() => console.log('Re-seed complete!'))
    .catch(error => console.log(`Error seeding data: ${error}`))
};
