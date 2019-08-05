var __interpretation_started_timestamp__;
var pi = 3.141592653589793;
robot = {
	d: 5.6,
	track: 17.5,
	cpr: 360,
	v: 80
}
var readGyro = brick.gyroscope().read
mL = brick.motor('M4').setPower // левый мотор
mR = brick.motor('M3').setPower // правый мотор
eL = brick.encoder('E4').read // левый энкодер
eR = brick.encoder('E3').read // правый энкодер
sF = brick.sensor('D1').read // сенсор спереди (УЗ)
sL = brick.sensor('A1').read // сенсор слева (ИК)
sR = brick.sensor('A2').read // сенсор справа (ИК)

var eLeft = brick.encoder(E4);
var eRight = brick.encoder(E3);

abs = Math.abs
wait = script.wait


function cm2cpr(cm) {
	return (cm / (pi * robot.d)) * robot.cpr
}

function motors(vl, vr){
	mL(vl == undefined ? robot.v : vl)
	mR(vr == undefined ? robot.v : vr)
}

function turnRight(angle){
	path = eL() + (robot.track * angle) / (robot.d * 360) * robot.cpr
	motors(40, -40)
	while(eL() < path){
		wait(10)
	}
	motors(0,0)
}

function turnLeft(angle){
	path = eL() - (robot.track * angle) / (robot.d * 360) * robot.cpr
	motors(-40, 40)
	while(eL() > path){
		wait(10)
	}
	motors(0,0)
}

function moveBackwards(cm){
	print('Moving back for ' + cm + ' cm')
	var path = eL() - cm2cpr(cm)
	motors(-robot.v, -robot.v)
}

function moveStraight(cm){
	print('Moving for ' + cm + ' cm')
	var path = cm2cpr(cm) + eL()
	motors()
	while (eL() < path){
		wait(10)
	}
	motors(0,0)
}
var main = function () {
	__interpretation_started_timestamp__ = Date.now()
	moveStraight(52.5)
	return
}

main()