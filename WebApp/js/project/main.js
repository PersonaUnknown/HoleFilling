async function main() {
    // Load model
    var sphereSmall =  new HoleMesh("sphere100hole");    
    var bunny = new HoleMesh("bunny_hole");
    // Wait for it to finish finding hole
    await sphereSmall.promise;
    await bunny.promise;
    
    var sceneSphere = prepModelForScene(sphereSmall.getMeshData());
    var holes = sphereSmall.getHoles();
    var triArea = triangulate(sphereSmall, "AREA");
    var triAngle = triangulate(sphereSmall, "ANGLE");

    addObject(scene, sceneSphere[0], sceneSphere[1])
    addHoleOutline(scene, holes)

    var area = prepModelForScene(triArea);
    var angle = prepModelForScene(triAngle);
    addObject(scene2, area[0], area[1], color=null, "area");
    addObject(scene2, angle[0], angle[1], color=null, "angle");
    hideObject(scene2, "angle")
    // removeObject("base-model")
    // draw3D(prepModel3D(baseModel), "base");
    // draw3D(baseModel, "base");
    // Triangulate (AREA)
    // var triArea = triangulate(sphereSmall, "AREA");
    // draw3D(prepModel3D(triArea), "tri-area");
    // // Triangulate (ANGLE)
    // var triAngle = triangulate(sphereSmall, "ANGLE");
    // draw3D(prepModel3D(triAngle), "tri-angle");
}

async function test() {
    var bunny = new HoleMesh("bunny_hole");
    await bunny.promise;
    triangulate(bunny, "AREA");
}

main()
// test();