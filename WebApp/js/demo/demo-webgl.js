main();

function main() {
  const canvas = $("#glcanvas").get(0);

  // Initialize the GL context
  const gl = canvas.getContext("webgl2");

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it.",
    );
    return;
  }

  // Create triangle
  const triVerts = [
    0.0, 0.5,
    -0.5, -0.5,
    0.5, -0.5
  ]

  // Create in format the GPU can accept
  const triVertsCPUBuffer = new Float32Array(triVerts);
  const triGeoBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triGeoBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, triVertsCPUBuffer, gl.STATIC_DRAW)

  // GLSL
  // First Line needs to be version number
  // void main() is an entry point
  // in vec2 vertexPosition = create an 'attribute' of type Vector2 with name vertexPosition
  const vertexShaderSourceCode = `#version 300 es 
  precision mediump float;

  in vec2 vertexPosition;
  void main() {
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
  }`;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSourceCode);
  gl.compileShader(vertexShader);

  // Check for compilation problems
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    const compilerError = gl.getShaderInfoLog(vertexShader);
    console.log("Failed to COMPILE vertex shader " + compilerError);
  }

  const fragmentShaderSourceCode = `#version 300 es
  precision mediump float;
  out vec4 outputColor;

  void main() {
    outputColor = vec4(1, 0, 1, 1.0);
  }`;

  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragmentShaderSourceCode);
  gl.compileShader(fragShader);

  // Check for compilation problems
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    const compilerError = gl.getShaderInfoLog(fragShader);
    console.log("Failed to COMPILE vertex shader " + compilerError);
  }

  const triShaderProgram = gl.createProgram();
  gl.attachShader(triShaderProgram, vertexShader);
  gl.attachShader(triShaderProgram, fragShader);
  gl.linkProgram(triShaderProgram);

   // Check for compilation problems
   if (!gl.getProgramParameter(triShaderProgram, gl.LINK_STATUS)) {
    const compilerError = gl.getShaderInfoLog(triShaderProgram);
    console.log("Failed to COMPILE vertex shader " + compilerError);
  }

  // Get attribute location
  const vertexPositionAttrLocation = gl.getAttribLocation(triShaderProgram, "vertexPosition");

  // Output merger - how to merge the shaded pixel fragment with the existing output image
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Rasterizer - which pixels are part of the triangle
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Set GPU Program (vertex + fragment shader pair)
  gl.useProgram(triShaderProgram);
  gl.enableVertexAttribArray(vertexPositionAttrLocation);

  // Input assembler
  gl.bindBuffer(gl.ARRAY_BUFFER, triGeoBuffer);
  gl.vertexAttribPointer(
    /* index: which attribute to use*/
    vertexPositionAttrLocation,
    /* size: how many components */
    2,
    /* type: what is the data type stored in the GPU buffer*/
    gl.FLOAT,
    /* normalized: determines how to convert ints to floats */
    false,
    /* stride: how many bytes to move forward in the buffer to find the same attribute (can use 2 * Float32Array.BYTES_PER_ELEMENT) */
    0,
    /* offset: how many bytes should the input assembler skip into the buffer when reading attributes */
    0,
  )

  // Draw Call
  // Params (how we draw this (i.e. use triangles), what is the start vertex, how many vertices to process)
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
