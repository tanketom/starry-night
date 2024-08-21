// Module aliases for easier access
const Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body;

// Create an engine
const engine = Engine.create();

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

// Create the first moon (a smaller gray circle)
const moon1 = Bodies.circle(window.innerWidth / 2 + 200, window.innerHeight / 2, 30, {
    render: {
        fillStyle: 'gray' // Set the color of the first moon
    }
});

// Create the second moon (another smaller gray circle)
const moon2 = Bodies.circle(window.innerWidth / 2 - 200, window.innerHeight / 2, 30, {
    render: {
        fillStyle: 'gray' // Set the color of the second moon
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
