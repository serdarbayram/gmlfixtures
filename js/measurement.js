// Measurements use sprite/world pixels, independent of zoom and grid snapping.
let measurement = null;

function startDiameterMeasurement() {
    cancelPresetPlacement();
    isDraggingPoint = false;
    isPanning = false;
    selectionBox = null;
    measurement = { start: null, pointer: null };
    document.getElementById('cancelMeasurement').hidden = false;
    updateWarningMsg();
}

function cancelMeasurement() {
    measurement = null;
    document.getElementById('cancelMeasurement').hidden = true;
    updateWarningMsg();
}

function getAxisMeasurement(start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    return {
        horizontal,
        end: horizontal ? { x: end.x, y: start.y } : { x: start.x, y: end.y },
        distance: Math.abs(horizontal ? dx : dy)
    };
}

function measureAt(world, screen) {
    if (!measurement.start) {
        measurement.start = { ...world };
        measurement.pointer = screen;
        updateWarningMsg();
        return;
    }
    const { distance } = getAxisMeasurement(measurement.start, world);
    if (distance < 2 || distance > 10000) {
        alert(t('measure_invalid'));
        return;
    }
    document.getElementById('presetWidth').value = Number(distance.toFixed(2));
    cancelMeasurement();
}

function drawMeasurement() {
    if (!measurement?.start || !measurement.pointer) return;
    const start = measurement.start;
    const result = getAxisMeasurement(start, getWorldPos(measurement.pointer.x, measurement.pointer.y));
    const end = result.end;
    const tick = 6 / camera.zoom;
    ctx.save();
    ctx.strokeStyle = '#ffd166';
    ctx.fillStyle = '#ffd166';
    ctx.lineWidth = 2 / camera.zoom;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    for (const point of [start, end]) {
        ctx.moveTo(point.x - (result.horizontal ? 0 : tick), point.y - (result.horizontal ? tick : 0));
        ctx.lineTo(point.x + (result.horizontal ? 0 : tick), point.y + (result.horizontal ? tick : 0));
    }
    ctx.stroke();
    ctx.font = `bold ${14 / camera.zoom}px Segoe UI, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    const label = `${Number(result.distance.toFixed(2))} px`;
    const x = (start.x + end.x) / 2 + 10 / camera.zoom;
    const y = (start.y + end.y) / 2 - 10 / camera.zoom;
    ctx.lineWidth = 4 / camera.zoom;
    ctx.strokeStyle = '#111';
    ctx.strokeText(label, x, y);
    ctx.fillText(label, x, y);
    ctx.restore();
}
