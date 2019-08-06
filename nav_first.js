var __interpretation_started_timestamp__;
var pi = 3.141592653589793;
robot = {
	d: 5.6,
	track: 17.5,
	cpr: 360,
	v: 80,
	curAngle: 1,
	beginAngle: 90000,
	x: 1,
	y: 0
}

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

cellSize = 52.5 //sim - 52.5, real - 60 (40 on NTI)
maze_width = 4
maze_height = 4
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

function printArr(arr, delim) {
	delim = delim == undefined ? ',' : delim
	for (var i = 0; i < arr.length; i++) {
		print(arr[i].join(delim))
	}
}

function get_cell(x, y) {
	return maze_width * y + x
}

function get_coord(cell) {
	return [cell % maze_width, Math.floor(cell / maze_height)]
}

function bfs(start, end) {
	var queue = [start]
	var P
	var path = []
	var visited = []
	for (var i = 0; i < mazeMatrix.length; i++) visited.push(false)
	while (queue.length) {
		P = queue.shift()
		path.push(P)
		if (P == end)
			break
		if (!visited[P]) {
			visited[P] = true
			for (var i = 0; i < mazeMatrix.length; i++) {
				if (mazeMatrix[P][i] == 1 && !visited[i]) queue.push(i)
			}
		}
	}
	path = path.reverse()
	var pathBack = [path.shift()]
	for (var i = 0; i < path.length; i++) {
		var lastP = pathBack.slice(-1)
		if (mazeMatrix[lastP][path[i]] == 1)
			pathBack.push(path[i])
	}
	path = pathBack.reverse()
	return path
}

function dfs(start, end) {
	var stack = [start]
	var P
	var path = [start]
	var Q
	var visited = []
	for (var i = 0; i < mazeMatrix.length; i++) visited.push(false)
	visited[start] = true
	while (stack.length) {
		P = stack[stack.length - 1]
		if (P == end)
			break
		hasnotvisited = []
		for (var i = 0; i < mazeMatrix.length; i++)
			if (mazeMatrix[P][i] == 1 && !visited[i]) {
				hasnotvisited.push(i)
			}
		if (hasnotvisited.length) {
			Q = hasnotvisited[0]
			visited[Q] = true
			stack.push(Q)
			path.push(Q)
		}
		else {
			stack.pop()
			path.pop()
		}
	}
	return path
}

function getPath(start_cell, stop_cell, start_dir) {
	way = bfs(start_cell, stop_cell)
	var step
	var az = start_dir
	var moves = []
	for (var i = 1; i < way.length; i++) {
		step = way[i] - way[i - 1]
		if (step == 4) {
			if (az == 0) moves.push('LL')
			if (az == 1) moves.push('R')
			if (az == 2) {}
			if (az == 3) moves.push('L')
			az = 2
		}
		if (step == 1) {
			if (az == 0) moves.push('R')
			if (az == 1) {}
			if (az == 2) moves.push('L')
			if (az == 3) moves.push('LL')
			az = 1
		}
		if (step == -4) {
			if (az == 0) {}
			if (az == 1) moves.push('L')
			if (az == 2) moves.push('LL')
			if (az == 3) moves.push('R')
			az = 0
		}
		if (step == -1) {
			if (az == 0) moves.push('L')
			if (az == 1) moves.push('LL')
			if (az == 2) moves.push('R')
			if (az == 3) {}
			az = 3
		}
		moves.push('F')
	}
	return moves
}

function goMoves(moves)	{
	for (var i = 0; i < moves.length; i++) {
		displayCoords()
		switch (moves[i]) {
			case 'F':
				moveCells(1)
				break
			case 'L':
				placeTurnLeft()
				break
			case 'R':
				placeTurnRight()
				break
		}
	}
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
	angle = angle - robot.beginAngle
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
	//robot.curAngle = angle
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

function displayCoords() {
	brick.display().addLabel("("+robot.x+";"+robot.y+")"+robot.curAngle,1,1) //вывод ответа
	brick.display().redraw()
}
//Main code functions

function placeTurnRight() {
	robot.curAngle = robot.curAngle + 1 > 3 ? 0 : robot.curAngle + 1
	moveStraight(robot.track / 2)
	turnGyro(robot.curAngle * 90000)
	moveStraight(-robot.track / 2)
}

function placeTurnLeft() {
	robot.curAngle = robot.curAngle - 1 < 0 ? 3 : robot.curAngle - 1
	moveStraight(robot.track / 2)
	turnGyro(robot.curAngle * 90000)
	moveStraight(-robot.track / 2)
}

function moveCells(cells) {
	moveSmooth(cells * cellSize)
	switch (robot.curAngle) {
		case 0:
			robot.y -= 1 * cells
			break
		case 1:
			robot.x += 1 * cells
			break
		case 2:
			robot.y += 1 * cells
			break
		case 3:
			robot.x -= 1 * cells
			break
	}


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
	var cell_start = 1
	var cell_end = 15
	print(bfs(cell_start, cell_end))
	print(dfs(cell_start, cell_end))
	rob_path = getPath(cell_start, cell_end, robot.curAngle)
	print(rob_path)
	goMoves(rob_path)

	return
}

main()
