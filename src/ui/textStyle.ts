import { UI_FONT } from '../config/constants';

/** Base Phaser text style for in-game UI copy */
export function uiText(
  size: string,
  color: string,
  extra?: Phaser.Types.GameObjects.Text.TextStyle,
): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: UI_FONT,
    fontSize: size,
    color,
    ...extra,
  };
}
