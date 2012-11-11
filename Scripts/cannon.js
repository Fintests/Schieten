// Fig. 14.27 cannon.js
// Logic of the Cannon Game
var canvas; // the canvas
var context; // used for drawing on the canvas

// constants for game play
var TARGET_PIECES = 7; // sections in the target
var BLOCKER_PIECES = 7; //sections in the blocker
var MISS_PENALTY = 2; // seconds deducted on a miss
var HIT_REWARD = 3; // seconds added on a hit
var TIME_INTERVAL = 25; // screen refresh interval in milliseconds

// variables for the game loop and tracking statistics
var intervalTimer; // holds interval timer
var timerCount; // number of times the timer fired since the last second
var timeLeft; // the amount of time left in seconds
var shotsFired; // the number of shots the user has fired
var timeElapsed; // the number of seconds elapsed

// variables for the blocker and target
var blocker; // start and end points of the blocker
var blockerDistance; // blocker distance from left
var blockerBeginning; // blocker distance from top
var blockerEnd; // blocker bottom edge distance from top
var initialBlockerVelocity; // initial blocker speed multiplier
var blockerVelocity; // blocker speed multiplier during game

var target; // start and end points of the target
var targetDistance; // target distance from left
var targetBeginning; // target distance from top
var targetEnd; // target bottom's distance from top
var pieceLength; // length of a target piece
var initialTargetVelocity; // initial target speed multiplier
var targetVelocity; // target speed multiplier during game

var lineWidth; // width of the target and blocker
var hitStates; // is each target piece hit?
var hitStatesB; // target piece hit
var targetPiecesHit; // number of target pieces hit (out of 7)

// variables for the cannon and cannonball
var cannonball; // cannonball image's upper-left corner
var cannonballVelocity; // cannonball's velocity
var cannonballOnScreen; // is the cannonball on the screen
var cannonballRadius; // cannonball radius
var cannonballSpeed; // cannonball speed
var cannonBaseRadius; // cannon base radius
var cannonLength; // cannon barrel length
var barrelEnd; // the end point of the cannon's barrel
var canvasWidth; // width of the canvas
var canvasHeight; // height of the canvas

// variables for sounds
var targetSound;
var cannonSound;
var blockerSound;
var airplaneExSound;
var missileExSound;
var bonusSound;
var screamSound;

var then;
var keysDown;
var direction;
var cPoint = new Object()
var prevY=0;
var angle;
var timeCountDown;
var score;
var BonusTime=0;
var diffTime=0;
var timeCount;

// flying missile
var missileX;
var missileHit;
var airplaneHit;
var man1;

// called when the app first launches
function setupGame()
{
   // stop timer if document unload event occurs
   document.addEventListener( "unload", stopTimer, false );
   
   // Handle keyboard controls
	keysDown = {};
   
   addEventListener("keydown", function (e) {keysDown[e.keyCode] = true; }, false);

   addEventListener("keyup", function (e) { delete keysDown[e.keyCode]; }, false);

	//intervalTimer = window.setInterval( updatePositions, TIME_INTERVAL );
   
   // get the canvas, its context and setup its click event handler
   canvas = document.getElementById( "theCanvas" );
   context = canvas.getContext("2d");
   
   // start a new game when user clicks Start Game button
   document.getElementById( "startButton" ).addEventListener( 
      "click", newGame, false );
   //document.getElementById( "startBtn" ).addEventListener("click", function(){alert("pp");}, false );

      
   //drawStart();

   // JavaScript Object representing game items
   missileX = new Object(); // object representing missile x-y coords
   airplane = new Object(); // object representing airplane x-y coords
   man1 = new Object(); // // object representing man1 x-y coords
   blocker = new Object(); // object representing blocker line
   blocker.start = new Object(); // will hold x-y coords of line start
   blocker.end = new Object(); // will hold x-y coords of line end
   blocker.currentPoint = new Object();
   target = new Object(); // object representing target line
   target.start = new Object(); // will hold x-y coords of line start
   target.end = new Object(); // will hold x-y coords of line end
   cannonball = new Object(); // object representing cannonball point
   barrelEnd = new Object(); // object representing end of cannon barrel

   // initialize hitStates as an array
   hitStates = new Array(TARGET_PIECES);
  
   for(var i=0; i<TARGET_PIECES; i++)
   		hitStates[i] = new Object();
   		   
   // initialize hitStates as an array
   hitStatesB = new Array(BLOCKER_PIECES);


   // get sounds
   targetSound = document.getElementById( "targetSound" );
   cannonSound = document.getElementById( "cannonSound" );
   blockerSound = document.getElementById( "blockerSound" );
   levelMusic = document.getElementById( "levelMusic" );
   airplaneExSound = document.getElementById( "airplaneExplo" );
   missileExSound = document.getElementById( "missileExplo" );
   bonusSound = document.getElementById( "bonus" );
   screamSound = document.getElementById( "scream" );

} // end function setupGame

