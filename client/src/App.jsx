import React from "react";
import * as PIXI from "pixi.js";
import myImage from "./virus.png";
import Canvas from "./Canvas";

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			entities: [],
			app: new PIXI.Application({
				width: 1000,
				height: 700,
				backgroundAlpha: 1,
			}),
		};
		this.pixiContainer = null;
	}

	componentDidMount() {
		const { entities, app } = this.state;
		let tempArr = entities.slice();
		const greenSquare = new PIXI.Sprite(PIXI.Texture.WHITE);
		greenSquare.position.set(
			(app.screen.width - 100) / 2,
			(app.screen.height - 100) / 2
		);
		greenSquare.width = 50;
		greenSquare.height = 50;
		greenSquare.tint = "0x00FF00";
		greenSquare.acceleration = new PIXI.Point(10);
		greenSquare.mass = 3;
		// The square you move around
		const redSquare = new PIXI.Sprite(PIXI.Texture.WHITE);
		redSquare.position.set(
			(app.screen.width - 100) / 3,
			(app.screen.height - 100) / 3
		);
		redSquare.width = 50;
		redSquare.height = 50;
		redSquare.tint = "0xFF0000";
		0;
		redSquare.acceleration = new PIXI.Point(10);
		redSquare.mass = 1;
		tempArr.push(redSquare, greenSquare);
		this.setState(
			{
				entities: tempArr,
			},
			() => {
				this.pixiUpdate(document.getElementById("canvas"));
				//app.stage.addChild(greenSquare1);
			}
		);
	}

	addSquare = () => {
		const { app, entities } = this.state;
		const greenSquare1 = new PIXI.Sprite(PIXI.Texture.WHITE);
		// If so, reverse acceleration in that direction
		const mouseCoords = app.renderer.plugins.interaction.mouse.global;
		greenSquare1.position.set(mouseCoords.x, mouseCoords.y);
		greenSquare1.width = 50;
		greenSquare1.height = 40;
		greenSquare1.tint = "0x00FF11";
		greenSquare1.acceleration = new PIXI.Point(1, -5);
		greenSquare1.mass = 3;
		let tempArr = entities.slice();
		tempArr.push(greenSquare1);
		this.setState(
			{
				entities: tempArr,
			},
			() => {
				this.pixiUpdate(document.getElementById("canvas"));
				//app.stage.addChild(greenSquare1);
			}
		);
	};

	pixiUpdate = (element) => {
		const { app, entities } = this.state;
		this.pixiContainer = element;
		console.log(entities, element);
		if (this.pixiContainer) {
			this.pixiContainer.appendChild(app.view);
			const movementSpeed = 0.05;

			// Strength of the impulse push between two objects
			const impulsePower = 2;

			// Test For Hit
			// A basic AABB check between two different squares
			function testForAABB(object1, object2) {
				const bounds1 = object1.getBounds();
				const bounds2 = object2.getBounds();

				return (
					bounds1.x < bounds2.x + bounds2.width &&
					bounds1.x + bounds1.width > bounds2.x &&
					bounds1.y < bounds2.y + bounds2.height &&
					bounds1.y + bounds1.height > bounds2.y
				);
			}

			// Calculates the results of a collision, allowing us to give an impulse that
			// shoves objects apart
			function collisionResponse(object1, object2) {
				if (!object1 || !object2) {
					return new PIXI.Point(0);
				}

				const vCollision = new PIXI.Point(
					object2.x - object1.x,
					object2.y - object1.y
				);

				const distance = Math.sqrt(
					(object2.x - object1.x) * (object2.x - object1.x) +
						(object2.y - object1.y) * (object2.y - object1.y)
				);

				const vCollisionNorm = new PIXI.Point(
					vCollision.x / distance,
					vCollision.y / distance
				);

				const vRelativeVelocity = new PIXI.Point(
					object1.acceleration.x - object2.acceleration.x,
					object1.acceleration.y - object2.acceleration.y
				);

				const speed =
					vRelativeVelocity.x * vCollisionNorm.x +
					vRelativeVelocity.y * vCollisionNorm.y;

				const impulse = (impulsePower * speed) / (object1.mass + object2.mass);

				return new PIXI.Point(
					impulse * vCollisionNorm.x,
					impulse * vCollisionNorm.y
				);
			}

			// Listen for animate update
			app.ticker.add((delta) => {
				for (let i = 0; i < entities.length; i++) {
					entities[i].acceleration.set(
						entities[i].acceleration.x * 0.98,
						entities[i].acceleration.y * 0.98
					);
					if (entities[i].x < 0 || entities[i].x > app.screen.width - 100) {
						entities[i].acceleration.x = -entities[i].acceleration.x;
					}
					if (entities[i].y < 0 || entities[i].y > app.screen.height - 100) {
						entities[i].acceleration.y = -entities[i].acceleration.y;
					}
					for (let j = i + 1; j < entities.length; j++) {
						if (testForAABB(entities[i], entities[j])) {
							// Calculate the changes in acceleration that should be made between
							// each square as a result of the collision
							const collisionPush = collisionResponse(entities[i], entities[j]);
							if (
								entities[i].tint === "0xFF0000" ||
								entities[j].tint == "0xFF0000"
							) {
								entities[i].tint = "0xFF0000";
								entities[j].tint = "0xFF0000";
							}
							// Set the changes in acceleration for both squares
							entities[j].acceleration.set(
								collisionPush.x * entities[i].mass,
								collisionPush.y * entities[i].mass
							);
							entities[i].acceleration.set(
								-(collisionPush.x * entities[j].mass),
								-(collisionPush.y * entities[j].mass)
							);
						}
					}
					entities[i].x += entities[i].acceleration.x * delta;
					entities[i].y += entities[i].acceleration.y * delta;
				}
				// Applied deacceleration for both squares, done by reducing the
				// acceleration by 0.01% of the acceleration every loop
				// redSquare.acceleration.set(
				// redSquare.acceleration.x * 0.99,
				// redSquare.acceleration.y * 0.99
				// );
				// greenSquare.acceleration.set(
				// greenSquare.acceleration.x * 0.995,
				// greenSquare.acceleration.y * 0.995
				// );

				// Check whether the green square ever moves off the screen
				// If so, reverse acceleration in that direction
				// if (greenSquare.x < 0 || greenSquare.x > app.screen.width - 100) {
				// greenSquare.acceleration.x = -greenSquare.acceleration.x;
				// }

				// if (greenSquare.y < 0 || greenSquare.y > app.screen.height - 100) {
				// greenSquare.acceleration.y = -greenSquare.acceleration.y;
				// }

				// If the green square pops out of the cordon, it pops back into the
				// middle
				// if (
				// greenSquare.x < -30 ||
				// greenSquare.x > app.screen.width + 30 ||
				// greenSquare.y < -30 ||
				// greenSquare.y > app.screen.height + 30
				// ) {
				// greenSquare.position.set(
				// (app.screen.width - 100) / 2,
				// (app.screen.height - 100) / 2
				// );
				// }

				// if (redSquare.x < 0 || redSquare.x > app.screen.width - 100) {
				// redSquare.acceleration.x = -redSquare.acceleration.x;
				// }
				// if (redSquare.y < 0 || redSquare.y > app.screen.height - 100) {
				// redSquare.acceleration.y = -redSquare.acceleration.y;
				// }
				// If the green square pops out of the cordon, it pops back into the
				// middle
				// if (
				// redSquare.x < -30 ||
				// redSquare.x > app.screen.width + 30 ||
				// redSquare.y < -30 ||
				// redSquare.y > app.screen.height + 30
				// ) {
				// redSquare.position.set(
				// (app.screen.width - 100) / 2,
				// (app.screen.height - 100) / 2
				// );
				// }

				// If the two squares are colliding
				// if (testForAABB(greenSquare, redSquare)) {
				// Calculate the changes in acceleration that should be made between
				// each square as a result of the collision
				// const collisionPush = collisionResponse(greenSquare, redSquare);
				// if (redSquare.tint === "0xFF0000" || greenSquare.tint == "0xFF0000") {
				// redSquare.tint = "0xFF0000";
				// greenSquare.tint = "0xFF0000";
				// }
				// Set the changes in acceleration for both squares
				// redSquare.acceleration.set(
				// collisionPush.x * greenSquare.mass,
				// collisionPush.y * greenSquare.mass
				// );
				// greenSquare.acceleration.set(
				// -(collisionPush.x * redSquare.mass),
				// -(collisionPush.y * redSquare.mass)
				// );
				// }

				// greenSquare.x += greenSquare.acceleration.x * delta;
				// greenSquare.y += greenSquare.acceleration.y * delta;

				// redSquare.x += redSquare.acceleration.x * delta;
				// redSquare.y += redSquare.acceleration.y * delta;
			});
			for (let i = 0; i < entities.length; i++) {
				app.stage.addChild(entities[i]);
			}
		}
	};

	render() {
		const { entities } = this.state;
		return (
			<React.Fragment>
				<div>App goes here</div>
				<button onClick={this.addSquare}>add green</button>
				<Canvas
					squareArr={entities}
					adder={this.addSquare}
					update={this.pixiUpdate}
				/>
			</React.Fragment>
		);
	}
}

export default App;
