var fuse; // holds our search engine
var searchVisible = false;
var firstRun = true; // allow us to delay loading json data unless search activated
var list = document.getElementById('searchResultList'); // targets the <ul>
var first = list.firstChild; // first child of search list
var last = list.lastChild; // last child of search list
var maininput = document.getElementById('searchInput'); // input box for search
var resultsAvailable = false; // Did we get any search results?


summaryInclude = 60;
var fuseOptions = {
  shouldSort: true,
  includeMatches: true,
  threshold: 0.0,
  tokenize: true,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    { name: "title", weight: 0.8 },
    { name: "contents", weight: 0.5 },
    { name: "tags", weight: 0.3 },
    { name: "categories", weight: 0.3 }
  ]
};

document.addEventListener('keydown', function(event) {
  //console.log('keydown Started .... ')
  if (event.keyCode == 13) {
    //console.log("Enter key is pressed");
    var contentQuery =  document.getElementById("contentQuery").value;
    if(contentQuery != ''){
     var offset = 0
     var limit = 5
     var currentpage = 1
     executeSearch(contentQuery, offset, limit, currentpage);
    }
  } 
});

document.getElementById("searchButton").onclick = function () {
  var offset = 0
  var limit = 5
  var currentpage = 1
  var contentQuery = document.getElementById("contentQuery").value;
  if (contentQuery != '') {
    executeSearch(contentQuery, offset, limit, currentpage);
  }

};


function executeSearch(searchQuery, offset, limit, currentpage) {
  $.getJSON("/index.json", function (data) {

    var pages = data;
    var fuse = new Fuse(pages, fuseOptions);
    var results = fuse.search(searchQuery);
    document.getElementById("fessOverlay").style.display = "none";
    document.getElementById("pagination").style.display = "none";

    var FilteredResults = results;
    let searchitems = ''; // our results bucket
    let pagination = '';


    if (FilteredResults.length === 0) { // no results based on what was typed into the input box
      resultsAvailable = false;
      searchitems = '';
      document.getElementById("result_count").innerText = " 0 results";
      document.getElementById("fessOverlay").style.display = "block";
      searchitems = searchitems +
        '<div class="alert">' +
        '<h3 class="title ellipsis media-heading">' +
        'Your search - <b>' + searchQuery + '</b> - did not match any documents.' +
        '</h3>' +
        '</div>';
      document.getElementById("searchResultList").innerHTML = searchitems;
    } else { // build our html 

      if (FilteredResults.length > limit) {
        var slicedarray = paginatesplitarray(FilteredResults, limit, currentpage);
      } else {
        var slicedarray = FilteredResults;
      }
     // console.log(' slicedarray  ' + slicedarray.length)

      $.each(slicedarray, function (key, value) {
        var itemcontents = value.item.contents;
        var itempermalink = value.item.permalink;
        var itemtitle = value.item.title;

        searchitems = searchitems +
          '<div class="media">' +
          '<div class="media-body">' +
          '<h3 class="title ellipsis media-heading">' +
          '<a class="link" href="' + itempermalink + '" data-uri="' + itempermalink + '" data-order="0">' + itemtitle + '</a>' +
          '</h3>' +
          '</div>' +
          '<div class="body">' +
          '<div>' +
          '<div class="media-body description">' +
          trimString(itemcontents) +
          '</div>' +
          '</div>' +

          '<div>' +
          '<div class="site ellipsis">' +
          '<cite>' + itempermalink + '</cite>' +
          '</div>' +
          '</div>' +

          '</div>' +
          '</div>' +
          '';

      });

      resultsAvailable = true;
    }

    document.getElementById("searchResultList").innerHTML = searchitems;

    if (FilteredResults.length > 0) {

      document.getElementById("result_count").innerText = FilteredResults.length + " results";
      document.getElementById("fessOverlay").style.display = "block";

      if (FilteredResults.length > limit) {
        var totalpages = Math.ceil(FilteredResults.length / limit);
        //currentpage
        var next = currentpage + 1;
        var previous = currentpage - 1;

        if (currentpage == 1) {
          pagination = '<li class="prev disabled" aria-label="Previous" page="' + previous + '"><a><span aria-hidden="true">«</span> <span class="sr-only">prev</span></a></li>';
        } else {
          pagination = '<li onclick="paginate(' + limit + ', ' + offset + ', ' + previous + ')" class="prev " aria-label="Previous" page="' + previous + '" style="cursor: pointer;" ><a><span aria-hidden="true">«</span> <span class="sr-only">prev</span></a></li>';
        }

        for (let i = 1; i <= totalpages; i++) {
          //console.log(' currentpage ' + currentpage + ' pagec ' + pagec )
          var pagec = i;
          if (currentpage == pagec) {
            pagination = pagination + '<li class="active" page="' + pagec + '" style="cursor: pointer;"><a>' + pagec + '</a></li>';
          } else {
            pagination = pagination + '<li page="' + pagec + '" style="cursor: pointer;" onclick="paginate(' + limit + ', ' + offset + ', ' + pagec + ' )"><a>' + pagec + "</a></li>";
          }

        }

        if (currentpage == totalpages) {
          pagination = pagination + '<li  class="next disabled" aria-label="Next" page=" ' + next + ' " style="cursor: pointer;"><a><span class="sr-only">next</span><span aria-hidden="true">»</span></a></li>';
        } else {
          pagination = pagination + '<li onclick="paginate(' + limit + ', ' + offset + ', ' + next + ')" class="next " aria-label="Next" page=" ' + next + ' " style="cursor: pointer;"><a><span class="sr-only">next</span><span aria-hidden="true">»</span></a></li>';

        }
        document.getElementById("pagination").innerHTML = pagination;
        document.getElementById("pagination").style.display = "inline-block";


      } else {
        document.getElementById("pagination").style.display = "none";
      }
    }

  });

}





document.getElementById("fessPopupClose").onclick = function () {
  document.getElementById("fessOverlay").style.display = "none";
};

function trimString(content) {

  //console.log(content.length);
  //return content;
  var length = 168;
  return content.length > length ?
    content.substring(0, length) + '...' :
    content;
}

function paginate(limit, offset, currentpage) {
  document.getElementById("searchResultList").innerHTML = "";
  var contentQuery = document.getElementById("contentQuery").value;
  executeSearch(contentQuery, offset, limit, currentpage);
}

function paginatesplitarray(array, page_size, page_number) {
  return array.slice((page_number - 1) * page_size, page_number * page_size);
  //return array.slice(page_number * page_size, page_number * page_size + page_size);
}
