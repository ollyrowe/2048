import { Component } from "@ollyrowe/core";

export class Icon extends Component {
  protected colour: string;
  protected size: { width: number; height: number };

  constructor({
    colour = "var(--text-colour-light)",
    size = { width: 20, height: 20 },
  } = {}) {
    super();

    this.colour = colour;
    this.size = size;
  }
}
