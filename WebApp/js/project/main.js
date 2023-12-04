async function main() {
    // Load model
    var sphereSmall =  new HoleMesh("sphere100hole");    
    // Wait for it to finish finding hole
    await sphereSmall.promise;
    // Display base model
    baseModel = prepModel3D(sphereSmall.getMeshData());
    draw3D(baseModel, "base");
    // Triangulate (AREA)
    triArea = triangulate(sphereSmall, "AREA");
    draw3D(prepModel3D(triArea), "tri-area");
    // Triangulate (ANGLE)
    triAngle = triangulate(sphereSmall, "ANGLE");
    draw3D(prepModel3D(triAngle), "tri-angle");
}

async function test() {
    var bunny = new HoleMesh("bunny_hole");
    await bunny.promise;
    triangulate(bunny, "AREA");
}

main()
// test();