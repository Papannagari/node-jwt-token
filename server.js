var express = require("express")
var app = express();
var router = express.Router();
var bodyParser = require("body-parser");
var mongoose = require("mongoose")
var morgan = require("morgan")
var jwt = require("jsonwebtoken")

var config  = require("./config.js");
var User  = require("./models/user");


app.use(morgan('dev'))
app.set("secretket",config.SECRET);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

console.log("my secretkey :"+app.get("secretket"))
mongoose.connect(config.DATABASECON,function(){
	console.log("This is connected to DB successfully")
})

router.get("/",function(request,response){
	response.send("This is my authentication app")
})

router.post("/createUser",function(request,response){
	var userObj = request.body;
	User.createUser(userObj,function(err,data){
		if(err){
		              throw err;
				  }
		response.json(data)		  
	})
})

router.get("/getUser/:name",function(request,response){
	var userName = request.params.name;
	User.getUerByName(userName,function(err,data){
			if(err){
					    throw err;
				 }
		response.json(data)		
	})
})

router.get("/getAllUsers",function(request,response){
	// userObj = request.body;
	 User.getUers(function(err,data){
	 	if(err){
					    throw err;
				 }
		response.json(data)
	 })
})
router.post("/authenticate",function(request,response){
	var userName = request.body.name;
	var password = request.body.password;
      User.getUerByName(userName,function(err,user){
      	if(err){
      		throw err;
      	}
      	if(!user){
      		response.json({
             success :false,
             message :"Authentication failed,user not found"
          	});
      	}
      	else if(user){
      		if(user.password != password){
      			response.json({
      				success : false,
      				message : "Authentication failed, password not matched"
      			})
      		}
      		else{
      		    var token = jwt.sign(user,app.get("secretket"))
      		    response.json({
      				success : true,
      				message : "Here is your token",
      				token : token
      			})
      	    }
      	}

      })
})

router.use(function(request,response,next){
	var token = request.body.token ||
	            request.query.token ||
	            request.headers["x-access-token"];


if(token){
jwt.verify(token,app.get("secretket"),function(err,decoded){
	if(err){
	    response.json({
	      				success : false,
	      				message : "Authentication failed ,not a valid token"
	      				
	      			})
	}
	request.decoded = decoded;
	next();
})
}
else{
    response.status(403).send({
	      				success : false,
	      				message : "Please provide token"
	      				
	      			})
}
});
app.use("/api",router);

var PORT = process.env.PORT || 2017;

app.listen(PORT,function(){
	console.log("server listening at port  "+PORT)
})