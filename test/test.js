var gutil = require('gulp-util')
  , fs = require('fs')
  , plugin = require('../');

function call(newFoo) {
  var cache = {};
  function define(name, deps, factory) {
    if (!factory) {
      factory = deps;
      deps = null;
    }
    cache[name] = { factory: factory, deps: null };
  }

  function require(name) {
    return cache[name].exports;
  }
  new Function('define', newFoo)(define);

  Object.keys(cache).forEach(function (key) {
    cache[key].deps ?
      process.nextTick(function () {
        var mod = cache[key]
          , module = { exports: {} }
        mod.exports = mod.factory(require, module.exports, module) || module.exports;
      }) :
      !function () {
        var mod = cache[key]
          , module = { exports: {} }
        mod.exports = mod.factory(require, module.exports, module) || module.exports;
      }();
  });
  return require;
}

describe('gulp-dmd', function () {
  it('should package a dwarf module and its depended modules', function () {
    var file = new gutil.File({
      path: 'test/src/main1.js',
      cwd: 'test/src',
      base: 'test/src',
      contents: fs.readFileSync('test/src/main1.js')
    });

    var stream = plugin();
    stream.on('data', function (newFile) {
      call(newFile.contents.toString())('./main1')().should.equal('Hello, world!');
    });

    stream.write(file);
    stream.end();

  });

  it('should package a dwarf module and its depended modules with template', function () {
    var file = new gutil.File({
      path: 'test/src/main2.js',
      cwd: 'test/src',
      base: 'test/src',
      contents: fs.readFileSync('test/src/main2.js')
    });

    var stream = plugin();
    stream.on('data', function (newFile) {
      call(newFile.contents.toString())('./main2')().should.equal('<p>Hello, world!</p>');
    });

    stream.write(file);
    stream.end();

  });
});