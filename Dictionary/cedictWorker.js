"use strict"

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

var myRequest = new XMLHttpRequest();

myRequest.onreadystatechange = function() {
	if (myRequest.readyState != 4 || myRequest.status != 200) { return; }
	var text = myRequest.responseText
	for (var line of myRequest.responseText.split("\r\n")) {
		var entry = parseLine(line);
		if (entry != null) {
			dictionary.push(entry);
		}
	}
	console.log("dictionary loaded");
	postMessage("ready");
	onmessage = function(e) { matchAndSend(e.data); };
};

myRequest.open('GET', 'cedict.txt', true);
myRequest.overrideMimeType("text/plain; charset=UTF-8");
myRequest.send();
