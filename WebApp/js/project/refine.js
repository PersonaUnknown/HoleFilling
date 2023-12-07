function refine(mesh, patches) {
    var surface = mesh.getMeshData();
    var verts = surface[0];
    var faces = surface[1];
    var holes = mesh.getHoles();
    var adjList = mesh.getAdjList();
    var removeTri, pos, pos2, positions = [];
    var alpha = 0.2;
    var changed = true;

    for (let i = 0; i < holes.length; i++) {
        var hole = holes[i];
        var patch = patches[i];
        var n = hole.length;
        var adjEdges = getAllEdges(surface, hole, adjList);
        var scale = new Array(hole.length);
        // For each vertex on hole boundary, compute average length

        for (let j = 0; j < hole.length; j++) {
            var x = adjEdges[hole[j]];
            scale[j] = math.mean(x);
        }

        while (changed) {
            var numVerts = verts.length;
            changed = false;
            for (let i = 0; i < patches.length; i++) {
                var tri = patch[i];
                var p1 = verts[tri[0]]; var p2 = verts[tri[1]]; var p3 = verts[tri[2]];

                // Compute centroid and corresponding scale
                var centroid = [(p1[0] + p2[0] + p3[0]) / 3, (p1[1] + p2[1] + p3[1]) / 3, (p1[2] + p2[2] + p3[2]) / 3];
                var triScale = (scale[adjList[p1].index] + adjList[p2].index + adjList[p3].index) / 3;
            }
        }
    }
}

function equal(a1, a2) {
    if (a1.length != a2.length) {
        return false;
    }

    for (let i = 0; i < a1.length; i++) {
        if (a1[i] != a2[i]) { return false; }
    }

    return true;
}

// Given mesh surface, hole vertices, and adjacency table, return table of all adjacent vertices
function getAllEdges(surface, hole, adjList) {
    var vert = surface[0];
    var faces = surface[1];
    var edges = new Object();
    var numFaces = faces.length;
    for (let i = 0; i < numFaces; i++) {
        var face = faces[i];
        for (let j = 0; j < hole.length; j++) {
            var val = hole[j];
            if (equal(vert[face[0]],val)) {
                if (!edges.hasOwnProperty(val)) {
                    edges[val] = [math.distance(vert[face[0]], vert[face[1]]), math.distance(vert[face[0]], vert[face[2]])]
                } else {
                    edges[val].push(math.distance(vert[face[0]], vert[face[1]]))
                    edges[val].push(math.distance(vert[face[0]], vert[face[2]]))
                }
            } else if (equal(vert[face[1]],val)) {
                if (!edges.hasOwnProperty(val)) {
                    edges[val] = [math.distance(vert[face[0]], vert[face[1]]), math.distance(vert[face[1]], vert[face[2]])]
                } else {
                    edges[val].push(math.distance(vert[face[0]], vert[face[1]]))
                    edges[val].push(math.distance(vert[face[1]], vert[face[2]]))
                }
            } else if (equal(vert[face[2]], val)) {
                if (!edges.hasOwnProperty(val)) {
                    edges[val] = [math.distance(vert[face[0]], vert[face[2]]), math.distance(vert[face[1]], vert[face[2]])]
                } else {
                    edges[val].push(math.distance(vert[face[0]], vert[face[2]]))
                    edges[val].push(math.distance(vert[face[1]], vert[face[2]]))
                }
            }
        }
    }
    
    return edges;
}