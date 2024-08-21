// Module aliases for easier access
const Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Events = Matter.Events,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint;

// Create an engine
const engine = Engine.create();
engine.world.gravity.scale = 0.001; // Adjust gravity scale for better effect

// Create a renderer and attach it to the canvas element
const render = Render.create({
    element: document.body,
    canvas: document.getElementById('world'),
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false, // Disable wireframes for solid shapes
        background: '#000' // Set background color to black
    }
});

// Create the planet (a large blue circle)
const planet = Bodies.circle(window.innerWidth / 2, window.innerHeight / 2, 100, {
    isStatic: true, // Make the planet static so it doesn't move
    render: {
        fillStyle: 'blue' // Set the color of the planet
    }
});

// Create the first moon (a smaller circle with texture)
const moon1 = Bodies.circle(window.innerWidth / 2 + 200, window.innerHeight / 2, 30, {
    render: {
        sprite: {
            texture: 'images/moon1.png', // Path to the texture image
            xScale: 0.6, // Scale the texture to fit the body
            yScale: 0.6
        }
    }
});

// Create the second moon (another smaller circle with texture)
const moon2 = Bodies.circle(window.innerWidth / 2 - 200, window.innerHeight / 2, 30, {
    render: {
        sprite: {
            texture: 'images/moon2.png', // Path to the texture image
            xScale: 0.6, // Scale the texture to fit the body
            yScale: 0.6
        }
    }
});

// Add the planet and moons to the world
World.add(engine.world, [planet, moon1, moon2]);

// Run the engine
Engine.run(engine);

// Run the renderer
Render.run(render);

// Function to update the positions of the moons
function updateMoons() {
    const time = Date.now() * 0.001; // Get the current time in seconds

    // Update the position of the first moon to orbit the planet
    Body.setPosition(moon1, {
        x: window.innerWidth / 2 + 200 * Math.cos(time),
        y: window.innerHeight / 2 + 200 * Math.sin(time)
    });

    // Update the position of the second moon to orbit the planet in the opposite direction
    Body.setPosition(moon2, {
        x: window.innerWidth / 2 + 200 * Math.cos(time + Math.PI),
        y: window.innerHeight / 2 + 200 * Math.sin(time + Math.PI)
    });

    // Add rotation to the moons
    Body.setAngularVelocity(moon1, 0.05); // Rotate the first moon
    Body.setAngularVelocity(moon2, 0.05); // Rotate the second moon

    // Request the next animation frame to keep updating the moons' positions
    requestAnimationFrame(updateMoons);
}

// Start updating the moons' positions
updateMoons();

// Add mouse control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});
World.add(engine.world, mouseConstraint);

// Function to create a meteor
function createMeteor(x, y) {
    const meteor = Bodies.circle(x, y, 20, {
        render: {
            fillStyle: 'red'
        }
    });
    World.add(engine.world, meteor);
    return meteor;
}

// Event listener for mouse down to create a meteor
let currentMeteor = null;
Events.on(mouseConstraint, 'mousedown', function(event) {
    const { mouse } = event.source;
    currentMeteor = createMeteor(mouse.position.x, mouse.position.y);
});

// Event listener for mouse up to apply force to the meteor
Events.on(mouseConstraint, 'mouseup', function(event) {
    if (currentMeteor) {
        const { mouse } = event.source;
        const forceMagnitude = 0.05 * currentMeteor.mass;
        const force = {
            x: (mouse.position.x - currentMeteor.position.x) * forceMagnitude,
            y: (mouse.position.y - currentMeteor.position.y) * forceMagnitude
        };
        Body.applyForce(currentMeteor, currentMeteor.position, force);
        currentMeteor = null;
    }
});

// Function to apply gravitational force from planet and moons
function applyGravity() {
    const bodies = Matter.Composite.allBodies(engine.world);
    bodies.forEach(body => {
        if (body !== planet && body !== moon1 && body !== moon2) {
            [planet, moon1, moon2].forEach(attractor => {
                const distance = Matter.Vector.magnitude(Matter.Vector.sub(attractor.position, body.position));
                const forceMagnitude = (attractor.mass * body.mass) / Math.pow(distance, 2);
                const force = Matter.Vector.mult(Matter.Vector.normalise(Matter.Vector.sub(attractor.position, body.position)), forceMagnitude);
                Body.applyForce(body, body.position, force);
            });
        }
    });
}

// Run the gravity function on each tick
Events.on(engine, 'beforeUpdate', applyGravity);