/* Made with ct.js http://ctjs.rocks/ */


const ct = {
    libs: [/*@libs@*/][0],
    speed: 60,
    types: {},
    snd: {},
    stack: [],
    fps: 60,
    dt: 0,
    version: '/*@ctversion@*/',
    meta: [/*@projectmeta@*/][0],
    main: {
        fpstick: 0,
        pi: 0
    },
    get width() {
        return ct.pixiApp.renderer.view.width;
    },
    set width(value) {
        ct.pixiApp.renderer.resize(value, ct.height);
        return value;
    },
    get height() {
        return ct.pixiApp.renderer.view.height;
    },
    set height(value) {
        ct.pixiApp.renderer.resize(ct.width, value);
        return value;
    }
};

console.log(`😺 ct.js v${ct.version} 😽
😻 Website: https://ctjs.rocks/ 🙀`);
ct.pixiApp = new PIXI.Application({
    width: [/*@startwidth@*/][0],
    height: [/*@startheight@*/][0],
    antialias: ![/*@pixelatedrender@*/][0],
    roundPixels: [/*@pixelatedrender@*/][0]
});
if (!ct.pixiApp.renderer.options.antialias) {
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
}
ct.stage = ct.pixiApp.stage;
ct.pixiApp.renderer.autoResize = false;
document.getElementById('ct').appendChild(ct.pixiApp.view);

