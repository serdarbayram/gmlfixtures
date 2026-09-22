function generateCode() {
    const shapes = getSceneShapes().filter(shape => shape.points.length);
    if (!shapes.length) { alert(t('msg_min_points')); return; }
    if (shapes.some(shape => shape.points.length < 3)) {
        alert(t('msg_incomplete_shape'));
        return;
    }
    const props = {
        density: document.getElementById('density').value,
        restitution: document.getElementById('restitution').value,
        friction: document.getElementById('friction').value,
        group: document.getElementById('group').value,
        sensor: document.getElementById('sensor').checked,
        awake: document.getElementById('awake').checked
    };
    let code = `${t('code_fixture_create')}\nvar fix;\n\n`;
    for (const [index, shape] of shapes.entries()) {
        const vertices = shape.shapeType === 'convex' ? getConvexHull([...shape.points]) : shape.points;
        const split = shape.shapeType === 'concave' || vertices.length > 8;
        const polygons = split ? triangulatePolygon(vertices) : [vertices];
        if (split && polygons.length !== vertices.length - 2) {
            alert(t('msg_triangulation_error'));
            return;
        }
        code += `${t('code_shape', { n: index + 1 })}\n`;
        if (split) code += `${t(shape.shapeType === 'concave' ? 'code_concave_split' : 'code_polygon_split', { n: polygons.length })}\n`;
        polygons.forEach((polygon, part) => {
            if (split) code += `${t('code_part', { n: part + 1 })}\n`;
            code += 'fix = physics_fixture_create();\nphysics_fixture_set_polygon_shape(fix);\n';
            polygon.forEach(p => {
                code += `physics_fixture_add_point(fix, ${Number(p.x.toFixed(6))}, ${Number(p.y.toFixed(6))});\n`;
            });
            code += generatePropsCode('fix', props);
            code += 'physics_fixture_bind(fix, id);\nphysics_fixture_delete(fix);\n\n';
        });
    }
    document.getElementById('codeOutput').innerText = code;
}

        function generatePropsCode(varName, p) {
            return `physics_fixture_set_density(${varName}, ${p.density});
physics_fixture_set_restitution(${varName}, ${p.restitution});
physics_fixture_set_friction(${varName}, ${p.friction});
physics_fixture_set_collision_group(${varName}, ${p.group});
physics_fixture_set_sensor(${varName}, ${p.sensor});
physics_fixture_set_awake(${varName}, ${p.awake});
physics_fixture_set_linear_damping(${varName}, 0.1);
physics_fixture_set_angular_damping(${varName}, 0.1);
`;
        }

        function copyCode(outputId = 'codeOutput', buttonId = 'copyBtn') {
            const range = document.createRange();
            range.selectNode(document.getElementById(outputId));
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            const btn = document.getElementById(buttonId);
                    btn.innerText = t('btn_copied');
            setTimeout(() => btn.innerText = t('btn_copy'), 1500);
        }

function updateDrawCode() {
    const enabled = document.getElementById('showFixtureDebug').checked;
    document.getElementById('drawCodePanel').hidden = !enabled;
    document.getElementById('drawCodeOutput').textContent = enabled
        ? 'draw_self();\ndraw_set_colour(c_lime);\nphysics_draw_debug();' : '';
}
