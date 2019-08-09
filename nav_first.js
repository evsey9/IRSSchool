var __interpretation_started_timestamp__;
var pi = 3.141592653589793;
//ARTag stuff and helper funcs
sign = function (n) {
    return n > 0 ? 1 : n = 0 ? 0 : -1
}
sqr = function (n) {
    return n * n
}
min = function (a, b) {
    return a < b ? a : b
}
max = function (a, b) {
    return a > b ? a : b
}
round = Math.round
abs = Math.abs
sqrt = Math.sqrt
sin = Math.sin
cos = Math.cos
atan2 = Math.atan2


var xsize = 160
var ysize = 120
var arcells = 6

function printArr(arr, delim) {
    delim = delim == undefined ? ',' : delim
    for (var i = 0; i < arr.length; i++) {
        print(arr[i].join(delim))
    }
}

function listToMatrix(list, elementsPerSubArray) {
    var matrix = [],
        i, k
    for (i = 0, k = -1; i < list.length; i++) {
        if (i % elementsPerSubArray == 0) {
            k++
            matrix[k] = []
        }
        matrix[k].push(list[i])
    }
    return matrix
}

function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {

    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
        return false
    }

    denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

    // Lines are parallel
    if (denominator === 0) {
        return false
    }

    var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
    var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return false
    }

    // Return a object with the x and y coordinates of the intersection
    var x = x1 + ua * (x2 - x1)
    var y = y1 + ua * (y2 - y1)

    return [x, y];
}

function quadrilateral_area(x1, y1, x2, y2, x3, y3, x4, y4) {
    return abs(x1 * y2 + x2 * y3 + x3 * y4 + x4 * y1 - x2 * y1 - x3 * y2 - x4 * y3 - x1 * y4) / 2
}

function rgb24_to_RGB(rgb) {
    var R = (rgb & 0xFF0000) >> 16
    var G = (rgb & 0x00FF00) >> 8
    var B = (rgb & 0x0000FF)
    return [R, G, B]
}

function rgb24_to_grey(matrix) {
    var rgbMatrix = new Array(ysize)
    for (var i = 0; i < rgbMatrix.length; i++) {
        rgbMatrix[i] = new Array(xsize)
    }

    var greyMatrix = new Array(ysize)
    for (var i = 0; i < greyMatrix.length; i++) {
        greyMatrix[i] = new Array(xsize)
    }

    for (var i = 0; i < ysize; i++) {
        for (var j = 0; j < xsize; j++) {
            var RGB = rgb24_to_RGB(matrix[i][j])
            rgbMatrix[i][j] = RGB
            greyMatrix[i][j] = (RGB[0] + RGB[1] + RGB[2]) / 3
        }
    }
    return greyMatrix
}

function grey_to_mask(greyMatrix) {
    const thresholdGrey = 255 / 6
    var maskMatrix = new Array(ysize)
    for (var i = 0; i < maskMatrix.length; i++) {
        maskMatrix[i] = new Array(xsize)
    }
    for (var i = 0; i < ysize; i++) {
        for (var j = 0; j < xsize; j++) {
            maskMatrix[i][j] = greyMatrix[i][j] > thresholdGrey ? 0 : 1
        }
    }
    return maskMatrix
}

function find_corners_straight(maskMatrix, delta) {
    delta = delta || 0
    var ULcorner = [0, 0]
    var URcorner = [0, 0]
    var DLcorner = [0, 0]
    var DRcorner = [0, 0]

    //upleft corner
    var x = delta
    var y = delta
    while (maskMatrix[y][x] != 1) {
        //print(x + " " + y)
        if (x >= xsize - 1 - delta)
            y += 1, x = delta
        else
            x += 1
    }
    ULcorner = [x, y]

    //upright corner
    var x = xsize - 1 - delta
    var y = delta
    while (maskMatrix[y][x] != 1) {
        if (y >= ysize - 1 - delta)
            x -= 1, y = delta
        else
            y += 1
    }
    URcorner = [x, y]

    //downleft corner
    var x = delta
    var y = delta
    while (maskMatrix[y][x] != 1) {
        if (y >= ysize - 1 - delta)
            x += 1, y = delta
        else
            y += 1
    }
    DLcorner = [x, y]

    //downright corner
    var x = delta
    var y = ysize - 1 - delta
    while (maskMatrix[y][x] != 1) {
        if (x >= xsize - 1 - delta)
            y -= 1, x = delta
        else
            x += 1
    }
    DRcorner = [x, y]
    return [ULcorner, URcorner, DLcorner, DRcorner]
}

