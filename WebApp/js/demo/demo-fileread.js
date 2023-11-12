$('#fileInput').on('change', function() { 
    var fr = new FileReader(); 
    fr.onload = function() { 
        var result = fr.result;
        var lines = result.split(/\r\n/)
        var verts = []
        var faces = []
        
        var details = lines[1].split(" ")
        var numVerts = +details[0];
        // var numFaces = +details[1];
        // var numEdges = +details[2];
    
        for (let i = 2; i < numVerts + 2; i++)
        {
            // Get current line
            var currLine = lines[i].split(" ")
        
            // Pass in x, y, z of vertex
            verts.push(+currLine[0])
            verts.push(+currLine[1])
            verts.push(+currLine[2])
            verts.push(0.5)         
            verts.push(0.5)
            verts.push(0.5)  
        }

        for (let i = numVerts + 2; i < lines.length; i++)
        {
            // Get current line
            var currLine = lines[i].split(" ")

            // Pass in indices for face
            faces.push(+currLine[1])
            faces.push(+currLine[2])
            faces.push(+currLine[3])
        }   

        draw3D([verts, faces], "file-canvas")
    } 
    
    fr.readAsText(this.files[0]); 
}) 