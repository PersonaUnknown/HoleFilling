// This script is to handle triangulation (either AREA or ANGLE method) and conntains helper functions to accomplish this
// Assumes triangulation is done with a HoleMesh object
// ====== STEP 2: Initial Hole Filling (Triangulation) ======
function trace() {

}

function minAreaWeightFunc(v1, v2, v3) {
    var AB = math.subtract(v2, v1);
    var AC = math.subtract(v3, v1);
    var area = math.norm(math.cross(AB, AC));
    return math.divide(area, 2);
}

function triangulate(mesh) {
    var surface = mesh.getMeshData();
    var holes = mesh.getHoles();
    var numHoles = mesh.getNumHoles();

    for (let i = 0; i < numHoles; i++)
    {
        // Init
        var hole = holes[i];
        var n = hole.length;
        var W = createSquareArray(n, 0); // Weight set
        var O = createSquareArray(n, 0); // Minimum indices
        // Step 1
        for (let i = 0; i <= n - 3; i++)
        {
            W[i][i + 2] = minAreaWeightFunc(hole[i], hole[i + 1], hole[i + 2]);
        }
        j = 2;
        console.log(W)
        // Step 2
        while (j < n)
        {
            j++;
        }
    }

    // if (method == "AREA")
    // {
        
    // }
    // else if (method == "ANGLE")
    // {
        
    // }
}