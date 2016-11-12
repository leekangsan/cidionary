"use strict"

var DB_VERSION = 1;
var DB_NAME = "cedict";
var DB_STORE_DICT = "cedict_dict";
var db;

var updateOutput = null;

importScripts("structs.js");

var dictionary = [];
var silableList = [];

function parseLine(line) {
	var rest = line;
	var index = null;
	var index2 = null;
	if (rest.substring(0,1) === "#" || rest === "") { return null; }
	index = rest.indexOf(" ");
	var traditional = rest.substring(0,index);
	rest = rest.substring(index+1,rest.length);
	index = rest.indexOf(" ");
	var simplified = rest.substring(0,index);
	rest = rest.substring(index+1,rest.length);
	index = rest.indexOf("[");
	index2 = rest.indexOf("]");
	var pinyin = rest.substring(index+1, index2);
	pinyin = pinyin.split(" ").map(
		function(sil) { return new Pinyin(sil) ;}
		);
	rest = rest.substring(index2+2,rest.length);
	var english = rest.substring(1,rest.length-1).split("/");
	return new DictEntry(traditional, simplified, pinyin, english);
}

function matchTradSimpEng(query, solutions) {
	for (var entry of dictionary) {
		var quality = Infinity;
		var index = entry.traditional.indexOf(query);
		if (index != -1) {
			quality = Math.min(entry.traditional.length, quality);
		}
		index = entry.simplified.indexOf(query);
		if (index != -1) {
			quality = Math.min(entry.simplified.length, quality);
		}
		for (var eng of entry.english) {
			index = eng.indexOf(query);
			if (index != -1) {
				quality = Math.min(eng.length,quality);
			}
		}
		if (quality != Infinity) {
			if (solutions[quality] == undefined) {
				solutions[quality] = [entry];
			} else {
				solutions[quality].push(entry);
			}
		}
	}
}

var sol_num = 40;

function matchAndSend(query) {
	var solutions = []
	matchTradSimpEng(query, solutions);
	var solutions2 = [];
	for (var sols of solutions) {
		if (sols == undefined) { continue; }
		for (var sol of sols) {
			solutions2.push(sol);
			if (solutions2.length >= sol_num) { break; }
		}
		if (solutions2.length >= sol_num) { break; }
	}
	postMessage(solutions2);
}

function cantCount(e) {
	console.log("can't get count");
};

function ready() {
	postMessage("ready");
	onmessage = function(e) { matchAndSend(e.data); };
}

function addDictionary(text) {
	var transaction = db.transaction([DB_STORE_DICT], "readwrite");
	// Do something when all the data is added to the database.
	transaction.oncomplete = function(event) {
		console.log("Successfully inserted the dictionary into database!");
		ready();
	};

	transaction.onerror = function(event) {
		postMessage("could not setup database. Your indexedDB size is probably to small for the database.")
		console.log("can't setup dictionary db");
	};

	var objectStore = transaction.objectStore(DB_STORE_DICT);

	request = objectStore.count();
	request.onsuccess = function(event) {
		if (event.target.result != 0) {
			console.log("already populated by " + event.target.result);
			return;
		}

		var i = 0;
		for (var line of text.split("\r\n")) {
			var entry = parseLine(line);
			if (entry != null) {
				i++
				if (i > 100) { break; }
				request = objectStore.add(entry);
				request.onerror = function(e) {
					console.log("Can't insert. " + line + " because " + JSON.stringify(e.target.errorCode));
				};
				dictionary.push(entry);
			}
		}
	};
	request.onerror = cantCount;
}

function downloadDictionary() {
	var transaction = db.transaction([DB_STORE_DICT], "readonly");
 
	transaction.onerror = cantCount;
 
	var objectStore = transaction.objectStore(DB_STORE_DICT);
	
	var request = objectStore.count();
	request.onerror = cantCount;
	request.onsuccess = function() {
		if (request.result == 0) { 
			transaction.oncomplete = function () {
				var myRequest = new XMLHttpRequest();

				myRequest.onreadystatechange = function() {
					if (myRequest.readyState != 4 || myRequest.status != 200) { return; }
					var text = myRequest.responseText
					addDictionary(text);
				};

				myRequest.open('GET', 'cedict.txt', true);
				myRequest.overrideMimeType("text/plain; charset=UTF-8");
				myRequest.send();
			}
		} else {
			var dicRequest = objectStore.getAll();
			dicRequest.onsuccess = function (event) {
				console.log(event.target.result.length + " dictionary entries retrieved");
				dictionary = event.target.result;
				ready();
			}
		}
	}
}

var request = indexedDB.open(DB_NAME, { version: DB_VERSION, storage: "persistent"} );
request.onerror = function(event) {
  console.log("Why didn't you allow me to use IndexedDB!? Your loss :(");
};
request.onsuccess = function(event) {
	db = event.target.result;
	console.log("Opened Database");
	downloadDictionary();
};
request.onerror = function(event) {
	// Generic error handler for all errors targeted at this database's
	// requests!
	console.log("Database error: " + event.target.errorCode);
};
// This event is only implemented in recent browsers
request.onupgradeneeded = function(event) { 
	var db = event.target.result;

	// Create an objectStore for this database
	var objectStore = db.createObjectStore(DB_STORE_DICT, { autoIncrement : true });
	console.log("Updated/Created Database");
};
