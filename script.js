class population {
    constructor(ins, outs, number) {
        this.connectionNumber = 0;
        this.population = new Array(number);
        this.genes = [];
        let nodes = new Array(ins + outs);
        for (let i = 0; i < nodes.length; i++) {
            nodes[i] = i + 1;
        }
        for (let i = 0; i < number; i++) {
            this.population[i] = new topology(null, ins, outs, this, copyArray(nodes));
            for (let j = 0; j < (ins * outs) / 2; j++) {
                this.population[i].mutate(2);
            }
        }
        this.generationNumber = 0;
    }
    cullAndBreed() {
        let matingPool = [];
        let bestFitness = this.population[0].fitness;
        for (let i = 1; i < this.population.length; i++) {
            if (this.population[i].fitness > bestFitness) {
                bestFitness = this.population[i].fitness;
            }
        }
        for (let i = 0; i < this.population.length; i++) {
            for (let j = 0; j < 100 * (this.population[i].fitness / bestFitness); j++) {
                matingPool.push(i);
            }
        }
        let nextGeneration = new Array(this.population.length);
        for (let i = 0; i < this.population.length; i++) {
            if (i > Math.floor(this.population.length / 4)) {
                let p1Index = Math.floor(Math.random() * matingPool.length);
                let p2Index = Math.floor(Math.random() * matingPool.length);
                if (this.population[matingPool[p1Index]].fitness > this.population[matingPool[p2Index]].fitness) {
                    nextGeneration[i] = combineTopologies(this.population[matingPool[p1Index]], this.population[matingPool[p2Index]]);
                } else {
                    nextGeneration[i] = combineTopologies(this.population[matingPool[p2Index]], this.population[matingPool[p1Index]]);
                }
                nextGeneration[i].fitness = 0;
                nextGeneration[i].mutate();
            } else {
                nextGeneration[i] = this.population[i];
                nextGeneration[i].fitness = 0;
                nextGeneration[i].mutate();
            }
        }
        this.population = nextGeneration;
        this.generationNumber++;
        console.log(this.generationNumber);
    }
}

