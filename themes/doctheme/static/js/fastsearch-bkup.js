var fuse; // holds our search engine
var searchVisible = false; 
var firstRun = true; // allow us to delay loading json data unless search activated
var list = document.getElementById('searchResultList'); // targets the <ul>
var first = list.firstChild; // first child of search list
var last = list.lastChild; // last child of search list
var maininput = document.getElementById('searchInput'); // input box for search
var resultsAvailable = false; // Did we get any search results?

// ==========================================
// The main keyboard event listener running the show
//
document.addEventListener('keydown', function(event) {
  console.log('Start .... ')
  // CMD-/ to show / hide Search
  //if (event.metaKey && event.which === 191) {
      // Load json search index if first time invoking search
      // Means we don't load json unless searches are going to happen; keep user payload small unless needed
      if(firstRun) {
        loadSearch(); // loads our json data and builds fuse.js search index
        firstRun = false; // let's never do this again
      }

      // Toggle visibility of search box
      if (!searchVisible) {
        //document.getElementById("fastSearch").style.visibility = "visible"; // show search box
        //document.getElementById("searchInput").focus(); // put focus in input box so you can just start typing
        //searchVisible = true; // search visible
      }
      else {
        //document.getElementById("fastSearch").style.visibility = "hidden"; // hide search box
       // document.activeElement.blur(); // remove focus from search box 
       // searchVisible = false; // search not visible
      }
 // }

  // Allow ESC (27) to close search box
//   if (event.keyCode == 27) {
//     if (searchVisible) {
//       document.getElementById("fastSearch").style.visibility = "hidden";
//       document.activeElement.blur();
//       searchVisible = false;
//     }
//   }

  // DOWN (40) arrow
//   if (event.keyCode == 40) {
//     if (searchVisible && resultsAvailable) {
//       event.preventDefault(); // stop window from scrolling
//       if ( document.activeElement == maininput) { first.focus(); } // if the currently focused element is the main input --> focus the first <li>
//       else if ( document.activeElement == last ) { last.focus(); } // if we're at the bottom, stay there
//       else { document.activeElement.parentElement.nextSibling.firstElementChild.focus(); } // otherwise select the next search result
//     }
//   }

  // UP (38) arrow
//   if (event.keyCode == 38) {
//     if (searchVisible && resultsAvailable) {
//       event.preventDefault(); // stop window from scrolling
//       if ( document.activeElement == maininput) { maininput.focus(); } // If we're in the input box, do nothing
//       else if ( document.activeElement == first) { maininput.focus(); } // If we're at the first item, go to input box
//       else { document.activeElement.parentElement.previousSibling.firstElementChild.focus(); } // Otherwise, select the search result above the current active one
//     }
//   }

  if (event.keyCode == 13) {
    console.log("Enter key is pressed");
    var contentQuery =  document.getElementById("contentQuery").value;
    if(contentQuery != ''){
     var offset = 0
     var limit = 5
     var currentpage = 1
     executeSearch(contentQuery, offset, limit, currentpage);
    }
  } 
});


// ==========================================
// execute search as each character is typed
//
//document.getElementById("searchInput").onkeyup = function(e) { 
   // alert('LLL + PPP + NNNN' + this.value)
  //executeSearch(this.value);
//}




document.getElementById("searchButton").onclick = function () {
   var contentQuery =  document.getElementById("contentQuery").value;
   if(contentQuery != ''){
    var offset = 0
    var limit = 5
    var currentpage = 1
    executeSearch(contentQuery, offset, limit, currentpage);
   }
 };

 document.getElementById("fessPopupClose").onclick = function () {
    document.getElementById("fessOverlay").style.display = "none";
 };

 

// ==========================================
// fetch some json without jquery
//
function fetchJSONFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
          if (callback) callback(data);
      }
    }
  };
  httpRequest.open('GET', path);
  httpRequest.send(); 
}


// ==========================================
// load our search index, only executed once
// on first call of search box (CMD-/)
//
function loadSearch() { 
  fetchJSONFile('/index.json', function(data){

    var options = { // fuse.js options; check fuse.js website for details
      // shouldSort: true,
      // ignoreFieldNorm: true,
      // findAllMatches: true,
      // location: 0,
      // distance: 100,
      threshold: 0.6,
      //ignoreLocation: true,
     // minMatchCharLength: 2,
     // shouldSort: true,
      keys: [
       'title',
       //'permalink',
       'contents'
       ]
    };
    
    console.log(data);
    fuse = new Fuse(data, options); // build the index from the json file
  });
}


 function trimString(string, length) {
    return string.length > length ? 
           string.substring(0, length) + '...' :
           string;
  };

