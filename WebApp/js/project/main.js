async function main() {
    // Load model
    var sphereSmall =  new HoleMesh("sphere100hole");    
    // Wait for it to finish finding hole
    await sphereSmall.promise;
    
    var sceneSphere = prepModelForScene(sphereSmall.getMeshData());
    var holes = sphereSmall.getHoles();
    var triArea = triangulate(sphereSmall, "AREA");
    
    var triAngle = triangulate(sphereSmall, "ANGLE");
    addObject(scene, sceneSphere[0], sceneSphere[1])
    addHoleOutline(scene, holes)
    var area = prepModelForScene(triArea[0]);
    var angle = prepModelForScene(triAngle[0]);
    addObject(scene2, area[0], area[1], color=null, "area");
    addObject(scene2, angle[0], angle[1], color=null, "angle");
    hideObject(scene2, "angle")

    // Not fully implemented (Refinement)
    var ref = refine(sphereSmall, triArea[1]);
    var sceneRefine = prepModelForScene(ref);
    addObject(scene3, sceneRefine[0], sceneRefine[1]);

    // Fairing
    var fair = fairAvg(sphereSmall.getMeshData());
    var sceneFair = prepModelForScene(fair);
    addObject(scene4, sceneFair[0], sceneFair[1])
}

main()