function find_corners_diag(maskMatrix, delta) {
    delta = delta || 0
    var ULcorner = [0, 0]
    var URcorner = [0, 0]
    var DLcorner = [0, 0]
    var DRcorner = [0, 0]
    //upleft corner
    var x = delta
    var y = delta
    var l = delta
    while (maskMatrix[y][x] != 1) {
        if (y >= ysize - 1 - delta)
            l += 1, y = delta, x = l
        if (x <= delta)
            l += 1, y = delta, x = l
        else
            y += 1, x -= 1
    }
    ULcorner = [x, y]
    print("ULcorner", ULcorner)
    //upright corner
    var x = xsize - 1 - delta
    var y = delta
    var l = delta
    while (maskMatrix[y][x] != 1) {
        if (y >= ysize - 1 - delta) {
            l += 1, y = delta, x = xsize - 1 - delta - l
            continue
        }
        if (x >= xsize - 1 - delta)
            l += 1, y = delta, x = xsize - 1 - delta - l
        else
            y += 1, x += 1
    }
    URcorner = [x, y]
    print("URcorner", URcorner)
    //down left corner
    var x = delta
    var y = ysize - 1 - delta
    var l = delta
    while (maskMatrix[y][x] != 1) {
        if (y <= 1 + delta) {
            l += 1, y = ysize - 1 - delta, x = l
            continue
        }
        if (x <= delta)
            l += 1, y = ysize - 1 - delta, x = l
        else
            y -= 1, x -= 1
    }
    DLcorner = [x, y]
    print("DLcorner", DLcorner)
    //down right corner
    var x = xsize - 1 - delta
    var y = ysize - 1 - delta
    var l = delta
    while (maskMatrix[y][x] != 1) {
        if (y <= 1 + delta) {
            l += 1, y = ysize - 1 - delta, x = xsize - 1 - l - delta
            continue
        }
        if (x >= xsize - 1 - delta)
            l += 1, y = ysize - 1 - delta, x = xsize - 1 - delta - l
        else
            y -= 1, x += 1
    }
    DRcorner = [x, y]
    print("DRcorner", DRcorner)
    return [ULcorner, URcorner, DLcorner, DRcorner]
}

