function updateWarningMsg() {
    if (measurement) {
        document.getElementById('warningMsg').textContent = t(measurement.start ? 'measure_second' : 'measure_first');
        return;
    }
    if (pendingPreset) {
        document.getElementById('warningMsg').textContent = t('preset_placing');
        return;
    } 
    const warning = document.getElementById('warningMsg');
    if(shapeType === 'convex') {
        warning.innerHTML = t('msg_convex');
        warning.style.borderLeftColor = "#ffc107";
        warning.style.color = "#ffca2c";
    } else {
        warning.innerHTML = t('msg_concave');
        warning.style.borderLeftColor = "#ff4757";
        warning.style.color = "#ff6b81";
    }
}

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}

function setShapeType(type) {
    shapeType = type;
    const btns = document.querySelectorAll('.shape-type-btn');
    btns.forEach(b => b.classList.remove('active'));
    if(type === 'convex') btns[0].classList.add('active');
    if(type === 'concave') btns[1].classList.add('active');
    updateWarningMsg();
}

function handleFile(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
            cancelMeasurement();
            sprite = { img: img, w: img.width, h: img.height };
            document.getElementById('spriteInfo').removeAttribute('data-i18n');
            document.getElementById('spriteInfo').innerText = `${file.name} (${sprite.w}x${sprite.h})`;
            camera.zoom = Math.min((canvas.width*0.8)/sprite.w, (canvas.height*0.8)/sprite.h);
            camera.x = canvas.width/2;
            camera.y = canvas.height/2;
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function getScreenPos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function getWorldPos(screenX, screenY) {
    return {
        x: (screenX - camera.x) / camera.zoom,
        y: (screenY - camera.y) / camera.zoom
    };
}

function alignPoints(axis) {
    if (selectedIndices.size < 2) return;
    let sum = 0;
    selectedIndices.forEach(index => {
        sum += (axis === 'horizontal') ? points[index].y : points[index].x;
    });
    let avg = sum / selectedIndices.size;
    if (snapToGrid) {
        avg = Math.round(avg / gridSize) * gridSize;
    } else {
        avg = Math.round(avg);
    }
    selectedIndices.forEach(index => {
        if (axis === 'horizontal') points[index].y = avg;
        else points[index].x = avg;
    });
    updatePointsList();
}

function onMouseDown(e) {
    // --- YENİ EKLENEN: Çizim alanına tıklanınca aktif kutucuklardan odağı tamamen çıkar ---
    if (document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
    }
    e.preventDefault();

    const s = getScreenPos(e);
    const w = getWorldPos(s.x, s.y);

    if(e.button === 1) {
        isPanning = true;
        lastMouse = { x: s.x, y: s.y };
        return;
    }

    if(e.button === 0) {
        if (measurement) {
            measureAt(w, s);
            return;
        }
        if (pendingPreset) {
            placePreset(w);
            return;
        }

        if(mode === 'add') {
            beginIndependentDrawing();
            let px = w.x, py = w.y;
            if(snapToGrid) {
                px = Math.round(px/gridSize)*gridSize;
                py = Math.round(py/gridSize)*gridSize;
            }
            points.push({x: px, y: py});
            selectedIndices.clear();
            selectedIndices.add(points.length - 1);
            updatePointsList();
        } 
        else if (mode === 'move' || mode === 'select') {
            let minDist = 10 / camera.zoom;
            let clickedIndex = -1;

            points.forEach((p, i) => {
                const d = Math.hypot(p.x - w.x, p.y - w.y);
                if(d < minDist) {
                    minDist = d;
                    clickedIndex = i;
                }
            });

            if(clickedIndex !== -1) {
                if (!selectedIndices.has(clickedIndex)) {
                    if (!e.shiftKey) selectedIndices.clear();
                    selectedIndices.add(clickedIndex);
                }
                isDraggingPoint = true;
                lastMouse = { x: w.x, y: w.y }; 
                updatePointsList();
            } else {
                if (mode === 'select') {
                    selectionBox = { sx: w.x, sy: w.y, w: 0, h: 0 };
                    if(!e.shiftKey) selectedIndices.clear();
                    updatePointsList();
                } else if (mode === 'move') {
                    selectedIndices.clear();
                    updatePointsList();
                }
            }
        }
    }
}

function onMouseMove(e) {
    const s = getScreenPos(e);
    const w = getWorldPos(s.x, s.y);
    if (measurement) measurement.pointer = s;
    if (pendingPreset) presetPointer = s;

    document.getElementById('mouseX').innerText = Math.round(w.x);
    document.getElementById('mouseY').innerText = Math.round(w.y);

    if(isPanning) {
        const dx = s.x - lastMouse.x;
        const dy = s.y - lastMouse.y;
        camera.x += dx;
        camera.y += dy;
        lastMouse = { x: s.x, y: s.y };
        return;
    }

    if(isDraggingPoint && selectedIndices.size > 0) {
        let dx = w.x - lastMouse.x;
        let dy = w.y - lastMouse.y;

        selectedIndices.forEach(index => {
            points[index].x += dx;
            points[index].y += dy;
        });

        lastMouse = { x: w.x, y: w.y };
        updatePointsList();
    }

    if (mode === 'select' && selectionBox) {
        selectionBox.w = w.x - selectionBox.sx;
        selectionBox.h = w.y - selectionBox.sy;
    }
}

function onMouseUp(e) {
    if (mode === 'select' && selectionBox) {
        const bx = selectionBox.w > 0 ? selectionBox.sx : selectionBox.sx + selectionBox.w;
        const by = selectionBox.h > 0 ? selectionBox.sy : selectionBox.sy + selectionBox.h;
        const bw = Math.abs(selectionBox.w);
        const bh = Math.abs(selectionBox.h);

        points.forEach((p, i) => {
            if (p.x >= bx && p.x <= bx + bw && p.y >= by && p.y <= by + bh) {
                selectedIndices.add(i);
            }
        });

        selectionBox = null;
        updatePointsList();
    }

    if (isDraggingPoint && snapToGrid) {
        selectedIndices.forEach(index => {
            points[index].x = Math.round(points[index].x / gridSize) * gridSize;
            points[index].y = Math.round(points[index].y / gridSize) * gridSize;
        });
        updatePointsList();
    }

    isPanning = false;
    isDraggingPoint = false;
}

function onWheel(e) {
    e.preventDefault();

    const zoomIntensity = 0.1;
    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoomFactor = Math.exp(wheel * zoomIntensity);

    const s = getScreenPos(e);
    const worldBefore = getWorldPos(s.x, s.y);

    camera.zoom *= zoomFactor;
    camera.zoom = Math.max(0.1, Math.min(10, camera.zoom));

    camera.x = s.x - worldBefore.x * camera.zoom;
    camera.y = s.y - worldBefore.y * camera.zoom;

    document.getElementById('zoomLevel').innerText = Math.round(camera.zoom*100) + '%';
}

function changeZoom(delta) {
    const centerS = { x: canvas.width/2, y: canvas.height/2 };
    const worldBefore = getWorldPos(centerS.x, centerS.y);

    let newZoom = camera.zoom;
    if(Math.abs(delta) < 0.5) newZoom *= (1 + delta); 
    else newZoom = delta; 

    newZoom = Math.max(0.1, Math.min(10, newZoom));
    camera.zoom = newZoom;

    camera.x = centerS.x - worldBefore.x * camera.zoom;
    camera.y = centerS.y - worldBefore.y * camera.zoom;

    document.getElementById('zoomLevel').innerText = Math.round(camera.zoom*100) + '%';
}

function resetView() {
    camera.x = canvas.width / 2;
    camera.y = canvas.height / 2;
    camera.zoom = 1;
    if(sprite) {
         camera.zoom = Math.min((canvas.width*0.8)/sprite.w, (canvas.height*0.8)/sprite.h);
    }
    changeZoom(0);
}

function updatePointsList() {
    updateShapeList();
    const list = document.getElementById('pointsList');
    document.getElementById('pointCount').innerText = points.length;
    list.innerHTML = '';

    points.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'point-item';
        if(selectedIndices.has(i)) div.classList.add('selected');

        div.onclick = (e) => {
            if(e.target.classList.contains('point-delete')) return;
            if(!e.ctrlKey && !e.shiftKey) selectedIndices.clear();
            selectedIndices.add(i);
            updatePointsList();
        };

        div.innerHTML = `
            <span>${i+1}: (${Math.round(p.x)}, ${Math.round(p.y)})</span>
            <button class="point-delete" title="${t('delete_point')}" aria-label="${t('delete_point')}" onclick="deletePoint(${i})">×</button>
        `;
        list.appendChild(div);
    });
}

function deletePoint(i) {
    points.splice(i, 1);
    selectedIndices.delete(i);
    selectedIndices.clear(); 
    updatePointsList();
}

function clearAllPoints() {
    points = [];
    activeShapeFinalized = false;
    selectedIndices.clear();
    updatePointsList();
}
