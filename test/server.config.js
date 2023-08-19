
const path = require('path');

module.exports = (env, argv) => ({
  output: path.join(__dirname, 'dist'),
  client: {
    main: {
      entry: './client/index.js',
      uri: '/',
    },
  },
  serverEntry: './server/index.js'
})