class topology {
    constructor(_connections, _ins, _outs, _population, _nodes) {
        this.maxConnections = _ins * _outs;
        if (_nodes != null) {
            this.nodes = _nodes;
            this.connections = [];
        } else {
            this.nodes = [];
            for (let i = 0; i < _ins + _outs; i++) {
                this.nodes.push(i + 1);
            }
            this.connections = _connections;
            for (let i = 0; i < _connections.length; i++) {
                if (!this.nodes.includes(_connections[i][1])) {
                    this.nodes.push(_connections[i][1]);
                    this.maxConnections += this.nodes.length - 1;
                }
            }
        }
        this.ins = _ins;
        this.outs = _outs;
        this.population = _population;
        this.fitness = 0;
    }
    getOutput(inputs) {
        let nodeValues = new Array(this.nodes.length);
        for (let i = 0; i < nodeValues.length; i++) {
            if (i < inputs.length) {
                nodeValues[i] = inputs[i];
            } else {
                nodeValues[i] = 0;
            }
        }
        let currentNode = -1;
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i][4]) {
                if (this.connections[i][1] != currentNode && currentNode != -1) {
                    nodeValues[currentNode - 1] = sigmoid(nodeValues[currentNode - 1]);
                }
                nodeValues[this.connections[i][1] - 1] += this.connections[i][2] * nodeValues[this.connections[i][0] - 1];
                currentNode = this.connections[i][1];
            }
        }
        nodeValues[currentNode - 1] = sigmoid(nodeValues[currentNode - 1]);
        let output = [];
        for (let i = this.ins; i < this.ins + this.outs; i++) {
            output.push(nodeValues[i]);
            if (output[output.length - 1] == null) {
                out[output.length - 1] = 0;
            }
        }
        return output;
    }
    mutate(n) {
        let x = Math.random();
        if (n != null) {
            x = n;
        }
        if (x < 0.01) {
            let choice = Math.floor(Math.random() * this.connections.length);
            const store = this.connections[choice];
            let connectionNumber = -1;
            for (let i = 0; i < this.population.genes.length; i++) {
                if (this.population.genes[i][0] == this.nodes.length + 1 && this.population.genes[i][1] == store[1]) {
                    connectionNumber = this.population.genes[i][2] - 1;
                }
            }
            if (connectionNumber < 0) {
                connectionNumber = this.population.connectionNumber;
                this.population.connectionNumber += 2;
                this.population.genes.push([this.nodes.length + 1, store[1], connectionNumber + 1]);
                this.population.genes.push([store[0], this.nodes.length + 1, connectionNumber]);
            }
            this.connections.splice(choice, 1, [this.nodes.length + 1, store[1], store[2], connectionNumber + 1, true]);
            let y = choice - 1;
            while (true) {
                if (y <= 0 || this.connections[y][1] != store[1]) {
                    this.connections.splice(y + 1, 0, [store[0], this.nodes.length + 1, 1, connectionNumber, true]);
                    break;
                }
                y--;
            }
            this.maxConnections += this.nodes.length;
            this.nodes.push(this.nodes.length + 1);
        }
        if (x < 0.8) {
            for (let choice = 0; choice < this.connections.length; choice++) {
                this.connections[choice][2] += (Math.random() * 0.4) - 0.2;
            }
        }
        if (x < 0.05 || x == 2) {
            if (this.connections.length == this.maxConnections) {
                this.mutate(0);
            } else {
                let choice1 = 1 + Math.floor(Math.random() * (this.nodes.length - 1));
                while (this.nodes[choice1 - 1] == -1 || (choice1 > this.ins && choice1 <= this.ins + this.outs)) {
                    choice1 = 1 + Math.floor(Math.random() * (this.nodes.length - 1));
                }
                let choice2 = 1 + Math.floor(Math.random() * (this.nodes.length - choice1)) + choice1;
                while (this.nodes[choice2 - 1] == -1 || choice2 <= this.ins) {
                    choice2 = 1 + Math.floor(Math.random() * (this.nodes.length - choice1)) + choice1;
                }
                let alreadyPresent = false;
                for (let i = 0; i < this.connections.length; i++) {
                    if (this.connections[i][0] == choice1 && this.connections[i][1] == choice2) {
                        alreadyPresent = true;
                    }
                }
                if (!alreadyPresent) {
                    let connectionNumber = -1;
                    for (let i = 0; i < this.population.genes.length; i++) {
                        if (this.population.genes[i][0] == choice1 && this.population.genes[i][1] == choice2) {
                            connectionNumber = this.population.genes[i][2];
                        }
                    }
                    if (connectionNumber < 0) {
                        connectionNumber = this.population.connectionNumber + 1;
                        this.population.connectionNumber++;
                        this.population.genes.push([choice1, choice2, connectionNumber])
                    }
                    if (this.connections.length > 0) {
                        for (let i = 0; i < this.connections.length; i++) {
                            if (this.connections[i][1] == choice2 || i == this.connections.length - 1) {
                                this.connections.splice(i + 1, 0, [choice1, choice2, Math.random() * 4 - 2, connectionNumber, true]);
                                break;
                            }
                        }
                    } else {
                        this.connections.push([choice1, choice2, Math.random() * 4 - 2, connectionNumber, true]);
                    }
                } else {
                    this.mutate(2);
                }
            }
        }
        if (x < 0.2) {
            let choice = Math.floor(Math.random() * this.connections.length);
            this.connections[choice][2] = (Math.random() * 4) - 2;
        }
        if (x < 0.1) {
            let choice = Math.floor(Math.random() * this.connections.length);
            this.connections[choice][4] = !this.connections[choice][4];
        }
    }
}

