// Module aliases
const { Engine, Render, Runner, Bodies, Composite, Body, Events } = Matter;

// Create an engine
const engine = Engine.create();
const world = engine.world;

// Create a renderer
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: '#000'
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Create the sun
const sun = Bodies.circle(window.innerWidth / 2, window.innerHeight / 2, 50, { isStatic: true, render: { fillStyle: 'yellow' } });
Composite.add(world, sun);

// Create the planets
const planet1 = Bodies.circle(sun.position.x + 150, sun.position.y, 20, { render: { fillStyle: 'blue' } });
const planet2 = Bodies.circle(sun.position.x + 300, sun.position.y, 30, { render: { fillStyle: 'green' } });
const planet3 = Bodies.circle(sun.position.x + 450, sun.position.y, 25, { render: { fillStyle: 'red' } });
Composite.add(world, [planet1, planet2, planet3]);

// Create the moon for the second planet
const moon = Bodies.circle(planet2.position.x + 50, planet2.position.y, 10, { render: { fillStyle: 'gray' } });
Composite.add(world, moon);

// Set initial velocities for planets and moon
Body.setVelocity(planet1, { x: 0, y: 2 });
Body.setVelocity(planet2, { x: 0, y: 1.5 });
Body.setVelocity(planet3, { x: 0, y: 1 });
Body.setVelocity(moon, { x: 0, y: 2 });

// Gravitational constant
const G = 0.001;

// Function to apply gravitational force between two bodies
function applyGravity(bodyA, bodyB) {
    const dx = bodyB.position.x - bodyA.position.x;
    const dy = bodyB.position.y - bodyA.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const forceMagnitude = (G * bodyA.mass * bodyB.mass) / (distance * distance);
    const force = {
        x: (forceMagnitude * dx) / distance,
        y: (forceMagnitude * dy) / distance
    };
    Body.applyForce(bodyA, bodyA.position, { x: force.x, y: force.y });
    Body.applyForce(bodyB, bodyB.position, { x: -force.x, y: -force.y });
}

// Update loop to apply gravity
Events.on(engine, 'beforeUpdate', function() {
    applyGravity(sun, planet1);
    applyGravity(sun, planet2);
    applyGravity(sun, planet3);
    applyGravity(planet2, moon);

    // Apply gravity to meteors
    Composite.allBodies(world).forEach(body => {
        if (body !== sun && body !== planet1 && body !== planet2 && body !== planet3 && body !== moon) {
            applyGravity(sun, body);
        }
    });
});

// Add meteor on button click
document.getElementById('addMeteor').addEventListener('click', function() {
    const meteor = Bodies.circle(Math.random() * window.innerWidth, 0, 10, { render: { fillStyle: 'red' } });
    Body.setVelocity(meteor, { x: (sun.position.x - meteor.position.x) * 0.01, y: (sun.position.y - meteor.position.y) * 0.01 });
    Composite.add(world, meteor);
});