# Kick Volley

A volley practice sketch: the ball auto-spawns from the left, bounces across the pitch, and the player volleys it toward the goal. The goalie tries to save it.

## Language

**Ball**:
The projectile that auto-spawns from the left edge and bounces across the pitch at z=0. The player volleys it toward the goal. When it enters the goal within the frame it's a score; when it hits the goalie it's a save.
_Avoid_: Shot, projectile

**Decision**:
The type of behaviour the goalie follows on each volley: `read` (predict ball and dive to intercept), `freeze` (stay centred, raise arms, no movement), or `randcorner` (dive to a random post at a random height regardless of ball direction). The decision is chosen randomly from a weighted array (`GOALIE_DECISIONS`).

**Dive**:
The goalie's movement on volley: for a `read` or `randcorner` decision, moves to `targetX` / `targetY` using lerp for horizontal and gravity for vertical. If the dive distance is ≥1m the sprite rotates to horizontal in 100ms and the collision zone swaps to 1.8m × 1.0m orientation. For shorter movements (<1m) the goalie stays upright with the standing zone.
_Avoid_: Jump, lunge

**Freeze**:
A goalie decision outcome where the keeper stands centred, raises arms (dive sprite) after the reaction delay, but makes no lateral or vertical movement.

**Random corner**:
A goalie decision outcome where the keeper dives to a random post at a random height, ignoring the ball's actual direction. The collision zone and rotation behave identically to a `read` dive.

**Read**:
A goalie decision outcome where the keeper uses perfect physics to predict the ball's position at the goal line and dives to intercept it.

**Goal**:
The 3D target area the ball must enter to count as a score. Defined by width and height.
_Avoid_: Net, frame

**Goalie**:
The AI-controlled defender standing on the goal line. Switches from a standing pose to a diving pose on volley. The collision zone rotates 90° when prone: from a 1.0m × 1.8m upright rectangle to a 1.8m × 0.5m ground-level rectangle extending in the dive direction.

**Volley**:
The player's action — tap on the ball to volley it toward the goal with fixed power. Direction is determined by where the finger/mouse is relative to the ball on tap.
_Avoid_: Kick, shoot, strike

**Miss**:
A volley that doesn't result in a score. The ball may go wide of the posts, over the bar, or hit the goalie (a save).

**Save**:
When the goalie's body blocks the ball from entering the goal. The ball deflects away.
_Avoid_: Block, stop

**Score**:
When the ball enters the goal within the frame and avoids the goalie. Each score is a discrete result of a single volley.
_Avoid_: Goal

**Spawn**:
The initial state of each ball — launched from the left edge at configurable position (SPAWN_X, SPAWN_Y, SPAWN_Z) with configurable velocity (SPAWN_VX, SPAWN_VY, SPAWN_VZ). The ball bounces across the pitch at z=0 until volleyed.
