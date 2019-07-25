var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// scrapping tools 
var axios = require("axios");
var cheerio = require("cheerio");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// require all models 
var db = require("./models");

var PORT = 3000 

// initialize Express 
var app = express


// Middleware Config

// use morgan logger for logging request 

app.request(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/unit18Populater", {
  useNewUrlParser: true
});

// Routes 

app.get("/scrape", (req, res) => {
  // grab the body fo the html with axios 
  axios.get("https://medium.com/topic/technology").then(response => {
  // load into cheerio and save it to $ for a shorthand selector 
  var $ = cheerio.load(response.data);
  
  // we grab every h3 in the section class
  $("section h3").each((i, element) => {
 
    // save an empty result object 
    var result = {};

    // add the text and href of every link, and save properties of the result object 

    

  }) 
  
  
  })
})