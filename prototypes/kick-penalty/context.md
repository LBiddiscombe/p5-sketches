# Kick Penalty

A single-kick penalty sandbox: the player aims and fires at the goal, the goalie tries to save it, and you see the result.

## Language

**Ball**:
The projectile the player kicks. When it enters the goal within the frame it's a score; when it hits the goalie it's a save.
_Avoid_: Shot, projectile

**Dive**:
The goalie's movement on kick: predicts the ball's position at the goal line from initial velocity and gravity, then moves to intercept. If the dive distance is ≥1m the sprite rotates to horizontal in 100ms and the collision zone swaps to 1.8m × 1.0m orientation. For shorter movements (<1m) the goalie stays upright with the standing zone.
_Avoid_: Jump, lunge

**Goal**:
The 3D target area the ball must enter to count as a score. Defined by width and height.
_Avoid_: Net, frame

**Goalie**:
The AI-controlled defender standing on the goal line. Switches from a standing pose to a diving pose on kick. The collision zone rotates 90° when prone: from a 1.0m × 1.8m upright rectangle to a 1.8m × 0.5m ground-level rectangle extending in the dive direction.

**Kick**:
The player's action — clicking or tapping the canvas — that launches the ball toward the goal.
_Avoid_: Shoot, strike

**Miss**:
A kick that doesn't result in a score. The ball may go wide of the posts, over the bar, or hit the goalie (a save).

**Penalty spot**:
The position on the pitch where the ball starts before each kick.

**Reach**:
The goalie's effective coverage zone within the goal: full goal width (±3.66m) and the lower half of the goal height (up to 1.22m).

**Reaction delay**:
A fixed pause between the kick and the start of the goalie's dive movement.

**Save**:
When the goalie's body blocks the ball from entering the goal. The ball deflects away.
_Avoid_: Block, stop

**Score**:
When the ball enters the goal within the frame and avoids the goalie. Each score is a discrete result of a single kick.
_Avoid_: Goal
