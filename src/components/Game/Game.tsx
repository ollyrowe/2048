import {
  Component,
  State,
  SwipeEvent,
  KeyDownHandler,
  SwipeHandler,
  TransitionEndHandler,
} from "@ollyrowe/core";
import { Location, Tile } from "../Tile";
import { RefreshIcon } from "../Icons";
import { Button } from "../Button";
import "./Game.css";

export class Game extends Component {
  @State()
  public tiles: Tile[] = [];

  private hasTileMoved = false;

  @State()
  private score = 0;

  @State()
  private highScore = Game.getHighScore();

  @State()
  private isGameOver = false;

  @State()
  private displayConfirmReset = false;

  /** Local storage key used to store the user's high score */
  private static HIGH_SCORE_LS_KEY = "high-score";

  constructor(tiles?: Tile[]) {
    super();

    if (tiles) {
      this.tiles = tiles;
    } else {
      this.createNewTile();
      this.createNewTile();
    }
  }

  @SwipeHandler({ target: document })
  public moveTiles(event: SwipeEvent) {
    // Check that the tiles have moved before moving them again
    if (this.hasTileMoved) {
      return;
    }

    if (this.isPaused()) {
      return;
    }

    const { direction } = event;

    // Loop through each row / column
    for (let i = 1; i <= 4; i++) {
      //  Loop backwards through each row / column
      for (let j = 4; j >= 1; j--) {
        const x = direction === "right" ? j : direction === "left" ? 5 - j : i;
        const y = direction === "down" ? j : direction === "up" ? 5 - j : i;

        const tile = this.getTileAtLocation({ x, y });

        // If there is no tile at this location, continue
        if (!tile) {
          continue;
        }

        // Move the tile as far in the given direction as possible
        while (
          ((direction === "right" && tile.location.x < 4) ||
            (direction === "left" && tile.location.x > 1) ||
            (direction === "up" && tile.location.y > 1) ||
            (direction === "down" && tile.location.y < 4)) &&
          !this.getAdjacentTile(tile.location, direction)
        ) {
          this.moveTileInDirection(tile, direction);
        }

        // If there is an adjacent tile in the given direction of this tile, and they have the same value, merge them
        const adjacentTile = this.getAdjacentTile(tile.location, direction);

        if (
          adjacentTile &&
          adjacentTile.value === tile.value &&
          !(adjacentTile.merged || adjacentTile.consumed)
        ) {
          // Flag the tile as consumed
          tile.consumed = true;

          // Flag the adjacent tile as merged
          adjacentTile.merged = true;

          // Increase the score
          this.score += tile.value * 2;

          // Move the tile in the given direction
          this.moveTileInDirection(tile, direction);
        }
      }
    }
  }