// ==========================================
// using the index we loaded on CMD-/, run 
// a search query (for "term") every time a letter is typed
// in the search box
//
function executeSearch(term, offset, limit, currentpage) {
    document.getElementById("fessOverlay").style.display = "none";
    document.getElementById("pagination").style.display = "none";
  let results = fuse.search(term); // the actual query being run using fuse.js

  const seen = new Set()
    const FilteredResults = results.filter(el => {
      const duplicate = seen.has(el.permalink);
      seen.add(el.permalink);
      return !duplicate;
    });

  console.log(FilteredResults);
  let searchitems = ''; // our results bucket
  let pagination = ''; 
  if (FilteredResults.length === 0) { // no results based on what was typed into the input box
    resultsAvailable = false;
    searchitems = '';
    document.getElementById("result_count").innerText =   " 0 results";
    document.getElementById("fessOverlay").style.display = "block";
    //<div class="alert">
     // Your search - <b>malabal</b> - did not match any documents.
    //</div>
    searchitems = searchitems + 
    '<div class="alert">' + 
        '<h3 class="title ellipsis media-heading">' + 
                'Your search - <b>' + term + '</b> - did not match any documents.' + 
        '</h3>' + 
    '</div>';
    document.getElementById("searchResultList").innerHTML = searchitems;
  } else { // build our html 

    if (FilteredResults.length > limit) {
        var slicedarray =  paginatesplitarray(FilteredResults, limit, currentpage);
    }else{
        var slicedarray =  FilteredResults;
    }
  
    for (let item in slicedarray) { // only show first 5 FilteredResults
        //console.log(FilteredResults)
        //searchitems = searchitems + '<li><a href="' + results[item].permalink + '" tabindex="0">' + '<span class="title">' + results[item].title + '</span><br /> ' + trimString(results[item].contents, 167)  + '</em></a></li>';
        //console.log(item);
        searchitems = searchitems + 
        '<div class="media">' + 
        '<div class="media-body">' + 
            '<h3 class="title ellipsis media-heading">' + 
                    '<a class="link" href="' + slicedarray[item].permalink + '" data-uri="' + slicedarray[item].permalink + '" data-order="0">' + slicedarray[item].title + '</a>' + 
            '</h3>' + 
        '</div>' +
        '<div class="body">' + 
            '<div>'  + 
                '<div class="media-body description">' + 
                 trimString(slicedarray[item].contents, 167)  + 
                '</div>' +
            '</div>' +

            '<div>'  + 
            '<div class="site ellipsis">' + 
                '<cite>' + slicedarray[item].permalink + '</cite>' + 
            '</div>' + 
            '</div>' +

        '</div>' +
        '</div>' + 
        '';
    }
    resultsAvailable = true;
  }

  document.getElementById("searchResultList").innerHTML = searchitems;
  if (FilteredResults.length > 0) {
      
    document.getElementById("result_count").innerText = FilteredResults.length  + " results";
    document.getElementById("fessOverlay").style.display = "block";
   // first = list.firstChild.firstElementChild; // first result container — used for checking against keyboard up/down location
    //last = list.lastChild.firstElementChild; // last result container — used for checking against keyboard up/down location


    if(FilteredResults.length > limit  ){
        var totalpages = Math.ceil(FilteredResults.length / limit);
        //currentpage
        var next = currentpage + 1;
        var previous = currentpage - 1;
        
        if(currentpage == 1){
            pagination = '<li class="prev disabled" aria-label="Previous" page="' + previous + '"><a><span aria-hidden="true">«</span> <span class="sr-only">prev</span></a></li>';
        }else{
            pagination = '<li onclick="paginate('+ limit +', '+ offset +', '+ previous +')" class="prev " aria-label="Previous" page="' + previous + '" style="cursor: pointer;" ><a><span aria-hidden="true">«</span> <span class="sr-only">prev</span></a></li>';
        }
        
        for (let i = 1; i <= totalpages; i++) {
           //console.log(' currentpage ' + currentpage + ' pagec ' + pagec )
           var pagec = i ;
           if(currentpage == pagec ){
            pagination = pagination + '<li class="active" page="' + pagec + '" style="cursor: pointer;"><a>' + pagec + '</a></li>';
           }else{
            pagination = pagination + '<li page="'+ pagec +'" style="cursor: pointer;" onclick="paginate('+limit+', '+offset+', '+pagec+' )"><a>' + pagec + "</a></li>";
           }
           
        }
        
        if( currentpage == totalpages ){
            pagination = pagination + '<li  class="next disabled" aria-label="Next" page=" ' + next + ' " style="cursor: pointer;"><a><span class="sr-only">next</span><span aria-hidden="true">»</span></a></li>';
        }else{
            pagination = pagination + '<li onclick="paginate('+ limit +', '+ offset +', '+ next +')" class="next " aria-label="Next" page=" ' + next + ' " style="cursor: pointer;"><a><span class="sr-only">next</span><span aria-hidden="true">»</span></a></li>';
       
        }
        document.getElementById("pagination").innerHTML = pagination;
        document.getElementById("pagination").style.display = "inline-block";


    }else{
        document.getElementById("pagination").style.display = "none";
    }
  }
}

function paginate(limit, offset, currentpage){
   document.getElementById("searchResultList").innerHTML = "";
   var contentQuery =  document.getElementById("contentQuery").value;
    executeSearch(contentQuery, offset, limit, currentpage);
}
function paginatesplitarray(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
    //return array.slice(page_number * page_size, page_number * page_size + page_size);
  }
