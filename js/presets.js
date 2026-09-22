let pendingPreset = null;
let presetPointer = null;

function createPresetPoints(type, width, height, count, rotation = 0) {
    if (!['circle', 'ellipse', 'rectangle', 'triangle', 'polygon'].includes(type) ||
        !Number.isFinite(width) || !Number.isFinite(height) || width < 2 || height < 2 ||
        width > 10000 || height > 10000 || !Number.isFinite(rotation) ||
        !Number.isInteger(count) || count < 3 || count > 64) {
        throw new Error('Invalid preset parameters');
    }
    let vertices;
    if (type === 'rectangle') {
        vertices = [{ x: -width / 2, y: -height / 2 }, { x: width / 2, y: -height / 2 },
            { x: width / 2, y: height / 2 }, { x: -width / 2, y: height / 2 }];
    } else {
        const n = type === 'triangle' ? 3 : count;
        const radiusY = ['circle', 'polygon', 'triangle'].includes(type) ? width / 2 : height / 2;
        vertices = Array.from({ length: n }, (_, i) => {
            const angle = -Math.PI / 2 + i * 2 * Math.PI / n;
            return { x: Math.cos(angle) * width / 2, y: Math.sin(angle) * radiusY };
        });
    }
    const angle = rotation * Math.PI / 180;
    return vertices.map(p => ({ x: p.x * Math.cos(angle) - p.y * Math.sin(angle),
        y: p.x * Math.sin(angle) + p.y * Math.cos(angle) }));
}

function updatePresetFields() {
    cancelMeasurement();
    const type = document.getElementById('presetType').value;
    document.getElementById('presetHeightRow').hidden = !['rectangle', 'ellipse'].includes(type);
    document.getElementById('presetCountRow').hidden = ['rectangle', 'triangle'].includes(type);
    const label = document.getElementById('presetWidthLabel');
    label.dataset.i18n = ['rectangle', 'ellipse'].includes(type) ? 'preset_width' : 'preset_diameter';
    label.textContent = t(label.dataset.i18n);
    cancelPresetPlacement();
}

function startPresetPlacement() {
    cancelMeasurement();
    try {
        const type = document.getElementById('presetType').value;
        const width = Number(document.getElementById('presetWidth').value);
        const height = ['rectangle', 'ellipse'].includes(type)
            ? Number(document.getElementById('presetHeight').value) : width;
        const count = type === 'rectangle' ? 4 : type === 'triangle' ? 3
            : Number(document.getElementById('presetCount').value);
        const rotation = Number(document.getElementById('presetRotation').value);
        const vertices = createPresetPoints(type, width, height, count, rotation);
        isDraggingPoint = false;
        selectionBox = null;
        pendingPreset = vertices;
        presetPointer = null;
        document.getElementById('cancelPreset').hidden = false;
        updateWarningMsg();
    } catch {
        alert(t('preset_invalid'));
    }
}

function cancelPresetPlacement() {
    pendingPreset = null;
    presetPointer = null;
    document.getElementById('cancelPreset').hidden = true;
    updateWarningMsg();
}

function positionedPreset(world) {
    const x = snapToGrid ? Math.round(world.x / gridSize) * gridSize : world.x;
    const y = snapToGrid ? Math.round(world.y / gridSize) * gridSize : world.y;
    return pendingPreset.map(p => ({ x: p.x + x, y: p.y + y }));
}

function drawPresetPreview() {
    if (!pendingPreset || !presetPointer) return;
    const vertices = positionedPreset(getWorldPos(presetPointer.x, presetPointer.y));
    ctx.save();
    ctx.strokeStyle = '#ffd166';
    ctx.fillStyle = 'rgba(255, 209, 102, 0.15)';
    ctx.lineWidth = 2 / camera.zoom;
    ctx.setLineDash([6 / camera.zoom, 4 / camera.zoom]);
    ctx.beginPath();
    vertices.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffd166';
    vertices.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 / camera.zoom, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}
