'use strict';

module.exports = function minion(config) { 
  require('http').createServer(function(request, response) {
    if (~request.url.search(/\.(js|css)$/)) {
      if (~request.url.search(/\.min\.(js|css)$/)) {
        request.url = request.url.replace(/\.min/, '');

        require('fs').exists(config.get('docroot') + request.url, function (exists) {
          if (exists) {
            var target = request.url.replace(/^\//, '').replace(/\.(js|css)$/, ''),
                options = ['-o', 'out=stdout', 'logLevel=4', 'baseUrl=' + config.get('docroot'), 'name=' + target],
                command = require('child_process').spawn(config.get('requirejs'), options);

            command.stdout.on('data', function (data) {
              response.statusCode = 200;
              if (~request.url.search(/\.js/)) {
                if (!response.headersSent) {
                  response.setHeader('Content-Type', 'application/javascript');
                }
              } else if (~request.url.search(/\.css/)) {
                if (!response.headersSent) {
                  response.setHeader('Content-Type', 'text/css');
                }
              } else {
                if (!response.headersSent) {
                  response.setHeader('Content-Type', 'text/plain');
                }
              }
              if (~request.headers['accept-encoding'].search('gzip')) {
                if (!response.headersSent) {
                  response.setHeader('Content-Encoding', 'gzip');
                }
                require('zlib').gzip(data, function (error, result) {
                  response.write(result);
                });
              } else if (~request.headers['accept-encoding'].search('deflate')) {
                if (!response.headersSent) {
                  response.setHeader('Content-Encoding', 'deflate');
                }
                require('zlib').deflate(data, function (error, result) {
                  response.write(result);
                });
              } else {
                response.write(data);
              }
            }).on('end', function () {
              response.end();
            });

            command.stderr.on('data', function (data) {
              response.statusCode = 500;
              response.write(data);
            }).on('end', function () {
              response.end();
            });
          } else {
            response.statusCode = 404;
            response.end('I don\'t have a thing like that. Go Fish.');
          }
        });
      } else {
        response.statusCode = 403;
        response.end('I know what that is, but you don\'t need my help to get things like that.');
      }
    } else {
      if (~request.url.search(/^\/$/)) {
        response.statusCode = 418;
        response.end('How Zen.');
      } else {
        response.statusCode = 415;
        response.end('What is this "' + request.url.match(/\.(.*)$/)[1] + '" thing you ask for?');
      }
    }
  }).listen(config.get('port'));
}
