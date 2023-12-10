function position(expr, pattern) {
    var cases = []
    for (let i = 0; i < expr.length; i++) {
        var element = expr[i];
        if (!Array.isArray(pattern)) {
            if(Array.isArray(element)) {
                for(let j = 0; j < element.length; j++) {
                    var el = element[j];
                    if(equal(el, pattern)) {
                        cases.push([i])
                    }
                }
            }
            else if (equal(element, pattern)) { cases.push([i])}
        } else {
            if (element== pattern) {cases.push([i])}
        }   
    }
    return cases;
}


function refine(mesh, patches) {
    var surface = mesh.getMeshData();
    var area = triangulate(mesh, "AREA");
    var verts = area[0][0];
    var faces = area[0][1];
    var holes = mesh.getHoles();
    var adjList = mesh.getAdjList();
    var removeTri, pos, pos2, positions = [];
    var alpha = Math.sqrt(2);
    var changed = true;

    for (let i = 0; i < holes.length; i++) {
        var hole = holes[i];
        var patch = patches[i];
        var n = hole.length;
        var adjEdges = getAllEdges(surface, hole, adjList);
        var scale = new Object();

        // For each vertex on hole boundary, compute average length
        for (let j = 0; j < n; j++) {
            var x = adjEdges[hole[j]];
            scale[hole[j]] = math.mean(x);
        }

        while (changed) {
            changed = false;
            // For every triangle in the patching mesh
            var length = patch.length;

            for (let i = 0; i < length; i++) {
                
                var tri = patch[i];
                var I = tri[0]; var J = tri[1]; var K = tri[2];
                var p1 = verts[I]; var p2 = verts[J]; var p3 = verts[K];

                // Compute centroid and scale
                var centroid =  [(p1[0] + p2[0] + p3[0]) / 3, (p1[1] + p2[1] + p3[1]) / 3, (p1[2] + p2[2] + p3[2]) / 3];
                var triScale = (scale[verts[adjList[p1].index]] + scale[verts[adjList[p2].index]] + scale[verts[adjList[p3].index]]) / 3;
                
                // For m = i, j, k
                if (alpha * math.norm(math.subtract(centroid, p1)) > triScale && alpha * math.norm(math.subtract(centroid, p1)) > scale[p1]) {
                    // Add centroid as point
                    verts.push(centroid)
                    var c = verts.length - 1;
                    patch[i] = [c, J, K];

                    // Add two triangles
                    patch.push([I, c, K])
                    patch.push([I, J, c])
                } else if (alpha * math.norm(math.subtract(centroid, p2)) > triScale && alpha * math.norm(math.subtract(centroid, p2)) > scale[p2]) {
                    // Add centroid as point
                    verts.push(centroid)
                    var c = verts.length;
                    patch[i] = [c, J, K];

                    // Add two triangles
                    patch.push([I, c, K])
                    patch.push([I, J, c])
                } else if (alpha * math.norm(math.subtract(centroid, p3)) > triScale && alpha * math.norm(math.subtract(centroid, p3)) > scale[p3]) {
                    // Add centroid as point
                    verts.push(centroid)
                    var c = verts.length;
                    patch[i] = [c, J, K];

                    // Add two triangles
                    patch.push([I, c, K])
                    patch.push([I, J, c])
                }
            }
        }
    }

    // Combine new patches with existing triangles
    var newFaces = faces.concat(patches.flat());
    return [verts, newFaces];
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
        if (adjList.hasOwnProperty(vert[face[0]])) {
            var val = adjList[vert[face[0]]];
            if (edges[vert[face[0]]] == null) {
                edges[vert[face[0]]] = [math.distance(vert[face[0]], vert[face[1]]), math.distance(vert[face[0]], vert[face[2]])]
            } else {
                edges[vert[face[0]]].push(math.distance(vert[face[0]], vert[face[1]]))
                edges[vert[face[0]]].push(math.distance(vert[face[0]], vert[face[2]]))
            }
        }

        if (adjList.hasOwnProperty(vert[face[1]])) {
            var val = adjList[vert[face[1]]];
            if (edges[vert[face[1]]] == null) {
                edges[vert[face[1]]] = [math.distance(vert[face[0]], vert[face[1]]), math.distance(vert[face[1]], vert[face[2]])]
            } else {
                edges[vert[face[1]]].push(math.distance(vert[face[0]], vert[face[1]]))
                edges[vert[face[1]]].push(math.distance(vert[face[1]], vert[face[2]]))
            }
        }

        if (adjList.hasOwnProperty(vert[face[2]])) {
            var val = adjList[vert[face[2]]];
            if (edges[vert[face[2]]] == null) {
                edges[vert[face[2]]] = [math.distance(vert[face[0]], vert[face[2]]), math.distance(vert[face[1]], vert[face[2]])]
            } else {
                edges[vert[face[2]]].push(math.distance(vert[face[0]], vert[face[2]]))
                edges[vert[face[2]]].push(math.distance(vert[face[1]], vert[face[2]]))
            }
        }
    }
    
    return edges;
}