// start game count
function startCount()
{
     intervalTimer = window.setInterval( drawCount, 1000 );
}

function stopCount()
{
     window.clearInterval( intervalTimer );
     //intervalTimer
     startTimer();
}


// set up interval timer to update game
function startTimer()
{
   levelMusic.play();
   canvas.addEventListener( "click", fireCannonball, false );
   intervalTimer = window.setInterval( updatePositions, TIME_INTERVAL );
} // end function startTimer

// terminate interval timer
function stopTimer()
{
   levelMusic.pause(); 
   canvas.removeEventListener( "click", fireCannonball, false );
   window.clearInterval( intervalTimer );
} // end function stopTimer

// called by function newGame to scale the size of the game elements
// relative to the size of the canvas before the game begins
function resetElements()
{
   var w = canvas.width;
   var h = canvas.height;
   canvasWidth = w; // store the width
   canvasHeight = h; // store the height
   cannonBaseRadius = h / 18; // cannon base radius 1/18 canvas height
   cannonLength = h * 7 / 8; // cannon length 1/8 canvas width

   cannonballRadius = w / 74; // cannonball radius 1/36 canvas width
   cannonballSpeed = w * 3 / 2; // cannonball speed multiplier

   lineWidth = w / 24; // target and blocker 1/24 canvas width

   missileX.y = 50; //starting y coord
   missileX.x = -130; //starting x coord
   missileX.endx = 10;
   missileX.endy = 90;
   missileX.score = 0; //initial score
   missileX.textX = 0;
   missileX.textY = 0;
   missileX.id = "missileX";
   missileX.bombed=0;
   airplane.x = -200;
   man1.x = 500;
   man1.y = canvasHeight-22;
   
   // configure instance variables related to the blocker
   blockerDistance = h * 3 / 8; // blocker 3/8 canvas width from bottom
   blockerBeginning = w / 8; // distance from top 1/8 canvas width
   blockerEnd = w * 3 / 8; // distance from top 3/8 canvas width
   initialBlockerVelocity = w / 2; // initial blocker speed multiplier
   blocker.start.y = blockerDistance;
   blocker.start.x = blockerBeginning;
   blocker.end.y = blockerDistance;
   blocker.end.x = blockerEnd;

   // configure instance variables related to the target
   targetDistance = h * 1 / 8; // target 1/8 canvas width from top
   targetBeginning = w / 8; // distance from top 1/8 canvas height
   targetEnd = w * 7 / 8; // distance from top 7/8 canvas height
   pieceLength = (targetEnd - targetBeginning) / TARGET_PIECES;
   initialTargetVelocity = -w / 4; // initial target speed multiplier
   target.start.y = targetDistance;
   target.start.x = targetBeginning;
   target.end.y = targetDistance;
   target.end.x = targetEnd;

   // end point of the cannon's barrel initially points horizontally
   barrelEnd.x = w / 2;
   barrelEnd.y = cannonLength;
} // end function resetElements

