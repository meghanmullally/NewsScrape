//Dependencies 
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var path = require('path');

// var apiRoutes = require("./routes/apiRoutes");
// var htmlRoutes = require("./routes/htmlRoutes");

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


app.engine("handlebars", exphbs({
  defaultLayout: "main",
  partialsDir: path.join(__dirname, "/views/partials")
}));
app.set("view engine", "handlebars")

// ROUTES

app.get("/", (req, res) => {
  db.Article.find({
    // "saved": false
  }, (err, data) => {
    console.log(data)
    var handlebarsObj = {
      articles: data
    };
    console.log(handlebarsObj, "handlebarObj");
    res.render("home", handlebarsObj)
  
  });
});

app.get('/saved', (req, res) => {
  db.Article.find({
    "saved": true
  }, (err, data) => {
    var handlebarsObj = {
      articles: data
    };
    console.log(handlebarsObj);
    res.render("saved", handlebarsObj)
  });
});

app.get("/scrape", (req, res) => {
  axios.get("https://medium.com/topic/technology").then(function (response) {
    var $ = cheerio.load(response.data);
    $("section div div div").each(function (i, element) {
      var result = {};
      result.link = $(this)
        .children("h3")
        .children("a")
        .attr("href");
      result.title = $(this)
        .children("h3")
        .children("a")
        .text();
      result.summary = $(this)
        .children("div")
        .children("p")
        .children("a")
        .text()

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
  db.Article.find({
    "saved": false
  }).then((dbArticle) => {
    // send them back to client if successfully find Articles 
    res.json(dbArticle);
  }).catch((err) => {
    // if err then send it to the client 
    res.json(err);
  });
});

// routes for saving / updating an Article
app.post("api/articles/:id", (req, res) => {
  // Note was created, find one Article with an `_id` equal to the `req.params.id`
  // then we update the article to be associated with the new Note 
  // {new: true}  will tell teh query that we want to return the updated User then return the original to default 
  db.Note.create(req.body).then((dbNote) => {
    return db.Article.findOneAndUpdate({
      _id: req.params.id
    }, {
      $set: {
        saved: true
      }
    });
  }).then((dbArticle) => {
    // send them back to client if successfully find Articles 
    res.json(dbArticle);
  }).catch((err) => {
    // if err then send it to the client 
    res.json(err);
  });
});


app.put("api/articles/saved/:id", (res, req) => {
  console.log(req, "c'mon work dammit");
  db.Article.findOneAndUpdate({
    _id: req.params.id
  }, {
    $set: {
      saved: false
    }
  }).then((dbArticle) => {
    res.json(dbArticle)
  }).catch((err) => {
    res.json(err);
  });
});

app.get("api/articles/saved/:id", (res, req) => {
  db.Article.findOne({
    _id: req.params.id
  }).populate('note').then((dbArticle) => {
    res.json(dbArticle)
  }).catch((err) => {
    res.json(err);
  });
})

app.post("api/articles/saved/:id", (req, res) => {
  console.log("req yourself foo", req);
  // db.Note.create(req.body).then((dbNote) => {
  //   return
db.Article.findOneAndUpdate({
      _id: req.params.id
    }, {
      note: dbNote._id
    }, {
      saved: true
    },{
      new: true
    })
.then((dbArticle) => {
    res.json(dbArticle);
  }).catch((err) => {
    res.json(err);
  });
// });

})

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});