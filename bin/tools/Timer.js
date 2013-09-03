function Timer() {
	this.timeStart = null;
	this.timeStop = null;

	this.start();
}

Timer.prototype.__getCurrentMiliseconds = function() {
	var date = new Date();
	return date.getTime();
}

Timer.prototype.start = function() {
	this.timeStart = this.__getCurrentMiliseconds();
}

Timer.prototype.stop = function() {
	this.timeStop = this.__getCurrentMiliseconds();
}

Timer.prototype.getTime = function() {
	var tStop = this.timeStop
	if (tStop == null) {
		tStop = this.__getCurrentMiliseconds();
	}

	return tStop - this.timeStart;
}

