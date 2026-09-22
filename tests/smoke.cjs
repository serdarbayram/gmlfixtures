// Dependency-free integration checks with a minimal DOM stub (not a browser test).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const elements = [];
const ids = new Map();
const context2d = new Proxy({}, { get: () => () => {} });
function element(attributes = {}) {
    let text = '';
    const node = {
        attributes, dataset: {}, style: {}, children: [], value: attributes.value || '',
        checked: Object.hasOwn(attributes, 'checked'),
        className: attributes.class || '',
        parentElement: { clientWidth: 1000, clientHeight: 700 },
        addEventListener() {}, appendChild(child) { this.children.push(child); },
        setAttribute(key, value) { this.attributes[key] = value; },
        removeAttribute(key) { delete this.attributes[key]; },
        getContext: () => context2d,
        getBoundingClientRect: () => ({ left: 0, top: 0 }),
        get textContent() { return text; }, set textContent(value) { text = String(value); },
        get innerText() { return text; }, set innerText(value) { text = String(value); },
        get innerHTML() { return text; }, set innerHTML(value) { text = String(value); this.children = []; },
    };
    node.classList = {
        contains: name => node.className.split(' ').includes(name),
        add: name => { node.className += ' ' + name; },
        remove: name => { node.className = node.className.split(' ').filter(x => x !== name).join(' '); },
    };
    for (const [key, value] of Object.entries(attributes)) {
        if (key.startsWith('data-')) node.dataset[key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
    }
    return node;
}
for (const match of html.matchAll(/<[a-z][^>]*>/gi)) {
    const attributes = {};
    for (const attr of match[0].matchAll(/([\w-]+)="([^"]*)"/g)) attributes[attr[1]] = attr[2];
    if (/\schecked[\s>]/.test(match[0])) attributes.checked = '';
    const node = element(attributes);
    elements.push(node);
    if (attributes.id) ids.set(attributes.id, node);
}
const document = {
    documentElement: {}, activeElement: { tagName: 'BODY', blur() {} },
    getElementById: id => { assert(ids.has(id), `Missing DOM id: ${id}`); return ids.get(id); },
    createElement: () => element(),
    querySelectorAll: selector => elements.filter(node => selector.startsWith('[')
        ? Object.hasOwn(node.attributes, selector.slice(1, -1))
        : selector.split('.').filter(Boolean).every(name => node.classList.contains(name))),
    querySelector(selector) { return this.querySelectorAll(selector)[0]; },
};
const storage = new Map();
const timers = [];
const alerts = [];
const sandbox = vm.createContext({ document, console,
    window: { addEventListener() {} },
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    setTimeout: callback => timers.push(callback), requestAnimationFrame() {},
    alert: message => alerts.push(message),
});
const run = code => vm.runInContext(code, sandbox);
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
for (const file of scripts) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), sandbox, { filename: file });
assert(fs.existsSync(path.join(root, 'css/styles.css')));
assert(!html.includes('style='));
assert.equal(run('JSON.stringify(Object.keys(translations.en).sort())'), run('JSON.stringify(Object.keys(translations.tr).sort())'));
for (const match of html.matchAll(/data-i18n(?:-title)?="([^"]+)"/g)) {
    assert(run(`Object.hasOwn(translations.en, ${JSON.stringify(match[1])})`), match[1]);
}
for (const file of scripts) {
    for (const match of fs.readFileSync(path.join(root, file), 'utf8').matchAll(/\bt\('([^']+)'/g)) {
        assert(run(`Object.hasOwn(translations.en, ${JSON.stringify(match[1])})`), match[1]);
    }
}
run('window.onload()');
assert.equal(run('historyStack.length'), 1);
run("setLanguage('tr')");
assert.equal(document.documentElement.lang, 'tr');
assert.equal(run("t('density')"), 'Yoğunluk');
assert.equal(ids.get('codeOutput').textContent, '// Kod buraya gelecek...');
assert.equal(run("t('code_part', { n: 3 })"), '// Parça 3');
run("setLanguage('unknown')");
assert.equal(document.documentElement.lang, 'en');
run("translations.tr.test_fallback = undefined; translations.en.test_fallback = 'Fallback'; setLanguage('tr')");
assert.equal(run("t('test_fallback')"), 'Fallback');
run('points = [{x:0,y:0},{x:80,y:0},{x:0,y:80}]; updatePointsList(); saveHistoryState(); generateCode()');
const gml = ids.get('codeOutput').textContent;
assert(gml.includes('physics_fixture_add_point(fix, 80, 0)'));
const commands = code => code.split('\n').filter(line => !line.startsWith('//')).join('\n');
run("points[1].x = 99; setLanguage('en')");
assert.equal(commands(ids.get('codeOutput').textContent), commands(gml));
assert(ids.get('codeOutput').textContent.startsWith('// Fixture Creation Code'));
run("setShapeType('concave'); generateCode(); setLanguage('tr')");
assert(ids.get('codeOutput').textContent.includes('// İçbükey şekil 1 üçgene bölündü.'));
run('points[1].x = 100; saveHistoryState(); performUndo(); performRedo()');
assert.equal(run('points[1].x'), 100);
ids.get('spriteInfo').removeAttribute('data-i18n');
ids.get('spriteInfo').textContent = 'sprite.png (64x64)';
run("setLanguage('tr')");
assert.equal(ids.get('spriteInfo').textContent, 'sprite.png (64x64)');
sandbox.localStorage.getItem = sandbox.localStorage.setItem = () => { throw Error('Storage disabled'); };
run("setLanguage('en')");
assert.equal(run('getSavedLanguage()'), 'en');
assert.equal(alerts.length, 0);

