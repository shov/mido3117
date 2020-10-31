# How to start
* make sure you have Node 11 +
* get to the project dir in a terminal app
* start the server `node server.js`
* navigate to [http://localhost:3000/](http://localhost:3000/) in you favorite browser

# Expected
* user data fields are filled by cookies values if they are exist
* any change of the fields does re-set the cookies, for one minute a lifetime

# Troubleshooting
* port of 3000 is already taken, change the port in `server.js Server.constructor.PORT`
* browser does not support [modern JS ECMAScript (ECMA-262)](https://tc39.es/ecma262/#sec-let-and-const-declarations). Please use any modern browser.
 
