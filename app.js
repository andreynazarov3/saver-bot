const http = require('http')

const server = http.createServer(function(request, response) {
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("Hello, heroku!");
});

server.listen(80);
console.log("Server is listening");