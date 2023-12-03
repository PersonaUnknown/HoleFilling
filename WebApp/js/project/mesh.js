// This script will contain a Mesh class that centralizes all the important Mesh data that is needed for Hole Filling to work
// Constructor Params: OFF File to obtain initial mesh data
// When fully initialized, the class object will have an array containing the holes
class HoleMesh {
    constructor(offFile) {
        // Mesh Data
        this.fileName = offFile;
        this.vertices = [];
        this.faces = [];
        
        // Hole Boundary Loops
        this.isolatedEdges = [];
        this.isolatedVertices = [];
        this.adjList = null;
        this.holes = [];

        // Refinement
        
        // Init
        this.init();
    }

    // Getters
    getMeshData() {
        return [this.vertices, this.faces];
    }

    getHoles() {
        return this.holes;
    }

    getNumHoles() {
        return this.holes.length;
    }

    getAdjList() {
        return this.adjList;
    }

    // Init
    async init() {
        // Async Promise
        this.promise = (async () => {
            // Read from OFF File and get vertices and faces
            const data = await this.readOffFile();
            [this.vertices, this.faces] = data;

            // Identify hole boundaries
            this.isolatedEdges = this.findIsolatedEdges();
            this.isolatedVertices = this.findIsolatedVertices();
            this.adjList = this.getAdjacencyList();
            this.holes = this.findHoleBoundaries();
        })();
    }

    // Reads OFF File and creates surface in format of [list of vertices, list of faces]
    async readOffFile() {
        /* === Grab OFF file and convert to vertices and faces */
        const response = await fetch("../data/" + this.fileName + ".off");
        const text = await response.text();
        var lines = text.split(/\r\n/)
        var verts = []
        var edges = []
        var faces = []
        
        var details = lines[1].split(" ")
        var numVerts = +details[0];
    
        // Get vertices
        for (let i = 2; i < numVerts + 2; i++)
        {
            // Get current line
            var currLine = lines[i].split(" ")
        
            // Pass in x, y, z of vertex
            verts.push([+currLine[0], +currLine[1], +currLine[2]])
        }
    
        // Get faces
        for (let i = numVerts + 2; i < lines.length; i++)
        {
            // Get current line
            var currLine = lines[i].split(" ")
            if (currLine != "")
            {
                // Pass in indices for face
                faces.push([+currLine[1], +currLine[2], +currLine[3]])
            }
        }
    
        return [verts, faces]
    }

    // ====== STEP 1: FINDING HOLE ======
    // Given mesh surface, get all edges with isolated values
    findIsolatedEdges() {
        var dict = new Object()
        var edges = []
        var numFaces = this.faces.length;
        for (let i = 0; i < numFaces; i++)
        {
            // Get indices that make up face
            var currFace = this.faces[i];
            var index0 = +currFace[0];
            var index1 = +currFace[1];
            var index2 = +currFace[2];

            // Compare edges
            var edge0 = index0 < index1 ? [index0, index1] : [index1, index0]
            if (dict.hasOwnProperty(edge0)) { dict[edge0]++; } else {dict[edge0] = 1; }
            var edge1 = index0 < index2 ? [index0, index2] : [index2, index0]
            if (dict.hasOwnProperty(edge1)) { dict[edge1]++; } else {dict[edge1] = 1; }
            var edge2 = index1 < index2 ? [index1, index2] : [index2, index1]
            if (dict.hasOwnProperty(edge2)) { dict[edge2]++; } else {dict[edge2] = 1; }
        }        

        for (var key in dict) {
            var value = dict[key]
            if (value == 1) {
                var edge = key.split(",")
                edge[0] = +edge[0]; 
                edge[1] = +edge[1];
                edges.push(edge)
            }
        }
        return edges;
    }

    // Given isolated edges, all vertex indices should also be isolated and are an element of a hole
    findIsolatedVertices() {
        var isolatedVerts = new Set(this.isolatedEdges.flat())
        return [...isolatedVerts]
    }

    // Given mesh data, create an adjacency list for each isolated vertex plus their original index
    getAdjacencyList() {
        var adjList = new Object();
        var numVerts = this.isolatedVertices.length;
        var numEdges = this.isolatedEdges.length;
        for (let i = 0; i < numVerts; i++)
        {
            // Init data
            var currIndex = this.isolatedVertices[i];
            var currVertex = this.vertices[currIndex];
            var pair = [0, 0];
            var pairIndex = 0;
            // Check each edge to see which is adjacent 
            for (let j = 0; j < numEdges; j++)
            {
                var currEdge = this.isolatedEdges[j];
                if (currEdge[0] == currIndex) { pair[pairIndex++] = currEdge[1] }
                if (currEdge[1] == currIndex) { pair[pairIndex++] = currEdge[0] }
                if (pairIndex > 1) { break }
            }           
            // Add to adjacency list
            adjList[currVertex] = {"adj": pair, "index": currIndex};
        }

        return adjList;
    }

    // Given mesh data, return list of holes (i.e. their vertices) sorted in order
    findHoleBoundaries() {
        var visited = new Object();
        var numVerts = this.isolatedVertices.length;
        var holes = [];
        for (let i = 0; i < numVerts; i++)
        {   
            var currVert = this.isolatedVertices[i];
            if (!visited.hasOwnProperty(currVert))
            {
                // If not visited yet, find the vertices to one hole
                var hole = [];
                var entry = this.adjList[this.vertices[currVert]]
                var connected = entry.adj;
                var prev = currVert;
                var curr = connected[1];
                var end = connected[0];

                // Until you haven't reached the end, keep adding points to hole
                while (connected[0] != end && connected[1] != end)
                {
                    hole.push(this.vertices[prev]);
                    visited[prev] = 1;
                    if (connected[0] != prev) {
                        prev = curr;
                        curr = connected[0];
                    } else {
                        prev = curr;
                        curr = connected[1];
                    }
                    connected = this.adjList[curr].adj;
                }
                hole.push(this.vertices[prev]); hole.push(this.vertices[curr]); hole.push(this.vertices[end]);
                visited[prev] = 1; visited[curr] = 1; visited[end] = 1;
                holes.push(hole);
            }
        }
        console.log(holes)
        return holes;
    }
}