function fairAvg(surface) {
    var verts = surface[0];
    var faces = surface[1];
    for (let i = 0; i < verts.length; i++) {
        var neighbors = [];
        for (let j = 0; j < faces.length; j++) {
            var face = faces[j];
            if (face[0] == i) {
                neighbors.push(verts[face[1]]);
                neighbors.push(verts[face[2]]);
            }
            if (face[1] == i) {
                neighbors.push(verts[face[0]]);
                neighbors.push(verts[face[2]]);
            }
            if (face[2] == i) {
                neighbors.push(verts[face[0]]);
                neighbors.push(verts[face[1]]);
            }
        }

        if (neighbors.length > 0) {
            verts[i] = math.mean(neighbors, 0);
        }
    }

    return [verts, faces];
}