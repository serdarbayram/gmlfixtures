function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(showGrid) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;

        const zoomedGrid = gridSize * camera.zoom;
        const startWorldX = Math.floor(-camera.x / zoomedGrid) * gridSize;
        const startWorldY = Math.floor(-camera.y / zoomedGrid) * gridSize;
        const startScreenX = startWorldX * camera.zoom + camera.x;
        const startScreenY = startWorldY * camera.zoom + camera.y;

        for(let x = startScreenX; x < canvas.width; x += zoomedGrid) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for(let y = startScreenY; y < canvas.height; y += zoomedGrid) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.moveTo(camera.x, 0); ctx.lineTo(camera.x, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, camera.y); ctx.lineTo(canvas.width, camera.y); ctx.stroke();
        ctx.restore();
    }

    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    if(sprite) {
        ctx.drawImage(sprite.img, -sprite.w/2, -sprite.h/2);
    }

    drawInactiveShapes();

    if(points.length > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1 / camera.zoom;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for(let i=1; i<points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        if(points.length > 2) ctx.closePath();
        ctx.stroke();

        if(points.length >= 3) {
            if(shapeType === 'convex') {
                const hull = getConvexHull([...points]);
                ctx.strokeStyle = '#64ffda';
                ctx.lineWidth = 2 / camera.zoom;
                ctx.fillStyle = 'rgba(100, 255, 218, 0.2)';
                ctx.beginPath();
                ctx.moveTo(hull[0].x, hull[0].y);
                for(let i=1; i<hull.length; i++) ctx.lineTo(hull[i].x, hull[i].y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else {
                const triangles = triangulatePolygon([...points]);
                triangles.forEach(tri => {
                    ctx.strokeStyle = '#ff6b81';
                    ctx.lineWidth = 2 / camera.zoom;
                    ctx.fillStyle = 'rgba(255, 107, 129, 0.2)';
                    ctx.beginPath();
                    ctx.moveTo(tri[0].x, tri[0].y);
                    ctx.lineTo(tri[1].x, tri[1].y);
                    ctx.lineTo(tri[2].x, tri[2].y);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                });
            }
        }

        points.forEach((p, i) => {
            const isSelected = selectedIndices.has(i);

            {
                ctx.fillStyle = isSelected ? '#ffeb3b' : '#f093fb';
                if (isSelected) {
                    ctx.shadowColor = '#ffeb3b';
                    ctx.shadowBlur = 10;
                } else {
                    ctx.shadowBlur = 0;
                }
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, (isSelected ? 5 : 4)/camera.zoom, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    drawPresetPreview();
    drawMeasurement();

    if(mode === 'select' && selectionBox) {
        ctx.fillStyle = 'rgba(100, 255, 218, 0.1)';
        ctx.strokeStyle = '#64ffda';
        ctx.lineWidth = 1 / camera.zoom;
        ctx.fillRect(selectionBox.sx, selectionBox.sy, selectionBox.w, selectionBox.h);
        ctx.strokeRect(selectionBox.sx, selectionBox.sy, selectionBox.w, selectionBox.h);
    }

    ctx.restore();
    requestAnimationFrame(loop);
}
