# Orbit Games by 3Sci Labs

[Play all five games](https://thefamousjc.github.io/classicgames/)

A browser-playable collection of five reimagined arcade games, with original canvas visuals, keyboard and touch controls, pause/resume, escalating levels, and local best scores.

| Game | Play | Controls |
| --- | --- | --- |
| Earth Defence | [Deploy](https://thefamousjc.github.io/classicgames/earth-defence/) | Arrows or A/D, Space to fire, Shift to dash |
| Gobbler | [Enter maze](https://thefamousjc.github.io/classicgames/play.html?game=gobbler) | Arrows or WASD |
| Meteors | [Launch](https://thefamousjc.github.io/classicgames/play.html?game=meteors) | Left/right rotate, up thrust, Space fire |
| Gorillaz | [Climb](https://thefamousjc.github.io/classicgames/play.html?game=gorillaz) | Left/right run, up/down climb, Space jump |
| Star Shooter | [Fly](https://thefamousjc.github.io/classicgames/play.html?game=shooter) | Left/right strafe, up/down altitude, Space fire |

Press P to pause. On-screen buttons support touch. Each game has three lives and unlimited escalating levels. Gobbler has power cores, Meteors has splitting rocks and inertia, Gorillaz has rolling drums and ladders, and Star Shooter has altitude gates and drones.

## Run locally

Open index.html in a browser or serve the repository with a static HTTP server. No build or dependency installation required. Earth Defence optionally loads Google Fonts; system fonts work offline.

## Verification

Run `node tests/smoke.cjs` for headless gameplay checks of the four new engines, including maze connectivity, rock splitting, ladder traversal, gate collisions, scoring, game over, restart, and pause. These use a simulated canvas/DOM and complement browser playtesting.

## Hosting and mobile

GitHub Pages serves the repository root from main. This is a web prototype collection; signed Android and iOS apps are a future packaging step.