ct.u = {
    ldx(l, d) {
    // lengthdir_x
        return l * Math.cos(d * Math.PI / -180);
    },
    ldy(l, d) {
    // lengthdir_y
        return l * Math.sin(d * Math.PI / -180);
    },
    // Point-point DirectioN
    pdn(x1, y1, x2, y2) {
        return (Math.atan2(y2 - y1, x2 - x1) * -180 / Math.PI + 360) % 360;
    },
    pdc(x1, y1, x2, y2) {
    // Point-point DistanCe
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    },
    /**
     * Rotates a vector (x; y) by deg around (0; 0)
     * @param {Number} x The x component
     * @param {Number} y The y component
     * @param {Number} deg The degree to rotate by
     * @returns {Array} A pair of new `x` and `y` parameters.
     */
    rotate(x, y, deg) {
        const rad = deg * Math.PI / -180;
        return [
            Math.cos(rad) * x - Math.sin(rad) * y,
            Math.sin(rad) * x - Math.cos(rad) * y
        ];
    },
    rotateRad(x, y, rad) {
        return [
            Math.cos(rad) * x - Math.sin(rad) * y,
            Math.sin(rad) * x - Math.cos(rad) * y
        ];
    },
    deltaDir(dir1, dir2) {
        dir1 = ((dir1 % 360) + 360) % 360;
        dir2 = ((dir2 % 360) + 360) % 360;
        var t = dir1,
            h = dir2,
            ta = h - t;
        if (ta > 180) {
            ta -= 360;
        }
        if (ta < -180) {
            ta += 360;
        }
        return ta;
    },
    clamp(min, val, max) {
        return Math.max(min, Math.min(max, val));
    },
    lerp(a, b, alpha) {
        return a + (b-a)*alpha;
    },
    unlerp(a, b, val) {
        return (val - a) / (b - a);
    },
    prect(x, y, arg) {
    // point-rectangle intersection
        var xmin, xmax, ymin, ymax;
        if (arg.splice) {
            xmin = Math.min(arg[0], arg[2]);
            xmax = Math.max(arg[0], arg[2]);
            ymin = Math.min(arg[1], arg[3]);
            ymax = Math.max(arg[1], arg[3]);
        } else {
            xmin = arg.x - arg.shape.left * arg.scale.x;
            xmax = arg.x + arg.shape.right * arg.scale.x;
            ymin = arg.y - arg.shape.top * arg.scale.y;
            ymax = arg.y + arg.shape.bottom * arg.scale.y;
        }
        return x >= xmin && y >= ymin && x <= xmax && y <= ymax;
    },
    pcircle(x, y, arg) {
        if (arg.splice) {
            return ct.u.pdc(x, y, arg[0], arg[1]) < arg[2];
        }
        return ct.u.pdc(0, 0, (arg.x - x) / arg.scale.x, (arg.y - y) / arg.scale.y) < arg.shape.r;
    },
    ext (o1, o2, arr) {
        if (arr) {
            for (const i in arr) {
                if (o2[arr[i]]) {
                    o1[arr[i]] = o2[arr[i]];
                }
            }
        } else {
            for (const i in o2) {
                o1[i] = o2[i];
            }
        }
    },
    load(url, callback) {
        var script = document.createElement('script');
        script.src = url;
        if (callback) {
            script.onload = callback;
        }
        document.getElementsByTagName('head')[0].appendChild(script);
    },
    wait: time => {
        var room = ct.room.name;
        return new Promise((resolve, reject) => setTimeout(() => {
            if (ct.room.name === room) {
                resolve();
            } else {
                reject({
                    info: 'Room switch',
                    from: 'ct.u.wait'
                });
            }
        }, time));
    }
};
ct.u.ext(ct.u, { // make aliases
    lengthDirX: ct.u.ldx,
    lengthDirY: ct.u.ldy,
    pointDirection: ct.u.pdn,
    pointDistance: ct.u.pdc,
    pointRectangle: ct.u.prect,
    pointCircle: ct.u.pcircle,
    extend: ct.u.ext
});
ct.loop = function(delta) {
    ct.delta = delta;
    for (let i = 0, li = ct.stack.length; i < li; i++) {
        ct.types.beforeStep.apply(ct.stack[i]);
        
        ct.stack[i].xprev = ct.stack[i].x;
        ct.stack[i].yprev = ct.stack[i].y;
        ct.stack[i].onStep.apply(ct.stack[i]);
        
        ct.types.afterStep.apply(ct.stack[i]);
    }

    ct.rooms.beforeStep.apply(ct.room);
    ct.room.onStep.apply(ct.room); 
    ct.rooms.afterStep.apply(ct.room);
    // copies
    for (let i = 0, li = ct.stack.length; i < li;) {
        if (ct.stack[i].kill) {
            ct.types.onDestroy.apply(ct.stack[i]);
            ct.stack[i].onDestroy.apply(ct.stack[i]);
            ct.stack[i].destroy({
                children: true
            });
            ct.stack.splice(i, 1);
            li--;
        } else {
            i++;
        }
    }

    // ct.types.list[type: String]
    for (const i in ct.types.list) {
        for (let k = 0, lk = ct.types.list[i].length; k < lk; k++) {
            if (ct.types.list[i][k].kill) {
                ct.types.list[i].splice(k, 1);
                k--; lk--;
            }
        }
    }

    for (const cont of ct.stage.children) {
        cont.children.sort((a, b) => {
                return ((a.depth || 0) - (b.depth || 0)) || ((a.uid || 0) - (b.uid || 0)) || 0;
        })
    }

    if (ct.room.follow) {
        if (ct.room.follow.kill) {
            delete ct.room.follow;
        } else if (ct.room.center) {
            ct.room.x += ct.room.follow.x + ct.room.followShiftX - ct.room.x - ct.width / 2;
            ct.room.y += ct.room.follow.y + ct.room.followShiftY - ct.room.y - ct.height / 2;
        } else {
            let cx = 0,
                cy = 0,
                w = 0,
                h = 0;
            w = Math.min(ct.room.borderX, ct.viewWidth / 2);
            h = Math.min(ct.room.borderY, ct.viewHeight / 2);
            if (ct.room.follow.x + ct.room.followShiftX - ct.room.x < w) {
                cx = ct.room.follow.x + ct.room.followShiftX - ct.room.x - w;
            }
            if (ct.room.follow.y + ct.room.followShiftY - ct.room.y < h) {
                cy = ct.room.follow.y + ct.room.followShiftY - ct.room.y - h;
            }
            if (ct.room.follow.x + ct.room.followShiftX - ct.room.x > ct.viewWidth - w) {
                cx = ct.room.follow.x + ct.room.followShiftX - ct.room.x - ct.viewWidth + w;
            }
            if (ct.room.follow.y + ct.room.followShiftY - ct.room.y > ct.viewHeight - h) {
                cy = ct.room.follow.y + ct.room.followShiftY - ct.room.y - ct.viewHeight + h;
            }
            ct.room.x = Math.floor(ct.room.x + cx);
            ct.room.y = Math.floor(ct.room.y + cy);
        }
    }
    ct.room.x = Math.round(ct.room.x);
    ct.room.y = Math.round(ct.room.y);
    
    ct.mouse.x = ct.mouse.rx + ct.room.x || 0;
    ct.mouse.y = ct.mouse.ry + ct.room.y || 0;
    ct.room.x = ct.room.x || 0;
    ct.room.y = ct.room.y || 0;

    for (let i = 0, li = ct.stack.length; i < li; i++) {
        ct.types.beforeDraw.apply(ct.stack[i]);
        ct.stack[i].onDraw.apply(ct.stack[i]);
        ct.types.afterDraw.apply(ct.stack[i]);
    }

    ct.rooms.beforeDraw.apply(ct.room);
    ct.room.onDraw.apply(ct.room); 
    ct.rooms.afterDraw.apply(ct.room);
    

    ct.mouse.pressed = false;
    ct.mouse.released = false;
    ct.mouse.wheel = 0;
    ct.mouse.xprev = ct.mouse.x;
    ct.mouse.yprev = ct.mouse.y;
    ct.main.fpstick++;
    if (ct.rooms.switching) {
        ct.rooms.forceSwitch();
    }
};

/*%load%*/