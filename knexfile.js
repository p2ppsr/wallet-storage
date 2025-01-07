module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: 'test/data/tmp/updatetest.sqlite'
    },
    useNullAsDefault: true
  }
}
