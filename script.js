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
        this.bestIndex = 0;
    }
    cullAndBreed() {
        let total = 0;
        let matingPool = [];
        let bestFitness = this.population[0].fitness;
        for (let i = 1; i < this.population.length; i++) {
            if (this.population[i].fitness > bestFitness) {
                bestFitness = this.population[i].fitness;
                this.bestIndex = i;
            }
            total += this.population[i].fitness;
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
        console.log(this.generationNumber, bestFitness, total / this.population.length, this.bestIndex);
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
                    this.nodes.push(this.nodes.length);
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
        if (x < 0.01 || x == 3) {
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
                this.mutate(3);
            } else {
                let choice1 = 1 + Math.floor(Math.random() * (this.nodes.length - 1));
                while ((choice1 > this.ins && choice1 <= this.ins + this.outs)) {
                    choice1 = 1 + Math.floor(Math.random() * (this.nodes.length - 1));
                }
                let choice2 = 1 + Math.floor(Math.random() * (this.nodes.length - choice1)) + choice1;
                while (choice2 <= this.ins) {
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

function drawNetwork(t) {
    let nCanvas = document.getElementById("network").getContext("2d");
    nCanvas.fillStyle = "rgb(0,0,0,255)";
    nCanvas.fillRect(0, 0, 400, 400);
    for (let i = 0; i < t.ins; i++) {
        nCanvas.fillStyle = "lightblue";
        nCanvas.fillRect(20, (i + 2) * (400 / (4 + t.ins)), 10, 10);
    }
    for (let i = 0; i < t.outs; i++) {
        nCanvas.fillStyle = "lightgreen";
        nCanvas.fillRect(360, (i + 2) * (400 / (4 + t.outs)), 10, 10);
    }
    for (let i = 0; i < t.connections.length; i++) {
        console.log(i, t.connections[i]);
        if (t.connections[i][4]) {
            nCanvas.strokeStyle = (t.connections[i][2] > 0 ? "rgba(255,0,0," : "rgba(0,0,255,") + Math.abs(t.connections[i][2] / 2).toString() + ")";
        } else {
            nCanvas.strokeStyle = "white";
        }
        if (t.connections[i][1] > t.ins + t.outs) {
            nCanvas.fillStyle = "purple";
            nCanvas.fillRect(40 + (t.connections[i][1] - (t.ins + t.outs)) * 10, t.connections[i][3] * 2, 10, 10);
            if (t.connections[i][0] > t.ins + t.outs) {
                // nCanvas.moveTo(50 + (t.connections[i][0] - (t.ins + t.outs)) * 10, 5 + t.connections[i][3] * 2);
                // nCanvas.lineTo(40 + (t.connections[i][1] - (t.ins + t.outs)) * 10, 5 + t.connections[i][3] * 2);
                // nCanvas.stroke();
                // console.log(i);
            } else {
                // nCanvas.moveTo(30, 5 + (t.connections[i][0] + 1) * (400 / (4 + t.ins)));
                // nCanvas.lineTo(40 + (t.connections[i][1] - (t.ins + t.outs)) * 10, 5 + t.connections[i][3] * 2);
                // nCanvas.stroke();
                // console.log(i);
            }
        } else if (t.connections[i][0] > t.ins + t.outs) {
            // nCanvas.moveTo(50 + (t.connections[i][0] - (t.ins + t.outs)) * 10, 5 + t.connections[i][3] * 2);
            // nCanvas.lineTo(360, 5 + (t.connections[i][1] - t.ins + 1) * (400 / (4 + t.outs)));
            // nCanvas.stroke();
            // console.log(i);
        } else {
            nCanvas.moveTo(30, 5 + (t.connections[i][0] + 1) * (400 / (4 + t.ins)));
            nCanvas.lineTo(360, 5 + (t.connections[i][1] - t.ins + 1) * (400 / (4 + t.outs)));
            nCanvas.stroke();
        }
    }
}

let pop = new population(2, 2, 500);

let points = [];

const lineFunc = (x) => 400 * ((Math.sin((x / 100) + 0.8) * 0.4) + 0.5);

const ctx = document.getElementById("game").getContext("2d")

ctx.fillStyle = "rgba(0,0,0,1)";
ctx.fillRect(0, 0, 400, 400);

for (let i = 0; i < 400; i++) {
    ctx.fillStyle = "white";
    ctx.fillRect(i, lineFunc(i), 2, 2);
}

for (let i = 0; i < 2000; i++) {
    let x = Math.random() * 400;
    let y = Math.random() * 400;
    points.push({
        x: x,
        y: y,
        type: y > lineFunc(x)
    });
    ctx.fillStyle = points[i].type ? "green" : "blue";
    ctx.fillRect(x, y, 2, 2);
}

function advanceGeneration() {
    document.getElementById("network").remove();
    for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < pop.population.length; j++) {
            let output = pop.population[j].getOutput([points[i].x, points[i].y])
            let result = output[0] > output[1];
            if (result == points[i].type) {
                pop.population[j].fitness++;
            }
        }
    }
    pop.cullAndBreed();
    document.getElementById("networkContainer").appendChild(document.createElement("canvas")).id = "network";
    document.getElementById("network").width = "400";
    document.getElementById("network").height = "400";
    drawNetwork(pop.population[pop.bestIndex]);
    console.log(pop.population[pop.bestIndex]);
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, 400, 400);
    for (let i = 0; i < 400; i++) {
        ctx.fillStyle = "white";
        ctx.fillRect(i, lineFunc(i), 2, 2);
    }

    for (let i = 0; i < points.length; i++) {
        let output = pop.population[pop.bestIndex].getOutput([points[i].x, points[i].y])
        let result = output[0] > output[1];
        if (result == points[i].type) {
            ctx.fillStyle = points[i].type ? "green" : "blue";
        } else {
            ctx.fillStyle = "red";
        }
        ctx.fillRect(points[i].x, points[i].y, 2, 2);
    }
}

//setInterval(advanceGeneration, 1000);