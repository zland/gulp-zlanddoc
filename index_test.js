var proxyquire = require('proxyquire');
var assert = require('assert');
var File = require('vinyl');
var readdirSyncCallCount = 0;

var zlanddoc = proxyquire('./index.js', {

  fs: {

    readdirSync: function() {
      readdirSyncCallCount++;
      if (readdirSyncCallCount === 1) {
        return ['testfolder1', 'testfolder2'];
      }
      if (readdirSyncCallCount === 2) {
        return ['testfile1.js', 'testfile2.js'];
      }

      throw new Error("unregistered readdirSync access");
    },

    existsSync: function() {
      return true;
    },

    readFileSync: function(file) {
      if (file.indexOf("README.md") !== -1) {
        return "# file " + file + " \n\n here some description of " + file;
      }

      if (file.indexOf(".js") !== -1) {
        return "some file content of " + file;
      }

      throw new Error("unregistered readFileSync access");
    },

    statSync: function() {
      return {
        isDirectory: function() {
          return true;
        },
        isFile: function() {
          return true;
        }
      }
    },

    '@noCallThru': true
  },

  dox: {
    parseComments: function(file) {
      return [
        {
          tags: [
            {
              type: 'filedescription',
              string: "neat description of " + file
            }
          ]
        }
      ];
    },

    '@noCallThru': true
  }
});

describe('gulp-zlanddoc', function() {

  it('add folder and file description to readme', function(done) {

    // create the fake file
    var fakeFile = new File({
      path: 'filetest/path/README.md',
      contents: new Buffer('abufferwiththiscontent')
    });

    // Create a zlanddoc plugin stream
    var doc = zlanddoc();

    // write the fake file to it
    doc.write(fakeFile);

    // wait for the file to come back out
    doc.once('data', function(file) {
      // make sure it came out the same way it went in
      assert(file.isBuffer());

      var content = file.contents.toString('utf8');

      // check the contents
      // for reparsing important comments
      assert.notEqual(content.indexOf('<!-- start generated readme -->'), -1);
      assert.notEqual(content.indexOf('<!-- end generated readme -->'), -1);
      // files
      assert.notEqual(content.indexOf('[testfolder1](testfolder1)'), -1);
      assert.notEqual(content.indexOf('[testfolder2](testfolder2)'), -1);
      // folders
      assert.notEqual(content.indexOf('[testfile1.js](testfile1.js.md)'), -1);
      assert.notEqual(content.indexOf('[testfile2.js](testfile2.js.md)'), -1);
      // call count
      assert.equal(readdirSyncCallCount, 2);
      done();
    });

  });

});
