"use strict"

function escapeHtml(unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

(function() {
	if(typeof(Worker) ==  "undefined")
		{ alert("Your browser doesn't support webworkers. Bad browser.") }
	var cedictWorker = new Worker("Dictionary/cedictWorker.js");

	var input = document.getElementById("input");
	var states = {
		STATE_WEBWORKER_SETUP : "state_webworker_setup",
		STATE_OUTDATED : "state_outdated", // webworker is working and result will already be outdated
		STATE_WAITING_WEBWORKER : "state_waiting_webworker", // webworker is working result won't wont be outdated
		STATE_OK : "state_ok" // everything is up to date webworker is not working
	}
	var state = states.STATE_WEBWORKER_SETUP;

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
				"<td>" + r.english.map(escapeHtml).join("/<br>") +"</td>"
				+ "</tr>");
		}
		var output = document.getElementById("output");
		output.innerHTML = html;
	}

	input.oninput = function() {
		switch (state) {
			case states.STATE_WEBWORKER_SETUP:
				break;
			case states.STATE_OUTDATED:
				break;
			case states.STATE_WAITING_WEBWORKER:
				state = states.STATE_OUTDATED;
				break;
			case states.STATE_OK:
				cedictWorker.postMessage(input.value);
				state = states.STATE_WAITING_WEBWORKER;
				break;
		}
	};
	
	cedictWorker.onmessage = function(message) {
		switch (state) {
			case states.STATE_OK:
				alert("this should not happen");
				break;
			case states.STATE_WEBWORKER_SETUP:
				document.getElementById("output_loading").style.display = "none";
				if (message.data != "ready") {
					alert(message.data);
				}
				cedictWorker.postMessage(input.value);
				state = states.STATE_WAITING_WEBWORKER
				break;
			case states.STATE_WAITING_WEBWORKER:
				updateOutput(message.data)
				state = states.STATE_OK;
				break;
			case states.STATE_OUTDATED:
				cedictWorker.postMessage(input.value);
				updateOutput(message.data)
				state = states.STATE_WAITING_WEBWORKER;
				break;
		}
	};
}());
