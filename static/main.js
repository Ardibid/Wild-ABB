var j0,j1,j2,j3,j4,j5,j6;
var robotMaterial;
var notLoaded = true;
var realTime= false;
var joints = [];
var rotVal = [Math.PI,-Math.PI,Math.PI,Math.PI,Math.PI,Math.PI]
var moveRobot,moveModel;
var gui;
var guiEntries = new guiSetJoints(0,0,0,0,0,0);

var frame = 0;
var animateIt = false;
var yOffset = 0;

function guiSetJoints (j1,j2,j3,j4,j5,j6){
    this.j1 = j1;
    this.j2 = j2;
    this.j3 = j3;
    this.j4 = j4;
    this.j5 = j5;
    this.j6 = j6;
}

function init(){
    ////////////////////////////// 
    // Canvas Setup
    ////////////////////////////// 
    // setup GUI
    gui = new dat.GUI();
    moveRobot = gui.addFolder('Move Real Robot');
    moveModel = gui.addFolder('Move Model Robot');

    // basic setup for the scene
    var scene = new THREE.Scene();

    // making geometries in the scene
    var plane = getPlane(60);
    plane.name = 'plane01';
    plane.position.y = -yOffset;
    plane.rotation.x = -Math.PI/2;
    scene.add(plane);

    //add lighting
    var light0 = getPointLight(1.4);
    light0.position.y = 3;
    light0.position.x=-3;
    
    var light1 = getPointLight(1);
    light1.position.y = 1.6;
    light1.position.x= 3;

    scene.add(light0);
    scene.add(light1);

    //setup camera
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1,1000);
    camera.position.x = 3;
    camera.position.y = 1.7;
    camera.position.z = 3;

    // adjusting the camera perspective AND RATIO
    var tanFOV = Math.tan( ( ( Math.PI / 180 ) * camera.fov / 2 ) );
    var windowHeight = window.innerHeight;
    var canvasWidth = window.innerWidth/1.5;
    var canvasHeight = window.innerHeight;
    camera.aspect = canvasWidth/canvasHeight;

    // adjust the FOV
    camera.fov = ( 360 / Math.PI ) * Math.atan( tanFOV * (canvasWidth / canvasHeight ) );
    camera.updateProjectionMatrix();

    // getting rendering ready!
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.enabled = true;
    renderer.setSize (canvasWidth, canvasHeight);
    renderer.setClearColor ('rgb(120,120,120)');
    document.getElementById("robotView").appendChild(renderer.domElement);
    // importing the robot with the materials
    importRobot();
    
    // add the camera control
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0, 1.4, 0);

    update(renderer, scene, camera, controls);
    return scene;
}

