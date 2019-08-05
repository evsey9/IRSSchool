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
var main = function () {
	__interpretation_started_timestamp__ = Date.now();

	return;
}