function sortByFitness(arr) {
    let isSorted = false;
    while (!isSorted) {
        isSorted = true;
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i].fitness < arr[i + 1].fitness) {
                isSorted = false;
                const store = arr[i];
                arr[i] = arr[i + 1];
                arr[i + 1] = store;
            }
        }
    }
    return arr;
}

function distanceOfTopologies(t1, t2) {
    let distance = 0;
    distance += Math.abs((t1.nodes.length - t2.nodes.length) * 10);
    for (let i = 0; i < t1.connections.length; i++) {
        let found = false;
        for (let j = 0; j < t2.connections.length; j++) {
            if (t1.connections[i][3] == t2.connections[j][3]) {
                found = true;
                distance += Math.abs(t1.connections[i][2] - t2.connections[j][2]) * 0.1;
                break;
            }
        }
        if (!found) {
            distance += 5;
        }
    }
    return distance;
}

function combineTopologies(t1, t2) {
    let newConnections = copyArray(t1.connections);
    let max = newConnections[0][3];
    for (let i = 1; i < newConnections.length; i++) {
        if (newConnections[i][3] > max) {
            max = newConnections[i][3];
        }
    }
    for (let i = 0; i < t2.connections.length; i++) {
        if (t2.connections[i][3] < max) {
            let found = false;
            for (let j = 0; j < newConnections.length; j++) {
                if (newConnections[j][3] == t2.connections[i][3]) {
                    newConnections[j][2] = (newConnections[j][2] + t2.connections[i][2]) / 2
                    found = true;
                    break;
                }
            }
            if (!found) {
                for (let j = 0; j < newConnections.length; j++) {
                    if (newConnections[j][2] == t2.connections[i][2]) {
                        newConnections.splice(j, 0, t2.connections[i]);
                        break;
                    }
                }
            }
        }
    }
    return new topology(newConnections, t1.ins, t1.outs, t1.population);
}

function copyArray(arr) {
    let out = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].length > 0) {
            out.push([]);
            for (let j = 0; j < arr[i].length; j++) {
                out[i].push(arr[i][j]);
            }
        } else {
            out.push(arr[i]);
        }
    }
    return out;
}



const sigmoid = (n) => (1 / (1 + Math.pow(Math.E, -1 * n)));

let snakeBrains = new population(24, 4, 2000);

let w = 18;
let h = 18;

let wS = 400 / w;
let hS = 400 / h;

const gameCanvas = document.getElementById("game").getContext("2d");

let snakes = new Array(snakeBrains.population.length);
let apples = new Array(snakes.length);
let directions = new Array(snakes.length);
let maxMoves = new Array(snakes.length);

let overallBest = -100;
let bestIndex = 0;

const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
];
for (let i = 0; i < snakes.length; i++) {
    snakes[i] = [{
        x: w / 2,
        y: h / 2
    }, {
        x: w / 2 - 1,
        y: h / 2
    }, {
        x: w / 2 - 2,
        y: h / 2
    }, {
        x: w / 2 - 3,
        y: h / 2
    }];
    apples[i] = {
        x: w / 2 + 2,
        y: h / 2
    };
    directions[i] = [0, 0];
    maxMoves[i] = 100;
}

console.log(snakeBrains);

function dispSnake(s, c) {
    for (let i = 0; i < s.length; i++) {
        c.fillStyle = "lightGreen";
        c.fillRect(s[i].x * wS, s[i].y * hS, wS, hS);
        c.strokeStyle = "darkGreen";
        c.strokeRect(s[i].x * wS, s[i].y * hS, wS, hS);
    }
}

function dispApple(a, c) {
    c.fillStyle = "red";
    c.fillRect(a.x * wS, a.y * hS, wS, hS);
    c.strokeStyle = "crimson";
    c.strokeRect(a.x * wS, a.y * hS, wS, hS);
}

