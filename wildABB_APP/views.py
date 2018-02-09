# this file links URLs to the Python functions in classifier.py

from django.shortcuts import render
import time
import inspect
from django.http import HttpResponse
import socket
from wildABB_APP.classifier import readImage,classifier

########################################
# Global Variable
########################################
imagePath = "./static/sensorData.jpg"
sensorPath = "./static/sensors/"

def readSensors(request):
    # read image from the camera and classify images
    logResult = classifier()
    names = str(logResult)
    names = names[1:-1]
    return HttpResponse(names)

def readJoints(request):
    # read joints values from the robot controller
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(('localhost', 5001))
    s.setblocking(1)
    try:
        while True:
            data = s.recv(1024).split()
            if len(data) == 11:
                newData = (data[5:])
                newData = (list(map(float, newData)))
                newData = str(newData)
                newData = newData[1:-1]
                j = newData.split(",")
                print(j)
                print(type(j))
                result = ""
                result = result + str(j[0]) + ","
                result = result + str(j[1]) + ","
                result = result + str(j[2]) + ","
                result = result + str(j[3]) + ","
                result = result + str(j[4]) + ","
                result = result + str(j[5]) + ";"
                return HttpResponse(result)

    finally:
        s.shutdown(socket.SHUT_RDWR)

def setJoints(request):
    # sends move command to the controller to rotate
    # robot's joints into desired values
    try:
        j0 = float(request.GET["j1"])
        j1 = float(request.GET["j2"])
        j2 = float(request.GET["j3"])
        j3 = float(request.GET["j4"])
        j4 = float(request.GET["j5"])
        j5 = float(request.GET["j6"])
        joints = [j0, j1, j2, j3, j4, j5]
        msg = "02 "
        for joint in joints: msg += format(joint, "+08.2f") + " "
        msg += "#"
        print(msg)
        caller = inspect.stack()[1][3]
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2.5)
        sock.connect(('localhost', 5000))
        sock.settimeout(None)
        sock.sendall(msg.encode('utf-8'))
        time.sleep(3)
        # if not wait_for_response: return
        data = sock.recv(4096)
        print('%-14s recieved: %s', caller, data)
        sock.shutdown(socket.SHUT_RDWR)

        return HttpResponse("Action!")

    except:
        return HttpResponse("Fail")



