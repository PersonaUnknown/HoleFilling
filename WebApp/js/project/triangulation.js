// This script is to handle triangulation (either AREA or ANGLE method) and conntains helper functions to accomplish this
// Assumes triangulation is done with a HoleMesh object
// ====== STEP 2: Initial Hole Filling (Triangulation) ======
function trace(i, k, O, S) {
    if (i + 2 == k) {
        S.push([i, i + 1, k]);
        return S;
    } else {
        var x = O[i][k];
        if (x != i + 1) {
            S = trace(i, x, O, S);
        }
        S.push([i, x, k]);
        if (x != k - 1) {
            S = trace(x, k, O, S);
        }
    }
    return S;
}

function minAreaWeightFunc(v1, v2, v3) {
    var AB = math.subtract(v2, v1);
    var AC = math.subtract(v3, v1);
    var area = math.norm(math.cross(AB, AC));
    return math.divide(area, 2);
}

function lessThan(w1, w2) {
    return w1[0] < w2[0] || (w1[0] == w2[0] && w1[1] < w2[1])
}

function addWeights(w1, w2) {
    return [Math.max(w1[0],w2[0]), w1[1] + w2[1]]
}

function calcDihedralAngle(tri1, tri2) {
    // Calculate normal vectors
    var norm1 = math.cross(math.subtract(tri1[1], tri1[0]), math.subtract(tri1[2], tri1[0]))
    var norm2 = math.cross(math.subtract(tri2[1], tri2[0]), math.subtract(tri2[2], tri2[0]))

    // Calculate cosine
    var dotProd = math.dot(norm1, norm2) / (math.norm(norm1) * math.norm(norm2))

    // Clamp dot product to within valid range for arc cos
    if (dotProd >= 1) { dotProd = 1}
    if (dotProd <= -1) {dotProd = -1}
    var angle = Math.acos(dotProd);
    return angle;
}

function minAngleWeightFunc(v1, v2, v3, adjTris, verts) {
    var area = minAreaWeightFunc(v1, v2, v3);
    var max = -Infinity;
    adjTris = Object.values(adjTris);
    var curr = calcDihedralAngle([v1, v2, v3,], [verts[adjTris[0][0]], verts[0][1], verts[0][2]]);
    if (curr > max) { max = curr;}
    var curr = calcDihedralAngle([v1, v2, v3,], [verts[adjTris[1][0]], verts[1][1], verts[1][2]]);
    if (curr > max) { max = curr;}
    return [max, area];
}

function minAngleWeightFuncTwo(v1, v2, v3, adjTris) {
    var area = minAreaWeightFunc(v1, v2, v3);
    var max = -Infinity;
    for (let i = 0; i < adjTris.length; i++)
    {
        var tris = adjTris[i];
        var curr = calcDihedralAngle([v1, v2, v3], tris);
        if (curr > max) { max = curr; }
    }

    return [max, area]
}

function getAdjacentTris(mesh, hole) {
    var meshData = mesh.getMeshData();
    var verts = meshData[0];
    var faces = meshData[1];
    var numFaces = faces.length;
    var adj = new Object();
    var edges = new Object();
    for (let i = 0; i < hole.length - 1; i++)
    {
        edges[i] = [hole[i], hole[i + 1]];
    }

    for (let i = 0; i < numFaces; i++)
    {
        var face = faces[i];
        var edge0 =  [verts[face[0]], verts[face[1]]];
        var edge00 = [verts[face[1]], verts[face[0]]];
        var edge1 =  [verts[face[0]], verts[face[2]]];
        var edge11 = [verts[face[2]], verts[face[0]]];
        var edge2 =  [verts[face[1]], verts[face[2]]];
        var edge22 = [verts[face[2]], verts[face[1]]];

        for (let j = 0; j < hole.length - 1; j++)
        {
            var edge = edges[j];
            if (edge0[0] == edge[0] && edge0[1] == edge[1]) { 
                adj[j] = face; 
            }

            if (edge00[0] == edge[0] && edge00[1] == edge[1]) { 
                adj[j] = face; 
            }

            if (edge1[0] == edge[0] && edge1[1] == edge[1]) { 
                adj[j] = face; 
            }

            if (edge11[0] == edge[0] && edge11[1] == edge[1]) { 
                adj[j] = face; 
            }

            if (edge2[0] == edge[0] && edge2[1] == edge[1]) { 
                adj[j] = face; 
            }

            if (edge22[0] == edge[0] && edge22[1] == edge[1]) { 
                adj[j] = face; 
            }
        }
    }

    return adj;
}

function triangulate(mesh, method) {
    var surface = mesh.getMeshData();
    var holes = mesh.getHoles();
    var numHoles = mesh.getNumHoles();
    var adj = mesh.getAdjList();
    var start = Date.now();
    for (let l = 0; l < numHoles; l++)
    {
        // Init
        var hole = holes[l];
        var n = hole.length;
        var W = null; // Weight set
        var O = createSquareArray(n, 0); // Minimum indices
        if (method == "AREA")
        {
            W = createSquareArray(n, 0)
            // Step 1
            for (let i = 0; i <= n - 3; i++)
            {
                W[i][i + 2] = minAreaWeightFunc(hole[i], hole[i + 1], hole[i + 2]);
            }
            var j = 2;
            // Step 2
            while (j < n)
            {
                j++;
                for (let i = 0; i < n - j; i++)
                {
                    var k = i + j;
                    var min = Infinity;
                    var m = -1;
                    for (let x = i + 1; x < k; x++)
                    {
                        var curr = W[i][x] + W[x][k] + minAreaWeightFunc(hole[i], hole[x], hole[k]);
                        if (curr < min) {
                            min = curr;
                            m = x;
                        }
                    }
                    W[i][k] = min;
                    O[i][k] = m;
                }
            }
        }
        else if (method == "ANGLE") {
            W = createSquareArray(n, [0, 0]);
            var adjTris = getAdjacentTris(mesh, hole);
            // Step 1
            for (let i = 0; i <= n - 3; i++)
            {
                W[i][i + 2] = minAngleWeightFunc(hole[i], hole[i + 1], hole[i + 2], [adjTris[i], adjTris[i + 1]], surface[0]);
            }
            var j = 2;
            // Step 2
            while (j < n) {
                j++;
                for (let i = 0; i < n - j; i++)
                {
                    var k = i + j;
                    var min = [Math.PI, Infinity];
                    var m = i + 1;
                    for (let x = i + 1; x < k; x++)
                    {
                        adjTris = [[hole[i], hole[O[i][m]], hole[x]], [hole[x], hole[O[m][k]], hole[k]]];
                        var curr = addWeights(addWeights(W[i][x], W[x][k]), minAngleWeightFuncTwo(hole[i], hole[x], hole[k], adjTris));
                        
                        if (lessThan(curr, min)) {
                            min = curr;
                            m = x;
                        }
                    }
                    W[i][k] = min;
                    O[i][k] = m;
                }
            }
        }
        // Step 3
        var triIndices = trace(0, n - 1, O, []);
        var numTris = triIndices.length;
        var newTris = new Array(numTris);
        for (let i = 0; i < numTris; i++)
        {
            var curr = triIndices[i];
            newTris[i] = [adj[hole[curr[0]]].index, adj[hole[curr[1]]].index, adj[hole[curr[2]]].index]
        }
        surface[1] = surface[1].concat(newTris);
    }

    var end = Date.now();
    console.log((end - start) / 1000 + " seconds to finish");
    return surface;
}