function moveSnake(s, d) {
    if (!(d[0] == 0 && d[1] == 0)) {
        for (let i = s.length - 1; i > 0; i--) {
            s[i].x = s[i - 1].x;
            s[i].y = s[i - 1].y;
        }
        s[0].x += d[0];
        s[0].y += d[1];
    }
    return s;
}

function checkApple(s, a) {
    let didEat = false;
    if (s[0].x == a.x && s[0].y == a.y) {
        didEat = true;
        s.push({
            x: -1,
            y: -1
        });
        while (true) {
            a = {
                x: Math.floor(Math.random() * w),
                y: Math.floor(Math.random() * h)
            };
            let val = true;
            for (let i = 0; i < s.length; i++) {
                if (a.x == s[i].x && a.y == s[i].y) {
                    val = false;
                    break;
                }
            }
            if (val) {
                break;
            }
        }
    }
    return [s, a, didEat];
}

function isSnakeDead(s) {
    if (s[0].x < 0 || s[0].x > w - 1 || s[0].y < 0 || s[0].y > h - 1) {
        return true;
    }
    for (let i = 2; i < s.length; i++) {
        if (s[0].x == s[i].x && s[0].y == s[i].y) {
            return true;
        }
    }
    return false;
}

function validNewDirection(d1, d2) {
    if ((d1[0] + d1[1] == 0 && d2[0] == -1)) {
        return d1;
    } else if (d1[0] + d1[1] == 0) {
        return d2;
    } else if ((d1[0] == 0 && d2[0] == 0) || (d1[1] == 0 && d2[1] == 0)) {
        return d1;
    } else {
        return d2;
    }
}

function updateSnakeAndApple(s, a, d, f) {
    s = moveSnake(s, d);
    let result = checkApple(s, a);
    s = result[0];
    a = result[1];
    if (result[2]) {
        f++;
    }
    if (isSnakeDead(s)) {
        return false;
    } else {
        return [s, a, f];
    }
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }
    var max = arr[0];
    var maxIndex = 0;
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }
    return maxIndex;
}

