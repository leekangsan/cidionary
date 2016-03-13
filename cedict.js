"use strict"

var cedict = function() {
	var myRequest = new XMLHttpRequest();
	var text = null;

	var silableList = [
															"zhi",	"chi",	"shi",	"ri",	"zi",	"ci",	"si",
	"a",	"ba",	"pa",	"ma",	"fa",	"da",	"ta",	"na",	"la",	"ga",	"ka",	"ha",				"zha",	"cha",	"sha",	"za",		"ca",	"sa",
	"o",	"bo",	"po",	"mo",	"fo",				"lo",
	"e",			"me",		"de",	"te",	"ne",	"le",	"ge",	"ke",	"he",				"zhe",	"che",	"she",	"re",	"ze",	"ce",	"se",
	"ai",	"bai",	"pai",	"mai",		"dai",	"tai",	"nai",	"lai",	"gai",	"kai",	"hai",				"zhai",	"chai",	"shai",		"zai",	"cai",	"sai",
	"ei",	"bei",	"pei",	"mei",	"fei",	"dei",	"tei",	"nei",	"lei",	"gei",	"kei",	"hei",				"zhei",		"shei",		"zei",		"sei",
	"ao",	"bao",	"pao",	"mao",		"dao",	"tao",	"nao",	"lao",	"gao",	"kao",	"hao",				"zhao",	"chao",	"shao",	"rao",	"zao",	"cao",	"sao",
	"ou",		"pou",	"mou",	"fou",	"dou",	"tou",	"nou",	"lou",	"gou",	"kou",	"hou",				"zhou",	"chou",	"shou",	"rou",	"zou",	"cou",	"sou",
	"an",	"ban",	"pan",	"man",	"fan",	"dan",	"tan",	"nan",	"lan",	"gan",	"kan",	"han",				"zhan",	"chan",	"shan",	"ran",	"zan",	"can",	"san",
	"en",	"ben",	"pen",	"men",	"fen",	"den",		"nen",		"gen",	"ken",	"hen",				"zhen",	"chen",	"shen",	"ren",	"zen",	"cen",	"sen",
	"ang",	"bang",	"pang",	"mang",	"fang",	"dang",	"tang",	"nang",	"lang",	"gang",	"kang",	"hang",				"zhang",	"chang",	"shang",	"rang",	"zang",	"cang",	"sang",
	"eng",	"beng",	"peng",	"meng",	"feng",	"deng",	"teng",	"neng",	"leng",	"geng",	"keng",	"heng",				"zheng",	"cheng",	"sheng",	"reng",	"zeng",	"ceng",	"seng",
	"er",
	"yi",	"bi",	"pi",	"mi",		"di",	"ti",	"ni",	"li",				"ji",	"qi",	"xi",
	"ya",					"dia",		"nia",	"lia",				"jia",	"qia",	"xia",
	"yo",
	"ye",	"bie",	"pie",	"mie",		"die",	"tie",	"nie",	"lie",				"jie",	"qie",	"xie",
	"yai",
	"yao",	"biao",	"piao",	"miao",	"fiao",	"diao",	"tiao",	"niao",	"liao",				"jiao",	"qiao",	"xiao",
	"you",			"miu",		"diu",		"niu",	"liu",				"jiu",	"qiu",	"xiu",
	"yan",	"bian",	"pian",	"mian",		"dian",	"tian",	"nian",	"lian",				"jian",	"qian",	"xian",
	"yin",	"bin",	"pin",	"min",				"nin",	"lin",				"jin",	"qin",	"xin",
	"yang",	"biang",				"diang",		"niang",	"liang",				"jiang",	"qiang",	"xiang",
	"ying",	"bing",	"ping",	"ming",		"ding",	"ting",	"ning",	"ling",				"jing",	"qing",	"xing",
	"wu",	"bu",	"pu",	"mu",	"fu",	"du",	"tu",	"nu",	"lu",	"gu",	"ku",	"hu",				"zhu",	"chu",	"shu",	"ru",	"zu",	"cu",	"su",
	"wa",									"gua",	"kua",	"hua",				"zhua",	"chua",	"shua",	"rua",
	"wo",					"duo",	"tuo",	"nuo",	"luo",	"guo",	"kuo",	"huo",				"zhuo",	"chuo",	"shuo",	"ruo",	"zuo",	"cuo",	"suo",
	"wai",									"guai",	"kuai",	"huai",				"zhuai",	"chuai",	"shuai",
	"wei",					"dui",	"tui",			"gui",	"kui",	"hui",				"zhui",	"chui",	"shui",	"rui",	"zui",	"cui",	"sui",
	"wan",					"duan",	"tuan",	"nuan",	"luan",	"guan",	"kuan",	"huan",				"zhuan",	"chuan",	"shuan",	"ruan",	"zuan",	"cuan",	"suan",
	"wen",					"dun",	"tun",	"nun",	"lun",	"gun",	"kun",	"hun",				"zhun",	"chun",	"shun",	"run",	"zun",	"cun",	"sun",
	"wang",									"guang",	"kuang",	"huang",				"zhuang",	"chuang",	"shuang",
	"weng",					"dong",	"tong",	"nong",	"long",	"gong",	"kong",	"hong",				"zhong",	"chong",	"shong",	"rong",	"zong",	"cong",	"song",
	"yu",							"nü",	"lü",				"ju",	"qu",	"xu",
	"yue",							"nüe",	"lüe",				"jue",	"que",	"xue",
	"yuan",												"juan",	"quan",	"xuan",
	"yun",								"lün",				"jun",	"qun",	"xun",
	"yong",												"jiong",	"qiong",	"xiong"]


	// takes "tong3" to "tong"
	function placeTone(silable) {
		var sil = silable.slice(0,-1);
		var tone = silable.slice(-1);
		var tone = parseInt(tone);
		if (/^[a-zA-Z·,]$/.test(silable)) { return silable; }
		if (silableList.indexOf(sil) === -1 || isNaN(tone)) { alert(silable + " is not a proper silable"); }
		
		var tonePos = null;
		var indexA = sil.indexOf("a");
		var indexE = sil.indexOf("e");
		var indexO = sil.indexOf("o");
		var indexI = sil.indexOf("i");
		var indexU = sil.indexOf("u");
		
		if (indexA != -1) { tonePos = indexA; }
		else if (indexE != -1) { tonePos = indexE; }
		else if (indexO != -1) { tonePos = indexO; }
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

	function parseLine(line) {
		var rest = line;
		var index = null;
		var index2 = null;
		if (rest.substring(0,1) === "#") { return null; }
		index = rest.indexOf(" ");
		var traditional = rest.substring(0,index);
		rest = rest.substring(index+1,rest.length);
		index = rest.indexOf(" ");
		var simplified = rest.substring(0,index);
		rest = rest.substring(index+1,rest.length);
		index = rest.indexOf("[");
		index2 = rest.indexOf("]");
		var pinyin = rest.substring(index+1, index2);
		pinyin = pinyin.split(" ").map(function(sil) { return placeTone(sil.toLowerCase()) ;}).join("");
		rest = rest.substring(index2+2,rest.length);
		var english = rest.substring(1,rest.length-1);
		return { traditional: traditional, simplified: simplified, pinyin: pinyin, english: english }
	}
	
	myRequest.onreadystatechange = function() {
		if (myRequest.readyState != 4 || myRequest.status != 200) { return; }
		text = myRequest.responseText
		var input = document.getElementById("input");
		input.oninput= function () {
			var output = document.getElementById("output");
			var res = (text.match(new RegExp("^.*" + input.value + ".*$","mg"))||["noResult noResult [,] /no results/"]);
			output.innerHTML = res.slice(0,25).map(function(r) {
				var r = parseLine(r);
				if (r == null) { return ""; }
				return "<tr>"+
					"<td><span style=\"white-space: nowrap;\">" + r.simplified + "</span></td>" +
					"<td>" + r.pinyin + "</td>" +
					"<td>" + r.english +"</td>" + "</tr>"; }).join("");
		};
	};
	myRequest.open('GET', 'cedict.txt', true);
	myRequest.overrideMimeType("text/plain; charset=UTF-8");
	myRequest.send();
	

	return { text: text };
} ()
