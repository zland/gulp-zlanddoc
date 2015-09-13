/**
 * Copyright 2015 Florian Biewald
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 'use strict';

var proxyquire = require('proxyquire');
var assert = require('assert');
var File = require('vinyl');
var readdirSyncCallCount = 0;
var fileExistsFunction = null;
var fs = require('fs');

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
      if (fileExistsFunction) {
        return fileExistsFunction.apply(undefined, arguments);
      }
      return true;
    },

    readFileSync: function(file) {
      if (file.indexOf("README.md") !== -1) {
        return "# file " + file + " \n\n here some description of " + file;
      }

      if (file.indexOf(".js") !== -1) {
        return "some file content of " + file;
      }

      if (file.indexOf(".ejs") !== -1) {
        return fs.readFileSync(file).toString();
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

  beforeEach(function() {
    readdirSyncCallCount = 0;
    fileExistsFunction = null;
  });

  it('contains static variables', function() {
    assert.notEqual(undefined, zlanddoc.markdoxCustomTemplate);
    assert.notEqual(undefined, zlanddoc.markdoxCustomFormatter);
  });

  it('add folder and file description to readme', function(done) {

    // create the fake file
    var fakeFile = new File({
      path: 'filetest/path/README.md',
      contents: new Buffer('abufferwiththiscontent')
    });

    // Create a zlanddoc plugin stream
    var doc = zlanddoc({
      buildFileDescriptions: true
    });

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


  it('add folder description only to readme', function(done) {

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
      assert.equal(content.indexOf('[testfile1.js](testfile1.js.md)'), -1);
      assert.equal(content.indexOf('[testfile2.js](testfile2.js.md)'), -1);
      done();
    });

  });

  it("writes link to file if .md file does not exists", function(done) {
    fileExistsFunction = function(file) {
      return file.indexOf('.js.md') === -1;
    };

    // create the fake file
    var fakeFile = new File({
      path: 'filetest/path/README.md',
      contents: new Buffer('abufferwiththiscontent')
    });

    // Create a zlanddoc plugin stream
    var doc = zlanddoc({
      buildFileDescriptions: true
    });

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
      assert.notEqual(content.indexOf('[testfile1.js](testfile1.js)'), -1);
      assert.notEqual(content.indexOf('[testfile2.js](testfile2.js)'), -1);
      done();
    });

  });

});