function playGeneration() {
    let stillAlive = new Array(snakes.length);
    for (let i = 0; i < stillAlive.length; i++) {
        stillAlive[i] = true;
    }
    let deadCount = 0;
    while (deadCount < snakes.length) {
        for (let i = 0; i < snakes.length; i++) {
            if (stillAlive[i]) {
                let inputs = [w - snakes[i][0].x, snakes[i][0].x, h - snakes[i][0].y, snakes[i][0].y, Math.sqrt(((w - snakes[i][0].x) * (w - snakes[i][0].x)) + (snakes[i][0].y * snakes[i][0].y)), Math.sqrt((snakes[i][0].x * snakes[i][0].x) + (snakes[i][0].y * snakes[i][0].y)), Math.sqrt((snakes[i][0].x * snakes[i][0].x) + ((h - snakes[i][0].y) * (h - snakes[i][0].y))), Math.sqrt(((w - snakes[i][0].x) * (w - snakes[i][0].x)) + ((h - snakes[i][0].y) * (h - snakes[i][0].y)))];
                inputs.push(apples[i].x - snakes[i][0].x, snakes[i][0].x - apples[i].x, apples[i].y - snakes[i][0].y, snakes[i][0].y - apples[i].y);
                inputs.push(Math.sqrt(Math.pow(apples[i].x - snakes[i][0].x, 2) + Math.pow(apples[i].y - snakes[i][0].y, 2)), Math.sqrt(Math.pow(snakes[i][0].x - apples[i].x, 2) + Math.pow(apples[i].y - snakes[i][0].y, 2)), Math.sqrt(Math.pow(apples[i].x - snakes[i][0].x, 2) + Math.pow(snakes[i][0].y - apples[i].y, 2)), Math.sqrt(Math.pow(snakes[i][0].x - apples[i].x, 2) + Math.pow(snakes[i][0].y - apples[i].y, 2)));
                inputs.push(0, 0, 0, 0, 0, 0, 0, 0);
                for (let j = 1; j < h; j++) {
                    for (let k = 2; k < snakes[i].length; k++) {
                        if (inputs[16] != 0 && snakes[i][k].x == snakes[i][0].x + j && snakes[i][k].y == snakes[i][0].y) {
                            inputs[16] = h;
                        }
                        if (inputs[17] != 0 && snakes[i][k].x == snakes[i][0].x - j && snakes[i][k].y == snakes[i][0].y) {
                            inputs[17] = h;
                        }
                        if (inputs[18] != 0 && snakes[i][k].x == snakes[i][0].x && snakes[i][k].y == snakes[i][0].y + j) {
                            inputs[18] = h;
                        }
                        if (inputs[19] != 0 && snakes[i][k].x == snakes[i][0].x && snakes[i][k].y == snakes[i][0].y - j) {
                            inputs[19] = h;
                        }
                        if (inputs[20] != 0 && snakes[i][k].x == snakes[i][0].x + j && snakes[i][k].y == snakes[i][0].y - j) {
                            inputs[20] = Math.sqrt(2 * h * h);
                        }
                        if (inputs[21] != 0 && snakes[i][k].x == snakes[i][0].x - j && snakes[i][k].y == snakes[i][0].y + j) {
                            inputs[21] = Math.sqrt(2 * h * h);
                        }
                        if (inputs[22] != 0 && snakes[i][k].x == snakes[i][0].x + j && snakes[i][k].y == snakes[i][0].y + j) {
                            inputs[22] = Math.sqrt(2 * h * h);
                        }
                        if (inputs[23] != 0 && snakes[i][k].x == snakes[i][0].x - j && snakes[i][k].y == snakes[i][0].y - j) {
                            inputs[23] = Math.sqrt(2 * h * h);
                        }
                    }
                }
                let output = snakeBrains.population[i].getOutput(inputs);
                const currentDistanceToApple = Math.sqrt(Math.pow(apples[i].x - snakes[i][0].x, 2) + Math.pow(apples[i].y - snakes[i][1].y, 2));
                directions[i] = validNewDirection(directions[i], dirs[indexOfMax(output)]);
                let result = updateSnakeAndApple(snakes[i], apples[i], directions[i], snakeBrains.population[i].fitness);
                maxMoves[i]--;
                if (directions[i][0] + directions[i][1] != 0) {
                    snakeBrains.population[i].fitness += 0.01;
                }
                if (snakeBrains.population[i].fitness > overallBest) {
                    overallBest = snakeBrains.population[i].fitness;
                    bestIndex = i;
                    console.log(overallBest);
                }
                if (result == false || maxMoves[i] == 0) {
                    if (maxMoves[i] == 0) {
                        snakeBrains.population[i].fitness -= 2;
                    } else {
                        snakeBrains.population[i].fitness -= 3;
                    }
                    stillAlive[i] = false;
                    deadCount++;
                    snakes[i] = [{
                        x: w / 2,
                        y: h / 2
                    }, {
                        x: w / 2 - 1,
                        y: h / 2
                    }, {
                        x: w / 2 - 2,
                        y: h / 2
                    }, {
                        x: w / 2 - 3,
                        y: h / 2
                    }];
                    apples[i] = {
                        x: w / 2 + 2,
                        y: h / 2
                    };
                    directions[i] = [0, 0];
                    maxMoves[i] = 100;
                } else {
                    snakes[i] = result[0];
                    apples[i] = result[1];
                    if (result[2] > snakeBrains.population[i].fitness) {
                        maxMoves[i] += 100;
                        snakeBrains.population[i].fitness++;
                    }
                }
                const newDistanceToApple = Math.sqrt(Math.pow(apples[i].x - snakes[i][0].x, 2) + Math.pow(apples[i].y - snakes[i][1].y, 2));
                let difference = newDistanceToApple - currentDistanceToApple;
                if (difference < 0) {
                    snakeBrains.population[i].fitness += 0.05;
                } else {
                    snakeBrains.population[i].fitness -= 0.01;
                }
            }
        }
    }
    drawNetwork(bestIndex);
}

