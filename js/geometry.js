function getConvexHull(pts) {
    if(pts.length < 3) return pts;
    let cx=0, cy=0;
    pts.forEach(p => { cx+=p.x; cy+=p.y; });
    cx/=pts.length; cy/=pts.length;
    pts.sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
    return pts; 
}

function triangulatePolygon(pts) {
    let vertices = pts.slice();
    let triangles = [];
    if (vertices.length < 3) return [];
    let count = 0; const maxCount = vertices.length * 3; 
    while (vertices.length > 3) {
        if(count++ > maxCount) break;
        let earFound = false;
        for (let i = 0; i < vertices.length; i++) {
            const prev = vertices[(i - 1 + vertices.length) % vertices.length];
            const curr = vertices[i];
            const next = vertices[(i + 1) % vertices.length];
            if (isEar(prev, curr, next, vertices)) {
                triangles.push([prev, curr, next]);
                vertices.splice(i, 1);
                earFound = true; break;
            }
        }
        if (!earFound) { triangles.push([vertices[0], vertices[1], vertices[2]]); vertices.shift(); }
    }
    triangles.push([vertices[0], vertices[1], vertices[2]]);
    return triangles;
}
function isEar(p1, p2, p3, polygon) {
    if (!isConvex(p1, p2, p3)) return false;
    for (let i = 0; i < polygon.length; i++) {
        const p = polygon[i];
        if (p === p1 || p === p2 || p === p3) continue;
        if (pointInTriangle(p, p1, p2, p3)) return false;
    }
    return true;
}
function isConvex(a, b, c) { return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) >= 0; }
function pointInTriangle(p, a, b, c) {
    const area = 0.5 * (-b.y * c.x + a.y * (-b.x + c.x) + a.x * (b.y - c.y) + b.x * c.y);
    const s = 1 / (2 * area) * (a.y * c.x - a.x * c.y + (c.y - a.y) * p.x + (a.x - c.x) * p.y);
    const t = 1 / (2 * area) * (a.x * b.y - a.y * b.x + (a.y - b.y) * p.x + (b.x - a.x) * p.y);
    return s > 0 && t > 0 && (1 - s - t) > 0;
}
