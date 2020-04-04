var port=444;
var CONNECTION_URL ="127.0.0.1:"+port;

(function (wHandle, wjQuery) {

    wHandle.setserver = function (arg) {
        if (arg != gameMode) {
			CONNECTION_URL = arg;
            gameMode = arg;
			wsClose();
			//wsConnect();
        }
    };
    var SKIN_URL = "./skins/";


    var touchX, touchY,
    // is this running in a touch capable environment?
        touchable = 'createTouch' in document,
        touches = []; // array of touch vectors

    var leftTouchID = -1,
        leftTouchPos = new Vector2(0,0),
        leftTouchStartPos = new Vector2(0,0),
        leftVector = new Vector2(0,0);

	var fps_counter = 0;
	var fps_startTime = 0;
	var fps_value = 12.345;

	var txtpos_width = 100;
	var txtpos_height = 20;
	var txtpos_share = "!";
	var txtpos_lastTime = 0;
	

	
	var mapx = 0;
	var mapy = 0;
	var mapDstX = 0;
	var mapDstY = 0;
	var drawMapDstPoint = false;
	
	var qPressed = false;
	
	var cursor_x_old=0, cursor_y_old=0;
	
	var localProtocol = wHandle.location.protocol,
        localProtocolHttps = "https:" == localProtocol;
    var nCanvas, ctx, mainCanvas, lbCanvas, chatCanvas, canvasWidth, canvasHeight, qTree = null,
        ws = null,
        nodeX = 0,
        nodeY = 0,
        nodesOnScreen = [],
        playerCells = [],
        nodes = {}, nodelist = [],
        Cells = [],
        leaderBoard = [],
		lastWinner = '?',
		recordHolder = '?',
		gameName = '?',
		countdown = 3600,
        chatBoard = [],
        rawMouseX = 0,
        rawMouseY = 0,
        X = -1,
        Y = -1,
        cb = 0,
        timestamp = 0,
        //userNickName = null,
        leftPos = 0,
        topPos = 0,
        rightPos = 1E4,
        bottomPos = 1E4,
        viewZoom = 1,
        w = null,
        showSkin = true,
        showName = true,
        noColor = false,
        ua = false,
        userScoreCurrent = 0,
		userScoreMax = 0,
        showDarkTheme = false,
		showFps = false,
        //showMass = false,
		showScore = false,
		simpleGreen = false,
		touchButtons = false,
        smoothRender = .4,
		transparentRender = false,
        hideChat = false,
        posX = nodeX = ~~((leftPos + rightPos) / 2),
        posY = nodeY = ~~((topPos + bottomPos) / 2),
        posSize = 1,
        gameMode = "",
        teamScores = null,
        //ma = false,
        hasOverlay = true,
        drawLine = false,
        lineX = 0,
        lineY = 0,
        drawLineX = 0,
        drawLineY = 0,
        Ra = 0,
        teamColor = ["#333333", "#FF3333", "#33FF33", "#3333FF"],
        zoom = 1,
        isTouchStart = "ontouchstart" in wHandle && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        //splitIcon = new Image,
        //ejectIcon = new Image,
        noRanking = false;
    //splitIcon.src = "split.png";
    //ejectIcon.src = "feed.png";
    var wCanvas = document.createElement("canvas");
    var playerStat = null;
    wHandle.isSpectating = false;
	
	var teamMapPlayers = [];
	var clanMapPlayers = [];
	var lastSendMouseMove = Date.now();

	var screenButtonWH = 70;
	var btnESC_x = 0;
	var btnESC_y = 0;
	var btnESC_w = screenButtonWH;
	var btnESC_h = screenButtonWH;
	
	var btnA_x = 0;
	var btnA_y = 0;
	var btnA_w = screenButtonWH;
	var btnA_h = screenButtonWH;
	
	var btnS_x = 0;
	var btnS_y = 0;
	var btnS_w = screenButtonWH;
	var btnS_h = screenButtonWH;
	
	var btnW_x = 0;
	var btnW_y = 0;
	var btnW_w = screenButtonWH;
	var btnW_h = screenButtonWH;
	
	var btnE_x = 0;
	var btnE_y = 0;
	var btnE_w = screenButtonWH;
	var btnE_h = screenButtonWH;
	var btnE_active = 0;
	
	var btnSPACE_x = 0;
	var btnSPACE_y = 0;
	var btnSPACE_w = screenButtonWH;
	var btnSPACE_h = screenButtonWH;
	
	if (!String.prototype.startsWith) {
		String.prototype.startsWith = function(searchString, position){
		  position = position || 0;
		  return this.substr(position, searchString.length) === searchString;
	  };
	}
	
	function getLangCode(){
		var l = document.getElementsByTagName('html')[0].getAttribute('lang');
		switch( l ){
			case 'tr':
			return 'tr';
			
			case 'en':
			return 'en';
			
			case 'es':
			return 'es';
			
			case 'de':
			return 'de';
			
			default:
			return 'tr';
		}
	}
	
	function updateCursorAgain(){
		updateCursor(cursor_x_old, cursor_y_old);
	}
	function updateCursor(x, y){
		document.getElementById("canvas").style.cursor = 'default';
		
		for (var i = 0; i<chatBoard.length; i++) {
			if ( chatBoard[i].userId!=0 && chatBoard[i].userId!=undefined ){
				if ( 	x>= chatBoard[i].name_x && x<=(chatBoard[i].name_x+chatBoard[i].name_w) &&
						y<= chatBoard[i].name_y && y>=(chatBoard[i].name_y-chatBoard[i].name_h) ){
					document.getElementById("canvas").style.cursor = 'pointer';
					break;
				}
			}
		}		
	}
	
	function screenButtonDown(x, y){
		if ( 	x>=btnESC_x && x<=(btnESC_x+btnESC_w) &&
				y>=btnESC_y && y<=(btnESC_y+btnESC_h) ){
			
			showOverlays("fast");
			wjQuery("#adsBottom").hide();
			return true;
		}
		else if ( 	x>=btnA_x && x<=(btnA_x+btnA_w) &&
				y>=btnA_y && y<=(btnA_y+btnA_h) ){
			
			sendUint8(4);
			return true;
		}
		else if ( 	x>=btnS_x && x<=(btnS_x+btnS_w) &&
				y>=btnS_y && y<=(btnS_y+btnS_h) ){
			
			sendUint8(24);
			return true;
		}
		else if ( 	x>=btnW_x && x<=(btnW_x+btnW_w) &&
				y>=btnW_y && y<=(btnW_y+btnW_h) ){
			
			sendUint8(21);
			return true;
		}
		else if ( 	x>=btnE_x && x<=(btnE_x+btnE_w) &&
				y>=btnE_y && y<=(btnE_y+btnE_h) ){
			
			btnE_active = 1;
			sendUint8(22);
			return true;
		}
		else if ( 	x>=btnSPACE_x && x<=(btnSPACE_x+btnSPACE_w) &&
				y>=btnSPACE_y && y<=(btnSPACE_y+btnSPACE_h) ){
			
			sendUint8(17);
			return true;
		}
		
		return false;
	}
	
	function screenButtonUp(x, y){
		if ( btnE_active==1 ){
			btnE_active = 0;
			sendUint8(23);
		}
	}
	
    function window_onLoad() {
		// localStorage{
		// Dikkat1: localstorage de saklanan ile deÄŸiÅŸken aynÄ± deÄŸerde,
		// ama deÄŸiÅŸken ile combobox.value birbirinin tersi olabilir!
		// Dikkat2: localStorage ekledikten sonra orjinal deÄŸiÅŸkeni kullanmaya devam ettik Ã§Ã¼nkÃ¼;
		// localStorage.abc  deÄŸiÅŸkenleri string deÄŸerler alÄ±yor boolean deÄŸil bu sebeple kodda deÄŸiÅŸkenlerin kullanÄ±ldÄ±ÄŸÄ± yerleride tekrar dÃ¼zenlemek gerekicekti.
		if ( localStorage.showSkin==null )
			localStorage.showSkin = true;
		showSkin = (localStorage.showSkin==='true');
		document.getElementById("noSkin").checked = !showSkin;
		
		if ( localStorage.showName==null )
			localStorage.showName = true;
		showName = (localStorage.showName==='true');
		document.getElementById("noNames").checked = !showName;
		
		if ( localStorage.noColor==null )
			localStorage.noColor = false;
		noColor = (localStorage.noColor==='true');
		document.getElementById("noColor").checked = noColor;
		
		if ( localStorage.showDarkTheme==null )
			localStorage.showDarkTheme = false;
		showDarkTheme = (localStorage.showDarkTheme==='true');
		document.getElementById("darkTheme").checked = showDarkTheme;
		
		if ( localStorage.hideChat==null )
			localStorage.hideChat = false;
		hideChat = (localStorage.hideChat==='true');
		document.getElementById("hideChat").checked = hideChat;
		if (hideChat) {
            wjQuery("#chat_textbox").hide();
        }
        else {
            wjQuery("#chat_textbox").show();
        }
		
		if ( localStorage.smoothRender==null )
			localStorage.smoothRender = .4;
		smoothRender = localStorage.smoothRender;
		document.getElementById("smoothRender").checked = (smoothRender==2);
		
		if ( localStorage.showFps==null )
			localStorage.showFps = false;
		showFps = (localStorage.showFps==='true');
		document.getElementById("showFps").checked = showFps;
		
		if ( localStorage.transparentRender==null )
			localStorage.transparentRender = false;
		transparentRender = (localStorage.transparentRender==='true');
		document.getElementById("transparentRender").checked = transparentRender;
		
		if ( localStorage.showScore==null )
			localStorage.showScore = false;
		showScore = (localStorage.showScore==='true');
		document.getElementById("showScore").checked = showScore;
		
		if ( localStorage.simpleGreen==null )
			localStorage.simpleGreen = false;
		simpleGreen = (localStorage.simpleGreen==='true');
		document.getElementById("simpleGreen").checked = simpleGreen;
		
		if ( localStorage.skinQuality==null )
			localStorage.skinQuality = 'l';
		document.getElementById("skinQuality").value = localStorage.skinQuality;
		
		var isTouchDevice = 'ontouchstart' in document.documentElement;
		if ( isTouchDevice==true ){
			if ( localStorage.touchButtons==null ){
				localStorage.touchButtons = 'true';
			}
		}else{
			localStorage.touchButtons = 'false';
			wjQuery("#labelTouchButtons").hide();
		}
		touchButtons = (localStorage.touchButtons==='true');
		document.getElementById("touchButtons").checked = touchButtons;
		// }
		
        //ma = true;
        document.getElementById("canvas").focus();
        var isTyping = false;
        var chattxt;
        mainCanvas = nCanvas = document.getElementById("canvas");
        ctx = mainCanvas.getContext("2d");

        mainCanvas.onmousemove = function (event) {
            rawMouseX = event.clientX;
            rawMouseY = event.clientY;
            mouseCoordinateChange();
			
			updateCursor(rawMouseX, rawMouseY);
        };
		
		mainCanvas.onmousedown = function (event) {
			var x = event.clientX;// - elemLeft;
			var y = event.clientY;// - elemTop;
			var deltaT = (new Date()).getTime() - txtpos_lastTime;
			if ( deltaT>5000 && x>=10 && x<=(10+txtpos_width) && y>=(200-txtpos_height) && y<=200 ){
				sendChat(txtpos_share);
				txtpos_lastTime = (new Date()).getTime();
			}
			
			for (var i = 0; i<chatBoard.length; i++) {
				if ( chatBoard[i].userId!=0 && chatBoard[i].userId!=undefined ){
					if ( 	x>= chatBoard[i].name_x && x<=(chatBoard[i].name_x+chatBoard[i].name_w) &&
							y<= chatBoard[i].name_y && y>=(chatBoard[i].name_y-chatBoard[i].name_h) ){
						console.log(chatBoard[i].userId);
						var win = window.open("http://agarz.com/"+getLangCode()+"/home/"+chatBoard[i].userId, '_blank');
						win.focus();
						break;
					}
				}
			}
			
			updateCursor(x, y);
        };

        if(touchable) {
            mainCanvas.addEventListener( 'touchstart', onTouchStart, false );
            mainCanvas.addEventListener( 'touchmove', onTouchMove, false );
            mainCanvas.addEventListener( 'touchend', onTouchEnd, false );
		}

        mainCanvas.onmouseup = function () {
			
        };
        if (/firefox/i.test(navigator.userAgent)) {
            document.addEventListener("DOMMouseScroll", handleWheel, false);
        } else {
            document.body.onmousewheel = handleWheel;
        }

        mainCanvas.onfocus = function () {
            isTyping = false;
        };

        document.getElementById("chat_textbox").onblur = function () {
            isTyping = false;
        };

        document.getElementById("chat_textbox").onfocus = function () {
            isTyping = true;
        };

        var spacePressed = false,
            //qPressed = false,
            wPressed = false;
			
		var ePressed = false;
		
		var int_e = 0;
		var aPressed = false;
		var sPressed = false;
		
		wHandle.onkeydown = function (event) {
			var vMenu = wjQuery("#overlays").is(":visible");
			
            switch (event.keyCode) {
                case 32: // split
                    if ( !spacePressed && !isTyping && vMenu==false ) {
                        sendMouseMove();
                        sendUint8(17);
                        spacePressed = true;
                    }
                    break;
                case 81: // key q pressed
                    if ( !qPressed && vMenu==false ) {
                        sendUint8(18);
                        qPressed = true;
                    }
                    break;
                case 87: // eject mass
                    if ( !wPressed && !isTyping && vMenu==false ) {
                        sendMouseMove();
                        sendUint8(21);
                        wPressed = true;
                    }
                    break;				
                case 27: // quit
                    showOverlays("fast");
                    wHandle.isSpectating = false;
					wjQuery("#adsBottom").hide();
                    break;

                case 13:
                    if (isTyping) {
                        isTyping = false;
                        document.getElementById("chat_textbox").blur();
                        chattxt = document.getElementById("chat_textbox").value;
						
						if (chattxt.length > 0) 
							sendChat(chattxt);
						document.getElementById("chat_textbox").value = "";
                    }
                    else {
                        if (!hasOverlay) {
                            isTyping = true;
                        }
                    }
					break;
				case 69:
					if ( (!ePressed) && (!isTyping) && vMenu==false ) {
						ePressed = true;
                        sendUint8(22);
					}
					if ( int_e==0 ){
						int_e = setInterval(function() {
							wHandle.onkeydown({keyCode: 87});
							wHandle.onkeyup({keyCode: 87});
						}, 75);
					}
					break;
				  case 65:
                    if ( (!aPressed) && (!isTyping) && (this.gold != 0)) {
                        sendUint8(65);
						aPressed = true;
						sendMouseMove();
                        this.gold -= 10;
                        
                    }
                    break;
				case 83:
					if ( (!sPressed) && (!isTyping) && (this.gold != 0)) {
                        sendUint8(83);
						aPressed = true;
					
                        this.gold -= 100;
                        
                    }
					break;
            }
        };
        wHandle.onkeyup = function (event) {
            switch (event.keyCode) {
                case 32:
                    spacePressed = false;
                    break;
                case 87:
                    wPressed = false;
                    break;
                case 81:
                    if (qPressed) {
                        sendUint8(19);
                        qPressed = false;
                    }
                    break;
				case 69:
					if (ePressed) {
						ePressed = false;
                        sendUint8(23);
					}
					if ( int_e!=0 ){
						clearInterval(int_e);
						int_e = 0;
					}
					break;
				case 65:
					aPressed = false;
					break;
				case 83:
					sPressed = false;
					break;
            }
        };
        wHandle.onblur = function () {
            //sendUint8(19);
            wPressed = qPressed = spacePressed = false
        };

        wHandle.onresize = canvasResize;
        canvasResize();
        if (wHandle.requestAnimationFrame) {
            wHandle.requestAnimationFrame(redrawGameScene);
        } else {
            setInterval(drawGameScene, 1E3 / 60);
        }
        //setInterval(sendMouseMove, 100);
        if (w) {
            wjQuery("#region").val(w);
        }
		
        wjQuery("#overlays").show();
        canvasResize();
		
		var txt = "";
		//var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		var possible = "abcdefghijklmnopqrstuvxyz0123456789";
		for( var i=0; i < 6; i++ ){
			txt += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		var tmp = document.getElementById("myTeam");
		//tmp.value = txt;
    }

    function onTouchStart(e) {
		var isMenuVisible = wjQuery("adsBottom").is(":visible"); 
        for(var i = 0; i<e.changedTouches.length; i++){
			var touch =e.changedTouches[i];
			
			var buttonRet = false;
			if ( isMenuVisible==false && touchButtons==true ){
				buttonRet = screenButtonDown(touch.clientX, touch.clientY);
			}
			
			if ( buttonRet==false ){
				//if((leftTouchID<0) && (touch.clientX<canvasWidth/2))
				if( leftTouchID<0 ){
					leftTouchID = touch.identifier;
					leftTouchStartPos.reset(touch.clientX, touch.clientY);
					leftTouchPos.copyFrom(leftTouchStartPos);
					leftVector.reset(0,0);
				}
			}

			/*
            var size = ~~ (canvasWidth / 7);
            if ((touch.clientX > canvasWidth - size) && (touch.clientY > canvasHeight - size)) {
                sendMouseMove();
                sendUint8(17); //split
            }

            if ((touch.clientX > canvasWidth - size) && (touch.clientY > canvasHeight - 2*size -10) && (touch.clientY < canvasHeight - size -10 )) {
                sendMouseMove();
                sendUint8(21); //eject
            }
			*/
        }
        touches = e.touches;
    }

    function onTouchMove(e) {
        // Prevent the browser from doing its default thing (scroll, zoom)
        e.preventDefault();

        for(var i = 0; i<e.changedTouches.length; i++){
            var touch =e.changedTouches[i];
            if(leftTouchID == touch.identifier)
            {
                leftTouchPos.reset(touch.clientX, touch.clientY);
                leftVector.copyFrom(leftTouchPos);
                leftVector.minusEq(leftTouchStartPos);
                rawMouseX = leftVector.x*3 + canvasWidth/2;
                rawMouseY = leftVector.y*3 + canvasHeight/2;
                mouseCoordinateChange();
                sendMouseMove();
            }
        }

        touches = e.touches;
    }

    function onTouchEnd(e) {
        touches = e.touches;

        for(var i = 0; i<e.changedTouches.length; i++){
            var touch =e.changedTouches[i];
			
			screenButtonUp(touch.clientX, touch.clientY);
			
            if(leftTouchID == touch.identifier)
            {
                leftTouchID = -1;
                leftVector.reset(0,0);
                break;
            }
        }
    }

    function handleWheel(event) {
        zoom *= Math.pow(.9, event.wheelDelta / -120 || event.detail || 0);
        1 > zoom && (zoom = 1);
        zoom > 4 / viewZoom && (zoom = 4 / viewZoom)
    }

    function buildQTree() {
        if (.4 > viewZoom) qTree = null;
        else {
            var a = Number.POSITIVE_INFINITY,
                b = Number.POSITIVE_INFINITY,
                c = Number.NEGATIVE_INFINITY,
                d = Number.NEGATIVE_INFINITY,
                e = 0;
            for (var i = 0; i < nodelist.length; i++) {
                var node = nodelist[i];
                if (node.shouldRender() && !node.prepareData && 20 < node.size * viewZoom) {
                    e = Math.max(node.size, e);
                    a = Math.min(node.x, a);
                    b = Math.min(node.y, b);
                    c = Math.max(node.x, c);
                    d = Math.max(node.y, d);
                }
            }
            qTree = Quad.init({
                minX: a - (e + 100),
                minY: b - (e + 100),
                maxX: c + (e + 100),
                maxY: d + (e + 100),
                maxChildren: 2,
                maxDepth: 4
            });
            for (i = 0; i < nodelist.length; i++) {
                node = nodelist[i];
                if (node.shouldRender() && !(20 >= node.size * viewZoom)) {
                    for (a = 0; a < node.points.length; ++a) {
                        b = node.points[a].x;
                        c = node.points[a].y;
                        b < nodeX - canvasWidth / 2 / viewZoom || c < nodeY - canvasHeight / 2 / viewZoom || b > nodeX + canvasWidth / 2 / viewZoom || c > nodeY + canvasHeight / 2 / viewZoom || qTree.insert(node.points[a]);
                    }
                }
            }
        }
    }

    function mouseCoordinateChange() {
        X = (rawMouseX - canvasWidth / 2) / viewZoom + nodeX;
        Y = (rawMouseY - canvasHeight / 2) / viewZoom + nodeY
    }

    function hideOverlays() {
        hasOverlay = false;
        wjQuery("#adsBottom").hide();
        wjQuery("#overlays").hide();
    }

    function showOverlays(arg) {
		sendUint8(5);
        hasOverlay = true;
        //userNickName = null;
		wjQuery("#overlays").fadeIn(arg);
    }

	var skipCloseEvent = false;
	
	function wsClose() {
		try {
			//ws.onopen = null;
            //ws.onmessage = null;
            //ws.onclose = null;
			ws.close()
		} catch (b) {
		}
		ws = null;		
	};
	
	wHandle.wsClose = wsClose;

    function wsConnect() {
		sid = Math.floor(1+Math.random()*1000000);
        wsUrl = "ws://" + CONNECTION_URL;// + "/" + sid;
        nodesOnScreen = [];
        playerCells = [];
        nodes = {};
        nodelist = [];
        Cells = [];
        leaderBoard = [];
		lastWinner = '?';
		topMessage1 = 'Bu Agarz Serveri ArTiZ Bey Tarafından Kuruldu!!!!';
		topMessage2 = '';
		topMessage3 = '';
		this.gold = 1000;
		this.countdown = 3600;
        mainCanvas = teamScores = null;
        userScoreMax = 0;
		userScoreCurrent = 0;
		teamMapPlayers = [];
		clanMapPlayers = [];
        
		wjQuery('#playBtn').css("background-color", "yellow");
		
		ws = new WebSocket(wsUrl);
        ws.binaryType = "arraybuffer";
        ws.onopen = onWsOpen;
        ws.onmessage = onWsMessage;
        ws.onclose = onWsClose;
        ws.onerror = function () {
            console.log("socket error");
        }
		
		console.log("wsConnect "+wsUrl);
    }

    function prepareData(a) {
        return new DataView(new ArrayBuffer(a))
    }

    function wsSend(a) {
        ws.send(a.buffer)
    }

	function sendPlayInit(){
		this.gold = 0;
		sendUserToken();
		sendTeam();
		sendNickName();
		sendHandshakeRequest();
		sendSkinName();
	}
	
	function sendLang(){
		var msg = prepareData(2);
        msg.setUint8(0, 25);
		switch( getLangCode() ){
			case 'tr':
			msg.setUint8(1, 1);
			break;
			
			case 'en':
			msg.setUint8(1, 2);
			break;
			
			case 'es':
			msg.setUint8(1, 3);
			break;
			
			case 'de':
			msg.setUint8(1, 4);
			break;
		}
		wsSend(msg);
	}
	
    function onWsOpen() {		
		console.log("onWsOpen");
        
		var msg;
		
		msg = prepareData(5);
        msg.setUint8(0, 255);
        msg.setUint32(1, 1332175218, true);
        wsSend(msg);
		
		sendLang();
		
		if ( wHandle.isSpectating==true ){
			sendUint8(1);
		}else{
			sendPlayInit();
		}		
		
		wjQuery('#playBtn').css("background-color", "green");
    }
	
	$(wHandle).focus(function() {
	});
	$(wHandle).blur(function() {
		if ( ws!=null && ws.readyState==1 ){
			//ws.close();
		}
	});
		
    function onWsClose() {
		console.log("onWsClose");
		ws = null;
		
        showOverlays("fast");
		
		wHandle.isSpectating = false;
		
		wjQuery("#adsBottom").hide();		
		wjQuery('#playBtn').css("background-color", "red");
    }

    function onWsMessage(msg) {
		try {
			handleWsMessage(new DataView(msg.data))
		} catch (b) {
			var dummy = 0;
		}
    }
	
	function transLastWinner(gameName, winnerScore, winnerName){
		switch( getLangCode() ){
			case 'tr':
			return gameName + " KAZANAN " + winnerName + " SKOR " + winnerScore;
			
			case 'en':
			return gameName + " WINNER IS " + winnerName + " SCORE " + winnerScore;
			
			case 'es':
			return gameName + " GANADOR ES " + winnerName + " PUNTUACIÃ“N " + winnerScore;
			
			case 'de':
			return gameName + " GEWINNER " + winnerName + " ERGEBNIS " + winnerScore;
		}
		return 'err lang code!';
	}
	
	function transNewRecord(gameName, winnerScore, winnerName){
		switch( getLangCode() ){
			case 'tr':
			return gameName + " REKOR! " + winnerName + " SKOR " + winnerScore;
			
			case 'en':
			return gameName + " NEW RECORD! " + winnerName + " SCORE " + winnerScore;
			
			case 'es':
			return gameName + " NEUVO RECORD! " + winnerName + " PUNTUACIÃ“N " + winnerScore;
			
			case 'de':
			return gameName + " NEUER EINTRAG! " + winnerName + " ERGEBNIS " + winnerScore;
		}
		return 'err lang code!';
	}

	function transMessage(msg){
		if ( msg.startsWith("trans ") ){
			var params = msg.substring(6);
			var parts = params.split(",");
			if (parts[0]=='1'){
				var gameName = parts[1];
				var winnerScore = parts[2];
				var winnerName = parts.slice(3).join(" ");
				
				return transLastWinner(gameName, winnerScore, winnerName);
			}else if (parts[0]=='2'){
				var gameName = parts[1];
				var winnerScore = parts[2];
				var winnerName = parts.slice(3).join(" ");
				
				return transNewRecord(gameName, winnerScore, winnerName);
			}else{
				return msg;
			}
		}else{
			return msg;
		}
	}
	
    function handleWsMessage(msg) {
        function getString() {
            var text = '',
                char;
            while ((char = msg.getUint16(offset, true)) != 0) {
                offset += 2;
                text += String.fromCharCode(char);
            }
            offset += 2;
            return text;
        }

        var offset = 0,
            setCustomLB = false;
        240 == msg.getUint8(offset) && (offset += 5);
        switch (msg.getUint8(offset++)) {
            case 16: // update nodes
                updateNodes(msg, offset);				
                break;
            case 17: // update position
                posX = msg.getFloat32(offset, true);
                offset += 4;
                posY = msg.getFloat32(offset, true);
                offset += 4;
                posSize = msg.getFloat32(offset, true);
                offset += 4;
                break;
            case 20: // clear nodes
                playerCells = [];
                nodesOnScreen = [];
                break;
            case 21: // draw line
                lineX = msg.getInt16(offset, true);
                offset += 2;
                lineY = msg.getInt16(offset, true);
                offset += 2;
                if (!drawLine) {
                    drawLine = true;
                    drawLineX = lineX;
                    drawLineY = lineY;
                }
                break;
            case 32: // add node
                nodesOnScreen.push(msg.getUint32(offset, true));
                offset += 4;
                break;
            case 48: // update leaderboard (custom text)
                setCustomLB = true;
                noRanking = true;
                break;
            case 49: // update leaderboard (ffa)
                if (!setCustomLB) {
                    noRanking = false;
                }
                teamScores = null;
                var LBplayerNum = msg.getUint32(offset, true);
                offset += 4;
                leaderBoard = [];
                for (i = 0; i < LBplayerNum; ++i) {
                    var nodeId = msg.getUint32(offset, true);
                    offset += 4;
                    leaderBoard.push({
                        id: nodeId,
                        name: getString()
                    })
                }
                drawLeaderBoard();
                break;
            case 50: // update leaderboard (teams)
                teamScores = [];
                var LBteamNum = msg.getUint32(offset, true);
                offset += 4;
                for (var i = 0; i < LBteamNum; ++i) {
                    teamScores.push(msg.getFloat32(offset, true));
                    offset += 4;
                }
                drawLeaderBoard();
                break;
            case 64: // set border
                leftPos = msg.getFloat64(offset, true);
                offset += 8;
                topPos = msg.getFloat64(offset, true);
                offset += 8;
                rightPos = msg.getFloat64(offset, true);
                offset += 8;
                bottomPos = msg.getFloat64(offset, true);
                offset += 8;
                posX = (rightPos + leftPos) / 2;
                posY = (bottomPos + topPos) / 2;
                posSize = 1;
                if (0 == playerCells.length) {
                    nodeX = posX;
                    nodeY = posY;
                    viewZoom = posSize;
                }
                break;
				
			case 87:// oyun rekortmeni
				recordHolder = '';
				var ch;
				while ((ch = msg.getUint16(offset, true)) != 0) {
					offset += 2;
					recordHolder += String.fromCharCode(ch);
				}
				break;
				
			case 88:
				clanMapPlayers = [];
				while(offset<msg.byteLength){
					var tx = msg.getUint16(offset, true);
					offset += 2;
					
					var ty = msg.getUint16(offset, true);
					offset += 2;
					
					clanMapPlayers.push({x:tx,y:ty});
				}
				break;
				
			case 89:// handshake
				var key = msg.getUint32(offset, true);
				var ukey = Math.sqrt(key - 347712);
				
				var nick = document.getElementById('nick').value;
				var msg = prepareData(5 + 2 * nick.length);
				msg.setUint8(0, 28);
				msg.setUint32(1, ukey);
				
				for (var i = 0; i < nick.length; ++i) 
					msg.setUint16(5 + 2 * i, nick.charCodeAt(i), true);
			
				wsSend(msg);
				break;
				
			case 90:// TeamMap
				teamMapPlayers = [];
				while(offset<msg.byteLength){
					var tx = msg.getUint16(offset, true);
					offset += 2;
					
					var ty = msg.getUint16(offset, true);
					offset += 2;
					
					teamMapPlayers.push({x:tx,y:ty});
				}
				break;
				
			case 91:// chat2
				addChat2(msg, offset);
				break;
				
			case 92:
				this.gameName = '';
				var ch;
				while ((ch = msg.getUint16(offset, true)) != 0) {
					offset += 2;
					this.gameName += String.fromCharCode(ch);
				}
				break;
				
			case 93:
				var t = '';
				var ch;
				while ((ch = msg.getUint16(offset, true)) != 0) {
					offset += 2;
					t += String.fromCharCode(ch);
				}
				user_logout(t);
				break;
				
			case 94:// gold count
				this.gold = msg.getInt32(offset, true);
				break;
				
			case 95:// top message
				var line = msg.getUint8(offset++);// Åžimdilik tek satÄ±r. Bu bilgi ilerde kullanmak iÃ§in...
				switch(line){
					case 1:
					topMessage1 = '';
					var ch;
					while ((ch = msg.getUint16(offset, true)) != 0) {
						offset += 2;
						topMessage1 += String.fromCharCode(ch);
					}
					topMessage1 = transMessage(topMessage1);
					break;
					
					case 2:
					topMessage2 = '';
					var ch;
					while ((ch = msg.getUint16(offset, true)) != 0) {
						offset += 2;
						topMessage2 += String.fromCharCode(ch);
					}
					topMessage2 = transMessage(topMessage2);
					break;
					
					case 3:
					topMessage3 = '';
					var ch;
					while ((ch = msg.getUint16(offset, true)) != 0) {
						offset += 2;
						topMessage3 += String.fromCharCode(ch);
					}
					topMessage3 = transMessage(topMessage3);
					break;
				}
				break;
				
			case 96:
				this.countdown = msg.getUint16(offset, true);
				break;
				
			case 97:// son oyun birincisi
				lastWinner = '';
				var ch;
				while ((ch = msg.getUint16(offset, true)) != 0) {
					offset += 2;
					lastWinner += String.fromCharCode(ch);
				}
				break;
				
			case 98:
				var cur = msg.getUint32(offset, true);
                offset += 4;
				var max = msg.getUint32(offset, true);
				setServerStatus(cur,max);
				break;
				
            case 99:
                addChat(msg, offset);
                break;

        }
    }

	function setServerStatus(cur,max){
	}
	
	function chatCensor(txt){
		
		var kufur = [
			"siki","sike","siky","sikm","skim","aminak","aminas","amini","amcik","oÃ§","ibne","ipne","ibine","orspu","orospu","oruspu","orsbu","orosbu","orusbu","got","piÃ§","yarak","yarag"
		];
		var ceza = [
			"kÃ¼fÃ¼r ettiÄŸim iÃ§in Ã¶zÃ¼r dilerim :(",
			"hadi savaÅŸmayalÄ±m seviÅŸelim varmÄ±sÄ±nÄ±z :D",
			"uff snne be slk",
			"bende seni seviyorum ;)",
			"ben kÄ±zÄ±m",
			"kanka cidden sevgili olalÄ±mmÄ±?",
			"ben 12 yaÅŸÄ±ndayken arkadaÅŸlarÄ±m bana aynÅŸtayn derdi",
			"ben zekimiyim?",
			"sinirlenince Ã§ok seksi oluyosun :P",
			"kalp <3",
			"sende beni seviyomusuuun?",
			"kanka Ã§Ä±kÄ±yorum gel hepsini vereyim",
			"proyum rekorum 8k takÄ±m olmak isteyen",
			"kanki ben biÅŸey yazÄ±yorum bu baÅŸka biÅŸey yazÄ±yo yaaa uff :q"
		];
		
		var txt2 = txt.toLowerCase();
		//txt2 = txt2.replace(/[Ã§]/g,'c');
		txt2 = txt2.replace(/[Ä±]/g,'i');
		txt2 = txt2.replace(/[1]/g,'i');
		txt2 = txt2.replace(/[@]/g,'a');
		txt2 = txt2.replace(/[4]/g,'a');
		txt2 = txt2.replace(/[Ã¶]/g,'o');
		txt2 = txt2.replace(/[0]/g,'o');
		txt2 = txt2.replace(/[Ã¼]/g,'u');
		txt2 = txt2.replace(/[ÄŸ]/g,'g');
		txt2 = txt2.replace(/[3]/g,'e');
		//txt2 = txt2.replace(/[ÅŸ]/g,'s');
		
		txt2 = txt2.replace(/[^abcÃ§deghhijklmnoprstuvyz]/g,'');
		txt2 = txt2.replace(/\d/g,'');
		
		var letters = ['a','b','c','Ã§','d','e','f','g','h','i','j','k','l','m','n','o','p','r','s','t','u','v','y','z'];
		for(var i=0; i<letters.length; i++){
			var l = letters[i];
			var ll = l+l;
			while(txt2.indexOf(ll)!=-1){
				txt2 = txt2.replace(ll,l);
			}
		}
		
		var yes = 0;
		for(var i=0; i<kufur.length; i++){
			if ( txt2.indexOf(kufur[i])!=-1 ){
				yes = 1;
			}
		}
		
		if ( yes==0 ){
			return txt;
		}else{
			var r = Math.floor((Math.random() * ceza.length));
			return ceza[r];
		}
	}

    function addChat(view, offset) {
        function getString() {
            var text = '',
                char;
            while ((char = view.getUint16(offset, true)) != 0) {
                offset += 2;
                text += String.fromCharCode(char);
            }
            offset += 2;
			//if ( text.length>70 ){
            //	text = text.substring(0,70);
            //}
			
			//text = chatCensor(text);
			
            return text;
        }

        var flags = view.getUint8(offset++);
        // for future expansions
        if (flags & 2) {
            offset += 4;
        }
        if (flags & 4) {
            offset += 8;
        }
        if (flags & 8) {
            offset += 16;
        }

        var r = view.getUint8(offset++),
            g = view.getUint8(offset++),
            b = view.getUint8(offset++),
            color = (r << 16 | g << 8 | b).toString(16);
        while (color.length > 6) {
            color = '0' + color;
        }
        color = '#' + color;
        chatBoard.push({
            "name": getString(),
            "color": color,
            "message": getString(),
            "time": Date.now()
        });
    }
	
	function addChat2(view, offset) {
        function getString() {
            var text = '', ch;
            while ((ch = view.getUint16(offset, true)) != 0) {
                offset += 2;
                text += String.fromCharCode(ch);
            }
            offset += 2;
            return text;
        }

        var r = view.getUint8(offset++),
            g = view.getUint8(offset++),
            b = view.getUint8(offset++),
            color = (r << 16 | g << 8 | b).toString(16);
			
		var userId = view.getUint32(offset);
		offset += 4;
			
        while (color.length > 6) {
            color = '0' + color;
        }
        color = '#' + color;
        chatBoard.push({
			"userId": userId,
            "name": getString(),
            "color": color,
            "message": getString(),
            "time": Date.now(),
			"name_x":0,
			"name_y":0,
			"name_w":0,
			"name_h":0,
			"msg_x":0,
			"msg_y":0,
			"msg_w":0,
			"msg_h":0
        });
		
		if ( chatBoard.length>15 ){
			chatBoard.shift();
		}
		
		updateCursorAgain();
    }

    function updateNodes(view, offset) {
        timestamp = +new Date;
        var code = Math.random();
        ua = false;
        var queueLength = view.getUint16(offset, true);
        offset += 2;
        for (i = 0; i < queueLength; ++i) {
            var killer = nodes[view.getUint32(offset, true)],
                killedNode = nodes[view.getUint32(offset + 4, true)];
            offset += 8;
            if (killer && killedNode) {
                killedNode.destroy();
                killedNode.ox = killedNode.x;
                killedNode.oy = killedNode.y;
                killedNode.oSize = killedNode.size;
                killedNode.nx = killer.x;
                killedNode.ny = killer.y;
                killedNode.nSize = killedNode.size;
                killedNode.updateTime = timestamp;
            }
        }
        for (var i = 0; ;) {
            var nodeid = view.getUint32(offset, true);
            offset += 4;
            if (0 == nodeid) break;
            ++i;
            var size, posY, posX = view.getInt16(offset, true);
            offset += 2;
            posY = view.getInt16(offset, true);
            offset += 2;
            size = view.getInt16(offset, true);
            offset += 2;
            for (var r = view.getUint8(offset++), g = view.getUint8(offset++), b = view.getUint8(offset++),
                     color = (r << 16 | g << 8 | b).toString(16); 6 > color.length;) color = "0" + color;
            var colorstr = "#" + color,
                flags = view.getUint8(offset++),
                flagVirus = !!(flags & 1),
                flagAgitated = !!(flags & 16);
            flags & 2 && (offset += 4);
            flags & 4 && (offset += 8);
            flags & 8 && (offset += 16);
        for (var char, name = "";;) {
            char = view.getUint16(offset, true);
            offset += 2;
            if (0 == char) break;
            name += String.fromCharCode(char)
        }
        var node = null;
            if (nodes.hasOwnProperty(nodeid)) {
                node = nodes[nodeid];
                node.updatePos();
                node.ox = node.x;
                node.oy = node.y;
                node.oSize = node.size;
                node.color = colorstr;
            } else {
                node = new Cell(nodeid, posX, posY, size, colorstr, name);
                nodelist.push(node);
                nodes[nodeid] = node;
                node.ka = posX;
                node.la = posY;
            }
            node.isVirus = flagVirus;
            node.isAgitated = flagAgitated;
            node.nx = posX;
            node.ny = posY;
            node.nSize = size;
            node.updateCode = code;
            node.updateTime = timestamp;
            node.flag = flags;
            name && node.setName(name);
            if (-1 != nodesOnScreen.indexOf(nodeid) && -1 == playerCells.indexOf(node)) {
                document.getElementById("overlays").style.display = "none";
                playerCells.push(node);
                if (1 == playerCells.length) {
                    nodeX = node.x;
                    nodeY = node.y;
					drawMapDstPoint = true;
                }
            }
        }
        queueLength = view.getUint32(offset, true);
        offset += 4;
        for (i = 0; i < queueLength; i++) {
            var nodeId = view.getUint32(offset, true);
            offset += 4;
            node = nodes[nodeId];
            null != node && node.destroy();
        }
        ua && 0 == playerCells.length && showOverlays("slow");
		
		if ( playerCells.length==0 && drawMapDstPoint==true ){
			mapDstX = mapx;
			mapDstY = mapy;
		}
    }


    function sendMouseMove() {
        var msg;
        if (wsIsOpen()) {
            msg = rawMouseX - canvasWidth / 2;
            var b = rawMouseY - canvasHeight / 2;
            if (64 <= msg * msg + b * b && !(.01 > Math.abs(oldX - X) && .01 > Math.abs(oldY - Y))) {
                oldX = X;
                oldY = Y;
                msg = prepareData(21);
                msg.setUint8(0, 16);
				msg.setFloat64(1, X, true);
				msg.setFloat64(9, Y, true);
                msg.setUint32(17, 0, true);
                wsSend(msg);
            }
        }
    }

	function sendHandshakeRequest() {
		if ( wsIsOpen() ) {
			var msg = prepareData(1);
            msg.setUint8(0, 27);
            wsSend(msg)
		}
	}
	
    function sendNickName() {
		var nick = document.getElementById('nick').value;
		//console.log("sendNickName "+userNickName);
		
        if ( wsIsOpen() ) {
            var msg = prepareData(1 + 2 * nick.length);
            msg.setUint8(0, 0);
            for (var i = 0; i < nick.length; ++i) msg.setUint16(1 + 2 * i, nick.charCodeAt(i), true);
            wsSend(msg)
        }
    }
	
	function sendSkinName() {
		var skin = document.getElementById('txtSkin').value;
		//if ( userSkinName==null )
			//return;
		
		var skinName = skin.toLowerCase();
		/*if (skinName.indexOf('[') != -1) {
			var clanStart = skinName.indexOf('[');
			var clanEnd = skinName.indexOf(']');
			skinName = skinName.slice(clanStart + 1, clanEnd);
		}*/
		
		//if (-1 != knownNameDict.indexOf(skinName)) {
			if (wsIsOpen() && null != skinName) {
				var msg = prepareData(1 + 2 * skinName.length);
				msg.setUint8(0, 2);
				for (var i = 0; i < skinName.length; ++i) msg.setUint16(1 + 2 * i, skinName.charCodeAt(i), true);
				wsSend(msg)
			}
		//}
    }
	
	function sendUserToken() {
		// md5.length = 32 olduÄŸundan
		if (	wsIsOpen() && 
				localStorage.userToken!=null && 
				localStorage.userToken.length==32) {

			var msg = prepareData(1 + 2*32);
			
			var offset = 0;
            msg.setUint8(offset++, 3);
			
			for (var i = 0; i < 32; ++i) {
				var c = localStorage.userToken.charCodeAt(i);
                msg.setUint16(offset, c, true);
                offset += 2;
            }

            wsSend(msg);
		}
	}
	
	function sendTeam() {
		var team = document.getElementById('myTeam').value;
		if (	wsIsOpen() && 
				team!=null && 
				team.length>0 ) {

			var msg = prepareData(1 + 2*team.length);
			
			var offset = 0;
            msg.setUint8(offset++, 26);
			
			for (var i = 0; i < team.length; ++i) {
				var c = team.charCodeAt(i);
                msg.setUint16(offset, c, true);
                offset += 2;
            }

            wsSend(msg);
		}
	}

    function sendChat(str) {
		str = chatCensor(str);		
        if (wsIsOpen() && (str.length < 200) && (str.length > 0)) {
            var msg = prepareData(2 + 2 * str.length);
            var offset = 0;
            msg.setUint8(offset++, 99);
            msg.setUint8(offset++, 0); // flags (0 for now)
            for (var i = 0; i < str.length; ++i) {
                msg.setUint16(offset, str.charCodeAt(i), true);
                offset += 2;
            }

            wsSend(msg);
            //console.log(msg);
        }
    }

    function wsIsOpen() {
        return null != ws && ws.readyState == ws.OPEN
    }

    function sendUint8(a) {
        if (wsIsOpen()) {
            var msg = prepareData(1);
            msg.setUint8(0, a);
            wsSend(msg)
        }
    }

    function redrawGameScene() {
        drawGameScene();
        wHandle.requestAnimationFrame(redrawGameScene)
    }


    function canvasResize() {
        window.scrollTo(0,0);
        canvasWidth = wHandle.innerWidth;
        canvasHeight = wHandle.innerHeight;
        nCanvas.width = canvasWidth;
        nCanvas.height = canvasHeight;

        var hello = wjQuery("#helloDialog");
        hello.css("transform", "none");
        var modalHeight = hello.height();
        modalHeight > canvasHeight / 1.1 ? hello.css("transform", "translate(-50%, -50%) scale(" + canvasHeight / modalHeight / 1.1 + ")") : hello.css("transform", "translate(-50%, -50%)");
        drawGameScene()
    }

    function viewRange() {
        var ratio;
        ratio = Math.max(canvasHeight / 1080, canvasWidth / 1920);
        return ratio * zoom;
    }

    function calcViewZoom() {
        if (0 != playerCells.length) {
            for (var newViewZoom = 0, i = 0; i < playerCells.length; i++) newViewZoom += playerCells[i].size;
            newViewZoom = Math.pow(Math.min(64 / newViewZoom, 1), .4) * viewRange();
            viewZoom = (9 * viewZoom + newViewZoom) / 10
        }
    }

    function drawGameScene() {
		var a, oldtime = Date.now();
        ++cb;
		
		var deltaT = Date.now() - lastSendMouseMove;
		
		if ( deltaT>50 ){
			lastSendMouseMove = Date.now();
			sendMouseMove();
		}
		
        timestamp = oldtime;
        if (0 < playerCells.length) {
            calcViewZoom();
            var c = a = 0;
            for (var d = 0; d < playerCells.length; d++) {
                playerCells[d].updatePos();
                a += playerCells[d].x / playerCells.length;
                c += playerCells[d].y / playerCells.length;
            }
            posX = a;
            posY = c;
            posSize = viewZoom;
            nodeX = (nodeX + a) / 2;
            nodeY = (nodeY + c) / 2
        } else {
            nodeX = (29 * nodeX + posX) / 30;
            nodeY = (29 * nodeY + posY) / 30;
            viewZoom = (9 * viewZoom + posSize * viewRange()) / 10;
        }
        buildQTree();
        mouseCoordinateChange();
        
		//ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		ctx.fillStyle = showDarkTheme ? "#111111" : "#F2FBFF";
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        nodelist.sort(function (a, b) {
            return a.size == b.size ? a.id - b.id : a.size - b.size
        });
        ctx.save();
        ctx.translate(canvasWidth / 2, canvasHeight / 2);
        ctx.scale(viewZoom, viewZoom);
        ctx.translate(-nodeX, -nodeY);
        //for (d = 0; d < Cells.length; d++) Cells[d].drawOneCell(ctx);		
		
		// border -->
		ctx.strokeStyle = '#FF0000';
		ctx.lineWidth = 10;
		ctx.lineCap = "square";
		ctx.lineJoin = "square";
		ctx.beginPath();
		ctx.moveTo(leftPos,topPos);
		ctx.lineTo(rightPos,topPos);
		ctx.lineTo(rightPos,bottomPos);
		ctx.lineTo(leftPos,bottomPos);
		ctx.closePath();
		ctx.stroke();
		
		ctx.strokeStyle = showDarkTheme ? "#AAAAAA" : "#000000";
		ctx.globalAlpha = .2;
		ctx.lineWidth = 1;
		var gridCellSize = 50;
		ctx.beginPath();
		for(var x=leftPos; x<=rightPos; x+=gridCellSize){
            ctx.moveTo(x, topPos);
            ctx.lineTo(x, bottomPos);            
		}
		for(var y=topPos; y<=bottomPos; y+=gridCellSize){
            ctx.moveTo(leftPos, y);
            ctx.lineTo(rightPos, y);
		}
		ctx.stroke();
		// <--
		
		if ( transparentRender==true ){
			ctx.globalAlpha = 0.6;
		}else{
			ctx.globalAlpha = 1;
		}
		
        for (d = 0; d < nodelist.length; d++){
			nodelist[d].drawOneCell(ctx);
		}
        //console.log(Cells.length);
        if (drawLine) {
            drawLineX = (3 * drawLineX + lineX) /
                4;
            drawLineY = (3 * drawLineY + lineY) / 4;
            ctx.save();
            ctx.strokeStyle = "#FFAAAA";
            ctx.lineWidth = 10;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.globalAlpha = .5;
            ctx.beginPath();
            for (d = 0; d < playerCells.length; d++) {
                ctx.moveTo(playerCells[d].x, playerCells[d].y);
                ctx.lineTo(drawLineX, drawLineY);
            }
            ctx.stroke();
            ctx.restore()
        }
				
        ctx.restore();

		// countdown -->
		if ( this.countdown < 3600 ){
			var countDownStr = "";
			
			if ( typeof this.gameName !== ' ' ){
				countDownStr += "FFA-1";
			}
			
			countDownStr += "[";
			
			var min = Math.floor(this.countdown/60);
			if ( min < 10 ){
				countDownStr += "0";
			}
			countDownStr += min+":";
			
			var sec = this.countdown%60;
			if ( sec<10 ){
				countDownStr += "0";
			}
			countDownStr += sec;
			countDownStr += "]";
			
			ctx.font = "30px Ubuntu";
			
			var countDownStrWidth = ctx.measureText(countDownStr).width;
			var allStr = countDownStr + " " + lastWinner;
			var allStrWidth = ctx.measureText(allStr).width;
			var countDown_x = (canvasWidth - allStrWidth) * 0.5;
			var countDown_y = 30;
			
			ctx.globalAlpha = .4;
			if ( showDarkTheme==false ){
				ctx.fillStyle = "#000000";
			}else{
				ctx.fillStyle = "#DDDDDD";
			}
			ctx.fillRect(countDown_x-10, 0, allStrWidth+20, 40);
			
			ctx.globalAlpha = 1;
			ctx.fillStyle = "#0000FF";			
			ctx.fillText(countDownStr, countDown_x, countDown_y);
			
			ctx.fillStyle = "#FFFF00";
			ctx.fillText(" "+lastWinner, countDown_x + countDownStrWidth, countDown_y);
		}
		// <--
		
		// fps -->
		if ( showFps===true ){
			if ( fps_startTime==0 ){
				fps_startTime = new Date().getTime();
			}else{
				var diff = new Date().getTime() - fps_startTime;
				if (diff >= 1000){
					var sn = diff/1000;
					fps_value = Math.round((fps_counter/sn)*10000)/10000;
					fps_startTime = new Date().getTime();
					fps_counter = 1;
				}else{
					fps_counter++;
				}
			}
			
			ctx.globalAlpha = 1;
			if ( showDarkTheme==true ){
				ctx.fillStyle = "#FFFFFF";
			}else{
				ctx.fillStyle = "#000000";
			}
			ctx.font = "30px Ubuntu";		
			ctx.fillText("fps "+fps_value, 10, 240);
		}
		// <--
		
		// gold -->
		ctx.globalAlpha = 1;
		if ( showDarkTheme==true ){
			ctx.fillStyle = "#FFFF00";
		}else{
			ctx.fillStyle = "#AAAA00";
		}
		ctx.font = "30px Ubuntu";		
		ctx.fillText("Gold: "+this.gold, 10, 270);
		// <--
		
		// topMessage -->
		ctx.globalAlpha = 1;
		ctx.fillStyle = "#00AA00";
		ctx.font = "30px Ubuntu";		
		
		var topMessage_x;
		var topMessage_y;
		
		topMessage_x = (canvasWidth - ctx.measureText(this.topMessage1).width) * 0.5;
		topMessage_y = 60;
		ctx.fillText(this.topMessage1, topMessage_x, topMessage_y);
		
		topMessage_x = (canvasWidth - ctx.measureText(this.topMessage2).width) * 0.5;
		topMessage_y = 90;
		ctx.fillText(this.topMessage2, topMessage_x, topMessage_y);
		
		topMessage_x = (canvasWidth - ctx.measureText(this.topMessage3).width) * 0.5;
		topMessage_y = 120;
		ctx.fillText(this.topMessage3, topMessage_x, topMessage_y);
		// <--
		
		
		
        lbCanvas && lbCanvas.width && ctx.drawImage(lbCanvas, canvasWidth - lbCanvas.width - 10, 10); // draw Leader Board
        if (!hideChat)
        {
            if ((chatCanvas != null)&&(chatCanvas.width > 0)) ctx.drawImage(chatCanvas, 0, canvasHeight - chatCanvas.height - 50); // draw Chat Board
        }
		
		// score -->
		userScoreCurrent = calcUserScore();
		userScoreMax = Math.max(userScoreMax, userScoreCurrent);
        /*if (0 != userScore) {
            if (null == scoreText) {
                scoreText = new UText(24, '#FF0000');
            }
            scoreText.setValue('Score: ' + ~~(userScore / 100));
            c = scoreText.render();
            a = c.width;
            ctx.globalAlpha = .2;
            ctx.fillStyle = '#000000';
            ctx.fillRect(10, 10, a + 10, 34);//canvasHeight - 10 - 24 - 10
            ctx.globalAlpha = 1;
            ctx.drawImage(c, 15, 15);//canvasHeight - 10 - 24 - 5
        }*/
		
		var txt_score = 'Score';
		var txt_max = 'Max';
		switch( getLangCode() ){
			case 'tr':
			txt_score = 'Skor';
			txt_max = 'Maks.';
			break;
			
			case 'en':
			txt_score = 'Score';
			txt_max = 'Max';
			break;
			
			case 'es':
			txt_score = 'PuntuaciÃ³n';
			txt_max = 'Max';
			break;
			
			case 'de':
			txt_score = 'Ergebnis';
			txt_max = 'Max';
			break;
		}
		
		ctx.globalAlpha = .8;
		if ( showDarkTheme==true ){
			ctx.fillStyle = '#FFFFFF';
		}else{
			ctx.fillStyle = '#000000';
		}
		ctx.font = "24px Ubuntu";
		ctx.fillText(txt_score+': ' + userScoreCurrent, 10, 34);
		ctx.fillText(txt_max+': ' + userScoreMax, 10, 60);
		// <--
		
		// map -->
		var pointSize = 5;
		
		ctx.globalAlpha = .4;
		if ( showDarkTheme==true ){
			ctx.fillStyle = "#DDDDDD";
		}else{
			ctx.fillStyle = "#000000";
		}
		ctx.fillRect(10, 80, 100, 100);
		
		ctx.globalAlpha = 1;
		
		if ( mapDstX!=0 && mapDstY!=0 && drawMapDstPoint==true ){
			if ( showDarkTheme==true ){
				ctx.fillStyle = '#FF0000';
			}else{
				ctx.fillStyle = '#990000';
			}		
			ctx.fillRect(mapDstX,mapDstY,pointSize,pointSize);
		}
		
		// team players -->
		if ( showDarkTheme==true ){
			ctx.fillStyle = '#CCCC00';
		}else{
			ctx.fillStyle = '#CCCC00';
		}
		for(var i=0; i<teamMapPlayers.length; i++){
			mapx = 10 + (teamMapPlayers[i].x/rightPos)*100 - pointSize*0.5;
			mapy = 80 + (teamMapPlayers[i].y/bottomPos)*100 - pointSize*0.5;
			
			ctx.fillRect(mapx,mapy,pointSize,pointSize);
		}
		// <--
		
		// clan players -->
		if ( showDarkTheme==true ){
			ctx.fillStyle = '#0000CC';
		}else{
			ctx.fillStyle = '#0000CC';
		}
		for(var i=0; i<clanMapPlayers.length; i++){
			mapx = 10 + (clanMapPlayers[i].x/rightPos)*100 - pointSize*0.5;
			mapy = 80 + (clanMapPlayers[i].y/bottomPos)*100 - pointSize*0.5;
			
			ctx.fillRect(mapx,mapy,pointSize,pointSize);
		}
		// <--
		
		// me -->
		mapx = 10 + (nodeX/rightPos)*100 - pointSize*0.5;
		mapy = 80 + (nodeY/bottomPos)*100 - pointSize*0.5;
		if ( showDarkTheme==true ){
			ctx.fillStyle = '#FFFFFF';
		}else{
			ctx.fillStyle = '#FFFFFF';
		}		
		ctx.fillRect(mapx,mapy,pointSize,pointSize);
		// <--
		
		ctx.globalAlpha = 1;
		ctx.font = "16px Ubuntu";
		
		var txt_share = 'share';
		switch( getLangCode() ){
			case 'tr':
			txt_share = 'paylaş';
			break;
			
			case 'en':
			txt_share = 'share';
			break;
			
			case 'es':
			txt_share = 'compartir';
			break;
			
			case 'de':
			txt_share = 'aktie';
			break;
		}
		
		var txt = Math.round(nodeX/1000)+' , '+Math.round(nodeY/1000)+' '+txt_share;
		txtpos_width = ctx.measureText(txt).width;
		txtpos_height = 16;
		txtpos_share = '*** '+Math.round(nodeX/1000)+' , '+Math.round(nodeY/1000)+' ***';
		ctx.fillText(txt, 10, 200);
		// <--
		
        drawSplitIcon(ctx);
        drawTouch(ctx);
		
		// chatboard --->
		if ( hideChat==false ){
			var cnt = 0;
			for (var i = chatBoard.length-1; i >= 0; i--) {
				cnt++;
				if ( cnt>15 ){
					break;
				}
				
				var name = chatBoard[i].name.trim();
				if ( name=='' ){
					name = 'Gold Keyifi';
				}
				var msgRaw = chatBoard[i].message.trim();
				var msgTag = msgRaw.substring(0,3);
				if ( msgTag=='-t ' ){
					msgRaw = msgRaw.substring(3);
				}else if ( msgTag=='-c ' ){
					msgRaw = msgRaw.substring(3);
				}
				var msgFull = " : "+msgRaw;
				
				ctx.font = "18px Arial";	
				
				chatBoard[i].name_x = 15;
				chatBoard[i].name_y = (canvasHeight-30) - 20*cnt;
				chatBoard[i].name_w = ctx.measureText(name).width;
				chatBoard[i].name_h = 18;				
				
				chatBoard[i].msg_x = 15 + chatBoard[i].name_w;
				chatBoard[i].msg_y = chatBoard[i].name_y;
				chatBoard[i].msg_w = ctx.measureText(msgFull).width;
				chatBoard[i].msg_h = chatBoard[i].name_h;
				
				ctx.fillStyle = chatBoard[i].color;
				ctx.fillText(name, chatBoard[i].name_x, chatBoard[i].name_y);
				
				if ( msgTag=='-t ' ){
					if ( showDarkTheme==true ){
						ctx.fillStyle = '#CCCC00';
					}else{
						ctx.fillStyle = '#CCCC00';
					}
				}else if ( msgTag=='-c ' ){
					if ( showDarkTheme==true ){
						ctx.fillStyle = '#00CCCC';
					}else{
						ctx.fillStyle = '#0000CC';
					}
				}else{
					if ( showDarkTheme==true ){
						ctx.fillStyle = "#FFFFFF";
					}else{
						ctx.fillStyle = "#000000";
					}
				}
				ctx.fillText(msgFull, chatBoard[i].msg_x, chatBoard[i].msg_y);				
			}
		}
		// <---		
		
		// touch buttons --->
		if ( touchButtons==true ){
			
			ctx.font = "18px Arial";
			ctx.globalAlpha = .5;
			//if ( showDarkTheme==true ){
			//	ctx.fillStyle = "#DDDDDD";
			//}else{
				ctx.fillStyle = "#000000";
			//}
			
			var buttonGap = 10;
			
			// ESC
			if ( hideChat==true ){
				btnESC_x = buttonGap;
			}else{
				btnESC_x = 400;
			}
			btnESC_y = canvasHeight-screenButtonWH-10;
			ctx.globalAlpha = .5;
			ctx.fillStyle = "#F1C40F";
			ctx.fillRect(btnESC_x, btnESC_y, btnESC_w, btnESC_h);
			ctx.globalAlpha = 1;
			ctx.fillStyle = "#000000";
			ctx.fillText("Esc", btnESC_x+5, btnESC_y+34);
			
			// A
			btnA_x = btnESC_x + btnESC_w + buttonGap;
			btnA_y = btnESC_y;
			ctx.globalAlpha = .5;
			ctx.fillStyle = "#F1C40F";
			ctx.fillRect(btnA_x, btnA_y, btnA_w, btnA_h);
			ctx.globalAlpha = 1;
			ctx.fillStyle = "#000000";
			ctx.fillText("A", btnA_x+5, btnA_y+34);
			
			// S
			btnS_x = btnA_x + btnA_w + buttonGap;
			btnS_y = btnA_y;
			ctx.globalAlpha = .5;
			ctx.fillStyle = "#F1C40F";
			ctx.fillRect(btnS_x, btnS_y, btnS_w, btnS_h);
			ctx.globalAlpha = 1;
			ctx.fillStyle = "#000000";
			ctx.fillText("S", btnS_x+5, btnS_y+34);
			
			// W
			btnW_x = btnS_x + btnS_w + buttonGap;
			btnW_y = btnS_y;
			ctx.globalAlpha = .5;
			ctx.fillStyle = "#F1C40F";
			ctx.fillRect(btnW_x, btnW_y, btnW_w, btnW_h);
			ctx.globalAlpha = 1;
			ctx.fillStyle = "#000000";
			ctx.fillText("W", btnW_x+5, btnW_y+34);
			
			// E
			btnE_x = btnW_x + btnW_w + buttonGap;
			btnE_y = btnW_y;
			ctx.globalAlpha = .5;
			ctx.fillStyle = "#F1C40F";
			ctx.fillRect(btnE_x, btnE_y, btnE_w, btnE_h);
			ctx.globalAlpha = 1;
			ctx.fillStyle = "#000000";
			ctx.fillText("E", btnE_x+5, btnE_y+34);
			
			// SPACE
			btnSPACE_x = btnE_x + btnE_w + buttonGap;
			btnSPACE_y = btnE_y;
			ctx.globalAlpha = .5;
			ctx.fillStyle = "#F1C40F";
			ctx.fillRect(btnSPACE_x, btnSPACE_y, btnSPACE_w, btnSPACE_h);
			ctx.globalAlpha = 1;
			ctx.fillStyle = "#000000";
			ctx.fillText("Space", btnSPACE_x+5, btnSPACE_y+34);
			
		}
		// <---
		
        var deltatime = Date.now() - oldtime;
        deltatime > 1E3 / 60 ? z -= .01 : deltatime < 1E3 / 65 && (z += .01);
        .4 > z && (z = .4);
        1 < z && (z = 1)
    }


    function drawTouch(ctx)
    {
        ctx.save();
        if(touchable) {

            for(var i=0; i<touches.length; i++) {

                var touch = touches[i];

                if(touch.identifier == leftTouchID){
                    ctx.beginPath();
                    ctx.strokeStyle = "#0096ff";
                    ctx.lineWidth = 6;
                    ctx.arc(leftTouchStartPos.x, leftTouchStartPos.y, 40,0,Math.PI*2,true);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.strokeStyle = "#0096ff";
                    ctx.lineWidth = 2;
                    ctx.arc(leftTouchStartPos.x, leftTouchStartPos.y, 60,0,Math.PI*2,true);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.strokeStyle = "#0096ff";
                    ctx.arc(leftTouchPos.x, leftTouchPos.y, 40, 0,Math.PI*2, true);
                    ctx.stroke();

                } else {

                    ctx.beginPath();
                    //ctx.fillStyle = "#0096ff";
                    //ctx.fillText("touch id : "+touch.identifier+" x:"+touch.clientX+" y:"+touch.clientY, touch.clientX+30, touch.clientY-30);

                    ctx.beginPath();
                    ctx.strokeStyle = "#0096ff";
                    ctx.lineWidth = "6";
                    ctx.arc(touch.clientX, touch.clientY, 40, 0, Math.PI*2, true);
                    ctx.stroke();
                }
            }
        } else {

            //ctx.fillStyle	 = "white";
            //ctx.fillText("mouse : "+touchX+", "+touchY, touchX, touchY);
        }
        //c.fillText("hello", 0,0);
        ctx.restore();
    }
    function drawGrid() {
        ctx.fillStyle = showDarkTheme ? "#111111" : "#F2FBFF";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.save();
        ctx.strokeStyle = showDarkTheme ? "#AAAAAA" : "#000000";
        ctx.globalAlpha = .2;
        ctx.scale(viewZoom, viewZoom);
        var a = canvasWidth / viewZoom,
            b = canvasHeight / viewZoom;
        for (var c = -.5 + (-nodeX + a / 2) % 50; c < a; c += 50) {
            ctx.beginPath();
            ctx.moveTo(c, 0);
            ctx.lineTo(c, b);
            ctx.stroke();
        }
        for (c = -.5 + (-nodeY + b / 2) % 50; c < b; c += 50) {
            ctx.beginPath();
            ctx.moveTo(0, c);
            ctx.lineTo(a, c);
            ctx.stroke();
        }
        ctx.restore()
    }

    function drawSplitIcon(ctx) {
        //if (touchable && splitIcon.width) {
         //var size = ~~ (canvasWidth / 7);
         //ctx.drawImage(splitIcon, canvasWidth - size, canvasHeight - size, size, size);
        //}

        //if (touchable && splitIcon.width) {
           // var size = ~~ (canvasWidth / 7);
            //ctx.drawImage(ejectIcon, canvasWidth - size, canvasHeight - 2*size-10, size, size);
        //}

    }

    function calcUserScore() {
        for (var score = 0, i = 0; i < playerCells.length; i++) {
			score += playerCells[i].getScore();
		}
			//score += playerCells[i].nSize * playerCells[i].nSize;
		
        return score
    }

    function drawLeaderBoard() {
        lbCanvas = null;
        if (null != teamScores || 0 != leaderBoard.length)
            if (null != teamScores || showName) {
                lbCanvas = document.createElement("canvas");
                var ctx = lbCanvas.getContext("2d"),
                    boardLength = 60;
                boardLength = null == teamScores ? boardLength + 24 * leaderBoard.length : boardLength + 180;
                var scaleFactor = Math.min(0.22*canvasHeight, Math.min(250, .3 * canvasWidth)) / 250;
                lbCanvas.width = 250 * scaleFactor;
                lbCanvas.height = boardLength * scaleFactor;

                ctx.scale(scaleFactor, scaleFactor);
                ctx.globalAlpha = .4;
                ctx.fillStyle = "#000000";
                ctx.fillRect(0, 0, 250, boardLength);

				
                ctx.globalAlpha = 1;
				//if ( this.lastWinner!=null ){
					
				//}
                var b;
                if (null == teamScores) {
					ctx.fillStyle = "#FFFF00";
					ctx.font = "20px Ubuntu";
					ctx.fillText(lastWinner, 125 - ctx.measureText(lastWinner).width / 2, 40);
					
                    for (ctx.font = "20px Ubuntu", b = 0; b < leaderBoard.length; ++b) {
                        var c = leaderBoard[b].name || "Gold Keyifi";
						c = c.trim();
						if ( c=='' ){
							c = 'Gold Keyifi';
						}
                        if (!showName) {
                            (c = "Gold Keyifi");
                        }
                        if (-1 != nodesOnScreen.indexOf(leaderBoard[b].id)) {
                            playerCells[0].name && (c = playerCells[0].name);
                            ctx.fillStyle = "#FFAAAA";
                            if (!noRanking) {
                                c = b + 1 + ". " + c;
                            }
                            ctx.fillText(c, 125 - ctx.measureText(c).width / 2, 70 + 24 * b);
                        } else {
                            ctx.fillStyle = "#FFFFFF";
                            if (!noRanking) {
                                c = b + 1 + ". " + c;
                            }
                            ctx.fillText(c, 125 - ctx.measureText(c).width / 2, 70 + 24 * b);
                        }
                    }
                }else {
					switch ( lastWinner ){
						case 'KÄ±rmÄ±zÄ±':
						ctx.fillStyle = "#FF0000";
						break;
						
						case 'YeÅŸil':
						ctx.fillStyle = "#00FF00";
						break;
						
						case 'Mavi':
						ctx.fillStyle = "#0000FF";
						break;
					}
	                
					ctx.font = "20px Ubuntu";
					ctx.fillText(lastWinner, 100 - ctx.measureText(lastWinner).width / 2, 40);
					
                    for (b = c = 0; b < teamScores.length; ++b) {
                        var d = c + teamScores[b] * Math.PI * 2;
                        ctx.fillStyle = teamColor[b + 1];
                        ctx.beginPath();
                        ctx.moveTo(100, 140);
                        ctx.arc(100, 140, 80, c, d, false);
                        ctx.fill();
                        c = d
                    }
                }
            }
    }

    function Cell(uid, ux, uy, usize, ucolor, uname) {
        this.id = uid;
        this.ox = this.x = ux;
        this.oy = this.y = uy;
        this.oSize = this.size = usize;
        this.color = ucolor;
        this.points = [];
        this.pointsAcc = [];
        this.createPoints();
        this.setName(uname)
    }

    function UText(usize, ucolor, ustroke, ustrokecolor) {
        usize && (this._size = usize);
        ucolor && (this._color = ucolor);
        this._stroke = !!ustroke;
        ustrokecolor && (this._strokeColor = ustrokecolor)
    }


    wHandle.onClickPlay = function () {
		//var nick = document.getElementById('nick').value;
		//var skin = document.getElementById('txtSkin').value;
		
        
		
        //userNickName = nick;
		//userSkinName = skin;
		
        
		
        userScoreCurrent = 0;
		userScoreMax = 0;
		
		if ( ws==null || ws.readyState==2 || ws.readyState==3 ){
			wsClose();
			wsConnect();
		}else{
			hideOverlays();
			sendPlayInit();
		}
    };

    wHandle.setSkins = function (arg) {
        showSkin = arg;
		localStorage.showSkin = arg;
    };
    wHandle.setNames = function (arg) {
        showName = arg;
		localStorage.showName = arg;
    };
    wHandle.setDarkTheme = function (arg) {
        showDarkTheme = arg;
		localStorage.showDarkTheme = arg;
    };
	wHandle.setFps = function (arg) {
        showFps = arg;
		localStorage.showFps = arg;
    };
    wHandle.setNoColor = function (arg) {
        noColor = arg;
		localStorage.noColor = arg;
    };
   // wHandle.setShowMass = function (arg) {
     //   showMass = arg
    //};
    wHandle.setSmooth = function (arg) {
        smoothRender = arg ? 2 : .4;
		localStorage.smoothRender = arg ? 2 : .4;
    };
	wHandle.setTransparent = function (arg) {
        transparentRender = arg;
		localStorage.transparentRender = arg;
    };
	wHandle.setShowScore = function (arg) {
        showScore = arg;
		localStorage.showScore = arg;
    };
	wHandle.setSimpleGreen = function (arg) {
		simpleGreen = arg;
		localStorage.simpleGreen = arg;
	};
	wHandle.setTouchButtons = function (arg) {
		touchButtons = arg;
		localStorage.touchButtons = arg;
	};
    wHandle.setHideChat = function (arg) {
        hideChat = arg;
		localStorage.hideChat = arg;
        if (arg) {
            wjQuery("#chat_textbox").hide();
        }
        else {
            wjQuery("#chat_textbox").show();
        }
    };
    wHandle.spectate = function () {
		wHandle.isSpectating = true;
		hideOverlays();
		wjQuery("#adsBottom").show();
		
		if ( ws==null || ws.readyState==2 || ws.readyState==3 ){
			//userNickName = null;
			//userSkinName = null;
			wsConnect();
		}else{
			//userNickName = null;
			sendUint8(1);
		}
    };
    wHandle.setGameMode = function (arg) {
        if (arg != gameMode) {
            gameMode = arg;
            wsConnect();
        }
    };
	wHandle.setskinquality = function (arg) {
		localStorage.skinQuality = arg;
    };

    wHandle.connect = wsConnect;
	
	wHandle.sendUserToken = sendUserToken;


	/*
    var response = null;
    wjQuery.ajax({
        type: "POST",
        dataType: "text",
        url: "skins_metadata/skinlist", 
        done:function() {
		//alert( "success" );
	  },
        success: function (data) {
            response = data.split('\n');
			
			knownNameDict = [];
			for (var i = 0; i < response.length; i++) {
					knownNameDict.push(response[i]);
			}
        },
		error: function(jqxhr, status, errorThrown){
			var dummy = 0;
		}
    });
	*/

    var delay = 500,
        oldX = -1,
        oldY = -1,
        Canvas = null,
        z = 1,
        scoreText = null,
        skins = {},
		skinsLoaded = {},
        //knownNameDict = [],
        //knownNameDict_noDisp = ["8", "nasa"],
        ib = ["_canvas'blob"];
    Cell.prototype = {
        id: 0,
        points: null,
        pointsAcc: null,
        name: null,
		skinName: null,
		hasSkinName:false,
        nameCache: null,
        sizeCache: null,
        x: 0,
        y: 0,
        size: 0,
        ox: 0,
        oy: 0,
        oSize: 0,
        nx: 0,
        ny: 0,
        nSize: 0,
        flag: 0, //what does this mean
        updateTime: 0,
        updateCode: 0,
        drawTime: 0,
        destroyed: false,
        isVirus: false,
        isAgitated: false,
        wasSimpleDrawing: true,
        destroy: function () {
            var tmp;
            for (tmp = 0; tmp < nodelist.length; tmp++)
                if (nodelist[tmp] == this) {
                    nodelist.splice(tmp, 1);
                    break
                }
            delete nodes[this.id];
            tmp = playerCells.indexOf(this);
            if (-1 != tmp) {
                ua = true;
                playerCells.splice(tmp, 1);
            }
            tmp = nodesOnScreen.indexOf(this.id);
            if (-1 != tmp) {
                nodesOnScreen.splice(tmp, 1);
            }
            this.destroyed = true;
            Cells.push(this)
        },
        getNameSize: function () {
            return Math.max(~~(.3 * this.size), 24)
        },
        setName: function (a) {
            if (this.name = a) {
                if (null == this.nameCache) {
                    this.nameCache = new UText(this.getNameSize(), "#FFFFFF", true, "#000000");
                    this.nameCache.setValue(this.name);
                } else {
                    this.nameCache.setSize(this.getNameSize());
                    this.nameCache.setValue(this.name);
                }
            }
        },
		setSkinName: function (a) {
            this.skinName = a;
        },
        createPoints: function () {
            for (var samplenum = this.getNumPoints(); this.points.length > samplenum;) {
                var rand = ~~(Math.random() * this.points.length);
                this.points.splice(rand, 1);
                this.pointsAcc.splice(rand, 1)
            }
            if (0 == this.points.length && 0 < samplenum) {
                this.points.push({
                    ref: this,
                    size: this.size,
                    x: this.x,
                    y: this.y
                });
                this.pointsAcc.push(Math.random() - .5);
            }
            while (this.points.length < samplenum) {
                var rand2 = ~~(Math.random() * this.points.length),
                    point = this.points[rand2];
                this.points.splice(rand2, 0, {
                    ref: this,
                    size: point.size,
                    x: point.x,
                    y: point.y
                });
                this.pointsAcc.splice(rand2, 0, this.pointsAcc[rand2])
            }
        },
        getNumPoints: function () {
            if (0 == this.id) return 16;
            var a = 10;
            if (20 > this.size) a = 0;
            if (this.isVirus) a = 30;
            var b = this.size;
            if (!this.isVirus) (b *= viewZoom);
            b *= z;
            if (this.flag & 32) (b *= .25);
            return ~~Math.max(b, a);
        },
        movePoints: function () {
            this.createPoints();
            for (var points = this.points, pointsacc = this.pointsAcc, numpoints = points.length, i = 0; i < numpoints; ++i) {
                var pos1 = pointsacc[(i - 1 + numpoints) % numpoints],
                    pos2 = pointsacc[(i + 1) % numpoints];
                pointsacc[i] += (Math.random() - .5) * (this.isAgitated ? 3 : 1);
                pointsacc[i] *= .7;
                10 < pointsacc[i] && (pointsacc[i] = 10);
                -10 > pointsacc[i] && (pointsacc[i] = -10);
                pointsacc[i] = (pos1 + pos2 + 8 * pointsacc[i]) / 10
            }
            for (var ref = this, isvirus = this.isVirus ? 0 : (this.id / 1E3 + timestamp / 1E4) % (2 * Math.PI), j = 0; j < numpoints; ++j) {
                var f = points[j].size,
                    e = points[(j - 1 + numpoints) % numpoints].size,
                    m = points[(j + 1) % numpoints].size;
                if (15 < this.size && null != qTree && 20 < this.size * viewZoom && 0 != this.id) {
                    var l = false,
                        n = points[j].x,
                        q = points[j].y;
                    qTree.retrieve2(n - 5, q - 5, 10, 10, function (a) {
                        if (a.ref != ref && 25 > (n - a.x) * (n - a.x) + (q - a.y) * (q - a.y)) {
                            l = true;
                        }
                    });
                    if (!l && points[j].x < leftPos || points[j].y < topPos || points[j].x > rightPos || points[j].y > bottomPos) {
                        l = true;
                    }
                    if (l) {
                        if (0 < pointsacc[j]) {
                            (pointsacc[j] = 0);
                        }
                        pointsacc[j] -= 1;
                    }
                }
                f += pointsacc[j];
                0 > f && (f = 0);
                f = this.isAgitated ? (19 * f + this.size) / 20 : (12 * f + this.size) / 13;
                points[j].size = (e + m + 8 * f) / 10;
                e = 2 * Math.PI / numpoints;
                m = this.points[j].size;
                this.isVirus && 0 == j % 2 && (m += 5);
                points[j].x = this.x + Math.cos(e * j + isvirus) * m;
                points[j].y = this.y + Math.sin(e * j + isvirus) * m
            }
        },
        updatePos: function () {
            if (0 == this.id) return 1;
            var a;
            a = (timestamp - this.updateTime) / 120;
            a = 0 > a ? 0 : 1 < a ? 1 : a;
            var b = 0 > a ? 0 : 1 < a ? 1 : a;
            this.getNameSize();
            if (this.destroyed && 1 <= b) {
                var c = Cells.indexOf(this);
                -1 != c && Cells.splice(c, 1)
            }
            this.x = a * (this.nx - this.ox) + this.ox;
            this.y = a * (this.ny - this.oy) + this.oy;
            this.size = b * (this.nSize - this.oSize) + this.oSize;
            return b;
        },
        shouldRender: function () {
            if (0 == this.id) {
                return true
            } else {
                return !(this.x + this.size + 40 < nodeX - canvasWidth / 2 / viewZoom || this.y + this.size + 40 < nodeY - canvasHeight / 2 / viewZoom || this.x - this.size - 40 > nodeX + canvasWidth / 2 / viewZoom || this.y - this.size - 40 > nodeY + canvasHeight / 2 / viewZoom);
            }
        },
		getScore: function(){
			var r = ~~(this.nSize*this.nSize / 100);
			return r;
		},
        drawOneCell: function (ctx) {
            if (this.shouldRender()) {
                var b = (0 != this.id && !this.isVirus && !this.isAgitated && smoothRender > viewZoom);
                if (5 > this.getNumPoints()) b = true;
                if (this.wasSimpleDrawing && !b)
                    for (var c = 0; c < this.points.length; c++) this.points[c].size = this.size;
                this.wasSimpleDrawing = b;
                ctx.save();
                this.drawTime = timestamp;
                c = this.updatePos();
                this.destroyed && (ctx.globalAlpha *= 1 - c);
                ctx.lineWidth = 10;
                ctx.lineCap = "round";
                ctx.lineJoin = this.isVirus ? "miter" : "round";
                if (noColor) {
                    ctx.fillStyle = "#FFFFFF";
                    ctx.strokeStyle = "#AAAAAA";
                } else {
                    ctx.fillStyle = this.color;
                    ctx.strokeStyle = this.color;
                }
                if (b || simpleGreen==true) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI, false);
                }
                else {
                    this.movePoints();
                    ctx.beginPath();
                    var d = this.getNumPoints();
                    ctx.moveTo(this.points[0].x, this.points[0].y);
                    for (c = 1; c <= d; ++c) {
                        var e = c % d;
                        ctx.lineTo(this.points[e].x, this.points[e].y)
                    }
                }
                ctx.closePath();
                
				c = null;
                if (!this.isAgitated && showSkin && ':teams' != gameMode) {
					
					if ( this.hasSkinName==false ){
						this.skinName = this.name.toLowerCase();
						if (this.skinName.indexOf('[') != -1) {
							var clanStart = this.skinName.indexOf('[');
							var clanEnd = this.skinName.indexOf(']');
							this.skinName = this.skinName.slice(clanStart + 1, clanEnd);
						}
						
						this.skinName = this.name.toLowerCase();
						if (this.skinName.indexOf('[') != -1) {
							var clanStart = this.skinName.indexOf('[');
							var clanEnd = this.skinName.indexOf(']');
							this.skinName = this.skinName.slice(clanStart + 1, clanEnd);
						}
					}
					
					if ( this.skinName!="" ){
						if (!skins.hasOwnProperty(this.skinName)) {
							skins[this.skinName] = new Image;
							
							//var cdnNo = Math.floor(Math.random() * 4) + 1;
							
							//skins[this.skinName].src = "//cdn" + cdnNo + ".agarz.com/" + this.skinName + '.png';
							
							var cdnSubdomain = '';
							
							switch( localStorage.skinQuality ){
								case 'l':
								cdnSubdomain = 'cdn128';
								break;
								
								case 'm':
								cdnSubdomain = 'cdn256';
								break;
								
								case 'h':
								cdnSubdomain = 'cdn';
								break;
								
								default:
								cdnSubdomain = 'cdn128';
								break;
							}
							
							skins[this.skinName].src = '//'+cdnSubdomain+'.agarz.com/' + this.skinName + '.png';
							skins[this.skinName].onload = function(){
								skinsLoaded[this.src] = true;
							}
						}
						if (0 != skins[this.skinName].width && skins[this.skinName].complete) {
							c = skins[this.skinName];
						}
					}
                }
				
                c = (e = c) ? -1 != ib.indexOf(this.skinName) : false;
                b || ctx.stroke();
                ctx.fill();
				if (!(null == e || c)) {
					if ( skinsLoaded.hasOwnProperty(e.src) ){
						ctx.save();
						ctx.clip();
						ctx.drawImage(e, this.x - this.size, this.y - this.size, 2 * this.size, 2 * this.size);
						ctx.restore();
					}
                }
                if ((noColor || 15 < this.size) && !b) {
                    ctx.strokeStyle = '#000000';
                    ctx.globalAlpha *= .1;
                    ctx.stroke();
                }
                ctx.globalAlpha = 1;
                if (null != e && c) {
					if ( skinsLoaded.hasOwnProperty(e.src) ){
						ctx.drawImage(e, this.x - 2 * this.size, this.y - 2 * this.size, 4 * this.size, 4 * this.size);
					}
                }
                c = -1 != playerCells.indexOf(this);
                var ncache;
                //draw name
                if (0 != this.id) {
                    var b = ~~this.y;
					if ((showName || c) && this.name && this.nameCache ) {
                        ncache = this.nameCache;
                        ncache.setValue(this.name);
                        ncache.setSize(this.getNameSize());
                        var ratio = Math.ceil(10 * viewZoom) / 10;
                        ncache.setScale(ratio);
                        var rnchache = ncache.render(),
                            m = ~~(rnchache.width / ratio),
                            h = ~~(rnchache.height / ratio);
                        ctx.drawImage(rnchache, ~~this.x - ~~(m / 2), b - ~~(h / 2), m, h);
                        b += rnchache.height / 2 / ratio + 4
                    }

					if (showScore==true && this.size>35 && this.isVirus==false) {
						ctx.fillStyle = "#FFFFFF";
						ctx.font = this.getNameSize()+"px Ubuntu";
						var str = this.getScore()+"";
						var strWidth = ctx.measureText(str).width;
						var xx = this.x - strWidth * .5;
						ctx.fillText(str, xx, this.y + this.getNameSize()+6);
					}
                }
                ctx.restore()
            }
        }
    };
    UText.prototype = {
        _value: "",
        _color: "#000000",
        _stroke: false,
        _strokeColor: "#000000",
        _size: 16,
        _canvas: null,
        _ctx: null,
        _dirty: false,
        _scale: 1,
        setSize: function (a) {
            if (this._size != a) {
                this._size = a;
                this._dirty = true;
            }
        },
        setScale: function (a) {
            if (this._scale != a) {
                this._scale = a;
                this._dirty = true;
            }
        },
        setStrokeColor: function (a) {
            if (this._strokeColor != a) {
                this._strokeColor = a;
                this._dirty = true;
            }
        },
        setValue: function (a) {
            if (a != this._value) {
                this._value = a;
                this._dirty = true;
            }
        },
        render: function () {
            if (null == this._canvas) {
                this._canvas = document.createElement("canvas");
                this._ctx = this._canvas.getContext("2d");
            }
            if (this._dirty) {
                this._dirty = false;
                var canvas = this._canvas,
                    ctx = this._ctx,
                    value = this._value,
                    scale = this._scale,
                    fontsize = this._size,
                    font = fontsize + 'px Ubuntu';
                ctx.font = font;
                var h = ~~(.2 * fontsize);
                canvas.width = (ctx.measureText(value).width + 6) * scale;
                canvas.height = (fontsize + h) * scale;
                ctx.font = font;
                ctx.scale(scale, scale);
                ctx.globalAlpha = 1;
                ctx.lineWidth = 3;
                ctx.strokeStyle = this._strokeColor;
                ctx.fillStyle = this._color;
                this._stroke && ctx.strokeText(value, 3, fontsize - h / 2);
                ctx.fillText(value, 3, fontsize - h / 2)
            }
            return this._canvas
        },
        getWidth: function () {
            return (ctx.measureText(this._value).width +
            6);
        }
    };
    Date.now || (Date.now = function () {
        return (new Date).getTime()
    });
    var Quad = {
        init: function (args) {
            function Node(x, y, w, h, depth) {
                this.x = x;
                this.y = y;
                this.w = w;
                this.h = h;
                this.depth = depth;
                this.items = [];
                this.nodes = []
            }

            var c = args.maxChildren || 2,
                d = args.maxDepth || 4;
            Node.prototype = {
                x: 0,
                y: 0,
                w: 0,
                h: 0,
                depth: 0,
                items: null,
                nodes: null,
                exists: function (selector) {
                    for (var i = 0; i < this.items.length; ++i) {
                        var item = this.items[i];
                        if (item.x >= selector.x && item.y >= selector.y && item.x < selector.x + selector.w && item.y < selector.y + selector.h) return true
                    }
                    if (0 != this.nodes.length) {
                        var self = this;
                        return this.findOverlappingNodes(selector, function (dir) {
                            return self.nodes[dir].exists(selector)
                        })
                    }
                    return false;
                },
                retrieve: function (item, callback) {
                    for (var i = 0; i < this.items.length; ++i) callback(this.items[i]);
                    if (0 != this.nodes.length) {
                        var self = this;
                        this.findOverlappingNodes(item, function (dir) {
                            self.nodes[dir].retrieve(item, callback)
                        })
                    }
                },
                insert: function (a) {
                    if (0 != this.nodes.length) {
                        this.nodes[this.findInsertNode(a)].insert(a);
                    } else {
                        if (this.items.length >= c && this.depth < d) {
                            this.devide();
                            this.nodes[this.findInsertNode(a)].insert(a);
                        } else {
                            this.items.push(a);
                        }
                    }
                },
                findInsertNode: function (a) {
                    return a.x < this.x + this.w / 2 ? a.y < this.y + this.h / 2 ? 0 : 2 : a.y < this.y + this.h / 2 ? 1 : 3
                },
                findOverlappingNodes: function (a, b) {
                    return a.x < this.x + this.w / 2 && (a.y < this.y + this.h / 2 && b(0) || a.y >= this.y + this.h / 2 && b(2)) || a.x >= this.x + this.w / 2 && (a.y < this.y + this.h / 2 && b(1) || a.y >= this.y + this.h / 2 && b(3)) ? true : false
                },
                devide: function () {
                    var a = this.depth + 1,
                        c = this.w / 2,
                        d = this.h / 2;
                    this.nodes.push(new Node(this.x, this.y, c, d, a));
                    this.nodes.push(new Node(this.x + c, this.y, c, d, a));
                    this.nodes.push(new Node(this.x, this.y + d, c, d, a));
                    this.nodes.push(new Node(this.x + c, this.y + d, c, d, a));
                    a = this.items;
                    this.items = [];
                    for (c = 0; c < a.length; c++) this.insert(a[c])
                },
                clear: function () {
                    for (var a = 0; a < this.nodes.length; a++) this.nodes[a].clear();
                    this.items.length = 0;
                    this.nodes.length = 0
                }
            };
            var internalSelector = {
                x: 0,
                y: 0,
                w: 0,
                h: 0
            };
            return {
                root: new Node(args.minX, args.minY, args.maxX - args.minX, args.maxY - args.minY, 0),
                insert: function (a) {
                    this.root.insert(a)
                },
                retrieve: function (a, b) {
                    this.root.retrieve(a, b)
                },
                retrieve2: function (a, b, c, d, callback) {
                    internalSelector.x = a;
                    internalSelector.y = b;
                    internalSelector.w = c;
                    internalSelector.h = d;
                    this.root.retrieve(internalSelector, callback)
                },
                exists: function (a) {
                    return this.root.exists(a)
                },
                clear: function () {
                    this.root.clear()
                }
            }
        }
    };
    wHandle.onload = window_onLoad;
})(window, window.jQuery);