var http = require('http');
var fs = require('fs');
var process = require('child_process');
var config = {
  port: 40480,
  docroot: '/data/www/docroot',
  requirejs: '/usr/bin/r.js -o out=stdout logLevel=4'
}
var command = config.requirejs + ' baseUrl=' + config.docroot + ' name='

http.createServer(function(request, response) {
  if (~request.url.search(/\.(js|css)$/)) {
    if (~request.url.search(/\.min\.(js|css)$/)) {
      request.url = request.url.replace(/\.min/, '');

      fs.exists(config.docroot + request.url, function (exists) {
        if (exists) {
          process.exec(command + request.url.replace(/^\//, '').match(/(.*)\.(js|css)$/)[0], function(error, stdout, stderr) {
            content_type = 'text/plain';
            if (~request.url.search(/\.js$/)) {
              content_type = 'application/javascript';
            } else if (~request.url.search(/\.css$/)) {
              content_type = 'text/css';
            }
            response.writeHead(200, { 'Content-Type': content_type });
            response.end(stdout);
          });
        } else {
          response.writeHead(404);
          response.end('I don\'t have a thing like that. Go Fish.');
        }
      });
    } else {
      response.writeHead(403);
      response.end('I know what that is, but you don\'t need my help to get things like that.');
    }
  } else {
    response.writeHead(415);
    response.end('What is this "' + request.url.match(/\.(.*)$/)[1] + '" thing you ask for?');
  }
}).listen(config.port);
