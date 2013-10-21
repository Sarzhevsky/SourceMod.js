var timers = [];
var gametime = 0;
var mapStarted = false;
var nextFrameFuncs = [];


game.hook("OnGameFrame", function(){
	gametime = game.rules.props.m_fGameTime;
	
	var arr = nextFrameFuncs;
	nextFrameFuncs = [];
	for (var i = 0; i < arr.length; ++i) {
		arr[i]();
	}
	
	for(var i = 0; i < timers.length; ++i){
		var t = timers[i];
		
		if(t.next == 0){
			t.next = gametime + t.interval;
		}else if(t.next <= gametime){
			t.func();
			if(t.repeat){
				//t.next = gametime + t.interval;
				
				// The timer may compensate and fire more often if frames are lasting longer
				t.next += t.interval;
			}else{
				timers.splice(i, 1);
				--i;
			}
		}
	}
}
);


game.hook("OnMapStart", function(){
	mapStarted = true;
	gametime = game.rules.props.m_fGameTime;
	for (var i = 0; i < timers.length; i++) {
		timers[i].next += gametime;
	}
});

exports.setInterval = function(func, interval){
	if(typeof func != 'function') throw new Error("Argument 1 must be a function");
	var timer = {
		func: func,
		interval: interval / 1000,
		next: gametime == 0 ? 0 : gametime + interval / 1000,
		repeat: true
	};
	timers.push(timer);
	
	return timer;
};

exports.setTimeout = function(func, interval){
	if(typeof func != 'function') throw new Error("Argument 1 must be a function");
	var timer = {
		func: func,
		interval: interval / 1000,
		next: gametime == 0 ? 0 : gametime + interval / 1000,
		repeat: false
	};
	timers.push(timer);
	
	return timer;
};

exports.clearTimer = exports.clearTimeout = exports.clearInterval = function(timer){
	if(timer == null) return false;
	for(var i = 0; i < timers.length; ++i){
		if(timers[i] == timer){
			timers.splice(i, 1);
			return true;
		}
	}
	
	return false;
}

exports.nextFrame = function(func){
	if(typeof func != 'function') throw new Error("Argument 1 must be a function");
	nextFrameFuncs.push(func);
}