function advanceGeneration() {
    playGeneration();
    snakeBrains.cullAndBreed();
}

let directionDisp = [0, 0];
let maxMovesDisp = 100;
let appleDisp = {
    x: w / 2 + 2,
    y: h / 2
};
let snakeDisp = [{
    x: w / 2,
    y: h / 2
}, {
    x: w / 2 - 1,
    y: h / 2
}, {
    x: w / 2 - 2,
    y: h / 2
}, {
    x: w / 2 - 3,
    y: h / 2
}];

setInterval(function () {
    let inputs = [w - snakeDisp[0].x, snakeDisp[0].x, h - snakeDisp[0].y, snakeDisp[0].y, Math.sqrt(Math.pow(Math.max(0, w - snakeDisp[0].x), 2) + Math.pow(Math.max(0, snakeDisp[0].y), 2)), Math.sqrt(Math.pow(Math.max(0, snakeDisp[0].x), 2) + Math.pow(Math.max(0, snakeDisp[0].y), 2)), Math.sqrt(Math.pow(Math.max(0, snakeDisp[0].x), 2) + Math.pow(Math.max(0, (h - snakeDisp[0].y)), 2)), Math.sqrt(Math.pow(Math.max(0, (w - snakeDisp[0].x)), 2) + Math.pow(Math.max(0, (h - snakeDisp[0].y)), 2))];
    inputs.push(appleDisp.x - snakeDisp[0].x, snakeDisp[0].x - appleDisp.x, appleDisp.y - snakeDisp[0].y, snakeDisp[0].y - appleDisp.y);
    inputs.push(Math.sqrt(Math.pow(Math.max(appleDisp.x - snakeDisp[0].x, 0), 2) + Math.pow(Math.max(appleDisp.y - snakeDisp[0].y, 0), 2)), Math.sqrt(Math.pow(Math.max(snakeDisp[0].x - appleDisp.x, 0), 2) + Math.pow(Math.max(appleDisp.y - snakeDisp[0].y, 0), 2)), Math.sqrt(Math.pow(Math.max(appleDisp.x - snakeDisp[0].x, 0), 2) + Math.pow(Math.max(snakeDisp[0].y - appleDisp.y, 0), 2)), Math.sqrt(Math.pow(Math.max(snakeDisp[0].x - appleDisp.x, 0), 2) + Math.pow(Math.max(snakeDisp[0].y - appleDisp.y, 0), 2)));
    for (let i = 0; i < inputs.length; i++) {
        inputs[i] = Math.max(0, inputs[i]);
    }
    let output = snakeBrains.population[bestIndex].getOutput(inputs);
    directionDisp = validNewDirection(directionDisp, dirs[indexOfMax(output)]);
    let result = updateSnakeAndApple(snakeDisp, appleDisp, directionDisp, snakeBrains.population[bestIndex].fitness);
    maxMovesDisp--;
    if (result == false || maxMovesDisp == 0) {
        snakeDisp = [{
            x: w / 2,
            y: h / 2
        }, {
            x: w / 2 - 1,
            y: h / 2
        }, {
            x: w / 2 - 2,
            y: h / 2
        }, {
            x: w / 2 - 3,
            y: h / 2
        }];
        appleDisp = {
            x: w / 2 + 2,
            y: h / 2
        };
        directionDisp = [0, 0];
        maxMovesDisp = 100;
    } else {
        snakeDisp = result[0];
        appleDisp = result[1];
    }
    gameCanvas.fillStyle = "rgba(0,0,0,1)";
    gameCanvas.fillRect(0, 0, 400, 400);
    dispApple(appleDisp, gameCanvas);
    dispSnake(snakeDisp, gameCanvas);
}, 100);

