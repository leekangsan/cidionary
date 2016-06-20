"use strict"

function escapeHtml(unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

if(typeof(Worker) ==  "undefined")
	{ alert("Your browser doesn't support webworkers. Bad browser.") }
var cedictWorker = new Worker("Dictionary/cedictWorker.js");

var updateOutput = null;

(function() {
	var input = document.getElementById("input");
	var workerWorking = false;
	var inputChanged = false;

	function placeTone(pinyin) {
		if (pinyin.tone === null || pinyin.tone === 5) { return pinyin.silable; }
		var sil = pinyin.silable;
		sil = sil.replace("u:", "ü");
		var tone = pinyin.tone;
		
		var tonePos = null;
		var indexA = sil.indexOf("a");
		var indexE = sil.indexOf("e");
		var indexO = sil.indexOf("o");
		var indexI = sil.indexOf("i");
		var indexU = sil.indexOf("u");
		var indexV = sil.indexOf("v");
		
		if (indexA != -1) { tonePos = indexA; }
		else if (indexE != -1) { tonePos = indexE; }
		else if (indexO != -1) { tonePos = indexO; }
		else if (indexV != -1) { tonePos = indexV; }
		else { tonePos = Math.max(indexI, indexU); }
		
		var accent = null;
		if (tone == 1) { accent = "&#772;"; }
		else if (tone == 2) { accent =  "&#769;"; }
		else if (tone == 3) { accent =  "&#780;"; }
		else if (tone == 4) { accent =  "&#768;"; }
		
		var ret = null;
		if (accent == null) { ret = sil; }
		else { ret = sil.substring(0,tonePos+1) + accent + sil.substring(tonePos+1,sil.length); }
		
		return ret;
	}

	var updateOutput = function(entries) {
		var html = "";
		for (var r of entries) {
			html = html.concat("<tr class=\"dict_entry\">"+
				"<td>" + escapeHtml(r.simplified) + "</td>" +
				"<td>" + r.pinyin.map(placeTone).join(" ") + "</td>" +
				"<td>" + r.english.map(escapeHtml).join("<br>") +"</td>"
				+ "</tr>");
		}
		output.innerHTML = html;
	}

	var onInputWork = function() {
		if (workerWorking) {
			inputChanged = true;
		} else {
			cedictWorker.postMessage(input.value);
			workerWorking = true;
		}
	};
	
	cedictWorker.onmessage = function(message) {
		workerWorking = false;
		if (inputChanged) {
			cedictWorker.postMessage(input.value);
			workerWorking = true;
			inputChanged = false;
		}
		updateOutput(message.data);
	};
	
	input.oninput = onInputWork;
	//onInputWork();
}());
