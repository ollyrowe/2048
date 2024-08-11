import { Component, State } from "@ollyrowe/core";
import "./Tile.css";

interface TileProps {
  value: number;
  location: Location;
}

export class Tile extends Component {
  @State()
  public value: number;

  @State()
  public location: Location;

  @State()
  // Whether this tile has been merged into by another tile
  public merged = false;

  // Whether another tile has been merged into this tile
  public consumed = false;

  constructor({ value, location }: TileProps) {
    super();

    this.value = value;
    this.location = location;
  }

  public render() {
    const styleString = `color: ${this.getFontColour()}; background-color: ${this.getBackgroundColour()}`;

    const classString = this.getClasses().join(" ");

    return (
      <div style={styleString} class={classString}>
        {this.value}
      </div>
    );
  }

  private getClasses() {
    const classes = [
      "tile",
      `row-${this.location.y}`,
      `column-${this.location.x}`,
    ];

    if (this.merged) {
      classes.push("merged");
    }

    return classes;
  }

  private getFontColour() {
    return this.value > 4 ? "var(--text-colour-light)" : "var(--text-colour)";
  }

  private getBackgroundColour() {
    switch (this.value) {
      case 2:
        return "#efe4dd";
      case 4:
        return "#efdfc5";
      case 8:
        return "#efb37b";
      case 16:
        return "#f89562";
      case 32:
        return "#f87d63";
      case 64:
        return "#f75d3b";
      case 128:
        return "#eece73";
      case 256:
        return "#edcc61";
      case 512:
        return "#edc850";
      case 1024:
        return "#edc53f";
      case 2048:
        return "#edc22e";
      default:
        return "#3c3a32";
    }
  }
}

export interface Location {
  x: number;
  y: number;
}