// Preset geometry is clockwise in canvas coordinates, centered, and rotatable.
for (const type of ['circle', 'ellipse', 'rectangle', 'triangle', 'polygon']) {
    const vertices = run(`createPresetPoints('${type}', 100, 60, 12)`);
    assert.equal(vertices.length, type === 'rectangle' ? 4 : type === 'triangle' ? 3 : 12);
    assert(Math.abs(vertices.reduce((sum, p) => sum + p.x, 0)) < 1e-8);
    assert(Math.abs(vertices.reduce((sum, p) => sum + p.y, 0)) < 1e-8);
    assert(vertices.every(p => Number.isFinite(p.x) && Number.isFinite(p.y)));
    const triangles = run(`triangulatePolygon(createPresetPoints('${type}', 100, 60, 12))`);
    assert.equal(triangles.length, vertices.length - 2);
}
assert(Math.abs(run("createPresetPoints('rectangle', 100, 60, 4, 90)[0].x") - 30) < 1e-8);
for (const args of ["'circle', 0, 20, 8", "'circle', 20, 20, 2", "'circle', 20, 20, 3.5", "'circle', 20, 20, 65", "'invalid', 20, 20, 8", "'circle', NaN, 20, 8"]) {
    assert.throws(() => run(`createPresetPoints(${args})`));
}
run("restoreScene([{points: [], shapeType: 'convex'}]); historyStack = []; historyStepIndex = -1; saveHistoryState()");
ids.get('presetType').value = 'circle';
ids.get('presetCount').value = '12';
run('updatePresetFields(); startPresetPlacement()');
assert.equal(run('points.length'), 0, 'Confirm only arms placement');
assert.equal(run('pendingPreset.length'), 12);
run('camera = {x:100, y:50, zoom:2}; snapToGrid = true; gridSize = 20');
run('onMouseMove({clientX:162, clientY:132}); loop()');
run('onMouseDown({button:0, clientX:162, clientY:132, preventDefault(){}})');
assert.equal(run('points.length'), 12);
assert.equal(run('pendingPreset'), null);
assert(Math.abs(run('points.reduce((sum, p) => sum + p.x, 0) / points.length') - 40) < 1e-8);
assert(Math.abs(run('points.reduce((sum, p) => sum + p.y, 0) / points.length') - 40) < 1e-8);
assert.equal(run('selectedIndices.size'), 12);
assert.equal(run('mode'), 'move');
const firstShape = run('JSON.stringify(points)');
ids.get('presetType').value = 'rectangle';
run('updatePresetFields(); startPresetPlacement(); placePreset({x:200,y:100})');
assert.equal(run('getSceneShapes().length'), 2);
assert.equal(run('points.length'), 4);
assert.equal(run('JSON.stringify(inactiveShapes[0].points)'), firstShape);
const combinedCode = ids.get('codeOutput').textContent;
assert.equal((combinedCode.match(/physics_fixture_create\(\)/g) || []).length, 11);
assert.equal((combinedCode.match(/physics_fixture_bind\(fix, id\)/g) || []).length, 11);
run('performUndo()');
assert.equal(run('getSceneShapes().length'), 1);
assert.equal(run('JSON.stringify(points)'), firstShape);
run('performRedo(); activateShape(0)');
assert.equal(run('JSON.stringify(points)'), firstShape);
assert.equal(run('activeShapeId'), 1);
run('selectedIndices = new Set([0]); alignPoints("horizontal"); deleteActiveShape()');
assert.equal(run('getSceneShapes().length'), 1);
assert.equal(run('points.length'), 4);
run('performUndo()');
assert.equal(run('getSceneShapes().length'), 2);
run('startPresetPlacement(); cancelPresetPlacement()');
assert.equal(run('pendingPreset'), null);
assert.equal(run('getSceneShapes().length'), 2);
ids.get('presetType').value = 'circle';
ids.get('presetCount').value = '2';
run('startPresetPlacement()');
assert.equal(alerts.pop(), run("t('preset_invalid')"));
assert.equal(run('pendingPreset'), null);

