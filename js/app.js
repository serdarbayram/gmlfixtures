window.onload = () => {
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');
    setLanguage(getSavedLanguage());
    saveHistoryState();
    updatePresetFields();
    updateDrawCode();

    window.addEventListener('resize', resizeCanvas);
    document.getElementById('spriteFile').addEventListener('change', handleFile);

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    canvas.addEventListener('mouseleave', () => { presetPointer = null; });
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // --- YENİ EKLENEN: Taşıma adımı kutusunda Enter'a basınca odağı kapat ---
    document.getElementById('nudgeStep').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            this.blur();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cancelMeasurement();
            cancelPresetPlacement();
        }
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
            return;
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (selectedIndices.size > 0) {
                points = points.filter((_, i) => !selectedIndices.has(i));
                selectedIndices.clear();
                updatePointsList();
            }
        }

        if (selectedIndices.size > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault(); 

            const step = parseFloat(document.getElementById('nudgeStep').value) || 1;
            let dx = 0, dy = 0;

            if (e.key === 'ArrowUp') dy = -step;
            if (e.key === 'ArrowDown') dy = step;
            if (e.key === 'ArrowLeft') dx = -step;
            if (e.key === 'ArrowRight') dx = step;

            selectedIndices.forEach(index => {
                points[index].x += dx;
                points[index].y += dy;
            });

            updatePointsList();
        }
    });

    document.querySelectorAll('.mode-btn').forEach(b => {
        b.addEventListener('click', function() {
            cancelMeasurement();
            cancelPresetPlacement();
            document.querySelector('.mode-btn.active').classList.remove('active');
            this.classList.add('active');
            mode = this.dataset.mode;
            if(mode !== 'select') selectionBox = null;
            if(mode === 'add') {
                selectedIndices.clear();
                updatePointsList();
            }
        });
    });

    document.getElementById('showGrid').addEventListener('change', e => showGrid = e.target.checked);
    document.getElementById('snapToGrid').addEventListener('change', e => snapToGrid = e.target.checked);
    document.getElementById('gridSize').addEventListener('input', function() {
        gridSize = parseInt(this.value);
        document.getElementById('gridSizeValue').innerText = gridSize + 'px';
    });

    resizeCanvas();
    resetView();
    loop();
};