// reset all the screen elements and start a new game
function newGame()
{
   resetElements(); // reinitialize all game elements
   stopTimer(); // terminate previous interval timer
   then = Date.now();

   // set every element of hitStates to false--restores target pieces
   for (var i = 0; i < TARGET_PIECES; ++i){
      hitStates[i].destroyed = false; // target piece not destroyed
   	  hitStates[i].bombed = 0;   
   }
      
   // set every element of hitStates to false--restores target pieces
   for (var i = 0; i < BLOCKER_PIECES; ++i)
      hitStatesB[i] = 0; // target piece not destroyed
	
   missileHit = false;
   airplaneHit = false;
   targetPiecesHit = 0; // no target pieces have been hit
   blockerVelocity = initialBlockerVelocity; // set initial velocity
   targetVelocity = initialTargetVelocity; // set initial velocity
   timeLeft = 100; // start the countdown at 10 seconds
   timerCount = 0; // the timer has fired 0 times so far
   cannonballOnScreen = false; // the cannonball is not on the screen
   shotsFired = 0; // set the initial number of shots fired
   timeElapsed = 0; // set the time elapsed to zero
   score =0;
   timeCount = -1;

   timeCountDown = 3;
   startCount();
   
   //startTimer(); // starts the game loop
} // end function newGame

