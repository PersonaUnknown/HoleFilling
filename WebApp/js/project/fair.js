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
            var x = 0; var y = 0; var z = 0;
            for (let k = 0; k < neighbors.length; k++) {
                x += neighbors[k][0];
                y += neighbors[k][1];
                z += neighbors[k][2];
            }
            
            verts[i] = [x / 3, y / 3, z / 3];
        }
    }

    return [verts, faces];
}