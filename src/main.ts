import { Renderer } from "@ollyrowe/core";
import { Game } from "./components/Game";
import "./style.css";

const root = document.querySelector<HTMLDivElement>("#app")!;

const game = new Game();

Renderer.render(game, root);