// called every TIME_INTERVAL milliseconds
function updatePositions()
{

   var now = Date.now();
   var delta = now - then;
   var modifier = delta/1000;
   	
	
	if (37 in keysDown) { // Player holding left
		if( barrelEnd.y<= canvasHeight - cannonballRadius){
			if(barrelEnd.y < 420) alert("ff");
			if(barrelEnd.x <= 300){
   				barrelEnd.y = parseFloat(barrelEnd.y); // jsp going nutz!!!
				barrelEnd.y += 256 * 0.005;
			}
			else
			{
				barrelEnd.y -= 256 * 0.005;
		    	if(barrelEnd.y < 420) barrelEnd.y=420;
		    }
		}
		else{
			barrelEnd.y = barrelEnd.y -= 256 * 0.005;
			if(barrelEnd.y < 420) barrelEnd.y=420;	
		}
		moveCannon("left");
	}
	if (39 in keysDown) { // Player holding right
		if( barrelEnd.y<= canvasHeight - cannonballRadius){
			if(barrelEnd.x >= 300) {
				barrelEnd.y = parseFloat(barrelEnd.y); // jsp going nutz!!!
				barrelEnd.y += 256 * 0.005;
			}
			else
			{
				barrelEnd.y -= 256 * 0.005;
				if(barrelEnd.y < 420) barrelEnd.y=420;
			}	
		}
		else
			barrelEnd.y = barrelEnd.y -= 256 * 0.005;
		moveCannon("right");
	}
	
	
	if (32 in keysDown) { // Player pressed Space
		fireCannonball();
	}
	
	// update missileX attribiutes
    if( /*(0 == timeElapsed%5 && timeCount!=timeElapsed) ||*/ missileX.x<=-100){
    	missileHit = false;
    	timeCount = timeElapsed;
    	missileX.y = (canvasHeight/2 - target.end.y) *Math.random()+ target.end.y;
    	missileX.bombed=0;
    	    	
    	if(missileX.y < (canvasHeight/2)/3)
    	{ missileX.score = 20; missileX.endx = 130 * 3/6; missileX.endy = 90* 3/6; missileX.textX = missileX.endx/8; missileX.textY = missileX.endy/8; missileX.id = "missileXb"; }  
    	if(missileX.y > (canvasHeight/2)/3 && missileX.y < (canvasHeight/2)*2/3 )
    	{ missileX.score = 10; missileX.endx = 130 * 4/6; missileX.endy = 90 * 4/6; missileX.textX = missileX.endx/10; missileX.textY = 0 ; missileX.id = "missileXg";}  
    	if(missileX.y > (canvasHeight/2)*2/3 && missileX.y < (canvasHeight/2))
    	{ missileX.score = 5;  missileX.endx = 130 * 5/6; missileX.endy = 90 * 5/6; missileX.textX = 0; missileX.textY = 0 ; missileX.id = "missileX";}  
    }
    
   // update the missileX's position
   if( /*timeElapsed - timeCount < 3 ||*/ missileX.x < canvasWidth+250 && timeElapsed>0){
   		var blockerUpdate = TIME_INTERVAL / 1000.0 * blockerVelocity;
   		missileX.x += 8;
   }
   
   // update airplane attribiutes
   if( airplane.x <= -200 ){
   		airplane.y = canvasHeight/2 * Math.random()
   		airplaneHit = false;		
   }
   		
   // update the airplane's position
   if( airplane.x <= canvasWidth+650){
   		var blockerUpdate = TIME_INTERVAL / 1000.0 * blockerVelocity;
   		airplane.x += 5;
   }
   
   // update the man1's position
   if( (timeElapsed>5 && timeElapsed<=8)  || (timeElapsed>0 && timeElapsed<=3)){
   		var blockerUpdate = TIME_INTERVAL / 1000.0 * blockerVelocity;
   		man1.x -= 1;
   }

   // update the blocker's position
   var blockerUpdate = TIME_INTERVAL / 1000.0 * blockerVelocity;
   blocker.start.x += blockerUpdate;
   blocker.end.x += blockerUpdate;

   // update the target's position
   var targetUpdate = TIME_INTERVAL / 1000.0 * targetVelocity;
   target.start.x += targetUpdate;
   target.end.x += targetUpdate;

   if (missileX.x > canvasWidth+250)
      missileX.x = -100;

	if (airplane.x > canvasWidth+250)
	      airplane.x = -200;

   
   // if the blocker hit the left or right, reverse direction
   if (blocker.start.x < 0 || blocker.start.x+7*pieceLength/3 > canvasWidth){
      blockerVelocity *= -1;
      blocker.start.y += 7;
   }
	
   // if the target hit the top or bottom, reverse direction
   if (target.start.x < 0 || target.end.x > canvasWidth){
      targetVelocity *= -1;
   	  target.start.y += 5;   
   }
   
   // if target reached 4/5 of the canvas
   if(target.start.y > canvasHeight*4/5){
   		screamSound.play();
		 airplaneHit = true;
		 stopTimer();
         draw(); // draw the game pieces one final time
         showGameOverDialog("You Lost! You killed our people!");

	}

   if (cannonballOnScreen) // if there is currently a shot fired
   {
      // update cannonball position
      var interval = TIME_INTERVAL / 1000.0;

      cannonball.x += interval * cannonballVelocityX;
      cannonball.y += interval * cannonballVelocityY;

	  // check for collision with missileX
	  if (cannonball.y + cannonballRadius >= missileX.y &&
         cannonball.y + cannonballRadius <= missileX.y + 90 &&
         cannonball.x - cannonballRadius > missileX.x &&
         cannonball.x + cannonballRadius < missileX.x+130)
      {
		 cannonballOnScreen = false; // remove cannonball
         timeLeft += HIT_REWARD; // add reward to remaining time
		 score += missileX.score;
		 missileExSound.play();
		 missileHit = true;
		 
	  }
	  
	  // check for collision with airplane
	  if (cannonball.y + cannonballRadius >= airplane.y &&
         cannonball.y + cannonballRadius <= airplane.y + 76 &&
         cannonball.x - cannonballRadius > airplane.x &&
         cannonball.x + cannonballRadius < airplane.x+200)
      {
		 cannonballOnScreen = false; // remove cannonball
         timeLeft -= HIT_REWARD; // add reward to remaining time
		 score -= 50;
		 airplaneExSound.play();
		 screamSound.play();
		 airplaneHit = true;
		 stopTimer();
         draw(); // draw the game pieces one final time
         showGameOverDialog("You Lost! You killed our people!");
	  }

	  
      // check for collision with blocker
      if ( (diffTime==0 || diffTime>=5) && 
         cannonball.y + cannonballRadius >= blocker.start.y &&
         cannonball.y + cannonballRadius <= blocker.start.y + lineWidth &&
         cannonball.x - cannonballRadius > blocker.start.x &&
         cannonball.x + cannonballRadius < blocker.end.x &&
         blocker.start.y < 360)
      {
         blockerSound.play(); // play blocker hit sound
         cannonballVelocityY *= -1; // reverse cannonball's direction
         timeLeft -= MISS_PENALTY; // penalize the user
         
         // determine target section number (0 is the left)
         var sectionB = 
            Math.floor((cannonball.x  - blocker.start.x) / (pieceLength/3) );
         
         if(hitStatesB[sectionB] == 0)
         	score = score + 10;

         if ((sectionB >= 0 && sectionB < BLOCKER_PIECES) && 
            hitStatesB[sectionB]<3)
         {
            targetSound.play(); // play target hit sound
            hitStatesB[sectionB] += 1; // section was hit
		 }
      } // end if

      // check for collisions with left and right walls
      else if (cannonball.x + cannonballRadius > canvasWidth || 
         cannonball.x - cannonballRadius < 0)
      {
         cannonballOnScreen = false; // remove cannonball from screen
      } // end else if

      // check for collisions with top and bottom walls
      else if (cannonball.y + cannonballRadius > canvasHeight || 
         cannonball.y - cannonballRadius < 0)
      {
         cannonballOnScreen = false; // make the cannonball disappear
      } // end else if

      // check for cannonball collision with target
      else if (/*cannonballVelocityX > 0 &&*/ 
         cannonball.y + cannonballRadius >= target.start.y/*targetDistance*/ &&
         cannonball.y + cannonballRadius <= target.start.y/*targetDistance*/ + 90 &&
         cannonball.x - cannonballRadius > target.start.x &&
         cannonball.x + cannonballRadius < target.end.x)
      {
         // determine target section number (0 is the top)
         var section = 
            Math.floor((cannonball.x  - target.start.x) / pieceLength);
            
         if(hitStates[section].destroyed == false)
         	score = score + 10;
           
         // check whether the piece hasn't been hit yet
         if ((section >= 0 && section < TARGET_PIECES) && 
            !hitStates[section].destroyed)
         {
            missileExSound.play();
            //targetSound.play(); // play target hit sound
            hitStates[section].destroyed = true; // section was hit
            cannonballOnScreen = false; // remove cannonball
            timeLeft += HIT_REWARD; // add reward to remaining time

            // if all pieces have been hit
            if (++targetPiecesHit == TARGET_PIECES)
            {
               stopTimer(); // game over so stop the interval timer
               draw(); // draw the game pieces one final time
               showGameOverDialog("You Won!"); // show winning dialog
            } // end if
         } // end if
      } // end else if
   } // end if

   ++timerCount; // increment the timer event counter

   // if one second has passed
   if (TIME_INTERVAL * timerCount >= 1000)
   {
      --timeLeft; // decrement the timer
      ++timeElapsed; // increment the time elapsed
      timerCount = 0; // reset the count
   } // end if

   draw(); // draw all elements at updated positions

   // if the timer reached zero
   if (timeLeft <= 0)
   {
      stopTimer();
      showGameOverDialog("You lost"); // show the losing dialog
   } // end if
} // end function updatePositions

