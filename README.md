1.Instal mongodb : 
   access link: https://docs.mongodb.com/manual/installation/#tutorials
   choose Install MongoDB Community Edition on Windows and install follow steps

2.Open source by Visual Studio Code.

3.Crete file .env in folder project, and add infomation config into file .env: (if not yet).
    NODE_ENV=development
    MONGODB_URI=mongodb://localhost/vtuber
    SECRET=demoVtuber

4.Run project on localhost. 
    Run command line (folde of project) :
        npm install
        npm run dev

5.Test API.
  Using PostMan.
    URL API: localhost:3000/api/user/registerUser
    Method: POST
    String Json :
        {
            "user":{
                "username": "namnvc",
                "email": "nguyen.van.namc@sun-asterik.com",
                "firstName": "Nguyen",
                "lastName": "Van Nam",
                "birthday": "1989-12-31",
                "notes": "this is test",
                "createBy": "NamNV",
                "updateBy": "NamNV",
                "password": "123456"
            }
        }

6.Run chat room:
    Open tab with localhost:3000 and input UserName(ignore Token). After that, click enter.
    With one tab, you had one session look like one account.

Code Overview
   Dependencies: 
    expressjs - The server for handling and routing HTTP requests
    express-jwt - Middleware for validating JWTs for authentication
    jsonwebtoken - For generating JWTs used by authentication
    mongoose - For modeling and mapping MongoDB data to javascript
    express-validator - Validation paramatter of API
    passport - For handling user authentication
    socket.io - Realtime
    winston - write log

Application Structure
    app.js - The entry point to our application. This file defines our express server and connects it to MongoDB using mongoose. It also requires the routes and models we'll be          using in the application.
    config/ - This folder contains configuration for passport as well as a central location for configuration/environment variables.
    routes/ - This folder contains the route definitions for our API.
    models/ - This folder contains the schema definitions for our Mongoose models.
    services/ - This folder contains the services to hanling business and access Mongodb.
    utility/ - This folder contains the logger and validations.
    .env - const environment available
    

      
 