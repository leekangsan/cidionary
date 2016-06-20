(function() {	
	if(typeof(Worker) ==  "undefined")
		{ alert("Your browser doesn't support webworkers. Bad browser.") }
	var charRecogWorker = new Worker("CharRecog/charRecogWorker.js");
	var char_input = document.getElementById("char_input");
	var clear_button = document.getElementById("clear_button");
	var char_choices = document.getElementById("char_choices");
	var ctx = char_input.getContext("2d");
	var currentStroke = null;
	var strokesInfos = []
	var strokes = [];
	var location = null;
	
	var touchGetLoc = function(e) {
		e.preventDefault();
		if(e.type != "touchstart" && e.type != "touchmove") {alert("not touch event");}
		var px = e.touches[0].clientX;
		var py = e.touches[0].clientY;
		var rect = char_input.getBoundingClientRect();
		var x = px - rect.left;
		var y = py - rect.top;
		return { x: x, y: y, time:(new Date).getTime()}
	};
	
	var mouseGetLoc = function(e) {
		return { x:e.offsetX, y:e.offsetY,  time:(new Date).getTime()};
	};

	var moveStroke = function(locNew) {
		currentStroke.push(locNew);
		ctx.moveTo(location.x,location.y);
		ctx.lineTo(locNew.x, locNew.y);
		ctx.stroke();
		//console.log(JSON.stringify(location) + JSON.stringify(locNew));
		location = locNew;
	};
	
	var endStroke = function(e) {
		strokes.push(currentStroke);
		currentStroke = null;
		char_input.onmousemove = null;
		char_input.ontouchmove = null;
		charRecogWorker.postMessage(strokes);
	}

	charRecogWorker.onmessage = function(e) {
		var matchList = e.data;
		char_choices.innerHTML = "<span class=\"single_char\">"
			+ matchList.slice(0,50).join("</span> <span class=\"single_char\">")
			+ "</span>";
		var singles = document.getElementsByClassName("single_char");
		var input = document.getElementById("input");
		for (i=0; i<singles.length ; i++) {
			singles[i].style.cursor = "pointer";
			singles[i].style["font-size"] = "18pt";
			singles[i].onclick = function(s) {
				input.value = input.value + s.target.innerHTML
				updateOutput();
			};
		};
	};

	var startStroke = function(loc) {
		currentStroke = [loc];
		location = loc;
		//console.log(JSON.stringify(location));

		char_input.onmousemove = function(e) { moveStroke(mouseGetLoc(e)); };
		char_input.ontouchmove = function(e) { moveStroke(touchGetLoc(e)); };
		char_input.onmouseup = endStroke;
		char_input.ontouchend = endStroke;
		//alert(JSON.stringify(location));
	};
	char_input.onmousedown = function(e) { startStroke(mouseGetLoc(e)); };
	char_input.ontouchstart = function(e) { startStroke(touchGetLoc(e)); };
	
	clear_button.onclick = function(){
		strokes = [];
		strokesInfos = [];
		currentStroke = null;
		ctx.clearRect(0,0, char_input.width, char_input.height);
		ctx.beginPath();
	};
})();