// fires a cannonball

function fireCannonball(event)
{
   //alert(event);
   if (cannonballOnScreen) // if a cannonball is already on the screen
      return; // do nothing

   var angle;
   
   if(event!=null)
		angle = alignCannon(event); // get the cannon barrel's angle
   else
   		angle = alignCannon();
   		
   // move the cannonball to be inside the cannon
   cannonball.x = canvasWidth / 2; // centers ball
   cannonball.y = canvasHeight - cannonballRadius; // align x-coordinate with cannon

   // get the x component of the total velocity
   cannonballVelocityX = (cannonballSpeed * Math.sin(angle)).toFixed(0);

   // get the y component of the total velocity
   cannonballVelocityY = (-cannonballSpeed * Math.cos(angle)).toFixed(0);
   cannonballOnScreen = true; // the cannonball is on the screen
   ++shotsFired; // increment shotsFired

   // play cannon fired sound
   cannonSound.play();
} // end function fireCannonball

// aligns the cannon in response to a keysDown
function moveCannon(direction)
{
   // get the location of the barrelEnd 
   var point = new Object();
   //point.x = barrelEnd.x;
   point.y = barrelEnd.y; // fix error 

   var angle = 0; // initialize angle to 0
   
   if(direction=="right")
   {
      if(barrelEnd.x>=300)   
         barrelEnd.x = (Math.sqrt( Math.pow(canvasHeight-cannonLength,2) - Math.pow(point.y-canvasHeight,2) ) + canvasWidth/2).toFixed(0);
      else
         barrelEnd.x = (-Math.sqrt( Math.pow(canvasHeight-cannonLength,2) - Math.pow(point.y-canvasHeight,2) ) + canvasWidth/2).toFixed(0);
   }

   if(direction=="left")
   {  
      if(barrelEnd.x<=300)
         barrelEnd.x = -Math.sqrt( Math.pow(canvasHeight-cannonLength,2) - Math.pow(point.y-canvasHeight,2) ) + canvasWidth/2;
      else
         barrelEnd.x = Math.sqrt( Math.pow(canvasHeight-cannonLength,2) - Math.pow(point.y-canvasHeight,2) ) + canvasWidth/2;  
   }
}

