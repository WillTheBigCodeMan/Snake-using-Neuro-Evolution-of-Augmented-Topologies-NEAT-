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
            this.population[i] = new topology(null, ins, outs, this, nodes);
            for (let j = 0; j < 10; j++) {
                this.population[i].mutate(0.5);
            }
        }
    }
    cullAndBreed(){

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
        }
        return output;
    }
    mutate(n) {
        let x = Math.random();
        if (n != null) {
            x = n;
        }
        if (x < 0.15) {
            let choice = Math.floor(Math.random() * this.connections.length);
            const store = this.connections[choice];
            let connectionNumber = -1;
            for (let i = 0; i < this.population.genes.length; i++) {
                if (this.population.genes[i][0] == this.nodes.length + 1 && this.population.genes[i][1] == store[1]) {
                    connectionNumber = this.population.genes[2] - 1;
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
            this.nodes.push(this.nodes.length + 2);
            console.log("Node");
        } else if (x < 0.45) {
            let choice = Math.floor(Math.random() * this.connections.length);
            this.connections[choice][2] += (Math.random() * 0.4) - 0.2;
            console.log("Weight Mutation");
        } else if (x < 0.6) {
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
                    console.log("Connection", choice1, choice2);
                } else {
                    this.mutate(0.5);
                }
            }
        } else if (x < 0.8) {
            let choice = Math.floor(Math.random() * this.connections.length);
            this.connections[choice][2] = (Math.random() * 4) - 2;
            console.log("Weight Randomised");
        } else {
            let choice = Math.floor(Math.random() * this.connections.length);
            this.connections[choice][4] = !this.connections[choice][4];
            console.log("Disabled/ Enabled");
        }
    }
}

function distanceOfTopologies(t1,t2){
    return 1; // MAKE THIS CODE ICL
}

const sigmoid = (n) => (1 / (1 + Math.pow(Math.E, -1 * n)));

let snakeBrains = new population(4, 4, 20);

let w = 12;
let h = 12;

let wS = 400 / w;
let hS = 400 / h;

const gameCanvas = document.getElementById("game").getContext("2d");

let snakes = new Array(snakeBrains.population.length);
let apples = new Array(snakes.length);
let directions = new Array(snakes.length);
let maxMoves = new Array(snakes.length);
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
            console.log("There has been a mistake");
            return true;
        }
    }
    return false;
}

function validNewDirection(d1, d2) {
    if((d1[0] + d1[1] == 0 && d2[0] == -1)){
        return d1;
    } else if (d1[0] + d1[1] == 0){
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

function indexOfMax(arr){
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
                let inputs = [2, 1, 4, 5]; // MAKE THIS BIT BETTER ICL
                let output = snakeBrains.population[i].getOutput(inputs);
                directions[i] = validNewDirection(directions[i], dirs[indexOfMax(output)]);
                let result = updateSnakeAndApple(snakes[i], apples[i], directions[i], snakeBrains.population[i].fitness);
                maxMoves[i] --;
                if (result == false||maxMoves[i] == 0) {
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
                    if(result[2] > snakeBrains.population[i].fitness){
                        maxMoves[i] += 100;
                    }
                    snakeBrains.population[i].fitness = result[2];
                }
            }
        }
    }
    console.log(snakeBrains);
}

playGeneration();
gameCanvas.fillStyle = "rgba(0,0,0,1)";
gameCanvas.fillRect(0, 0, 400, 400);
dispApple(apples[0], gameCanvas);
dispSnake(snakes[0], gameCanvas);