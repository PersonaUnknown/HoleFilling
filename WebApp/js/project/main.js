async function main() {
    // Load model
    var sphereSmall =  new HoleMesh("sphere_500_hole_1");    
    // Wait for it to finish finding hole
    await sphereSmall.promise;
    
    var sceneSphere = prepModelForScene(sphereSmall.getMeshData());
    var holes = sphereSmall.getHoles();
    var triArea = triangulate(sphereSmall, "AREA");
    
    // var triAngle = triangulate(sphereSmall, "ANGLE");
    addObject(scene, sceneSphere[0], sceneSphere[1])
    addHoleOutline(scene, holes)
    var area = prepModelForScene(triArea[0]);
    // var angle = prepModelForScene(triAngle[0]);
    addObject(scene2, area[0], area[1], color=null, "area");
    console.log(area)
    // addObject(scene2, angle[0], angle[1], color=null, "angle");
    // hideObject(scene2, "angle")
    // getAllEdges(triArea)
    // refine(sphereSmall, triArea[1])
}

main()