let canvas, ctx;
let sprite = null;
let points = [];
let mode = 'add'; 
let shapeType = 'convex'; 

let selectedIndices = new Set(); 
let selectionBox = null;

let isDraggingPoint = false;
let isPanning = false;
let lastMouse = { x: 0, y: 0 };
let camera = { x: 0, y: 0, zoom: 1 };
let gridSize = 20;
let showGrid = true;
let snapToGrid = false;