// aligns the cannon in response to a mouse click
function alignCannon(event)
{
   // get the location of the click 
   var clickPoint = new Object();
   if(event != null){
   		clickPoint.x = event.layerX;
   		clickPoint.y = event.layerY;
   }
   else{
   		clickPoint.x = barrelEnd.x;
	    clickPoint.y = barrelEnd.y;
   }
   
   // compute the click's distance from center of the screen
   // on the y-axis
   var centerMinusY = (canvasHeight / 2 - (clickPoint.y - canvasHeight/2) );

   var angle = 0; // initialize angle to 0

   // calculate the angle the barrel makes with the horizontal
   if (centerMinusY !== 0) // prevent division by 0
      angle = Math.atan( (clickPoint.x - canvasWidth/2)  / centerMinusY);

   // if the click is on the lower half of the screen
   if (centerMinusY < 0)
      angle += Math.PI; // adjust the angle

   // calculate the end point of the cannon's barrel
   barrelEnd.y = ( (canvasHeight-cannonLength - (canvasHeight-cannonLength) * Math.sin(Math.PI/2-angle)) + cannonLength ).toFixed(0);
   barrelEnd.x = 
      ( (canvasHeight-cannonLength) * Math.cos(Math.PI/2-angle) + canvasWidth/2).toFixed(0);
	//alert("x="+barrelEnd.x+" | y="+barrelEnd.y + " | a=" + angle*180/Math.PI + " x="+ clickPoint.x + " y="+clickPoint.y);
   return angle; // return the computed angle
} // end function alignCannon

