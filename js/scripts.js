function parse(event) {
	if (event.keyCode == '13') {
		parseJSON();
	}
}

/* Parse the JSON input from the API */
async function parseJSON() {

	/* Find the category that is searched, and check if the category is not found */
	showLoad();
	var find = await findURL();

	/* Parse the JSON text */
	const Http = new XMLHttpRequest();
	const url = "https://cors-anywhere.herokuapp.com/http://jservice.io/api/category?id=" + find;
	Http.open("GET", url);
	Http.send();

	/* Find the text input given by user */
	var input = document.getElementById("searchbar").value;

	/* Find the necessary searching criteria */
	var difficulty = findDifficultyFilter();

	var start = getStartDate();
	var end = getEndDate();

	var searchBy = findActiveFilter();

	var includeDouble = getDouble();

	/* Send the results back to display */
	Http.onreadystatechange = (e) => {
	    var results = JSON.parse(Http.responseText).clues;
	    var searchResults;
	    if (input.length == 0) {
	    	searchResults = [];
	    } else {
	    	if (searchBy === "question") {
	    		searchResults = getResultsByQuestion(input, results, difficulty, start, end, includeDouble);
	    	} else {
	    		searchResults = getResultsByAnswer(input, results, difficulty, start, end, includeDouble);
	    	}

	    }

	    /* Create the HTML Table based on the results of the search */
		Http.onreadystatechange = function() {

			if (this.readyState = 4 && this.status == 200) {
				if (searchResults.length > 0) {
					var txt = "<table border='1'>";
					txt += "<tr> \
					            <th>Question ID</th> \
					            <th>Question</th>    \
					            <th>Answer</th>      \
					            <th>Air Date</th>    \
					            <th>Difficulty</th>  \
					        </tr>";
					for (var i = 0; i < searchResults.length; i++) {
						var parsed = searchResults[i];
						var time = new Date(searchResults[i].airdate);
						txt += "<tr><td>" + parsed.id + "</td>";
						txt += "<td>" + parsed.question + "</td>";
						txt += "<td>" + parsed.answer + "</td>";
						txt += "<td>" + time.toString() + "</td>";
						txt += "<td>" + parsed.value + "</td></tr>";
					}
					txt += "</table>";
					document.getElementById("data").innerHTML = txt;
					showPage();
				} else {
					showPage();
					document.getElementById("data").innerHTML = "<p>No results!</p>";
				}
			}
		}
	}
		
}

/* Find the URL based on the input given in the category searchbar */
function findURL() {

	/* Looping through all the categories will cause a desync, so a Promise is returned */
	return new Promise(function(resolve, reject) {
		var category = document.getElementById("searchbarCategory").value;

		var request = new XMLHttpRequest();
		(function loop(i, length) {
		    if (i>= length) {
		        return 1;
		    }
		    var url = "https://cors-anywhere.herokuapp.com/http://jservice.io/api/categories?count=100&offset=" + i*100;

		    request.open("GET", url);

		    /* Loops through all the JSON categories to see which ID matches the input */
		    request.onreadystatechange = function() {
		        if(request.readyState === XMLHttpRequest.DONE && request.status === 200) {
		        	var data = JSON.parse(request.responseText);
		        	for (var index = 0; index < data.length; index++) {
			            var id = data[index].id;
			            var filter = data[index].title.toUpperCase();
						if (filter.indexOf(category.toUpperCase()) > -1) {
			            	resolve(id);
			            	return;
			            }
			        }
		            loop(i + 1, length);
		        }
		    }
		    request.send();
		})(0, 185);
	});
}




/* Make the loader appear when it's loading */
function showPage() {
	document.getElementById("loader").style.display = "none";
	document.getElementById("data").style.display = "block";
}

function showLoad() {
	document.getElementById("loader").style.display = "block";
	document.getElementById("data").style.display = "none";
}




/* Find if the user wants to search by double jeopardy */
function activateDouble() {
	var doubleContainer = document.getElementById("doublediv");

	// Get all buttons with class="btn" inside the container
	var btns = doubleContainer.getElementsByClassName("btn");

	for (var i = 0; i < btns.length; i++) {
	    var doubleCur = doubleContainer.getElementsByClassName("active");

	    if (doubleCur.length > 0) {
	        doubleCur[0].classList.remove("active");
	    } else {
	    	btns[i].classList.add("active");
	    }
	}
}