setInterval(advanceGeneration, 3000);

function drawNetwork(index) {
    const nCanvas = document.getElementById("network").getContext("2d");
    nCanvas.fillStyle = "rgba(0.8,0.8,0.9,1)";
    nCanvas.fillRect(0, 0, 400, 400);
    for (let i = 0; i < snakeBrains.population[index].ins; i++) {
        nCanvas.fillStyle = "lightblue";
        nCanvas.fillRect(20, (i + 2) * (400 / (4 + snakeBrains.population[index].ins)), 10, 10);
    }
    for (let i = 0; i < snakeBrains.population[index].outs; i++) {
        nCanvas.fillStyle = "lightgreen";
        nCanvas.fillRect(360, (i + 2) * (400 / (4 + snakeBrains.population[index].outs)), 10, 10);
    }
    for (let i = 0; i < snakeBrains.population[index].connections.length; i++) {
        if (snakeBrains.population[index].connections[i][4]) {
            nCanvas.strokeStyle = (snakeBrains.population[index].connections[i][2] > 0 ? "rgba(255,0,0," : "rgba(0,0,255,") + Math.abs(snakeBrains.population[index].connections[i][2] / 2).toString() + ")";
            if (snakeBrains.population[index].connections[i][1] > snakeBrains.population[index].ins + snakeBrains.population[index].outs) {
                nCanvas.fillStyle = "purple";
                nCanvas.fillRect(40 + (snakeBrains.population[index].connections[i][1] - (snakeBrains.population[index].ins + snakeBrains.population[index].outs)) * 10, snakeBrains.population[index].connections[i][3] * 2, 10, 10);
                if (snakeBrains.population[index].connections[i][0] > snakeBrains.population[index].ins + snakeBrains.population[index].outs) {
                    nCanvas.moveTo(50 + 5 + (snakeBrains.population[index].connections[i][0] - (snakeBrains.population[index].ins + snakeBrains.population[index].outs)) * 10, snakeBrains.population[index].connections[i][3] * 2);
                    nCanvas.lineTo(40 + 5 + (snakeBrains.population[index].connections[i][1] - (snakeBrains.population[index].ins + snakeBrains.population[index].outs)) * 10, snakeBrains.population[index].connections[i][3] * 2);
                    nCanvas.stroke();
                } else {
                    nCanvas.moveTo(30, 5 + (snakeBrains.population[index].connections[i][0] + 1) * (400 / (4 + snakeBrains.population[index].ins)));
                    nCanvas.lineTo(40 + (5 + snakeBrains.population[index].connections[i][1] - (snakeBrains.population[index].ins + snakeBrains.population[index].outs)) * 10, snakeBrains.population[index].connections[i][3] * 2);
                    nCanvas.stroke();
                }
            } else if (snakeBrains.population[index].connections[i][0] > snakeBrains.population[index].ins + snakeBrains.population[index].outs) {
                nCanvas.moveTo(50 + 5 + (snakeBrains.population[index].connections[i][0] - (snakeBrains.population[index].ins + snakeBrains.population[index].outs)) * 10, snakeBrains.population[index].connections[i][3] * 2);
                nCanvas.lineTo(360, 5 + (snakeBrains.population[index].connections[i][1] - snakeBrains.population[index].ins + 1) * (400 / (4 + snakeBrains.population[index].outs)));
                nCanvas.stroke();
            } else {
                nCanvas.moveTo(30, 5 + (snakeBrains.population[index].connections[i][0] + 1) * (400 / (4 + snakeBrains.population[index].ins)));
                nCanvas.lineTo(360, 5 + (snakeBrains.population[index].connections[i][1] - snakeBrains.population[index].ins + 1) * (400 / (4 + snakeBrains.population[index].outs)));
                nCanvas.stroke();
            }
        }
    }
}