function importRobot(){
    
    robotMaterial = new THREE.MeshPhongMaterial({
            color: 'rgb(200,200,200)'
        });
    robotMaterial.side = THREE.DoubleSide;
    var jointsPath = ["/static/models/j0.js",
                  "/static/models/j1.js",
                  "/static/models/j2.js",
                  "/static/models/j3.js",
                  "/static/models/j4.js",
                  "/static/models/j5.js",
                  "/static/models/j6.js"]

    // loading all joints
    var loader = new THREE.JSONLoader();

    // Robot data offsets
    // 0- 0,0,0 /                       y
    // 1- 9.0427e-9,-1.5762e-8,0.23 /   y
    // 2- 0.32,-0.1335,0.55 /           z
    // 3- 0.000076,-0.207353,1.076172 / z
    // 4- 0.230924,0.340853,0.198827 /  x
    // 5- 0.9115,-0.093,7.4369e-7 /     z
    // 6- 0.177,0.093,1.1985e-7 /       x

    loader.load(jointsPath[0], function(geometry){
        // loading it
        j0 = new THREE.Mesh(geometry, robotMaterial);
        // placing it
        j0.position.x = 0;
        j0.position.y = 0-yOffset;
        j0.position.z = 0;
        // setting the materials for shadows
        j0.receiveShadow = true;
        j0.receiveShadow = true;
        // putting a name on it, so can be picked by name
        j0.name = 'j0';
        console.log("j0 loaded!");
        loadRobot();
    });

    //var loader = new THREE.JSONLoader();
    loader.load(jointsPath[1], function(geometry){
        // loading it
        j1 = new THREE.Mesh(geometry, robotMaterial);
        // placing it
        //9.0427e-9,-1.5762e-8,0.23
        j1.position.x = 0;
        j1.position.y = 0.23;
        j1.position.z = 0;
        // setting the materials for shadows
        j1.receiveShadow = true;
        j1.receiveShadow = true;
        // putting a name on it, so can be picked by name
        j1.name = 'j1';
        console.log("j1 loaded!");
        loadRobot();
    });

    // #2
    loader.load(jointsPath[2], function(geometry){
        // loading it
        j2 = new THREE.Mesh(geometry, robotMaterial);
        // placing it
        // 2- x= 0.32, z= -0.1335,y = 0.55
        j2.position.x = 0.32;
        j2.position.y = 0.55;
        j2.position.z = 0.1335;
        // setting the materials for shadows
        j2.receiveShadow = true;
        j2.receiveShadow = true;

        // putting a name on it, so can be picked by name
        j2.name = 'j2';
        console.log("j2 loaded!");
        loadRobot();
    });

    // #3
    loader.load(jointsPath[3], function(geometry){
        // loading it
        j3 = new THREE.Mesh(geometry, robotMaterial);
        // placing it
        
        j3.position.x = 0.000076;
        j3.position.y = 1.076172;
        j3.position.z = 0.207353;
        // setting the materials for shadows
        j3.receiveShadow = true;
        j3.receiveShadow = true;

        // putting a name on it, so can be picked by name
        j3.name = 'j3';
        console.log("j3 loaded!")
        loadRobot();
    });

    // #4
    loader.load(jointsPath[4], function(geometry){
        // loading it
        j4 = new THREE.Mesh(geometry, robotMaterial);
        // placing it
        j4.position.x = 0.230924;
        j4.position.y = 0.198827;
        j4.position.z = -0.340853;
        // setting the materials for shadows
        j4.receiveShadow = true;
        j4.receiveShadow = true;

        // putting a name on it, so can be picked by name
        j4.name = 'j4';
        console.log("j4 loaded!");
        loadRobot();
        
    });

    // #5
    loader.load(jointsPath[5], function(geometry){
        // loading it
        j5 = new THREE.Mesh(geometry, robotMaterial);
        // placing it
        j5.position.x = 0.9115;
        j5.position.y = 7.4369e-7;
        j5.position.z = 0.093;
        // setting the materials for shadows
        j5.receiveShadow = true;
        j5.receiveShadow = true;

        // putting a name on it, so can be picked by name
        j5.name = 'j5';
        console.log("j5 loaded!");
        loadRobot();
    });

    // #6
    loader.load(jointsPath[6], function(geometry){
        // loading it
        j6 = new THREE.Mesh(geometry, robotMaterial);
        // placing it
        j6.position.x =  0.177;
        j6.position.y = 1.1985e-7;
        j6.position.z = -0.093;
        // setting the materials for shadows
        j6.receiveShadow = true;
        j6.receiveShadow = true;

        // putting a name on it, so can be picked by name
        j6.name = 'j6';
        console.log("j6 loaded!");
        loadRobot();
    });
}
////////////////////////////////////////////////////////////////////
// GUI Functions
////////////////////////////////////////////////////////////////////