// draws the game elements to the given Canvas
function draw()
{
   canvas.width = canvas.width; // clears the canvas (from W3C docs)

   // display time remaining
   context.fillStyle = "#A5FFDF";
   context.font = "bold 24px serif";
   context.textBaseline = "top";      
   context.fillText(" Time remaining: " + timeLeft + " Score: " + score + " Player: " + DB[current].fname, 5, 5);
   
   var img;
   // flying missile
   if(!missileHit){
   		img=document.getElementById(missileX.id);
   		context.drawImage(img,missileX.x,missileX.y,missileX.endx,missileX.endy);
   		context.fillStyle = "black";
   		context.font = "bold 24px Theoma";
   		context.fillText(missileX.score ,missileX.x + missileX.endx/2 - missileX.textX, (missileX.y + missileX.endy/3) - missileX.textY);
   }
   else{
   		if(missileX.bombed<5){
   			img=document.getElementById("explosion2");
   			context.drawImage(img,missileX.x,missileX.y, 90 - missileX.score,90 - missileX.score);
   			missileX.bombed++;
   		}
   			
   }
   
   // building1
   img=document.getElementById("building1");
   context.drawImage(img,100,canvasHeight-94,60,94);
   
   // building2
   img=document.getElementById("building2");
   context.drawImage(img,350,canvasHeight-83,95,84);

   // building3
   img=document.getElementById("building3");
   context.drawImage(img,500,canvasHeight-105,82,105);
   
   // man1
   //img=document.getElementById("man1");
   //context.drawImage(img,man1.x,man1.y,17,22);
	
   // flying airplane
   if(!airplaneHit){
   		img=document.getElementById("airplane");
   		context.drawImage(img,airplane.x,airplane.y,200,76);
   		//context.fillStyle = "black";
   		//context.font = "bold 24px Theoma";
   		//context.fillText(missileX.score ,missileX.x + missileX.endx/2 - missileX.textX, (missileX.y + missileX.endy/3) - missileX.textY);
   }
   else {
   		img=document.getElementById("explosion1");
   		context.drawImage(img,airplane.x,airplane.y, 128,119 );
   }

   // if a cannonball is currently on the screen, draw it
   if (cannonballOnScreen)
   { 
      context.fillStyle = "gray";
      context.beginPath();
      context.arc(cannonball.x, cannonball.y, cannonballRadius, 
         0, Math.PI * 2);
      context.closePath();
      context.fill();
   } // end if

   // draw the cannon barrel
   context.beginPath(); // begin a new path
   var gradObj = context.createRadialGradient(canvasWidth / 2,canvasHeight,0, canvasWidth/2,canvasHeight,90);
   gradObj.addColorStop(1, "#C0C0C0");
   gradObj.addColorStop(0, "#000000");
   context.strokeStyle = gradObj;
   context.moveTo(canvasWidth / 2 , canvasHeight); // path origin
   context.lineTo(barrelEnd.x, barrelEnd.y); 
   context.lineWidth = lineWidth*2/3; // line width
   context.stroke(); //draw path

   // draw the cannon base
   context.beginPath();
   var gradObj = context.createRadialGradient(canvasWidth / 2,canvasHeight,0, canvasWidth/2,canvasHeight,50);
   gradObj.addColorStop(0, "#C0C0C0");
   gradObj.addColorStop(1, "#000000");
   context.fillStyle = gradObj;
   context.arc(canvasWidth / 2, canvasHeight , cannonBaseRadius, 0, Math.PI * 2);
   context.fill();
   //context.closePath();
   
   // initialize currentPoint to the starting point of the targe
   blocker.currentPoint.x = blocker.start.x;
   blocker.currentPoint.y = blocker.start.y; 

   // draw the blocker
   for (var i = 0; i < BLOCKER_PIECES; ++i)
   {
      // if this target piece is not hit, draw it
      if (hitStatesB[i]<3 && blocker.start.y < 360)
      {
         context.beginPath(); // begin a new path for target

         // alternate coloring the pieces yellow and blue
         if(hitStatesB[i]==0) context.strokeStyle = "black";
         if(hitStatesB[i]==1) context.strokeStyle = "#FF8000";
         if(hitStatesB[i]==2) context.strokeStyle = "#FF4200";

         context.moveTo(blocker.currentPoint.x, blocker.currentPoint.y); // path origin
         context.lineTo(blocker.currentPoint.x +pieceLength/3, blocker.currentPoint.y); 
         context.lineWidth = lineWidth; // line width
         context.stroke(); // draw path
      } // end if	 
      // move currentPoint to the start of the next piece
      blocker.currentPoint.x += pieceLength/3;
   } // end for

   

   // initialize currentPoint to the starting point of the target
   var currentPoint = new Object();
   currentPoint.x = target.start.x;
   currentPoint.y = target.start.y; 

   // draw the target
   for (var i = 0; i < TARGET_PIECES; ++i)
   {
      // if this target piece is not hit, draw it
      if (!hitStates[i].destroyed)
      {
      	 // alien_target
      	 img=document.getElementById("target");
      	 context.drawImage(img,currentPoint.x,currentPoint.y, 63, 57 );
      	       
      /*
         context.beginPath(); // begin a new path for target

		 var gradObj = context.createRadialGradient(currentPoint.x,currentPoint.y,0, currentPoint.x,currentPoint.y,50);
         // alternate coloring the pieces yellow and blue
         if (i % 2 === 0){
            //context.strokeStyle = "yellow";
          	gradObj.addColorStop(0, "#FFE400");
   			gradObj.addColorStop(1, "#FF8F00");
			context.strokeStyle = gradObj;
			}
         else{
			gradObj.addColorStop(0, "#4C61FF");
   			gradObj.addColorStop(1, "#A32FFF");
   			context.strokeStyle = gradObj;
		 }
         context.moveTo(currentPoint.x, currentPoint.y); // path origin
         context.lineTo(currentPoint.x +pieceLength, currentPoint.y); 
         context.lineWidth = lineWidth; // line width
         context.stroke(); // draw path
         */
      } // end if
      else
            if(hitStates[i].bombed<5){
   			img=document.getElementById("explosion2");
   			context.drawImage(img,currentPoint.x,currentPoint.y, 63,57);
   			hitStates[i].bombed++;
		 	}

      	 
      // move currentPoint to the start of the next piece
      currentPoint.x += pieceLength;
   } // end for
   
   // Bonus
   if (score == 50 && BonusTime==0){
   		BonusTime = timeElapsed;
   		diffTime = 0; 
   		bonusSound.play();
   }
   if (score >= 50 && diffTime<5) 
   {
   		if(BonusTime > timeElapsed){
   			//alert(BonusTime + " | T="+timeElapsed);
   			context.fillStyle = "rgba(0, 0, 200, 0.3)";
   			context.fillRect (180, 210, 280, 40);
   			context.fillStyle = "#D9C4FF";
   			context.font = "bold 24px Theoma";
   			//context.textBaseline = "top";
   			context.fillText(" Bonus - Pentrate Blocker! " , 180, 220);
   		}
   		else if(BonusTime < timeElapsed){
   			context.fillStyle = "rgba(0, 0, 200, 0.3)";
   			context.fillRect (180, 210, 280, 40);
   			context.fillStyle = "#FF403D";
   			context.font = "bold 24px Theoma";
   			//context.textBaseline = "top";
   			context.fillText(" Bonus - Pentrate Blocker! " , 180, 220)
   			BonusTime+=0.1; diffTime+=0.1;
   		}
   }
   
} // end function draw

