/* === Add support for glMatrix === */
// CITATION: https://stackoverflow.com/questions/66147508/gl-matrix-is-not-included-properly-in-webgl-application
const { vec2, vec3, mat3, mat4 } = glMatrix;

// File Input Support
$('#fileInput').on('change', function(event) {
    const file = event.target.files[0];
	var fr = new FileReader(); 
    fr.onload = function(e) 
	{ 
		// Create 
        var result = fr.result;
		var newMesh = new HoleMesh("", result);
	}

	fr.readAsText(file); 
}) 

/* === Given mesh data, prepare it for being displayed using Three.js === */
function prepModelForScene(meshData) {
    vertices = meshData[0];
    faces = meshData[1];

    newVerts = [];
    for (let i = 0; i < vertices.length; i++) {
        newVerts.push(vertices[i][0])
        newVerts.push(vertices[i][1])
        newVerts.push(vertices[i][2])
    }

    newFaces = [];
    for (let i = 0; i < faces.length; i++) {
        newFaces.push(faces[i][0])
        newFaces.push(faces[i][1])
        newFaces.push(faces[i][2])
    }

    return [newVerts, newFaces];
}

/* === Given mesh data, prepare it for being displayed on WebGL === */
function prepModel3D(meshData) {
    vertices = meshData[0];
    faces = meshData[1];

    newVerts = [];
    for (let i = 0; i < vertices.length; i++) {
        newVerts.push(vertices[i][0])
        newVerts.push(vertices[i][1])
        newVerts.push(vertices[i][2])
        newVerts.push(Math.random())
        newVerts.push(Math.random())
        newVerts.push(Math.random())
    }

    newFaces = [];
    for (let i = 0; i < faces.length; i++) {
        newFaces.push(faces[i][0])
        newFaces.push(faces[i][1])
        newFaces.push(faces[i][2])
    }

    return [newVerts, newFaces];
}

/* === Display 3D object given its vertices and faces === */
// Params: modelData -> [vertices, faces], canvasID -> draw onto right canvas element
// CITATIONS:
// https://youtu.be/3yLL9ADo-ko?si=oQMeBAtxl3wK-6yU                <-- Rotating 3D Cube
// https://www.tutorialspoint.com/webgl/webgl_interactive_cube.htm <-- Interactive 3D Cube
function draw3D(modelData, canvasID)
{
	// Set up GL Context
	const canvas = $("#" + canvasID).get(0)
	const gl = canvas.getContext("webgl")
	if (gl === null) {
		console.log("WebGL not supported.")
		gl = canvas.getContext("experimental-webgl")	
	}
	if (gl === null) {
		console.log("Browser does not support WebGL")
	}

	// Setup canvas
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.frontFace(gl.CCW);

	// Model Data
	const vertices = modelData[0]
	const faces = modelData[1] 

	// Create buffers
	var vertexBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
	
	var faceBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceBuffer)
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces), gl.STATIC_DRAW)

	// Vertex Shader
	var vertexShaderText = 
	`
	precision mediump float;
	attribute vec3 vertPosition;
	attribute vec3 vertColor;
	varying vec3 fragColor;
	uniform mat4 mWorld;
	uniform mat4 mView;
	uniform mat4 mProj;

	void main()
	{
		fragColor = vertColor;
		gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
	}
	`
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderText);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}

	// Fragment Shader
	var fragmentShaderText =
    `
	precision mediump float;
	varying vec3 fragColor;
	void main()
	{
		gl_FragColor = vec4(fragColor, 1.0);
	}
	`
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentShaderText);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	// Program
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}

	// Get attributes for vertex positions and color
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

	// Attribute pointers for position and color
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.vertexAttribPointer(
		colorAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);

	// Tell OpenGL state machine which program should be active.
	gl.useProgram(program);

	// Set up uniform locations
	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	// Set input change for sliders
	var viewPos = [0, 0, 5.5]
	var canvasDiv = document.getElementById(canvasID).parentElement
	var zSlider = canvasDiv.getElementsByClassName("zRange")[0]
	zSlider.oninput = function() {
		viewPos[2] = zSlider.value
		mat4.lookAt(viewMatrix, viewPos, [0, 0, 0], [0, 1, 0]);
		// gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	}

	// Set up matrices values
	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, viewPos, [0, 0, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

	// Main render loop
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	
	var amortization = 0.95;
	var drag = false;
	var old_x;
	var old_y;
	var dX = 0
	var dY = 0;
	var theta = 0
	var phi = 0
    var time_old = 0;

	var mouseDown = function(event) {
		drag = true;
		old_x = event.pageX
		old_y = event.pageY;
		event.preventDefault();
		return false;
	};

	var mouseUp = function(event){
		drag = false;
	};

	var mouseMove = function(event) {
		if (!drag) 
		{
			return false;
		}
		dX = (event.pageX - old_x) * 2 * Math.PI / canvas.width,
		dY = (event.pageY - old_y) * 2 * Math.PI / canvas.height;
		theta += dX;
		phi += dY;
		old_x = event.pageX
		old_y = event.pageY;
		event.preventDefault();
	};

	canvas.addEventListener("mousedown", mouseDown, false);
	canvas.addEventListener("mouseup", mouseUp, false);
	canvas.addEventListener("mouseout", mouseUp, false);
	canvas.addEventListener("mousemove", mouseMove, false);
	
	var animate = function(time) {
		var dt = time-time_old;
	 
		if (!drag) {
		   dX *= amortization
		   dY *= amortization
		   theta += dX
		   phi += dY
		}
	 
		mat4.rotate(yRotationMatrix, identityMatrix, theta, [0, 1, 0])
		mat4.rotate(xRotationMatrix, identityMatrix, phi, [1, 0, 0])
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix)
		gl.uniformMatrix4fv(matProjUniformLocation, false, projMatrix);
		gl.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);

		time_old = time; 
		gl.enable(gl.DEPTH_TEST);

		gl.clearColor(0.8, 0.85, 0.8, 1);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	 
		gl.drawElements(gl.TRIANGLES, faces.length, gl.UNSIGNED_SHORT, 0);
	 
		window.requestAnimationFrame(animate);
	}
	animate(0);

	/* === IF WANTING TO USE LOOP ROTATION DISPLAY === */
	// var angle = 0;
	// var loop = function () {
	// 	angle = performance.now() / 1000 / 6 * 2 * Math.PI;
	// 	mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
	// 	mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
	// 	mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
	// 	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	// 	gl.clearColor(0.8, 0.85, 0.8, 1.0);
	// 	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	// 	gl.drawElements(gl.TRIANGLES, faces.length, gl.UNSIGNED_SHORT, 0);

	// 	requestAnimationFrame(loop);
	// };
	// requestAnimationFrame(loop);
}