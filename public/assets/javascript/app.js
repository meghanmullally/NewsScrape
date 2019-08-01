// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
  }
});

$(document).on("click", 'button', function(event){
// grab article link "save"
var thisId = $(this).attr("data-id");
console.log(thisId);
// put it in the /saved 
$("scrape-success").on("click", saveArticle(thisId));
});
// $("delete-success").on("click", unsaveArticle());

// save article and post to the articles saved 
  function saveArticle(thisId) {
    console.log("HELLOOOO", thisId);
    event.preventDefault();
    $.ajax({
      url: "/api/articles/saved/" + thisId,
      method: "PUT",
      data: {
        saved: true
      }
    }).then(res => {
      console.log("inside the then function");
      $("#scrape-success").modal("toggle")
    })
    }
    // delete article and post to the articles saved 
  // function unsaveArticle() {
  //     event.preventDefault();
  //     var id = $(this)[0].attributes[1].value;
  //   app.post("/api/articles/saved" + id).then(res => {
  //     $("#delete-success").modal("toggle")
  //   })
  //   }
