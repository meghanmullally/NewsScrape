var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

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
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new section using the `result` object built from scraping 

      db.Article.create(result).then((dbArticle) => {
        // view the added result in the console
        console.log(dbArticle);
      }).catch((err) => {
        console.log(err);
      });

    });
    // send a message to the client 
    res.send('Scrape Complete');
  });
});

// Route for getting all Articles from the db 
app.get("/articles", (req, res) => {
  // grabbing every doc in the Articles Collection 
  db.Article.find({}).then((dbArticle) => {
    // send them back to client if successfully find Articles 
    res.json(dbArticle);
  }).catch((err) => {
    // if err then send it to the client 
    res.json(err);
  });
});

// routes for saving / updating an Article
app.post("/articles/:id", (req, res) => {
  // Note was created, find one Article with an `_id` equal to the `req.params.id`
  // then we update the article to be associated with the new Note 
  // {new: true}  will tell teh query that we want to return the updated User then return the original to default 
  db.Note.create(req.body).then((dbNote) => {
    return db.Article.findOneAndUpdate({
      _id: req.params.id
    }, {
      note: dbNote._id
    }, {
      new: true
    });
  }).then((dbArticle) => {
    // send them back to client if successfully find Articles 
    res.json(dbArticle);
  }).catch((err) => {
    // if err then send it to the client 
    res.json(err);
  });
});


// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});