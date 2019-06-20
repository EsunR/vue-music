var path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        'src': resolve('src'),
        'common': resolve('src/common'),
        'components': resolve('src/components'),
        'api': resolve('src/api'),
        'base': resolve('src/base')
      }
    }
  }
}