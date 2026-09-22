// Existing editing tools operate on the active shape through points/shapeType.
let inactiveShapes = [];
let activeShapeId = 1;
let activeShapeFinalized = false;
let activeShapeName = '';

function normalizeShapeName(name) {
    return typeof name === 'string' ? name.trim().slice(0, 80) : '';
}

function renameActiveShape(name) {
    checkAndSaveState();
    activeShapeName = normalizeShapeName(name);
    updateShapeList();
    checkAndSaveState();
}

function getActiveShape() {
    return { points, shapeType, id: activeShapeId, finalized: activeShapeFinalized, name: activeShapeName };
}

function getSceneShapes() {
    return [...inactiveShapes, getActiveShape()];
}

// Finished shapes remain editable, but new drawing never extends them.
function beginIndependentDrawing(type = shapeType) {
    if (!activeShapeFinalized) return;
    checkAndSaveState();
    if (points.length) inactiveShapes.push(getActiveShape());
    activeShapeId = Math.max(0, ...inactiveShapes.map(shape => shape.id)) + 1;
    points = [];
    activeShapeName = '';
    activeShapeFinalized = false;
    selectedIndices.clear();
    selectionBox = null;
    isDraggingPoint = false;
    setShapeType(type);
    updatePointsList();
}

function chooseDrawingType(type) {
    cancelMeasurement();
    cancelPresetPlacement();
    beginIndependentDrawing(type);
    setShapeType(type);
    mode = 'add';
    document.querySelectorAll('.mode-btn').forEach(button => {
        button.classList.remove('active');
        if (button.dataset.mode === mode) button.classList.add('active');
    });
}

function finalizeActiveShape() {
    if (points.length < 3) { alert(t('msg_min_points')); return; }
    cancelMeasurement();
    cancelPresetPlacement();
    checkAndSaveState();
    activeShapeFinalized = true;
    mode = 'move';
    isDraggingPoint = false;
    selectionBox = null;
    selectedIndices.clear();
    document.querySelectorAll('.mode-btn').forEach(button => {
        button.classList.remove('active');
        if (button.dataset.mode === mode) button.classList.add('active');
    });
    updatePointsList();
    checkAndSaveState();
    refreshSceneCode();
}

function updateShapeList() {
    const select = document.getElementById('shapeList');
    select.innerHTML = '';
    getSceneShapes().forEach((shape, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = shape.name ? `${shape.name} (${shape.points.length})` : t('shape_item', { n: shape.id, count: shape.points.length });
        if (shape.finalized) option.textContent += ' ✓';
        select.appendChild(option);
    });
    select.value = inactiveShapes.length;
    document.getElementById('shapeName').value = activeShapeName;
}

function activateShape(index) {
    if (!Number.isInteger(index) || index < 0 || index >= inactiveShapes.length) return;
    cancelMeasurement();
    cancelPresetPlacement();
    checkAndSaveState();
    const next = inactiveShapes.splice(index, 1)[0];
    if (points.length) inactiveShapes.push(getActiveShape());
    points = next.points;
    activeShapeName = normalizeShapeName(next.name);
    activeShapeId = next.id;
    activeShapeFinalized = next.finalized === true;
    setShapeType(next.shapeType);
    selectedIndices.clear();
    updatePointsList();
    checkAndSaveState();
}

function deleteActiveShape() {
    cancelMeasurement();
    cancelPresetPlacement();
    checkAndSaveState();
    const next = inactiveShapes.pop() || { points: [], shapeType: 'convex' };
    points = next.points;
    activeShapeName = normalizeShapeName(next.name);
    activeShapeId = next.id || 1;
    activeShapeFinalized = next.finalized === true;
    setShapeType(next.shapeType);
    selectedIndices.clear();
    updatePointsList();
    checkAndSaveState();
    refreshSceneCode();
}

function placePreset(world) {
    const vertices = positionedPreset(world);
    checkAndSaveState();
    if (points.length) inactiveShapes.push(getActiveShape());
    activeShapeId = Math.max(0, ...inactiveShapes.map(shape => shape.id)) + 1;
    points = vertices;
    activeShapeName = '';
    activeShapeFinalized = true;
    setShapeType('convex');
    selectedIndices = new Set(points.map((_, i) => i));
    mode = 'move';
    document.querySelectorAll('.mode-btn').forEach(button => {
        button.classList.remove('active');
        if (button.dataset.mode === mode) button.classList.add('active');
    });
    cancelPresetPlacement();
    updatePointsList();
    checkAndSaveState();
    generateCode();
}

function refreshSceneCode() {
    if (getSceneShapes().some(shape => shape.points.length >= 3)) generateCode();
    else document.getElementById('codeOutput').textContent = t('msg_code_placeholder');
}

function drawInactiveShapes() {
    ctx.save();
    ctx.strokeStyle = '#829ce8';
    ctx.fillStyle = 'rgba(130, 156, 232, 0.12)';
    ctx.lineWidth = 1.5 / camera.zoom;
    inactiveShapes.forEach(shape => {
        const vertices = shape.shapeType === 'convex' ? getConvexHull([...shape.points]) : shape.points;
        if (!vertices.length) return;
        ctx.beginPath();
        vertices.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    });
    ctx.restore();
}
