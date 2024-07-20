const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const drawBtn = document.getElementById('drawBtn');
const eraseBtn = document.getElementById('eraseBtn');
const pointBtn = document.getElementById('pointBtn');
const colorPicker = document.getElementById('colorPicker');
const playBtn = document.getElementById('playBtn');
const exportGifBtn = document.getElementById('exportGifBtn');
const exportMp4Btn = document.getElementById('exportMp4Btn');
const addFrameBtn = document.getElementById('addFrameBtn');
const framesContainer = document.getElementById('framesContainer');

let isDrawing = false;
let isErasing = false;
let isControlPointMode = false;
let currentColor = '#000000';
let frames = [];
let currentFrameIndex = 0;

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

drawBtn.addEventListener('click', () => {
    isDrawing = true;
    isErasing = false;
    isControlPointMode = false;
});

eraseBtn.addEventListener('click', () => {
    isDrawing = false;
    isErasing = true;
    isControlPointMode = false;
});

pointBtn.addEventListener('click', () => {
    isDrawing = false;
    isErasing = false;
    isControlPointMode = true;
});

colorPicker.addEventListener('input', (event) => {
    currentColor = event.target.value;
});

addFrameBtn.addEventListener('click', addFrame);
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        addFrame();
    }
});

playBtn.addEventListener('click', playAnimation);
exportGifBtn.addEventListener('click', exportGifAnimation);
exportMp4Btn.addEventListener('click', exportMp4Animation);

function startDrawing(event) {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
}

function stopDrawing() {
    isDrawing = false;
    ctx.closePath();
}

function draw(event) {
    if (!isDrawing) return;

    if (isErasing) {
        ctx.clearRect(event.offsetX, event.offsetY, 10, 10);
    } else if (isControlPointMode) {
        // Implementacja trybu punktów kontrolnych
    } else {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 2;
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
    }
}

function addFrame() {
    const frame = canvas.toDataURL();
    frames.push(frame);
    updateFrameBar();
}

function updateFrameBar() {
    framesContainer.innerHTML = '';
    frames.forEach((frame, index) => {
        const frameElement = document.createElement('div');
        frameElement.classList.add('frame');
        frameElement.style.backgroundImage = `url(${frame})`;
        frameElement.addEventListener('click', () => {
            loadFrame(index);
        });
        framesContainer.appendChild(frameElement);
    });
}

function loadFrame(index) {
    const frame = new Image();
    frame.src = frames[index];
    frame.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(frame, 0, 0);
        currentFrameIndex = index;
    };
}

function playAnimation() {
    let index = 0;
    const interval = setInterval(() => {
        if (index >= frames.length) {
            clearInterval(interval);
        } else {
            loadFrame(index);
            index++;
        }
    }, 100);
}

function exportGifAnimation() {
    const gif = new GIF({
        workers: 2,
        quality: 10,
    });

    frames.forEach((frame) => {
        const img = new Image();
        img.src = frame;
        gif.addFrame(img, { delay: 100 });
    });

    gif.on('finished', (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'animation.gif';
        a.click();
    });

    gif.render();
}

function exportMp4Animation() {
    const encoder = new Whammy.Video(30);
    frames.forEach((frame) => {
        const img = new Image();
        img.src = frame;
        img.onload = () => {
            encoder.add(img);
        };
    });

    setTimeout(() => {
        const output = encoder.compile();
        const url = URL.createObjectURL(output);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'animation.webm';
        a.click();
    }, 1000);
}
