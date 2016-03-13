(function() {
	var char_input = document.getElementById("char_input");
	var clear_button = document.getElementById("clear_button");
	var char_choices = document.getElementById("char_choices");
	var ctx = char_input.getContext("2d");
	var currentStroke = null;
	var strokesInfos = []
	var strokes = [];
	var char_list= null;
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
		var stroke=currentStroke;
		currentStroke = null;
		char_input.onmousemove = null;
		char_input.ontouchmove = null;

		var start = stroke[0];
		var end = stroke[stroke.length-1];
		
		var velocities = [];
		for (i=0; i<stroke.length-1; i++) {
			dx = stroke[i+1].x - stroke[i].x;
			dy = stroke[i+1].y - stroke[i].y;
			dtime = stroke[i+1].time - stroke[i].time;
			velocities.push((dx*dx+dy*dy)/dtime/dtime);
			//alert(dx + " " + dy + " " + dtime);
		}
		velocities[0]=Infinity;
		velocities[1]=Infinity;
		velocities[2]=Infinity;
		velocities[3]=Infinity;
		velocities[velocities.length-1]=Infinity;
		velocities[velocities.length-2]=Infinity;
		velocities[velocities.length-3]=Infinity;
		velocities[velocities.length-4]=Infinity;
		var minIndices= [];
		while (true) {
			var minIndex = null;
			var minValue = Infinity;
			for (i=0; i<velocities.length; i++) {
				if (velocities[i] < minValue) {
					minIndex = i;
					minValue = velocities[i];
				}
			}
			if (minValue == Infinity) { break; }
			minIndices.push(minIndex);
			for (i=Math.max(0, minIndex-4) ; i <= Math.min(minIndex+4,velocities.length); i++) {
				velocities[i] = Infinity;
			}
		}

		var strokeInfos = [];
		for (i=0; i<=minIndices.length; i++) {
			var strokeInfo = []
			var current = stroke[0];
			var indexOrder = ([0].concat(minIndices.slice(0,i)).concat([stroke.length-1])).sort(function(a, b){return a-b});
			//alert(indexOrder);
			for (j = 0; j<indexOrder.length-1; j++) {
				var start = stroke[indexOrder[j]];
				var end = stroke[indexOrder[j+1]];
				dx = end.x - start.x;
				dy = end.y - start.y;
				//alert(dx + " " + dy);
				strokeInfo.push({ r : Math.sqrt(dx*dx+dy*dy), phi : (Math.atan2(-dy,dx)+2*Math.PI)%(2*Math.PI) });
			}
			strokeInfos.push(strokeInfo);
		}
		strokesInfos.push(strokeInfos);
		
		var matchList = []
		for (i = 0; i<char_list.length; i++){
			var dotP = 0;
			var listStrokes = char_list[i].strokes;
			var norm = 0;
			if (listStrokes.length != strokesInfos.length) { continue; }
			listStrokes.map(function(listStroke, j) {
				if (strokesInfos[j].length <= listStroke.length) { return; }
				var clientStroke = strokesInfos[j][listStroke.length-1];
				if (listStroke.length != clientStroke.length) { alert(listStroke + clientStroke); }
				listStroke.map(function(listSubstroke,k) {
					norm += clientStroke[k].r;
				});
			});
			listStrokes.map(function(listStroke, j) {
				if (strokesInfos[j].length <= listStroke.length) { return; }
				var clientStroke = strokesInfos[j][listStroke.length-1];
				if (listStroke.length != clientStroke.length) { alert(listStroke + clientStroke); }
				listStroke.map(function(listSubstroke,k) {
					max = Math.max(clientStroke[k].r/norm, listSubstroke.r/char_list[i].norm);
					min = Math.min(clientStroke[k].r/norm, listSubstroke.r/char_list[i].norm);
					dotP += (min*(1/max) + Math.cos(clientStroke[k].phi-listSubstroke.phi))/listStroke.length;
				});
			});
			matchList.push([dotP, char_list[i].char]);
		}
		matchList.sort(function(a,b) { return b[0]-a[0]; });
		var lastChar = null;
		var matchList2 = [];
		matchList.map(function(val) {
			if (val[1] != lastChar) {
				lastChar = val[1];
				matchList2.push(val[1]);
			}
		});
		//alert(matchList.slice(0,10).map(function(x) { x}));
		char_choices.innerHTML = "<span class=\"single_char\">"
			+ matchList2.slice(0,50).join("</span> <span class=\"single_char\">")
			+ "</span>";
		var singles = document.getElementsByClassName("single_char");
		var input = document.getElementById("input");
		for (i=0; i<singles.length ; i++) {
			singles[i].style.cursor = "pointer";
			singles[i].style["font-size"] = "18pt";
			singles[i].onclick = function(s) {
				input.value = input.value + s.target.innerHTML };
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

	var myRequest = new XMLHttpRequest();
	myRequest.onreadystatechange = function() {
		if (myRequest.readyState != 4 || myRequest.status != 200) { return; }
		var text = myRequest.responseText;
		var lines = text.match(/^[0-9a-f]{2}.*$/mg);
		char_list = lines.map(function(line) {
			var normalization = 0;
			var strokes = line.split(" | ");
			var char = String.fromCharCode(parseInt("0x" + strokes[0]));
			
			strokes2 = strokes.slice(1).map(function(stroke) {
				var substrokes = stroke.split(" # ");
				return substrokes.map(function(substroke) {
					phir = substroke.slice(1,-1).split(",");
					normalization += parseFloat(phir[1]);
					return { phi: parseFloat(phir[0]), r: parseFloat(phir[1]) };
				});
			});
			return { strokes: strokes2, char: char, norm: normalization }
			//alert(JSON.stringify(strokes2));
		});
	};
	myRequest.open('GET', 'strokes.txt', true);
	myRequest.overrideMimeType("text/plain; charset=UTF-8");
	myRequest.send();
})();
