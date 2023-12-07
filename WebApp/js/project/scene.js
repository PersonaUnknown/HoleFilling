// Init scene
const scene = new THREE.Scene();
const scene2 = new THREE.Scene();
// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2;
camera2.position.z = 2;
// Renderer
const renderer = new THREE.WebGLRenderer();
const renderer2 = new THREE.WebGLRenderer();
scene.background = new THREE.Color( 0xffffff );
scene2.background = new THREE.Color( 0xffffff );
// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement)
const controls2 = new THREE.OrbitControls(camera2, renderer2.domElement)
document.getElementById("hole").appendChild(renderer.domElement);
document.getElementById("tri").appendChild(renderer2.domElement);

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera2.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    camera2.updateProjectionMatrix()
    render()
}

function animate() {
    requestAnimationFrame(animate)
    render()
}

function render() {
    renderer.render(scene, camera)
    renderer2.render(scene2, camera2)
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

    const edges = new THREE.EdgesGeometry( geometry ); 
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) ); 
    line.name = name == null ? "base-outline" : name + "-outline";

    scene.add(mesh);
    scene.add(line);
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
    selectedObject.visible = true;
    if (objEdges) {objEdges.visible = true;}
}

function hideObject(scene, name) {
    var selectedObject = scene.getObjectByName(name);
    var objEdges = scene.getObjectByName(name + "-outline");
    selectedObject.visible = false;
    if (objEdges) {objEdges.visible = false;}
}

var outlineState = true;
function toggleOutline() {
    if (outlineState) {
        scene.getObjectByName("outline").visible = false;
        outlineState = false;
    } else {
        scene.getObjectByName("outline").visible = true;
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
        methodState = false;
    } else {
        hideObject(scene2, "angle")
        showObject(scene2, "area")
        methodState = true;
    }
}