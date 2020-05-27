class SplineCanvas {
    constructor(width, height, elem) {
        this.canvas = elem;
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        this.color = 'blue';
        this.ctx.fillStyle = 'red';
        this.points = [];
    }

    getPoints() { return this.points; }

    drawCurve(curve, delay, pause) {
        if (!delay) delay = 10;
        if (!pause) pause = delay;
        let i = 0;

        let delayDraw = () => {
            if (i >= curve.length - 1) return;
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.color;
            this.ctx.moveTo(curve[i][0], curve[i][1]);
            this.ctx.lineTo(curve[i + 1][0], curve[i + 1][1]);
            this.ctx.stroke();
            ++i;
            setTimeout(delayDraw, delay);
        }
        setTimeout(delayDraw, pause);
    }

    mouseDownHandler() {
        let points = [];
        let addPoints = () => {
            this.points.push({ x: event.offsetX, y: event.offsetY });
            points.push({ x: event.offsetX, y: event.offsetY });

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            points.forEach(point => {
                this.ctx.fillRect(point.x, point.y, 8, 8);
            });
        }
        this.canvas.addEventListener('mousedown', addPoints);
    }
}

function buildBSpline(t, degree, points, knots, weights, result) {
    let i, j, s, l;
    let n = points.length;
    let d = points[0].length;

    if (degree < 1) {
        alert('Недостаточно точек для построения сплайна!');
        throw new Error('Недостаточно точек для построения сплайна!');
    }
    if (degree > (n - 1)) {
        alert('Степень полинома должна быть <= количеству точек - 1');
        throw new Error('Степень полинома должна быть <= количеству точек - 1');
    }

    if (!weights) {
        weights = [];
        for (i = 0; i < n; i++) {
            weights[i] = 1;
        }
    }

    if (!knots) {
        let knots = [];
        for (i = 0; i < n + degree + 1; i++) {
            knots[i] = i;
        }
    } else {
        if (knots.length !== n + degree + 1) {
            alert('Длинна вектора не правильная');
            throw new Error('Длинна вектора не правильная');
        }
    }

    let domain = [
        degree,
        knots.length - 1 - degree
    ];

    let low = knots[domain[0]];
    let high = knots[domain[1]];
    t = t * (high - low) + low;

    if (t < low || t > high) {
        alert('out of bounds');
        throw new Error('out of bounds');
    }

    for (s = domain[0]; s < domain[1]; s++) {
        if (t >= knots[s] && t <= knots[s + 1]) {
            break;
        }
    }

    let v = [];
    for (i = 0; i < n; i++) {
        v[i] = [];
        for (j = 0; j < d; j++) {
            v[i][j] = points[i][j] * weights[i];
        }
        v[i][d] = weights[i];
    }

    let alpha;
    for (l = 1; l <= degree + 1; l++) {
        for (i = s; i > s - degree - 1 + l; i--) {
            alpha = (t - knots[i]) / (knots[i + degree + 1 - l] - knots[i]);
            for (j = 0; j < d + 1; j++) {
                v[i][j] = (1 - alpha) * v[i - 1][j] + alpha * v[i][j];
            }
        }
    }

    var result = result || [];
    for (i = 0; i < d; i++) {
        result[i] = v[s][i] / v[s][d];
    }

    return result;
}


let element = document.querySelector('#canvas');

let canvasSpline = new SplineCanvas(400, 400, element);
canvasSpline.mouseDownHandler();


let btn = document.querySelector('#btn');
let knots = [];

class BSpline {
    constructor(pointsArr, order) {
        this.points = [];
        this.setPoints(pointsArr);
        this.order = order;
        this.knotsVector = [];
        this.setKnots();
    }

    setKnots() {
        for (let i = 0; i < this.points.length + this.order + 1; i++) {
            this.knotsVector.push(i);
        }
    }

    setPoints(pointsArr) {
        for (let i = 0; i < pointsArr.length; i++) {
            this.points.push([pointsArr[i].x, pointsArr[i].y]);
        }
    }
}

btn.addEventListener('mousedown', () => {
    let bspline = new BSpline(canvasSpline.getPoints(), 2);
    let bsplineCurve = [];

    for (let t = 0; t < 1; t += 0.01) {
        let point = buildBSpline(t, bspline.order, bspline.points, bspline.knotsVector);
        console.log(bspline.order, bspline.points, bspline.knotsVector);
        bsplineCurve.push(point);
    }

    canvasSpline.drawCurve(bsplineCurve, 10, 10, bspline.points.length);
});
