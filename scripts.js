var gridX = true;
var gridY = false;
var gridZ = false;
var axes = true;
var ground = true;
var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();

//tube parameters
var irt = 80.0, irb = 80.0, ort = 100.0, orb = 100.0, innerHeight = 400.0, outerHeight = 400.0;
var rs = 32, hs = 16, oe = false, es = 16, ra = 360, modif = 'Math.exp(Math.cos(x * 5))';
//display parameters
var wireframe = false, tubeColor = 0x4aa9be, vertexNormals = false, faceNormals = false;

function init()
{
	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(document.body.clientWidth, document.body.clientHeight);
	renderer.setClearColorHex( 0xAAAAAA, 1.0 );
	document.body.appendChild(renderer.domElement);

	// CAMERA
	camera = new THREE.PerspectiveCamera( 40, document.body.clientWidth / document.body.clientHeight, 1, 10000 );
	camera.position.set( -384, 1000, -492 );
	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	//cameraControls.target.set(0,475,0);

	fillScene();
	createTube();
	drawHelpers();
	setupGui();
	render();
}

function toRadians(angle)
{
	return angle * Math.PI / 180;
}

function createTube()
{
	var m_func;
	try
	{
		m_func = new Function("x", "return " + modif);
		m_func(1.0);

	}catch(err){ m_func = undefined; }
	var geometry = new TubeGeometry(irt, irb, ort, orb, innerHeight, outerHeight, rs, hs, oe, es, toRadians(ra), m_func );
	var material = new THREE.MeshPhongMaterial({color: tubeColor, wireframe: wireframe});
	var tube = new THREE.Mesh(geometry, material);
	tube.position.y = Math.max(innerHeight, outerHeight) * 0.5;
	scene.add(tube);

	if(vertexNormals)
	{
		var geometryNormals = createNormals(geometry, 5, 0xCC0000);
		geometryNormals.position.y = tube.position.y;
		scene.add(geometryNormals);
	}

	if(faceNormals)
	{
		var geometryNormals = createNormals(geometry, 5, 0xCC0000, true);
		geometryNormals.position.y = tube.position.y;
		scene.add(geometryNormals);
	}
}

function fillScene() 
{
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// LIGHTS
	var ambientLight = new THREE.AmbientLight( 0x222222 );

	var light = new THREE.DirectionalLight( 0xffffff, 1.0 );
	light.position.set( 200, 400, 500 );
	
	var light2 = new THREE.DirectionalLight( 0xffffff, 1.0 );
	light2.position.set( -500, 400, -200 );

	scene.add(ambientLight);
	//scene.add(light);
	scene.add(light2);
}

function drawHelpers() 
{
  if (ground) {
		Coordinates.drawGround({size:10000});		
	}
	if (gridX) {
		Coordinates.drawGrid({size:10000,scale:0.01});
	}
	if (gridY) {
		Coordinates.drawGrid({size:10000,scale:0.01, orientation:"y"});
	}
	if (gridZ) {
		Coordinates.drawGrid({size:10000,scale:0.01, orientation:"z"});	
	}
	if (axes) {
		Coordinates.drawAllAxes({axisLength:200,axisRadius:1,axisTess:50});
	}
}