  @KeyDownHandler({ target: document })
  public onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowUp":
        this.moveTiles({ direction: "up" });
        break;
      case "ArrowRight":
        this.moveTiles({ direction: "right" });
        break;
      case "ArrowDown":
        this.moveTiles({ direction: "down" });
        break;
      case "ArrowLeft":
        this.moveTiles({ direction: "left" });
        break;
    }
  }

  @TransitionEndHandler()
  public handleAnimationEnd(event: TransitionEvent) {
    // Ignore any transform transition which aren't relevant to the tile's movement
    if (event.propertyName === "transform") {
      return;
    }

    // Locate tiles in the same location
    const overlappingTiles = this.tiles.filter((tile) => {
      const otherTile = this.tiles.find(
        (otherTile) =>
          otherTile !== tile &&
          isSameLocation(tile.location, otherTile.location)
      );

      return otherTile;
    });

    // Filter out merged tiles
    const tilesToRemove = overlappingTiles.filter((tile) => !tile.merged);

    const tilesToKeep = overlappingTiles.filter((tile) => tile.merged);

    // Remove the tiles from the game
    this.tiles = this.tiles.filter((tile) => !tilesToRemove.includes(tile));

    tilesToKeep.forEach((tile) => {
      tile.value *= 2;
      tile.merged = false;
    });

    if (this.hasTileMoved) {
      // Add a new tile to the game
      this.createNewTile();
    }

    this.hasTileMoved = false;

    if (!this.hasAvailableMoves()) {
      this.isGameOver = true;

      this.recordHighScore();

      return;
    }
  }

  public render() {
    return (
      <div class="game">
        <div class="header">
          <h1 class="title">2048</h1>
          <div class="box">
            <div class="score-text">Score</div>
            <div>{this.score}</div>
          </div>
          <div class="box margin-left">
            <div class="score-text">High Score</div>
            <div>{this.highScore || "-"}</div>
          </div>
        </div>
        <div class="header flex-row">
          <Button onClick={() => this.confirmResetGame()}>
            <RefreshIcon />
          </Button>
        </div>
        <div class="grid-container">
          <div class="grid">
            {...this.generatePlaceholders()}
            {...this.tiles}
            {this.renderOverlay()}
          </div>
        </div>
      </div>
    );
  }

  private renderOverlay() {
    if (this.displayConfirmReset) {
      return (
        <div class="grid-overlay">
          <div>Restart?</div>
          <div>
            <Button variant="text" onClick={() => this.resetGame()}>
              Yes
            </Button>
            <Button variant="text" onClick={() => this.closeResetConfirm()}>
              No
            </Button>
          </div>
        </div>
      );
    }

    if (this.isGameOver) {
      return <div class="grid-overlay">Game Over!</div>;
    }
  }

  private confirmResetGame() {
    this.displayConfirmReset = true;
  }

  private closeResetConfirm() {
    this.displayConfirmReset = false;
  }

  private resetGame() {
    this.tiles = [];
    this.score = 0;
    this.isGameOver = false;
    this.displayConfirmReset = false;

    this.createNewTile();
    this.createNewTile();
  }

  private generatePlaceholders() {
    return new Array(16).fill(null).map((_, index) => {
      const classString = `placeholder row-${
        Math.floor(index / 4) + 1
      } column-${(index % 4) + 1}`;

      return <div class={classString} />;
    });
  }

  private getAdjacentTile(location: Location, direction: Direction) {
    switch (direction) {
      case "right":
        return this.getTileAtLocation({ x: location.x + 1, y: location.y });
      case "left":
        return this.getTileAtLocation({ x: location.x - 1, y: location.y });
      case "up":
        return this.getTileAtLocation({ x: location.x, y: location.y - 1 });
      case "down":
        return this.getTileAtLocation({ x: location.x, y: location.y + 1 });
    }
  }

  private getTileAtLocation(location: Location) {
    return this.tiles.find((tile) => isSameLocation(tile.location, location));
  }

  /**
   * Move a tile in a specified direction.
   */
  private moveTileInDirection(tile: Tile, direction: Direction) {
    switch (direction) {
      case "right":
        tile.location.x += 1;
        break;
      case "left":
        tile.location.x -= 1;
        break;
      case "up":
        tile.location.y -= 1;
        break;
      case "down":
        tile.location.y += 1;
        break;
    }

    this.hasTileMoved = true;
  }

  private hasAvailableMoves() {
    // Loop through each location on the board
    for (let i = 1; i <= 4; i++) {
      for (let j = 1; j <= 4; j++) {
        // Get the tile at the current location
        const tile = this.getTileAtLocation({ x: j, y: i });

        // If there's a missing tile, then a move is available
        if (!tile) {
          return true;
        }

        // If there's an adjacent tile with the same value, then there's still a move available
        if (
          this.getAdjacentTile(tile.location, "right")?.value === tile.value ||
          this.getAdjacentTile(tile.location, "left")?.value === tile.value ||
          this.getAdjacentTile(tile.location, "up")?.value === tile.value ||
          this.getAdjacentTile(tile.location, "down")?.value === tile.value
        ) {
          return true;
        }
      }
    }

    return false;
  }

  private createNewTile() {
    // 75% chance of a 2, 25% chance of a 4
    const value = random() < 0.75 ? 2 : 4;

    const location: Location = {
      x: Math.floor(random() * 4) + 1,
      y: Math.floor(random() * 4) + 1,
    };

    // Check if there is already a tile at this location
    if (this.tiles.some((tile) => isSameLocation(tile.location, location))) {
      this.createNewTile();
    } else {
      this.tiles.push(new Tile({ value, location }));
    }
  }

  private isPaused() {
    return this.isGameOver || this.displayConfirmReset;
  }

  private static getHighScore() {
    const highScoreItem = localStorage.getItem(Game.HIGH_SCORE_LS_KEY);

    if (!highScoreItem) {
      return undefined;
    }

    return parseInt(highScoreItem);
  }

  private recordHighScore() {
    this.highScore = this.score;

    localStorage.setItem(Game.HIGH_SCORE_LS_KEY, this.highScore.toString());
  }
}

let seed = 5;

function random() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const isSameLocation = (firstLocation: Location, secondLocation: Location) => {
  return (
    firstLocation.x === secondLocation.x && firstLocation.y === secondLocation.y
  );
};

type Direction = "up" | "down" | "left" | "right";
