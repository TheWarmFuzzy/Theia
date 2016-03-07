function Debug(count){
	this.logWindow = null;
	
	//Sets the number of log messages to be kept
	this.logMessagesCount = typeof count == "number" ? Math.round(count) : 10;
	
	//Creates the array for the log messages
	this.logMessages = new Array(this.logMessagesCount);
	
	//Index of the oldest message
	this.firstMessage = 0;
	
	//If the class is enabled
	this.enabled = true;
	
	//Runs the initialization
	this.initialize();
}

//Initializes the debug class
Debug.prototype.initialize = function(){
	
	//Creates the log window on the page
	this.create_log_window();
	
}


Debug.prototype.toggle_enabled = function(){
	
	//Toggle the window visibility
	this.logWindow.hidden = this.enabled;
	
	//Toggle Enabled
	this.enabled = this.enabled ? false : true;
		
}

Debug.prototype.log = function(message){
	//Return if not enabled
	if(!this.enabled)
		return false;
	
	//Returned if argument is not a string
	if(typeof message != "string")
		return false;
	
	//Replace the oldest element with the new message
	this.logMessages[this.firstMessage] = message + "<br/>";
	
	//Go to next oldest message
	this.firstMessage = (this.firstMessage + 1) % this.logMessages.length;
	
	//Display messages
	this.display();
}

//Displays the messages on the page
Debug.prototype.display = function(){
	//Return if not enabled
	if(!this.enabled)
		return false;
	
	//Prepare the messages variable
	var logMessages = "";
	
	//Loop throught the array of log messages
	for(var i = 0; i < this.logMessages.length; i++){
		
		//Get the start index of the message
		var index = (this.firstMessage + i) % this.logMessages.length;
		
		//Add the message if it exists
		if(typeof this.logMessages[index] != "undefined")
			logMessages += this.logMessages[index];
	}
	
	//Display all messages in the log window
	this.logWindow.innerHTML = logMessages;
}

//Creates the log message area on the page
Debug.prototype.create_log_window = function(){
	
	//Creates a new div element
	this.logWindow = document.createElement("div");
	
	//Sets the css styling
	this.logWindow.style = 
		"position:absolute;" +
		"width:300px;" +
		"height:600px;" +
		"top:0px;" +
		"left:0px;" +
		"padding:10px;" +
		"color: RGB(255,255,255);" +
		"background-color: RGBA(0,0,0,0.5);" +
		"z-index:99999";
	
	//Add to the page
	document.body.appendChild(this.logWindow);
}

//Messages 3-12 should each be visible on a new line
Debug.prototype.test = function(){
	this.log("1");
	this.log("2");
	this.log("3");
	this.log("4");
	this.log("5");
	this.log("6");
	this.log("7");
	this.log("8");
	this.log("9");
	this.log("10");
	this.log("11");
	this.log("12");
}