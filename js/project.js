function resetPhysics() {
    document.getElementById('density').value = 0.5;
    document.getElementById('restitution').value = 0.1;
    document.getElementById('friction').value = 0.2;
    document.getElementById('group').value = 1;
    document.getElementById('sensor').checked = false;
    document.getElementById('awake').checked = true;
}

function saveProject() {
    const projectData = {
        version: 2,
        showFixtureDebug: document.getElementById('showFixtureDebug').checked,
        shapes: getSceneShapes(),
        points: points,
        shapeType: shapeType,
        physics: {
            density: document.getElementById('density').value,
            restitution: document.getElementById('restitution').value,
            friction: document.getElementById('friction').value,
            group: document.getElementById('group').value,
            sensor: document.getElementById('sensor').checked,
            awake: document.getElementById('awake').checked
        }
    };

    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "fixture_data.json";
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadProject(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);

            const shapes = data.shapes ?? [{ points: data.points, shapeType: data.shapeType || 'convex' }];
            if (!Array.isArray(shapes) || !shapes.length || shapes.some(shape =>
                !shape || !Array.isArray(shape.points) || !['convex', 'concave'].includes(shape.shapeType) ||
                shape.points.some(p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y)))) {
                throw new Error('Invalid project shapes');
            }
            checkAndSaveState();
            restoreScene(shapes);
            document.getElementById('showFixtureDebug').checked = data.showFixtureDebug === true;
            updateDrawCode();

            if (data.physics) {
                document.getElementById('density').value = data.physics.density ?? 0.5;
                document.getElementById('restitution').value = data.physics.restitution ?? 0.1;
                document.getElementById('friction').value = data.physics.friction ?? 0.2;
                document.getElementById('group').value = data.physics.group ?? 1;
                document.getElementById('sensor').checked = data.physics.sensor || false;
                document.getElementById('awake').checked = data.physics.awake ?? true;
            }

            selectedIndices.clear();
            updatePointsList();
            checkAndSaveState();
            refreshSceneCode();

            e.target.value = '';

        } catch (err) {
            console.error("Yükleme Hatası:", err);
            alert(t('msg_load_error'));
        }
    };

    reader.readAsText(file);
}
