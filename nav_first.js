var __interpretation_started_timestamp__;
var pi = 3.141592653589793;
robot = {
	d: 5.6,
	track: 17.5,
	cpr: 360,
	v: 80,
	curAngle: 0
}
cellSize = 52.5 //sim - 52.5, real - 60 (40 on NTI)
var readGyro = brick.gyroscope().read
mL = brick.motor('M4').setPower // левый мотор
mR = brick.motor('M3').setPower // правый мотор
eL = brick.encoder('E4').read // левый энкодер
eR = brick.encoder('E3').read // правый энкодер
sF = brick.sensor('D1').read // сенсор спереди (УЗ)
sL = brick.sensor('A2').read // сенсор слева (ИК)
sR = brick.sensor('A1').read // сенсор справа (ИК)

var eLeft = brick.encoder(E4);
var eRight = brick.encoder(E3);

abs = Math.abs
wait = script.wait

var mazeMatrix = [
	[0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
	[0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0]
]

function sign(num) {
	return num > 0 ? 1 : -1
}

function cm2cpr(cm) {
	return (cm / (pi * robot.d)) * robot.cpr
}

function getYaw() {
	return readGyro()[6]
}

function motors(vl, vr) {
	mL(vl == undefined ? robot.v : vl)
	mR(vr == undefined ? robot.v : vr)
}

//base functions. Try not to use in main code

function turnEnc(angle) {
	var sgn = sign(angle)
	var eN = sgn == 1 ? eL : eR
	var path = eN() + (robot.track * abs(angle)) / (robot.d * 360) * robot.cpr
	motors(40 * sgn, -40 * sgn)
	while (eN() < path) {
		wait(10)
	}
	motors(0, 0)
}

function turnGyro(angle) {
	if (abs(angle) < 200) angle *= 1000
	if (angle > 180000) angle = (angle - (angle - 180000) * 2) * -1
	var cyaw = getYaw()
	var sgn = 1
	var lb = cyaw - 180000
	if (angle > lb && angle < cyaw)
		sgn = -1
	else if (lb < -180000) {
		lb = abs(lb) - (abs(lb) - 180000) * 2
		if (angle > lb) sgn = -1
	}
	motors(40 * sgn, -40 * sgn)
	while (abs(angle - getYaw()) > 1000)
		wait(10)
	motors(0, 0)
	robot.curAngle = angle
}

function moveBackwards(cm) {
	print('Moving back for ' + cm + ' cm')
	var path = eL() - cm2cpr(cm)
	motors(-robot.v, -robot.v)
	while (eL() > path) {
		wait(10)
	}
	motors(0, 0)
}

function moveStraight(cm) {
	var sgn = sign(cm)
	print('Moving for ' + cm + ' cm')
	var path = eL() + cm2cpr(abs(cm)) * sgn
	motors(robot.v * sgn, robot.v * sgn)
	if (sgn == 1)
		while (eL() < path) {
			wait(10)
		}
	else
		while (eL() > path) {
			wait(10)
		}
	motors(0, 0)
}

function moveSmooth(cm, v) {
	v = v == undefined ? robot.v : v
	var sgn = sign(cm)
	cm = abs(cm)
	var pathStart = eL()
	var path = pathStart + cm2cpr(cm) * sgn
	var v0 = 30,
		vM = v0
	var startStop = cm2cpr(cm) / 4
	var dV = (v - v0) / 10
	if (sgn == 1)
		while (eL() < path) {
			if (eL() < pathStart + startStop) vM += dV
			if (eL() > pathStart + startStop * 3) vM -= dV
			vM = Math.max(v0, vM)
			motors(vM, vM)
			wait(30)
		}
	else if (sgn == -1)
		while (eL() > path) {
			if (eL() > pathStart - startStop) vM += dV
			if (eL() < pathStart - startStop * 3) vM -= dV
			vM = Math.max(v0, vM)
			motors(-vM, -vM)
			wait(30)
		}
	motors(0, 0)
}

//Main code functions

function placeTurnRight() {
	moveStraight(robot.track / 2)
	turnGyro(robot.curAngle + 90000)
	moveStraight(-robot.track / 2)
}

function placeTurnLeft() {
	moveStraight(robot.track / 2)
	turnGyro(robot.curAngle - 90000)
	moveStraight(-robot.track / 2)
}

function moveCells(cells) {
	moveSmooth(cells * cellSize)
}

function reg_move() {
	var kP = 5.0
	var kD = 6.0
	var error = 0
	var lastError = 0
	var regSpeed = 40
	motors(regSpeed, regSpeed)
	var ndist = sR()
	while (true) {
		error = ndist - sR()
		var P = error * kP
		var D = (error - lastError) * kD
		var PD = P + D
		motors(regSpeed - PD, regSpeed + PD)
		lastError = error
		wait(10)
	}
}
//Main program. Keep at end of file

var main = function () {
	__interpretation_started_timestamp__ = Date.now()
	brick.gyroscope().calibrate(5000) //5000 in simulator, 14000 in real
	wait(6000)
	/*turnGyro(-90)
	wait(1000)
	turnGyro(90)
	wait(1000)
	moveStraight(52.5)
	turnEnc(90)
	turnEnc(-90)
	moveStraight(-52.5)
	placeTurnRight()
	placeTurnLeft()
	moveSmooth(52.5)
	moveSmooth(-52.5)*/
	//print(sR())
	for (var i = 1; i < 5; i++) {
		moveSmooth(105)
		placeTurnRight()
	}
	reg_move()
	motors()
	while (sF() > 17.5) wait(10)
	motors(0, 0)
	return
}

main()