// Real project handlers with in-memory download and FileReader doubles.
let downloaded;
sandbox.Blob = class { constructor(parts) { downloaded = parts.join(''); } };
sandbox.URL = { createObjectURL: () => 'blob:test', revokeObjectURL() {} };
document.body = { appendChild() {}, removeChild() {} };
const createElement = document.createElement;
document.createElement = () => ({ ...createElement(), click() {} });
sandbox.FileReader = class { readAsText(file) { this.onload({ target: { result: file.text } }); } };
run('saveProject()');
const savedProject = JSON.parse(downloaded);
assert.equal(savedProject.version, 2);
assert.equal(savedProject.shapes.length, 2);
function load(data) {
    sandbox.testFile = { files: [{ text: JSON.stringify(data) }], value: 'test.json' };
    run('loadProject({target: testFile})');
    assert.equal(sandbox.testFile.value, '');
}
run('inactiveShapes = []; points = []');
load(savedProject);
assert.equal(run('getSceneShapes().length'), 2);
assert.equal(run('JSON.stringify(getSceneShapes())'), JSON.stringify(savedProject.shapes));
load({ points: [{x:0,y:0},{x:20,y:0},{x:0,y:20}], shapeType: 'convex', physics: { density: 0, group: 0 } });
assert.equal(run('getSceneShapes().length'), 1);
assert.equal(Number(ids.get('density').value), 0);
assert.equal(Number(ids.get('group').value), 0);
// Maximum count and small dimensions retain distinct exported vertices.
run("points = createPresetPoints('circle', 2, 2, 64); generateCode()");
assert.equal((ids.get('codeOutput').textContent.match(/physics_fixture_create\(\)/g) || []).length, 62);
assert(ids.get('codeOutput').textContent.includes('0.098017'));
run("setLanguage('tr')");
assert(ids.get('codeOutput').textContent.includes('// Çokgen 62 üçgene bölündü.'));
assert.equal(alerts.length, 0);
// Two-click measurement projects onto the dominant axis in world pixels.
const sceneBeforeMeasurement = run('JSON.stringify(getSceneShapes())');
const historyBeforeMeasurement = run('historyStack.length');
run('camera = {x:100, y:50, zoom:2}; snapToGrid = true; startDiameterMeasurement()');
run('onMouseDown({button:0, clientX:120, clientY:70, preventDefault(){}})');
run('onMouseMove({clientX:220.5, clientY:80}); loop()');
assert.equal(run('measurement.start.x'), 10);
assert.equal(ids.get('warningMsg').textContent, run("t('measure_second')"));
run('onMouseDown({button:0, clientX:220.5, clientY:80, preventDefault(){}})');
assert.equal(Number(ids.get('presetWidth').value), 50.25);
assert.equal(run('measurement'), null);
assert.equal(run('JSON.stringify(getSceneShapes())'), sceneBeforeMeasurement);
assert.equal(run('historyStack.length'), historyBeforeMeasurement);
run('startDiameterMeasurement(); measureAt({x:10,y:80},{x:120,y:210})');
run('measureAt({x:12,y:10},{x:124,y:70})');
assert.equal(Number(ids.get('presetWidth').value), 70, 'Vertical measurement works upward');
assert.equal(run('getAxisMeasurement({x:100,y:0},{x:20,y:3}).distance'), 80);
assert.equal(run('getAxisMeasurement({x:0,y:0},{x:4,y:9}).horizontal'), false);
run('startDiameterMeasurement(); measureAt({x:0,y:0},{x:100,y:50}); measureAt({x:0,y:0},{x:100,y:50})');
assert.equal(alerts.pop(), run("t('measure_invalid')"));
assert.equal(Number(ids.get('presetWidth').value), 70, 'Invalid measurement preserves the field');
assert(run('measurement !== null'), 'Invalid second click can be retried');
run("setLanguage('en')");
assert.equal(ids.get('warningMsg').textContent, run("t('measure_second')"));
run('cancelMeasurement()');
assert.equal(run('measurement'), null);
ids.get('presetCount').value = '8';
run('startPresetPlacement(); startDiameterMeasurement()');
assert.equal(run('pendingPreset'), null);
run('startPresetPlacement()');
assert.equal(run('measurement'), null);
run('cancelPresetPlacement()');
assert.equal(alerts.length, 0);
// Finishing a preset prevents both manual algorithms from extending its outline.
for (const drawingType of ['concave', 'convex']) {
    run("restoreScene([{points: [], shapeType: 'convex'}]); historyStack = []; historyStepIndex = -1; saveHistoryState(); camera = {x:0,y:0,zoom:1}; snapToGrid = false");
    run('startPresetPlacement(); placePreset({x:0,y:0})');
    const presetBefore = run('JSON.stringify(getActiveShape())');
    assert.equal(run('activeShapeFinalized'), true);
    run(`chooseDrawingType('${drawingType}')`);
    assert.equal(run('points.length'), 0);
    assert.equal(run('inactiveShapes[0].shapeType'), 'convex');
    for (const [x, y] of [[200, 0], [240, 0], [240, 40]]) {
        run(`onMouseDown({button:0,clientX:${x},clientY:${y},preventDefault(){}})`);
    }
    assert.equal(run('points.length'), 3);
    assert.equal(run('shapeType'), drawingType);
    assert.equal(run('JSON.stringify(inactiveShapes[0])'), presetBefore);
    run('checkAndSaveState(); generateCode()');
    assert.equal((ids.get('codeOutput').textContent.match(/physics_fixture_create\(\)/g) || []).length, 2);
    run('performUndo()');
    assert.equal(run('activeShapeFinalized'), true);
    assert.equal(run('JSON.stringify(getActiveShape())'), presetBefore);
    run('performRedo(); finalizeActiveShape()');
    assert.equal(run('activeShapeFinalized'), true);
    assert.equal(run('mode'), 'move', 'Finish immediately exits point drawing');
    assert.equal(run('selectedIndices.size'), 0);
    const finishedScene = run('JSON.stringify(getSceneShapes())');
    run('onMouseDown({button:0,clientX:900,clientY:900,preventDefault(){}}); onMouseUp({})');
    assert.equal(run('JSON.stringify(getSceneShapes())'), finishedScene, 'A canvas click after finishing adds no point');
    assert(ids.get('codeOutput').textContent.includes('physics_fixture_bind(fix, id)'));
    run('saveProject()');
    load(JSON.parse(downloaded));
    assert.equal(run('activeShapeFinalized'), true);
    run("mode = 'add'; onMouseDown({button:0,clientX:300,clientY:100,preventDefault(){}})");
    assert.equal(run('points.length'), 1);
    assert.equal(run('inactiveShapes.length'), 2);
    assert.equal(run('inactiveShapes[1].points.length'), 3);
}
assert.equal(alerts.length, 0);
// Names survive selection, history and project serialization; debug code stays separate.
run("restoreScene([{points:[{x:0,y:0},{x:30,y:0},{x:0,y:30}],shapeType:'convex'}]); selectedIndices.clear(); historyStack=[]; historyStepIndex=-1; saveHistoryState(); renameActiveShape('  Gövde  ')");
assert.equal(run('getActiveShape().name'), 'Gövde');
run('performUndo()');
assert.equal(run('activeShapeName'), '');
run('performRedo()');
assert.equal(ids.get('shapeName').value, 'Gövde');
run('startPresetPlacement(); placePreset({x:100,y:100}); renameActiveShape("Tekerlek"); activateShape(0)');
assert.equal(run('activeShapeName'), 'Gövde');
run('generateCode()');
const fixtureOutput = ids.get('codeOutput').textContent;
ids.get('showFixtureDebug').checked = true;
run('updateDrawCode(); saveProject()');
assert.equal(ids.get('drawCodePanel').hidden, false);
assert.equal(ids.get('drawCodeOutput').textContent, 'draw_self();\ndraw_set_colour(c_lime);\nphysics_draw_debug();');
assert.equal(ids.get('codeOutput').textContent, fixtureOutput);
const namedProject = JSON.parse(downloaded);
assert.deepEqual(namedProject.shapes.map(shape => shape.name), ['Tekerlek', 'Gövde']);
assert.equal(namedProject.showFixtureDebug, true);
load(namedProject);
assert.equal(run('activeShapeName'), 'Gövde');
assert.equal(ids.get('drawCodePanel').hidden, false);
run("setLanguage('tr')");
assert.equal(run('activeShapeName'), 'Gövde');
ids.get('showFixtureDebug').checked = false;
run('updateDrawCode()');
assert.equal(ids.get('drawCodePanel').hidden, true);
assert.equal(ids.get('drawCodeOutput').textContent, '');
load({points:[{x:0,y:0},{x:30,y:0},{x:0,y:30}],shapeType:'convex'});
assert.equal(run('activeShapeName'), '');
assert.equal(ids.get('showFixtureDebug').checked, false);
assert.equal(alerts.length, 0);
for (const handler of html.matchAll(/\son\w+="([^"]+)"/g)) new vm.Script(`(function(event){${handler[1]}})`);
console.log(`PASS: ${scripts.length} scripts; translations, startup, presets, preview, placement, snapping, independent shapes, undo/redo, GML and project round-trip.`);
