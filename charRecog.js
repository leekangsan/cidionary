
var char_list= null;

function determineChar(e) {
	var strokes = e.data;
	var strokesInfos = [];

	strokes.map(function(stroke) {
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
	});
	
	var matchList = [];
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
	return matchList2;
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
	postMessage([]);
};
myRequest.open('GET', 'strokes.txt', true);
myRequest.overrideMimeType("text/plain; charset=UTF-8");
myRequest.send();

function computeAndPostChars(strokes) {
	if (char_list==null) { return; }
	choices = determineChar(strokes);
	postMessage(choices);
};
onmessage = computeAndPostChars;
