function restoreScene(shapes) {
    cancelMeasurement();
    cancelPresetPlacement();
    const restored = JSON.parse(JSON.stringify(shapes));
    restored.forEach((shape, i) => {
        shape.id = Number.isInteger(shape.id) && shape.id > 0 ? shape.id : i + 1;
        shape.finalized = typeof shape.finalized === 'boolean' ? shape.finalized : shape.points.length >= 3;
        shape.name = normalizeShapeName(shape.name);
    });
    const active = restored.pop() || { points: [], shapeType: 'convex' };
    inactiveShapes = restored;
    points = active.points;
    activeShapeName = normalizeShapeName(active.name);
    activeShapeId = active.id || 1;
    activeShapeFinalized = active.finalized === true;
    setShapeType(active.shapeType);
}

let historyStack = [];
let historyStepIndex = -1;

// Orijinal noktaları kopyalayıp hafızaya alan fonksiyon
function saveHistoryState() {
    if (typeof points === 'undefined') return;
    historyStepIndex++;
    historyStack = historyStack.slice(0, historyStepIndex);
    historyStack.push(JSON.parse(JSON.stringify(getSceneShapes())));
}



// Geri Al (Undo)
function performUndo() {
    if (historyStepIndex > 0) {
        historyStepIndex--;
        restoreScene(historyStack[historyStepIndex]);
        if (typeof selectedIndices !== 'undefined') selectedIndices.clear();
        if (typeof updatePointsList === 'function') updatePointsList();
        refreshSceneCode();
    }
}

// İleri Al (Redo)
function performRedo() {
    if (historyStepIndex < historyStack.length - 1) {
        historyStepIndex++;
        restoreScene(historyStack[historyStepIndex]);
        if (typeof selectedIndices !== 'undefined') selectedIndices.clear();
        if (typeof updatePointsList === 'function') updatePointsList();
        refreshSceneCode();
    }
}

// İşlemler bittiğinde (Tıklama veya Tuşa basma) değişikliği algıla ve kaydet
function checkAndSaveState() {
    if (typeof points === 'undefined') return;
    const currentString = JSON.stringify(getSceneShapes());
    const lastSavedString = JSON.stringify(historyStack[historyStepIndex]);
    
    // Eğer sahnede gerçekten bir değişiklik olduysa hafızaya al
    if (currentString !== lastSavedString) {
        saveHistoryState();
    }
}

// Mouse ile taşıma veya nokta ekleme bitince durumu kontrol et
window.addEventListener('mouseup', () => {
    setTimeout(checkAndSaveState, 50); 
});

// Klavyeden el çekildiğinde (Delete ile silme veya ok tuşlarıyla taşıma bitince) kontrol et
window.addEventListener('keyup', (e) => {
    // Geri/İleri alma kısayolları basılmadıysa kontrol et
    if (!e.ctrlKey) {
        setTimeout(checkAndSaveState, 50);
    }
});

// Kısayol Tuşlarını (Ctrl+Z ve Ctrl+Shift+Z) Dinleme
window.addEventListener('keydown', (e) => {
    // Kullanıcı bir input kutusuna değer giriyorsa iptal et
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        return;
    }

    if (e.ctrlKey && e.shiftKey && (e.key === 'Z' || e.key === 'z')) {
        e.preventDefault();
        performRedo();
    } else if (e.ctrlKey && (e.key === 'Z' || e.key === 'z')) {
        e.preventDefault();
        performUndo();
    }
}, true);
