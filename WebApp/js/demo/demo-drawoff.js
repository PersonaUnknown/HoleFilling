// Test drawing an OFF file from project directory

/* === Add support for glMatrix === */
// CITATION: https://stackoverflow.com/questions/66147508/gl-matrix-is-not-included-properly-in-webgl-application
const { vec2, vec3, mat3, mat4 } = glMatrix;

/* === Grab OFF file and convert to vertices and faces */
async function importOFFFile(fileName) 
{
	const response = await fetch("../data/" + fileName + ".off");
	const text = await response.text();
	var lines = text.split(/\r\n/)
    var verts = []
    var faces = []
    
    var details = lines[1].split(" ")
    var numVerts = +details[0];
    // var numFaces = +details[1];
    // var numEdges = +details[2];
    
	for (let i = 2; i < numVerts + 2; i++)
    {
        // Get current line
        var currLine = lines[i].split(" ")
    
        // Pass in x, y, z of vertex
        verts.push(+currLine[0])
        verts.push(+currLine[1])
        verts.push(+currLine[2])
        verts.push(0.5)         
        verts.push(0.5)
        verts.push(0.5)  
    }

    for (let i = numVerts + 2; i < lines.length; i++)
    {
        // Get current line
        var currLine = lines[i].split(" ")

        // Pass in indices for face
        faces.push(+currLine[1])
        faces.push(+currLine[2])
        faces.push(+currLine[3])
    }

	return [verts, faces]
}

/* === Display 3D object given its vertices and faces === */
// Params: modelData -> [vertices, faces], canvasID -> draw onto right canvas element
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

	// Model Data
	const vertices = modelData[0]
	const faces = modelData[1] 
	console.log(modelData)
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

	// Setup canvas
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

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
		gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
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
	var angle = 0;
	var loop = function () {
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

		gl.clearColor(0.8, 0.85, 0.8, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, faces.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
}

function demoDraw3D() {
	importOFFFile("bunny_hole").then(function(data) {
		draw3D(data, "sphere")
	});
}

demoDraw3D()