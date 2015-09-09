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

var through = require('through2');
var path = require('path');
var fs = require('fs');
var dox = require('dox');
var gutil = require('gulp-util');

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    if (file.indexOf('.') === 0) {
      return false;
    }
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

function getFiles(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isFile();
  });
}

function getFolderDescription(dir) {
  var readmePath = path.join(dir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    return '';
  }
  var file = fs.readFileSync(readmePath, 'utf-8');
  var arrayOfLines = file.match(/[^\r\n]+/g);
  if (!arrayOfLines || !arrayOfLines[1]) {
    return '';
  }
  return arrayOfLines[1];
}

function getFileDescription(filePath) {
  var fileDescription = '';
  var file = fs.readFileSync(filePath, 'utf-8');
  dox.parseComments(file).forEach(function(thingy) {
    thingy.tags.forEach(function(tag) {
      if (tag.type === 'filedescription') {
        fileDescription = tag.string;
      }
    })
  });
  return fileDescription;
}

function filterGeneratedContent(string) {
  return string.replace(/(\<\!\-\- start generated readme \-\-\>)([\s\S]*?)(\<\!\-\- end generated readme \-\-\>)/, '');
}

function createDescriptions(descriptions) {
  return descriptions.map(function(description) {
    return '### [' + description.text + '](' + description.link + ')' + "  \n"
            + description.description;
  });
}

function createDescriptionContent(directoryDescriptions, fileDescriptions) {
  var content = "<!-- start generated readme -->"
  if (directoryDescriptions.length) {
    content+= "\n\n## Directories  \n\n"
            + createDescriptions(directoryDescriptions).join("\n\n");
  }
  if (fileDescriptions.length) {
    content+= "\n\n## Files  \n\n"
           + createDescriptions(fileDescriptions).join("\n\n");
  }
  content+= "\n\n<!-- end generated readme -->";
  return content;
}

// Plugin level function(dealing with files)
function zlanddoc() {

  // Creating a stream through which each file will pass
  return through.obj(function(file, enc, cb) {
    if (file.isStream()) {
      throw new gutil.PluginError('Streams are not supported');
    }

    if (file.isNull()) {
      // return empty file
      return cb(null, file);
    }

    var directoryPath = path.dirname(file.path);
    var directories = getDirectories(directoryPath);
    var files = getFiles(directoryPath);

    var directoryDescriptions = directories.map(function(subdir) {
      return {
        description: getFolderDescription(path.join(directoryPath, subdir)),
        text: subdir,
        link: subdir
      };
    });

    var jsFiles = files.filter(function(file) {
      return path.extname(file) === '.js';
    });

    var fileDescriptions = jsFiles.map(function(file) {
      return {
        description: getFileDescription(path.join(directoryPath, file)),
        text: file,
        link: file + '.md'
      };
    });

    var fileContent = filterGeneratedContent(file.contents.toString());
    if (fileContent.charAt(fileContent.length) !== "\n") {
      fileContent+= "\n";
    }
    fileContent+= createDescriptionContent(directoryDescriptions, fileDescriptions);
    file.contents = new Buffer(fileContent);
    cb(null, file);

    // console.log(directoryPath);
    // console.log(directoryDescriptions);

  });

}

module.exports = zlanddoc;
