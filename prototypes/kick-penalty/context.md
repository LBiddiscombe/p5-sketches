# Kick Penalty

A single-kick penalty sandbox: the player aims and fires at the goal, the goalie tries to save it, and you see the result.

## Language

**Ball**:
The projectile the player kicks. When it enters the goal within the frame it's a score; when it hits the goalie it's a save.
_Avoid_: Shot, projectile

**Decision**:
The type of behaviour the goalie follows on each kick: `read` (predict ball and dive to intercept), `freeze` (stay centred, raise arms, no movement), or `randcorner` (dive to a random post at a random height regardless of ball direction). The decision is chosen randomly from a weighted array (`GOALIE_DECISIONS`).

**Dive**:
The goalie's movement on kick: for a `read` or `randcorner` decision, moves to `targetX` / `targetY` using lerp for horizontal and gravity for vertical. If the dive distance is ≥1m the sprite rotates to horizontal in 100ms and the collision zone swaps to 1.8m × 1.0m orientation. For shorter movements (<1m) the goalie stays upright with the standing zone.
_Avoid_: Jump, lunge

**Freeze**:
A goalie decision outcome where the keeper stands centred, raises arms (dive sprite) after the reaction delay, but makes no lateral or vertical movement.

**Random corner**:
A goalie decision outcome where the keeper dives to a random post at a random height, ignoring the ball's actual direction. The collision zone and rotation behave identically to a `read` dive.

**Read**:
A goalie decision outcome where the keeper uses perfect physics to predict the ball's position at the goal line and dives to intercept it. This is the original always-save behaviour, now reduced by weighting in `GOALIE_DECISIONS`.

**Goal**:
The 3D target area the ball must enter to count as a score. Defined by width and height.
_Avoid_: Net, frame

**Goalie**:
The AI-controlled defender standing on the goal line. Switches from a standing pose to a diving pose on kick. The collision zone rotates 90° when prone: from a 1.0m × 1.8m upright rectangle to a 1.8m × 0.5m ground-level rectangle extending in the dive direction.

**Kick**:
The player's action — tap near the ball to start a power charge, then release to launch the ball toward the goal. Direction is determined by where the finger/mouse is relative to the ball on release.
_Avoid_: Shoot, strike

**Miss**:
A kick that doesn't result in a score. The ball may go wide of the posts, over the bar, or hit the goalie (a save).

**Penalty spot**:
The position on the pitch where the ball starts before each kick.

**Power**:
The magnitude of the kick, determined by how long the player holds the tap. The power meter cycles from 0 to max over `POWER_CYCLE_MS`; releasing earlier gives less power, waiting for a full cycle gives max power.

**Reach**:
The goalie's effective coverage zone within the goal: full goal width (±3.66m) and the lower half of the goal height (up to 1.22m).

**Reaction delay**:
A random pause between the kick and the start of the goalie's action (movement or freeze pose). Sampled uniformly from `[0, MAX_REACTION_DELAY_MS]` independently each kick. Applies to all decision types.

**Save**:
When the goalie's body blocks the ball from entering the goal. The ball deflects away.
_Avoid_: Block, stop

**Score**:
When the ball enters the goal within the frame and avoids the goalie. Each score is a discrete result of a single kick.
_Avoid_: Goal
