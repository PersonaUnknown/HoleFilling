// Init scene
const scene = new THREE.Scene();
const scene2 = new THREE.Scene();
const scene3 = new THREE.Scene();
const scene4 = new THREE.Scene();
// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera3 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera4 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2;
camera2.position.z = 2;
camera3.position.z = 2;
camera4.position.z = 2;
// Renderer
const renderer = new THREE.WebGLRenderer();
const renderer2 = new THREE.WebGLRenderer();
const renderer3 = new THREE.WebGLRenderer();
const renderer4 = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio)
renderer2.setPixelRatio(window.devicePixelRatio)
renderer3.setPixelRatio(window.devicePixelRatio)
renderer4.setPixelRatio(window.devicePixelRatio)
scene.background = new THREE.Color(0xffffff);
scene2.background = new THREE.Color(0xffffff);
scene3.background = new THREE.Color(0xffffff);
scene4.background = new THREE.Color(0xffffff);
// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement)
const controls2 = new THREE.OrbitControls(camera2, renderer2.domElement)
const controls3 = new THREE.OrbitControls(camera3, renderer3.domElement) 
const controls4 = new THREE.OrbitControls(camera4, renderer4.domElement) 
document.getElementById("hole").appendChild(renderer.domElement);
document.getElementById("tri").appendChild(renderer2.domElement);
document.getElementById("refine").appendChild(renderer3.domElement);
document.getElementById("fair").appendChild(renderer4.domElement);

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera2.aspect = window.innerWidth / window.innerHeight
    camera3.aspect = window.innerWidth / window.innerHeight
    camera4.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    camera2.updateProjectionMatrix()
    camera3.updateProjectionMatrix()
    camera4.updateProjectionMatrix()
    render()
}

function animate() {
    requestAnimationFrame(animate)
    render()
}

function render() {
    renderer.render(scene, camera)
    renderer2.render(scene2, camera2)
    renderer3.render(scene3, camera3);
    renderer4.render(scene4, camera4);
}

animate()

function addObject(scene, verts, faces, color = null, name = null) {    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geometry.setIndex(faces);
    
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x555555, 
        side: THREE.DoubleSide
        // wireframe: true 
    });
    if (color != null) { material.color.setHex(color)}

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name == null ? "base-model" : name;

    if (name != "bunny") {
        const edges = new THREE.WireframeGeometry( geometry ); 
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) ); 
        line.name = name == null ? "base-outline" : name + "-outline";
        scene.add(line);
    }
    scene.add(mesh);
}

function addHoleOutline(scene, holes) {
    const group = new THREE.Group();
    for (let i = 0; i < holes.length; i++)
    {
        var hole = holes[i];
        var points = [];
        for (let j = 0; j < hole.length; j++)
        {
            var point = hole[j];
            points.push(new THREE.Vector3(point[0], point[1], point[2]));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });
        const line = new THREE.Line(geometry, material);
        group.add(line);
    }
    group.name = "outline"
    scene.add(group);
}

function removeObject(scene, name) {
    var selectedObject = scene.getObjectByName(name);
    scene.remove( selectedObject );
    animate();
}


function showObject(scene, name) {
    var selectedObject = scene.getObjectByName(name);
    var objEdges = scene.getObjectByName(name + "-outline");
    if (selectedObject) { selectedObject.visible = true; }
    if (objEdges) {objEdges.visible = true;}
}

function hideObject(scene, name) {
    var selectedObject = scene.getObjectByName(name);
    var objEdges = scene.getObjectByName(name + "-outline");
    if (selectedObject) { selectedObject.visible = false; }
    if (objEdges) {objEdges.visible = false;}
}

var outlineState = true;
function toggleOutline() {
    if (outlineState) {
        if (scene.getObjectByName("outline") != null) {
            scene.getObjectByName("outline").visible = false;
        }
        outlineState = false;
    } else {
        if (scene.getObjectByName("outline") != null) {
            scene.getObjectByName("outline").visible = true;   
        }
        outlineState = true;
    }
}

var modelState = true;
function toggleModel() {
    if (modelState) {
        hideObject(scene, "base-model");
        modelState = false;
    } else {
        showObject(scene, "base-model");
        modelState = true;
    }
}

var methodState = true; // True = Area, False = Angle
function toggleMethod() {
    if (methodState) {
        hideObject(scene2, "area")
        showObject(scene2, "angle")
        document.getElementById("tri-desc").textContent = "Triangulation (Angle)"
        methodState = false;
    } else {
        hideObject(scene2, "angle")
        showObject(scene2, "area")
        document.getElementById("tri-desc").textContent = "Triangulation (Area)"
        methodState = true;
    }
}

// Refresh scenes given new mesh
function refresh(mesh) {
    // Reset Bools
    outlineState = true;
    modelState = true;
    methodState = true;

    // Remove all objects
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    while(scene2.children.length > 0){ 
        scene2.remove(scene2.children[0]); 
    }
    while(scene3.children.length > 0){ 
        scene3.remove(scene3.children[0]); 
    }
    while(scene4.children.length > 0){ 
        scene4.remove(scene4.children[0]); 
    }
   
    // Start replacing the scene with new mesh
    var base = prepModelForScene(mesh.getMeshData());
    var holes = mesh.getHoles();
    var triArea = triangulate(mesh, "AREA");
    var triAngle = triangulate(mesh, "ANGLE");
    addObject(scene, base[0], base[1])
    addHoleOutline(scene, holes)
    var area = prepModelForScene(triArea[0]);
    var angle = prepModelForScene(triAngle[0]);
    addObject(scene2, area[0], area[1], color=null, "area");
    addObject(scene2, angle[0], angle[1], color=null, "angle");
    hideObject(scene2, "angle")
}

function showBunny() {
    // Reset Bools
    outlineState = true;
    modelState = true;
    methodState = true;

    // Remove all objects
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    while(scene2.children.length > 0){ 
        scene2.remove(scene2.children[0]); 
    }
    while(scene3.children.length > 0){ 
        scene3.remove(scene3.children[0]); 
    }

    // Start replacing the scene with new mesh
    addObject(scene, BUNNY_BASE[0], BUNNY_BASE[1], color=null)
    addHoleOutline(scene, BUNNY_HOLES_OUTLINE)
    addObject(scene2, BUNNY_AREA[0], BUNNY_AREA[1], color=null, "area");
    addObject(scene2, BUNNY_ANGLE[0], BUNNY_ANGLE[1], color=null, "angle");
    hideObject(scene2, "angle")
}