function loadMainGUI(){
    var fileNames;
    var mainSettings = {
            animateRobot()
                {
                    animateIt = !animateIt;
                    console.log("ANIMATE: ", animateIt)
                },
            realtimeUpdate()
                {
                    realTime = !realTime;
                    console.log("realTime",realTime);
                },
            updateRobot(){
                readRobot();
            }

    };
    var loadImages={
        load(){

            var table = document.getElementById('markUpTable');
            var thisRow= table.insertRow(0);
            var x = thisRow.insertCell(-1);
            var img = document.createElement('img');
            img.setAttribute("id", "markUpTable");
            img.src = "/static/sensors/final.jpg";
            x.appendChild(img);

            fileNames = "'./static/sensors/03033.jpg', './static/sensors/03331.jpg', './static/sensors/03333.jpg', './static/sensors/12123.jpg', './static/sensors/12202.jpg', './static/sensors/12220.jpg', './static/sensors/12221.jpg', './static/sensors/12222.jpg', './static/sensors/12223.jpg'"
            console.log("adding images!")
            console.log("something",fileNames);
            var images = [];
            var tags = []
            fileNames = fileNames.slice(1,-1);
            var dataSet = fileNames.split(",");

            for (var i= 0; i < (dataSet.length); i++){

                dataSet[i] =dataSet[i].trim();
                if (i == dataSet.length -1) {
                    var name = dataSet[i].slice(1,);}
                else{
                    var name = dataSet[i].slice(1,-1);}

                if (name[0] == "."){
                        name = name.slice(1,)
                    }

                console.log("The name is: ",name);
                images.push(name);
            }
            console.log("IMAGES: ",images);
            var sampleSize = dataSet.length
            var table = document.getElementById('imageTable');
            var thisRow= table.insertRow(0);


            for (var i=0 ; i <sampleSize/2; i++)
                {
                    thisRow= table.insertRow(-1);
                    //var thisRow=document.getElementById('imageTable').rows[i];
                    for (var j = 0; j < 2 ; j ++)
                    {
                        if (i*2+j < sampleSize){
                        var x = thisRow.insertCell(-1);
                        var img = document.createElement('img');
                        img.setAttribute("id", "sensorImage");
                        console.log(images[i*2+j])
                        img.src = images[i*2+j];
                        x.appendChild(img);}
                    }
                }



            },

        readSensors(){
                console.log("Reading sensors");
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function()
                {
                    if(xhttp.readyState == 4 && xhttp.status == 200)
                    {
                        var sensorDataNames = xhttp.responseText;
                        fileNames = sensorDataNames;
                        console.log(sensorDataNames);
                    }
                };
                xhttp.open("GET", "/readSensors/",true);
                xhttp.send();
                }
        }


    gui.add(mainSettings,'animateRobot');
    gui.add(mainSettings, 'realtimeUpdate');
    gui.add(mainSettings, 'updateRobot');
    gui.add(loadImages, 'load');
    gui.add(loadImages, 'readSensors');

}



function loadControlGUI(){
    var makeRobotMove =  
        {
            move() {
                console.log("moving masalan!")
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function()
                {
                    if(xhttp.readyState == 4 && xhttp.status == 200)
                    {
                        //console.log(xhttp.responseText);
                        console.log("Moving finished!");
                    }
                };
                var sendParameters = "?j1="+guiEntries.j1.toString()+"&j2="+guiEntries.j2.toString()+"&j3="+guiEntries.j3.toString()
                +"&j4="+guiEntries.j4.toString()+"&j5="+guiEntries.j5.toString()+"&j6="+guiEntries.j6.toString();
                console.log("Sent: ",sendParameters);
                xhttp.open("GET", "/setJoints/"+sendParameters,true);
                xhttp.send();
            }
        }
    moveRobot.add(guiEntries,'j1',-90,90).listen();
    moveRobot.add(guiEntries,'j2',-90,90).listen();
    moveRobot.add(guiEntries,'j3',-90,90).listen();
    moveRobot.add(guiEntries,'j4',-90,90).listen();
    moveRobot.add(guiEntries,'j5',-90,90).listen();
    moveRobot.add(guiEntries,'j6',-90,90).listen();
    moveRobot.add(makeRobotMove,'move');
}