function recartag(source_artag) {
    if (source_artag.length == 1) source_artag = source_artag[0].trim().split(',')
    source_artag = source_artag.map(Number)
    var xnum = 0
    var ynum = 0
    var nnum = 0
    var matrix = listToMatrix(source_artag, xsize)
    //print(matrix)
    var greyMatrix = rgb24_to_grey(matrix)
    //print(greyMatrix)
    var maskMatrix = grey_to_mask(greyMatrix)
    for (var i = 0; i < ysize; i++) {
        for (var j = 0; j < 5; j++) {
            maskMatrix[i][j] = 0
        }
    }
    //printArr(maskMatrix)
    corners = find_corners_straight(maskMatrix)
    print(corners)
    ULcorner = corners[0], URcorner = corners[1], DLcorner = corners[2], DRcorner = corners[3]
    brick.display().setPainterWidth(4)
    brick.display().drawLine(ULcorner[0], ULcorner[1], URcorner[0], URcorner[1])
    brick.display().drawLine(URcorner[0], URcorner[1], DRcorner[0], DRcorner[1])
    brick.display().drawLine(DRcorner[0], DRcorner[1], DLcorner[0], DLcorner[1])
    brick.display().drawLine(DLcorner[0], DLcorner[1], ULcorner[0], ULcorner[1])
    brick.display().addLabel("UL", ULcorner[0], ULcorner[1])
    brick.display().addLabel("UR", URcorner[0], URcorner[1])
    brick.display().addLabel("DL", DLcorner[0], DLcorner[1])
    brick.display().addLabel("DR", DRcorner[0], DRcorner[1])
    brick.display().redraw()
    script.wait(2000)
    var centre = [(ULcorner[0] + URcorner[0] + DLcorner[0] + DRcorner[0]) / 4, (ULcorner[1] + URcorner[1] + DLcorner[1] + DRcorner[1]) / 4]

    var dirvecUP = [URcorner[0] - ULcorner[0], URcorner[1] - ULcorner[1]];
    var lenUP = sqrt(dirvecUP[0] * dirvecUP[0] + dirvecUP[1] * dirvecUP[1]);
    var normvecUP = [dirvecUP[0] / lenUP, dirvecUP[1] / lenUP];
    var angleUP = atan2(dirvecUP[1], dirvecUP[0]);
    var onelenUP = lenUP / arcells;
    var onevecUP = [normvecUP[0] * onelenUP, normvecUP[1] * onelenUP];

    var dirvecLEFT = [DLcorner[0] - ULcorner[0], DLcorner[1] - ULcorner[1]];
    var lenLEFT = sqrt(dirvecLEFT[0] * dirvecLEFT[0] + dirvecLEFT[1] * dirvecLEFT[1]);
    var normvecLEFT = [dirvecLEFT[0] / lenLEFT, dirvecLEFT[1] / lenLEFT];
    var angleLEFT = atan2(dirvecLEFT[1], dirvecLEFT[0]);
    var onelenLEFT = lenLEFT / arcells;
    var onevecLEFT = [normvecLEFT[0] * onelenLEFT, normvecLEFT[1] * onelenLEFT];

    var dirvecDOWN = [DRcorner[0] - DLcorner[0], DRcorner[1] - DLcorner[1]];
    var lenDOWN = sqrt(dirvecDOWN[0] * dirvecDOWN[0] + dirvecDOWN[1] * dirvecDOWN[1]);
    var normvecDOWN = [dirvecDOWN[0] / lenDOWN, dirvecDOWN[1] / lenDOWN];
    var angleDOWN = atan2(dirvecDOWN[1], dirvecDOWN[0]);
    var onelenDOWN = lenDOWN / arcells;
    var onevecDOWN = [normvecDOWN[0] * onelenDOWN, normvecDOWN[1] * onelenDOWN];

    var dirvecRIGHT = [DRcorner[0] - URcorner[0], DRcorner[1] - URcorner[1]];
    var lenRIGHT = sqrt(dirvecRIGHT[0] * dirvecRIGHT[0] + dirvecRIGHT[1] * dirvecRIGHT[1]);
    var normvecRIGHT = [dirvecRIGHT[0] / lenRIGHT, dirvecRIGHT[1] / lenRIGHT];
    var angleRIGHT = atan2(dirvecRIGHT[1], dirvecRIGHT[0]);
    var onelenRIGHT = lenRIGHT / arcells;
    var onevecRIGHT = [normvecRIGHT[0] * onelenRIGHT, normvecRIGHT[1] * onelenRIGHT];

    var artag = new Array(arcells - 2)
    for (var i = 0; i < artag.length; i++) {
        artag[i] = new Array(arcells - 2)
    }

    for (var i = 1; i < arcells - 1; i++) {
        for (var j = 1; j < arcells - 1; j++) {
            var cxU = ULcorner[0] + onevecUP[0] * j + onevecUP[0] / 2
            var cyU = ULcorner[1] + onevecUP[1] * j
            var cxD = ULcorner[0] + onevecDOWN[0] * j + onevecDOWN[0] / 2 + dirvecLEFT[0]
            var cyD = ULcorner[1] + onevecDOWN[1] * j + dirvecLEFT[1]
            var cxL = ULcorner[0] + onevecLEFT[0] * i
            var cyL = ULcorner[1] + onevecLEFT[1] * i + onevecLEFT[1] / 2
            var cxR = ULcorner[0] + onevecRIGHT[0] * i + dirvecUP[0]
            var cyR = ULcorner[1] + onevecRIGHT[1] * i + onevecRIGHT[1] / 2 + dirvecUP[1]
            var vec = intersect(cxU, cyU, cxD, cyD, cxL, cyL, cxR, cyR);
            brick.display().clear()
            brick.display().drawLine(ULcorner[0], ULcorner[1], URcorner[0], URcorner[1])
            brick.display().drawLine(URcorner[0], URcorner[1], DRcorner[0], DRcorner[1])
            brick.display().drawLine(DRcorner[0], DRcorner[1], DLcorner[0], DLcorner[1])
            brick.display().drawLine(DLcorner[0], DLcorner[1], ULcorner[0], ULcorner[1])
            brick.display().addLabel("UL", ULcorner[0], ULcorner[1])
            brick.display().addLabel("UR", URcorner[0], URcorner[1])
            brick.display().addLabel("DL", DLcorner[0], DLcorner[1])
            brick.display().addLabel("DR", DRcorner[0], DRcorner[1])

            brick.display().addLabel("U", cxU, cyU[1])
            brick.display().addLabel("L", cxL, cyL)
            brick.display().addLabel("D", cxD, cyD)
            brick.display().addLabel("R", cxR, cyR)
            brick.display().drawLine(cxU, cyU, cxD, cyD)
            brick.display().drawLine(cxL, cyL, cxR, cyR)
            //brick.display().drawPoint(ULcorner[0] + vec[0], ULcorner[1] + vec[1])
            brick.display().redraw()
            //script.wait(500)
            //print(vec)
            //print(ULcorner[1] + round(vec[1]), " ", ULcorner[0] +round(vec[0]))
            artag[i - 1][j - 1] = maskMatrix[round(vec[1])][round(vec[0])];
        }
    }
    brick.display().redraw()
    //script.wait(5000)
    for (var i = 0; i < artag.length; i++) {
        print(artag[i])
    }
    if (artag[0][0] == 0) {
        for (var i = 0; i < artag.length; i++) {
            artag[i].reverse()
        }
        artag.reverse()
    } else if (artag[3][0] == 0) {
        var newArray = artag.reverse()
        for (var i = 0; i < newArray.length; i++) {
            for (var j = 0; j < i; j++) {
                var temp = newArray[i][j]
                newArray[i][j] = newArray[j][i]
                newArray[j][i] = temp
            }
        }
        for (var i = 0; i < newArray.length; i++) {
            newArray[i].reverse()
        }
        newArray.reverse()
        artag = newArray
    } else if (artag[0][3] == 0) { //clockwise
        var newArray = artag.reverse()
        for (var i = 0; i < newArray.length; i++) {
            for (var j = 0; j < i; j++) {
                var temp = newArray[i][j]
                newArray[i][j] = newArray[j][i]
                newArray[j][i] = temp
            }
        }
        artag = newArray
    }
    print("new")
    for (var i = 0; i < artag.length; i++) {
        print(artag[i])
    }
    xar = [artag[1][3]] + [artag[2][0]] + [artag[2][2]]
    yar = [artag[2][3]] + [artag[3][1]] + [artag[3][2]]
    nar = [artag[1][0]] + [artag[1][2]]
    xnum = parseInt(xar, 2)
    ynum = parseInt(yar, 2)
    nnum = parseInt(nar, 2)
    //brick.playTone(1000, 50)
    //brick.display().addLabel(nnum + " ("+xnum + ";" + ynum + ")", 1, 1)
    //brick.display().redraw()

    return [xnum, ynum, nnum]
}
//ARTag ends here
//TRIK robot stuff
var trik = false
if (script.readAll("trik.txt").length) {
	trik = true
}
robot = {
	d: trik ? 8.5 : 5.6,
	track: trik ? 17.3 : 17.5,
	cpr: trik ? 385 : 360,
	v: 80,
	curAngle: 1,
	x: 1,
	y: 0,
	calibration_time: trik ? 14000 : 5000,
	calibration_values: trik ? [113, -172, 14, 12, -41, 4137] : undefined
}
var gyroAngles = [
	[0, 90, 180, -90],
	[-90, 0, 90, 180],
	[180, -90, 0, 90],
	[90, 180, -90, 0]
]
const drift = 132
var gyro = gyroAngles[robot.curAngle]
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



