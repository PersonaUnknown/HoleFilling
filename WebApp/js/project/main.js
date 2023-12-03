async function main() {
    // Load model
    var sphereSmall =  new HoleMesh("sphere100hole");    
    // Wait for it to finish finding hole
    await sphereSmall.promise;
    // Triangulate
    // triangulate(sphereSmall);
}

main()