function loadModelGUI(){
    var resetJoints =  
        {
            reset() {
                joints[0].rotation.y = 0;
                joints[1].rotation.z = 0;
                joints[2].rotation.z = 0;
                joints[3].rotation.x = 0;
                joints[4].rotation.z = 0;
                joints[5].rotation.x = 0;
            }
        }
    moveModel.add(joints[0].rotation,'y',-5,5).listen();
    moveModel.add(joints[1].rotation,'z',-5,5).listen();
    moveModel.add(joints[2].rotation,'z',-5,5).listen();
    moveModel.add(joints[3].rotation,'x',-5,5).listen();
    moveModel.add(joints[4].rotation,'z',-5,5).listen();
    moveModel.add(joints[5].rotation,'x',-5,5).listen();
    moveModel.add(resetJoints,'reset');

}

////////////////////////////////////////////////////////////////////
// Robot Functions
////////////////////////////////////////////////////////////////////

function loadRobot()
{
    if ( notLoaded && j0 && j1 && j2 && j3 && j4 && j5 && j6){
                console.log("Loading all!")
                j0.add(j1);
                j1.add(j2);
                j2.add(j3);
                j3.add(j4);
                j4.add(j5);
                j5.add(j6);
                scene.add(j0);
                notLoaded = false;
                joints = [j1,j2,j3,j4,j5,j6]
                loadMainGUI();
                loadModelGUI();
                loadControlGUI();
            }
}

function readRobot(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function()
    {
        if(xhttp.readyState == 4 && xhttp.status == 200)
        {
            var data = xhttp.responseText;
            var robotData = data.split(";");
            jointValues = robotData[0];
            readJ = jointValues.split(",")
            console.log("from urls:",jointValues)
            j1.rotation.y = parseFloat(readJ[0])* (Math.PI / 180);
            j2.rotation.z = -parseFloat(readJ[1])* (Math.PI / 180);
            j3.rotation.z = -parseFloat(readJ[2])* (Math.PI / 180);
            j4.rotation.x = parseFloat(readJ[3])* (Math.PI / 180);
            j5.rotation.z = -parseFloat(readJ[4])* (Math.PI / 180);
            j6.rotation.x = parseFloat(readJ[5])* (Math.PI / 180);
            
            rotVal = [parseFloat(readJ[0])* (Math.PI / 180),
                      parseFloat(readJ[1])* (Math.PI / 180),
                      parseFloat(readJ[2])* (Math.PI / 180),
                      parseFloat(readJ[3])* (Math.PI / 180),
                      parseFloat(readJ[4])* (Math.PI / 180),
                      parseFloat(readJ[5])* (Math.PI / 180)];  
        }
    }
    xhttp.open("GET", "/readJoints/",true);
    xhttp.send();
}


////////////////////////////////////////////////////////////////////
// Geometries Constructors
////////////////////////////////////////////////////////////////////

function getPlane (w)
{
    var geometry = new THREE.PlaneGeometry(w,w);
    // var material = new THREE.MeshBasicMaterial({
    //     color : 0x222222
    // });
    var material = new THREE.MeshPhongMaterial({
        color: 'rgb(25,25,25)'
        }
    )
    var mesh = new THREE.Mesh(
        geometry,
        material
    );
    mesh.receiveShadow = true;
    return mesh;
}

function getPointLight(intensity){
    var light = new THREE.PointLight(0xFFFFFF, intensity);
    light.castShadows = true;
    return light;
}

////////////////////////////////////////////////////////////////////
// Scene/animation Functions
////////////////////////////////////////////////////////////////////

// now we can see scene properties in the console
var scene = init();


function animateItNow(){
    console.log("ANIMATE IT!")
    animateIt = !animateIt;
}

function update(renderer, scene, camera,controls)
{
    renderer.render(
        scene,
        camera
    );

    frame = frame +1;
    controls.update();

    if (realTime){
        readRobot();
    }

    requestAnimationFrame(function (){
        update(renderer,scene,camera, controls);
    } );
}

function resizeCanvasToDisplaySize(force) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (force || canvas.width !== width ||canvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // set render target sizes here
  }
}