//draw count
function drawCount()
{
   canvas.width = canvas.width;
	
   //context.fillStyle = "rgba(0, 0, 200, 0.3)";
   //context.fillRect (200, 150, 200, 100);
   context.fillStyle = "#000000";
      
   var img;
   
   switch(timeCountDown)
   {
   case 3:
   img=document.getElementById("missile1");
   context.drawImage(img,180,150,230,230);
   break;
   case 2:
   img=document.getElementById("missile2");
   context.drawImage(document.getElementById("missile2"),180,150,230,230);
   break;
   case 1:
   img=document.getElementById("missile3");
   context.drawImage(document.getElementById("missile3"),180,150,230,230);
   break;
   }
   
      
   context.font = "bold 30pt Arial";
   txt = timeCountDown;
   if(timeCountDown == 0){
   		context.font = "bold 20pt Arial";
   		context.fillText("Go", 280, 325);
   }
   else
   		context.fillText(txt, 290, 325);
   context.restore();
   --timeCountDown;
   
   if(timeCountDown <=-1)
       stopCount();
   
   //context.lineTo(blocker.end.x, blocker.end.y); 
   //context.lineWidth = lineWidth; // line width
   //context.stroke(); //draw path

}

function drawStart()
{
   canvas.width = canvas.width;
   var img=document.getElementById("soldier");   
   context.drawImage(img,180,250,330,300);
   
   context.drawImage(document.getElementById("startBtn"),180,250,158,53);
   
}

// display an alert when the game ends
function showGameOverDialog(message)
{
   var win;
   if(score>=100 && target.start.y < 360) win="Yon won! You saved us!";
   else win="You Lost! Everybody is dead!" 
   alert(win + "\nShots fired: " + shotsFired + 
      "\nTotal time: " + timeElapsed + " seconds ");
} // end function showGameOverDialog

window.addEventListener("load", setupGame, false);


/*************************************************************************
* (C) Copyright 1992-2012 by Deitel & Associates, Inc. and               *
* Pearson Education, Inc. All Rights Reserved.                           *
*                                                                        *
* DISCLAIMER: The authors and publisher of this book have used their     *
* best efforts in preparing the book. These efforts include the          *
* development, research, and testing of the theories and programs        *
* to determine their effectiveness. The authors and publisher make       *
* no warranty of any kind, expressed or implied, with regard to these    *
* programs or to the documentation contained in these books. The authors *
* and publisher shall not be liable in any event for incidental or       *
* consequential damages in connection with, or arising out of, the       *
* furnishing, performance, or use of these programs.                     *
*************************************************************************/