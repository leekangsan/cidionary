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
	var date = new Date();
	char_input.onmousedown = function(e) {
		location = {x:e.offsetX, y:e.offsetY, time : (new Date).getTime()};
		currentStroke = [location];
		//console.log(JSON.stringify(location));
		char_input.onmousemove = function(e2) {
			var locNew = {x:e2.offsetX, y:e2.offsetY, time: (new Date).getTime()};
			currentStroke.push(locNew);
			ctx.moveTo(location.x,location.y);
			ctx.lineTo(locNew.x, locNew.y);
			ctx.stroke();
			//console.log(JSON.stringify(location) + JSON.stringify(locNew));
			location = locNew;
		};
		char_input.onmouseup = function(e) {
			strokes.push(currentStroke);
			var stroke=currentStroke;
			currentStroke = null;
			char_input.onmousemove = null;

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
			
// 			var bestChar = null;
// 			var bestDotP = -Infinity;
			var matchList = []
			for (i = 0; i<char_list.length; i++){
				var dotP = 0;
				var listStrokes = char_list[i].strokes;
				if (listStrokes.length != strokesInfos.length) { continue; }
				listStrokes.map(function(listStroke, j) {
					if (strokesInfos[j].length <= listStroke.length) { return; }
					var clientStroke = strokesInfos[j][listStroke.length-1];
					if (listStroke.length != clientStroke.length) { alert(listStroke + clientStroke); }
					listStroke.map(function(listSubstroke,k) {
						dotP += //clientStroke[k].r * listSubstroke.r *
							Math.cos(clientStroke[k].phi-listSubstroke.phi);
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
					matchList2.push(val);
				}
			});
			//alert(matchList.slice(0,10).map(function(x) { x}));
			char_choices.innerHTML = matchList2.slice(0,20).join(" ");
		};
		//alert(JSON.stringify(location));
	};
	
	clear_button.onclick = function(){
		strokes = []
		currentStroke = null;
		ctx.clearRect(0,0, char_input.width, char_input.height);
	};

	var myRequest = new XMLHttpRequest();
	myRequest.onreadystatechange = function() {
		if (myRequest.readyState != 4 || myRequest.status != 200) { return; }
		var text = myRequest.responseText;
		var lines = text.match(/^[0-9a-e]{2}.*$/mg);
		char_list = lines.map(function(line) {
			var strokes = line.split(" | ");
			var char = String.fromCharCode(parseInt("0x" + strokes[0]));
			strokes2 = strokes.slice(1).map(function(stroke) {
				var substrokes = stroke.split(" # ");
				return substrokes.map(function(substroke) {
					phir = substroke.slice(1,-1).split(",");
					return { phi: phir[0], r: phir[1] };
				});
			});
			return { strokes: strokes2, char: char }
			//alert(JSON.stringify(strokes2));
		});
	};
	myRequest.open('GET', 'strokes.txt', true);
	myRequest.overrideMimeType("text/plain; charset=UTF-8");
	myRequest.send();
})();
