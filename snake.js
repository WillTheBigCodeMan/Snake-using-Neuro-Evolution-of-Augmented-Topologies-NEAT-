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