function getDouble() {
	var btnContainer = document.getElementById("doublediv");

	var btns = btnContainer.getElementsByClassName("btn");

	for (var i = 0; i < btns.length; i++) {
		if (btns[i].classList.contains("active")) {
			return true;
		}
	}
	return false;
}


/* Functions for checking how the user wants to search */
function changeActiveFilters() {
	var btnContainer = document.getElementById("filters");

	var btns = btnContainer.getElementsByClassName("btn");

	for (var i = 0; i < btns.length; i++) {
	  btns[i].addEventListener("click", function() {
	    var current = document.getElementsByClassName("active");

	    if (current.length > 0 || this.id == "none") {
	        current[0].classList.remove("active");
	    }

	    this.classList.add("active");
	  });
	}
}

/* Find whether the user wants to search by question of by answer */
function findActiveFilter() {
	var btnContainer = document.getElementById("filters");

	var btns = btnContainer.getElementsByClassName("btn");

	for (var i = 0; i < btns.length; i++) {
		if (btns[i].classList.contains("active")) {
			return btns[i].id;
		}
	}

	return "question";
}


/* Functions controlling the difficulty filter */
function filterByDifficulty() {
	var btnContainer = document.getElementById("difficulties");

	var btns = btnContainer.getElementsByClassName("btn");

	// Loop through the buttons and add the active class to the current/clicked button
	for (var i = 0; i < btns.length; i++) {
	  btns[i].addEventListener("click", function() {
	    var current = document.getElementsByClassName("actived");

	    if (current.length > 0 || this.id == "none") {
	        current[0].classList.remove("actived");
	    }

	    this.classList.add("actived");
	  });
	}
}

function findDifficultyFilter() {
	var btnContainer = document.getElementById("difficulties");

	var btns = btnContainer.getElementsByClassName("btn");

	for (var i = 0; i < btns.length; i++) {
		if (btns[i].classList.contains("actived")) {
			if (btns[i].id == "none") return 0;
			return parseInt(btns[i].id);
		}
	}

	return 0;
}


/* Functions controlling the date filters */
function getStartDate() {
	if (!Date.parse(document.getElementById("start").value)) {
		return null;
	}
	return new Date(document.getElementById("start").value);
}

function getEndDate() {
	if (!Date.parse(document.getElementById("start").value)) {
		return null;
	}
	return  new Date(document.getElementById("end").value);
}


/* Functions controlling the q/a filters */

/* Filter results by answer */
function getResultsByAnswer(input, results, difficulty, start, end, double) {
	var searchResults = [];
	var filter = input;

	if (typeof input === "string") filter = input.toUpperCase();
	for (var i = 0; i < results.length; i++) {
		var ans = results[i].answer;
		var txtVal = ans.toString().toUpperCase();
		if (txtVal.indexOf(filter) > -1) {
			if (difficulty == 0 || results[i].value == difficulty || (double == true && results[i].value == difficulty*2)) {

				/* Put results in if they fit with the date range. */
				var date = new Date(results[i].airdate);
				if ((date >= start || start == null) && (date <= end || end == null)) {
					searchResults.push(results[i]);
				}
			}
		}
	}
	return searchResults;
}

/* Filter results by question */
function getResultsByQuestion(input, results, difficulty, start, end, double) {
	var searchResults = [];
	var filter = input;

	if (typeof input === "string") filter = input.toUpperCase();
	for (var i = 0; i < results.length; i++) {
		var question = results[i].question;
		var txtVal = question.toString().toUpperCase();
		if (txtVal.indexOf(filter) > -1) {
			if (difficulty == 0 || results[i].value == difficulty || (double == true && results[i].value == difficulty*2)) {
				var date = new Date(results[i].airdate);
				if ((date >= start || start == null) && (date <= end || end == null)) {
					searchResults.push(results[i]);
				}
			}
		}
	}
	return searchResults;
}
