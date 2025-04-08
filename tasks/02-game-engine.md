# Task: Game Engine Implementation

## Objective
Develop the core game engine that manages the game state, updates, and rendering.

## Context
The game engine is the central component of the FORESIGHT game, coordinating all game elements and managing the game loop.

## Requirements
- Implement game state management (menu, playing, paused, game over)
- Create the main game loop using p5.js
- Manage pattern creation and updates
- Handle user interactions and input
- Implement scoring system
- Create level progression logic
- Add visual effects system

## Acceptance Criteria
- [ ] Game successfully initializes with p5.js
- [ ] Game states transition correctly
- [ ] Main game loop updates and renders at consistent frame rate
- [ ] Pattern management system works correctly
- [ ] User input is properly detected and processed
- [ ] Scoring system accurately tracks player performance
- [ ] Level progression works based on score thresholds
- [ ] Visual effects display for correct/incorrect predictions

## Implementation Details
- Use p5.js for the rendering and animation system
- Implement a state machine for game states
- Create modular systems for different game components
- Use time-based updates for consistent behavior across devices
- Implement delta time for smooth animations
- Add visual feedback for player actions

## Related Files
- js/game.js (main implementation)
- js/patterns.js (for pattern integration)
- js/levels.js (for level data)
- js/ui.js (for UI updates)