function render() 
{
	requestAnimationFrame(render);

	var delta = clock.getDelta();
	cameraControls.update(delta);

	if ( effectController.newGridX !== gridX || effectController.newGridY !== gridY || effectController.newGridZ !== gridZ || effectController.newGround !== ground 
		|| effectController.newAxes !== axes || effectController.innerRadiusTop !== irt || effectController.innerRadiusBottom !== irb || effectController.outerRadiusTop !== ort
		|| effectController.outerRadiusBottom !== orb || effectController.tubeInnerHeight !== innerHeight || effectController.tubeOuterHeight !== outerHeight
		|| effectController.radialSegments !== rs || effectController.heightSegments !== hs || effectController.openEnded !== oe || effectController.endSegments !== es
		|| effectController.rangeAngle !== ra || effectController.wire !== wireframe || effectController.faceNorms !== faceNormals || effectController.vertexNorms !== vertexNormals 
		|| effectController.tubeCol !== tubeColor || effectController.modifier !== modif)
	{
		gridX = effectController.newGridX;
		gridY = effectController.newGridY;
		gridZ = effectController.newGridZ;
		ground = effectController.newGround;

		irt = effectController.innerRadiusTop;
		irb = effectController.innerRadiusBottom;
		ort = effectController.outerRadiusTop;
		orb = effectController.outerRadiusBottom;
		innerHeight = effectController.tubeInnerHeight;
		outerHeight = effectController.tubeOuterHeight;
		rs = effectController.radialSegments;
		hs = effectController.heightSegments;
		oe = effectController.openEnded;
		es = effectController.endSegments;
		ra = effectController.rangeAngle;

		modif = effectController.modifier;

		wireframe = effectController.wire;
		vertexNormals = effectController.vertexNorms;
		faceNormals = effectController.faceNorms;
		tubeColor = effectController.tubeCol;

		axes = effectController.newAxes;
        fillScene();
        createTube();
		drawHelpers();
	}

	renderer.render(scene, camera);
}

function setupGui() 
{
	effectController = {

		//grid
		newGridX: gridX,
		newGridY: gridY,
		newGridZ: gridZ,
		newGround: ground,
		newAxes: axes,

		//tube parameters
		innerRadiusTop: irt,
		innerRadiusBottom: irb,
		outerRadiusTop: ort,
		outerRadiusBottom: orb,
		tubeInnerHeight: innerHeight,
		tubeOuterHeight: outerHeight,
		radialSegments: rs,
		heightSegments: hs,
		openEnded: oe,
		endSegments: es,
		rangeAngle: ra,
		modifier: modif,

		//display parameters
		wire: wireframe,
		faceNorms: faceNormals,
		vertexNorms: vertexNormals,
		tubeCol: tubeColor
	};

	var gui = new dat.GUI();
	gui.width = 400;
	var h = gui.addFolder("Grid display");
	h.add( effectController, "newGridX").name("Show XZ grid");
	h.add( effectController, "newGridY" ).name("Show YZ grid");
	h.add( effectController, "newGridZ" ).name("Show XY grid");
	h.add( effectController, "newGround" ).name("Show ground");
	h.add( effectController, "newAxes" ).name("Show axes");

	var tp = gui.addFolder("Tube parameters");
	tp.add( effectController, "innerRadiusTop", 0.0, 1000.0, 100.0).name("Inner radius top");
	tp.add( effectController, "innerRadiusBottom", 0.0, 1000.0, 100.0).name("Inner radius bottom");
	tp.add( effectController, "outerRadiusTop", 0.0, 1000.0, 100.0).name("Outer radius top");
	tp.add( effectController, "outerRadiusBottom", 0.0, 1000.0, 100.0).name("Outer radius bottom");
	tp.add( effectController, "tubeInnerHeight", 0.0, 1000.0, 400.0).name("Inner height");
	tp.add( effectController, "tubeOuterHeight", 0.0, 1000.0, 400.0).name("Outer height");
	tp.add( effectController, "radialSegments", 3, 256, 32).name("Radial segments");
	tp.add( effectController, "heightSegments", 1, 256, 16).name("Height segments");
	tp.add( effectController, "rangeAngle", 0, 360, 360).name("Range angle");
	tp.add( effectController, "openEnded").name("Open ended");
	tp.add( effectController, "endSegments", 1, 256, 16).name("End segments");

	var advancedParams = gui.addFolder("Advanced parameters");
	advancedParams.add( effectController, "modifier" ).name("Radius modifier");

	var dparams = gui.addFolder("Display parameters");
	dparams.add( effectController, "wire").name("Wireframe");
	dparams.add( effectController, "vertexNorms").name("Display vertex normals");
	dparams.add( effectController, "faceNorms").name("Display face normals");
	dparams.addColor( effectController, "tubeCol").name("Tube color");

	tp.open();
	advancedParams.open();
	dparams.open();
}
			