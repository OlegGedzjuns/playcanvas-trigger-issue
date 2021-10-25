import WebGLRenderingContext from 'webgl-mock-threejs/src/WebGLRenderingContext.js';
WebGLRenderingContext.prototype['getSupportedExtensions'] = function () {
    return [];
};

import HTMLCanvasElement from 'webgl-mock-threejs/src/HTMLCanvasElement.js';
HTMLCanvasElement.prototype['removeEventListener'] = function () {};

import _Ammo from './libs/ammo.js';

async function initializeAmmo() {
    return new Promise(resolve => {
        _Ammo().then(Ammo => {
            global.Ammo = Ammo;
            console.log('Ammo initialized');
            resolve();
        });
    });
}

await initializeAmmo();

import { Application, BODYTYPE_DYNAMIC, BODYTYPE_STATIC, createScript, Entity, Vec3 } from 'playcanvas';

const createTriggerScript = function (app) {
    var TriggerTest = createScript('triggerTest', app);

    TriggerTest.prototype.initialize = function () {
        this.entity.collision.on('triggerenter', other => console.log('Enter: ', other._guid));
        this.entity.collision.on('triggerleave', other => console.log('Leave: ', other._guid));
    };
};

const createPlane = function (app) {
    const plane = new Entity('plane');

    plane.addComponent('collision', {
        type: 'box',
        halfExtents: new Vec3(4, 0.05, 4),
    });

    plane.addComponent('rigidbody', {
        type: BODYTYPE_STATIC,
        friction: 1,
        restitution: 0,
    });

    app.root.addChild(plane);
};

const createBox = function (app) {
    const box = new Entity('box');

    box.addComponent('collision', {
        type: 'box',
        halfExtents: new Vec3(0.5, 0.5, 0.5),
    });

    box.addComponent('rigidbody', {
        type: BODYTYPE_DYNAMIC,
    });

    app.root.addChild(box);

    box.rigidbody.teleport(0, 2, 0);
};

const createTrigger = function (app) {
    const trigger = new Entity('trigger');

    trigger.addComponent('collision', {
        type: 'box',
        halfExtents: new Vec3(4, 0.05, 4),
    });

    trigger.addComponent('script');
    trigger.script.create('triggerTest');

    app.root.addChild(trigger);

    trigger.setPosition(0, 0.2, 0);
};

const app1 = new Application(new HTMLCanvasElement());
app1.onLibrariesLoaded();
createTriggerScript(app1);

createPlane(app1);
createBox(app1);
createTrigger(app1);

app1.start();

const app2 = new Application(new HTMLCanvasElement());
app2.onLibrariesLoaded();
createTriggerScript(app2);

createPlane(app2);
createBox(app2);
createTrigger(app2);

app2.start();

setInterval(() => {
    app1.update(1 / 60);
    app2.update(1 / 60);
}, 1000 / 60);

// start script
// with one application it is working as expected
//
// output:
//  'Enter: GUID'
//
// uncomment line 106
//
// with multiple applications triggers are breaking
//
// otput:
//  'Enter: GUID1'
//  'Enter: GUID2'
//  'Leave: GUID1'
//  'Enter: GUID1'
//  'Leave: GUID2'
//  'Enter: GUID2'
//  'Leave: GUID1'
//  'Enter: GUID1'
//
// and so on
