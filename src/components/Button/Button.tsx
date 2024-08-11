import { Component, ComponentProps, ClickHandler } from "@ollyrowe/core";
import "./Button.css";

interface ButtonProps extends ComponentProps {
  variant?: "filled" | "text";
  onClick?: (e?: MouseEvent) => void;
}

export class Button extends Component {
  private variant: ButtonVariant;

  private onClick?: (e?: MouseEvent) => void;

  constructor({ variant = "filled", onClick, ...props }: ButtonProps) {
    super(props);

    this.variant = variant;

    this.onClick = onClick;
  }

  @ClickHandler()
  public handleClick(e: MouseEvent) {
    this.onClick?.(e);
  }

  public render() {
    const classString = this.variant === "text" ? "button text" : "button box";

    return <button class={classString}>{this.children}</button>;
  }
}

type ButtonVariant = "filled" | "text";
