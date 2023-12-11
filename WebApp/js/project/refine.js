function position(expr, pattern) {
    var cases = []
    for (let i = 0; i < expr.length; i++) {
        var element = expr[i];
        if(Array.isArray(element)) {
            for (let j=0; j< element.length; j++) {
                var elem = element[j];
                if(Array.isArray(elem)) {
                    for(let k=0; k<element.length; k++) {
                        var el = elem[k]
                        if(equal(el, pattern)) {
                            cases.push([i,j,k])
                        }
                    }
                }
                if(equal(elem, pattern)) {
                    cases.push([i,j])
                }
            }
        }
        if(equal(element,pattern)) {
            cases.push([i])
        }
    }
    return cases;
}


function refine(mesh, patches) {
    var surface = mesh.getMeshData();
    var area = triangulate(mesh, "AREA");
    var verts = surface[0];
    var faces = surface[1];
    var holes = mesh.getHoles();
    var adjList = mesh.getAdjList();
    var removeTri, pos, pos2, positions = [];
    var alpha = Math.sqrt(2);
    var changed = true;

    for (let i = 0; i < holes.length; i++) {
        let removeTri = [];
        var hole = holes[i];
        var patch = patches[i];
        var n = hole.length;
        var adjEdges = getAllEdges(surface, hole, adjList);
        var scale = new Object();
        
        // For each vertex on hole boundary, compute average length
        for (let j = 0; j < verts.length; j++) {
            
            var x = adjEdges[verts[j]];
            if(!(typeof x === 'undefined')) {
                for (let k = 0; k < x.length; k++) {
                    if(x[k]!=[])
                        scale[j] = math.mean(x);
                }
            }
        }
        while (changed) {
            changed = false;
            // For every triangle in the patching mesh
            var length = patch.length;

            for (let j = 0; j < length; j++) {
                
                var tri = patch[j];
                var I = tri[0]; var J = tri[1]; var K = tri[2];
                var p1 = verts[I]; var p2 = verts[J]; var p3 = verts[K];
                // Compute centroid and scale
                var centroid =  [(p1[0] + p2[0] + p3[0]) / 3, (p1[1] + p2[1] + p3[1]) / 3, (p1[2] + p2[2] + p3[2]) / 3];
                var triScale = (scale[I] + scale[J] + scale[K]) / 3;
                var replace = true
                // For m = i, j, k
                if (alpha * math.norm(math.subtract(centroid, p1)) <= triScale || alpha * math.norm(math.subtract(centroid, p1)) <= scale[I]) {
                    // check scale
                    replace = false;
                    
                } else if (alpha * math.norm(math.subtract(centroid, p2)) <= triScale || alpha * math.norm(math.subtract(centroid, p2)) <= scale[J]) {
                    
                    replace = false;
                } else if (alpha * math.norm(math.subtract(centroid, p3)) <= triScale || alpha * math.norm(math.subtract(centroid, p3)) <= scale[K]) {
                    
                    replace = false;
                }
                if (replace) {
                    changed=true;
                    verts.push(centroid)
                    var averageScale = (scale[I] + scale[J] + scale[K])/3;
                    
                    
                    let c = verts.length - 1;
                    scale[c] = averageScale;
                    // console.log(scale[c])
                    removeTri.push(j)
                    // Add two triangles
                    patch.push([J, K, c]);
                    patch.push([I, K, c])
                    patch.push([I, J, c])
                    
                    // relax edges, relax edge I, J
                    let positions = position(patch, I)
                    let pos2 = []
                    let posTracker = []
                    for(let k = 0; k< positions.length;k++) {
                        pos2.push(patch[positions[k][0]])
                        posTracker.push(positions[k][0])
                    }
                    let pos = position(pos2, J);
                    let changePos = 0;
                    let T = -1;
                    for(let k =0; k< pos.length; k++) {
                        let temp = pos2[pos[k][0]][3 - position(pos2[pos[k][0]],I)[0]-pos[k][1]];
                        
                        if(temp!=K && temp != c) {
                            T = temp;
                            changePos = posTracker[pos[k][0]];
                        }
                    }
                    
                    if(T!=-1 && math.distance(verts[I], verts[J]) > math.distance(centroid,verts[T])){
                        patch[changePos][3 - position(patch[changePos],I)[0] - position(patch[changePos], T)[0]] = c;
                        patch[patch.length-1][0]=T;
                    }
                    
                    //relax edge I,K
                    pos = position(pos2, K);
                    changePos = 0;
                    T = -1;
                    for(let k =0; k< pos.length; k++) {
                        let temp = pos2[pos[k][0]][3 - position(pos2[pos[k][0]],I)[0]-pos[k][1]];
                        
                        if(temp!=J && temp != c) {
                            T = temp;
                            changePos = posTracker[pos[k][0]];
                        }
                    }
                    // console.log(patch[changePos])
                    // console.log(patch[patch.length-2])
                    if(T!=-1 && math.distance(verts[I], verts[K]) > math.distance(centroid,verts[T])){
                        patch[changePos][3 - position(patch[changePos],I)[0] - position(patch[changePos], T)[0]] = c;
                        patch[patch.length-2][0]=T;
                    }
                    // console.log(patch[changePos])
                    // console.log(patch[patch.length-2])

                    //relax edge J,K
                    positions = position(patch, K)
                    pos2 = []
                    posTracker = []
                    for(let k = 0; k< positions.length;k++) {
                        pos2.push(patch[positions[k][0]])
                        posTracker.push(positions[k][0])
                    }
                    pos = position(pos2, J);
                    changePos = 0;
                    T = -1;
                    for(let k =0; k< pos.length; k++) {
                        let temp = pos2[pos[k][0]][3 - position(pos2[pos[k][0]],K)[0]-pos[k][1]];
                        
                        if(temp!=I && temp != c) {
                            T = temp;
                            changePos = posTracker[pos[k][0]];
                        }
                    }
                    if(T!=-1 && math.distance(verts[J], verts[K]) > math.distance(centroid,verts[T])){
                        patch[changePos][3 - position(patch[changePos],J)[0] - position(patch[changePos], T)[0]] = c;
                        patch[patch.length-3][0]=T;
                    }
                }
    
            }
            
            for(let j = removeTri.length-1; j>=0; j--) {
                
                patch.splice(removeTri[j],1);
            }
            removeTri = [];
        }
    }
    
    // Combine new patches with existing triangles
    
    var newFaces = faces.concat(patch);
    
    return [verts, newFaces];
}

function equal(a1, a2) {
    if(!Array.isArray(a1)) {
        return a1 == a2;
    }
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