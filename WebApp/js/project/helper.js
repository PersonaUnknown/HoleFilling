// For dealing with basic helper functions to speed up implementation
function createSquareArray(n) {
    matrix = new Array(n);
    for (let i = 0; i < n; i++)
    {
        matrix[i] = new Array(n);
    }

    return matrix;
}

function createSquareArray(n, val) {
    matrix = new Array(n);
    for (let i = 0; i < n; i++)
    {
        matrix[i] = new Array(n).fill(val);
    }

    return matrix;
}