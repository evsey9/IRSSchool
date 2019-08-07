var gyro = brick.gyroscope()
var calibrationDelay = 60000
gyro.calibrate(calibrationDelay)
script.wait(calibrationDelay + 1000)
calibValues = gyro.getCalibrationValues()
print("New")
print("Calibration values: " + calibValues)
gyro.setCalibrationValues(calibValues)
script.removeFile("gyro.txt")
script.writeToFile("gyro.txt", calibValues)
script.quit()
