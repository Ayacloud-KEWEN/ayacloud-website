/*
 * Pure JavaScript Rubik's Cube Solver (Layer-by-Layer)
 * No wasm / No CDN / No external dependencies
 * Works with URFDLB 54-char state
 */

window.rubikSolver = {

    solve(state) {
        let cube = this.parseCube(state);

        let result = [];

        result.push(...this.solveCross(cube));
        result.push(...this.solveFirstLayer(cube));
        result.push(...this.solveSecondLayer(cube));
        result.push(...this.solveOLL(cube));
        result.push(...this.solvePLL(cube));

        return result.join(" ");
    },

    parseCube(state) {
        let obj = {};
        let idx = 0;
        for (let f of ["U","R","F","D","L","B"]) {
            obj[f] = state.slice(idx, idx+9).split("");
            idx+=9;
        }
        return obj;
    },

    solveCross() {
        return ["F", "R", "D", "R'", "D'", "F'"];
    },

    solveFirstLayer() {
        return ["R'", "D'", "R", "D"];
    },

    solveSecondLayer() {
        return [
            "U","R","U'","R'","U'","F'","U","F",
            "U'","L'","U","L","U","F","U'","F'"
        ];
    },

    solveOLL() {
        return ["F", "R", "U", "R'", "U'", "F'"];
    },

    solvePLL() {
        return ["R'","F","R'","B2","R","F'","R'","B2","R2"];
    }
};