wait = script.wait

cellSize = trik ? 56 : 52.5 //sim - 52.5, real - 60 (40 on NTI)
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
		} else {
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

function goMoves(moves) {
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

var yawdrift = 0

function driftmeasure() { //662 mdeg per 5 seconds
	print("yaw drift per 1 second: " + getYaw())
	yawdrift += getYaw()
	//script.exit()
}

function driftfix() {
	yawdrift += -132
}

if (trik) {
	var drifttimer = script.timer(1000)
	drifttimer.timeout.connect(driftfix)
}

function getYaw() {
	yawValue = readGyro()[6] - yawdrift
	if (yawValue > 180000) {
		yawValue = -yawValue + (yawValue - 180000) * 2
	}
	return yawValue
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
	motors(52 * sgn, -40 * sgn)
	while (abs(angle - getYaw()) > 1000)
		wait(10)
	motors(0, 0)
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
	//regulator values
	var encd_kP = 0.0
	var gyro_kP = -2.5
	var encLst = eL()
	var encRst = eR()
	var gyrost = gyro[robot.curAngle]
	print("gyrost" + gyrost)
	var control = 0
	var encdControl = 0
	var gyroControl = 0
	if (sgn == 1)
		while (eL() < path) {
			if (eL() < pathStart + startStop) vM += dV
			if (eL() > pathStart + startStop * 3) vM -= dV
			vM = Math.min(Math.max(v0, vM), robot.v)
			encdControl = ((eL() - encLst) - (eR() - encRst)) * encd_kP
			gyroControl = (gyrost - getYaw() / 1000) * gyro_kP
			print("gyrocontrol" + gyroControl)
			print("encdcontrol" + encdControl)
			print("yaw " + getYaw() / 1000)
			brick.display().addLabel(control, 1, 1)
			control = encdControl + gyroControl
			brick.display().addLabel("motor speeds: " + (vM - control) + " " + (vM + control) , 1, 20)
			brick.display().redraw()
			motors(Math.min(vM - control, 100), Math.min(vM + control, 100))
			wait(35)
		}
	else if (sgn == -1)
		while (eL() > path) {
			if (eL() > pathStart - startStop) vM += dV
			if (eL() < pathStart - startStop * 3) vM -= dV
			vM = Math.max(v0, vM)
			motors(-vM, -vM)
			wait(35)
		}
	motors(0, 0)
}

function displayCoords() {
	brick.display().addLabel("(" + robot.x + ";" + robot.y + ")" + robot.curAngle, 1, 1) //вывод ответа
	brick.display().redraw()
}
//Main code functions

function placeTurnRight() {
	robot.curAngle = robot.curAngle + 1 > 3 ? 0 : robot.curAngle + 1
	if (!trik) moveStraight(robot.track / 2)
	turnGyro(gyro[robot.curAngle])
	if (!trik) moveStraight(-robot.track / 2)
}

function placeTurnLeft() {
	robot.curAngle = robot.curAngle - 1 < 0 ? 3 : robot.curAngle - 1
	if (!trik) moveStraight(robot.track / 2)
	turnGyro(gyro[robot.curAngle])
	if (!trik) moveStraight(-robot.track / 2)
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
	eLeft.reset()
	eRight.reset()
	if (trik) print("Running on TRIK")
	else print("Running on simulator")
	if (robot.calibration_values) brick.gyroscope().setCalibrationValues(robot.calibration_values)
	else {
		brick.gyroscope().calibrate(robot.calibration_time) //5000 in simulator, 14000 in real
		wait(robot.calibration_time + 1000)
	}
	//script.wait(100000)
	//moveSmooth(200)
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
	var cell_end = 8
	print(bfs(cell_start, cell_end))
	print(dfs(cell_start, cell_end))
	var rob_path = getPath(cell_start, cell_end, robot.curAngle)
	print(rob_path)
	goMoves(rob_path)
	var photo = getPhoto()
	//script.writeToFile("photo.txt",photo)
	//brick.display().show(photo, 160, 120, 'rgb32')
	var nums = recartag(photo, xsize, ysize, 0)
	//script.wait(2500)
	print(nums)
	brick.display().redraw()
	brick.display().addLabel("(" + nums[0] + ";" + nums[1] + ")" + nums[2], 1, 1)
	brick.display().redraw()
	rob_path = getPath(cell_end, get_cell(nums[1]), robot.curAngle)
	goMoves(rob_path)
	script.wait(5000)
	return
}
//moveSmooth(200)
main()