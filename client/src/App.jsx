import React from "react";
import * as PIXI from "pixi.js";
import Canvas from "./Canvas";

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			infected: false,
			entities: [],
			app: new PIXI.Application({
				autoResize: true,
				resolution: devicePixelRatio,
				backgroundAlpha: 0.1,
			}),
			paused: false,
		};
		this.pixiContainer = null;
	}

	componentDidMount() {
		const { entities, app } = this.state;
		let tempArr = entities.slice();
		const texture = PIXI.Texture.from("../../virus.png");
		const greenEntity = new PIXI.Sprite(texture);
		greenEntity.position.set(
			(app.screen.width - 100) / 2,
			(app.screen.height - 100) / 2
		);
		greenEntity.width = 50;
		greenEntity.height = 50;
		greenEntity.acceleration = new PIXI.Point(3);
		greenEntity.mass = 3;
		const redEntity = new PIXI.Sprite(texture);
		redEntity.position.set(
			(app.screen.width - 100) / 3,
			(app.screen.height - 100) / 3
		);
		redEntity.width = 50;
		redEntity.height = 50;
		redEntity.tint = "0x00FF00";
		0;
		redEntity.acceleration = new PIXI.Point(3);
		redEntity.mass = 1;
		tempArr.push(redEntity, greenEntity);
		this.setState(
			{
				entities: tempArr,
			},
			this.pixiUpdate
		);
	}

	addEntity = () => {
		const { app, entities, infected } = this.state;
		const texture = PIXI.Texture.from("../../virus.png");
		const greenEntity1 = new PIXI.Sprite(texture);
		// If so, reverse acceleration in that direction
		const mouseCoords = app.renderer.plugins.interaction.mouse.global;
		greenEntity1.position.set(mouseCoords.x, mouseCoords.y);
		greenEntity1.width = 50;
		greenEntity1.height = 50;
		if (infected) {
			greenEntity1.tint = "0x00FF00";
		}

		greenEntity1.acceleration = new PIXI.Point(
			Math.random() * 1,
			Math.random() * 1
		);
		greenEntity1.mass = 1;
		let tempArr = entities.slice();
		tempArr.push(greenEntity1);
		this.setState(
			{
				entities: tempArr,
			},
			this.pixiUpdate
		);
	};

	pauser = (bool) => {
		const { app, paused } = this.state;
		if(bool && !paused) {
			this.setState({
				paused: bool
			}, () => app.ticker.stop())
		}
		if(!bool && paused) {
			this.setState({
				paused: bool
			}, () => app.ticker.start())
		}
	};

	resize = () => {
		const { app } = this.state;
		const parent = app.view.parentNode;
		if (parent) {
			app.renderer.resize(parent.clientWidth, parent.clientHeight);
		}
	};

	pixiUpdate = () => {
		window.addEventListener("resize", this.resize);
		this.resize();

		const { app, entities } = this.state;
		this.pixiContainer = document.getElementById("canvas");
		if (this.pixiContainer) {
			this.pixiContainer.appendChild(app.view);

			// Strength of the impulse push between two objects
			const impulsePower = 4;
			const maxAcceleration = 13;

			// Test For Hit
			// A basic AABB check between two different Entitys
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
			app.ticker.add(() => {
				// if(entities[0]) {
					// console.log(entities[0].acceleration);
				// }
				for (let i = 0; i < entities.length; i++) {
					//deaccelerate at a rate of 0.001 per tick
					entities[i].acceleration.set(
						entities[i].acceleration.x * 0.999,
						entities[i].acceleration.y * 0.999
					);
					//check its not going out of bounds
					if (entities[i].x < 0 || entities[i].x > app.screen.width - 50) {
						entities[i].acceleration.x = -entities[i].acceleration.x;
					}
					if (entities[i].y < 0 || entities[i].y > app.screen.height - 50) {
						entities[i].acceleration.y = -entities[i].acceleration.y;
					}
					//check for collisions with all other entities
					for (let j = i + 1; j < entities.length; j++) {
						if (testForAABB(entities[i], entities[j])) {
							// Calculate the changes in acceleration that should be made between
							// each Entity as a result of the collision
							const collisionPush = collisionResponse(entities[i], entities[j]);
							if (
								entities[i].tint === "0x00FF00" ||
								entities[j].tint === "0x00FF00"
							) {
								entities[i].tint = "0x00FF00";
								entities[j].tint = "0x00FF00";
							}
							// Set the changes in acceleration for both Entitys
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
					//never go past max acceleration
					if (entities[i].acceleration.x > maxAcceleration) {
						entities[i].acceleration.set(
							maxAcceleration,
							entities[i].acceleration.y
						);
					} else if (entities[i].acceleration.x < -maxAcceleration) {
						entities[i].acceleration.set(
							-maxAcceleration,
							entities[i].acceleration.y
						);
					}
					if (entities[i].acceleration.y > maxAcceleration) {
						entities[i].acceleration.set(
							entities[i].acceleration.x,
							maxAcceleration
						);
					} else if (entities[i].acceleration.y < -maxAcceleration) {
						entities[i].acceleration.set(
							entities[i].acceleration.x,
							-maxAcceleration
						);
					}
					entities[i].x += entities[i].acceleration.x;
					entities[i].y += entities[i].acceleration.y;
				}
			});
			for (let i = 0; i < entities.length; i++) {
				app.stage.addChild(entities[i]);
			}
		}
	};

	render() {
		const { entities, infected } = this.state;
		return (
			<React.Fragment>
				<h1>Spreader</h1>
				<button
					onClick={() => {
						this.setState({
							infected: true,
						});
					}}
				>
					add infected
				</button>
				<button
					onClick={() => {
						this.setState({
							infected: false,
						});
					}}
				>
					add healthy
				</button>
				<button onClick={() => this.pauser(true)}>pause</button>
				<button onClick={() => this.pauser(false)}>play</button>
				<Canvas
					EntityArr={entities}
					adder={this.addEntity}
					update={this.pixiUpdate}
				/>
			</React.Fragment>
		);
	}
}

export default App;
