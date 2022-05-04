/* eslint-disable prefer-destructuring */
import { Position } from "chess.js";
import { Dimensions } from "react-native";
import { Vector } from "react-native-redash";

const { width } = Dimensions.get("window");
export const SIZE = width / 8;

export const toTranslation = (to: Position) => {
  "worklet";
  // worklet don't support destructuring yet
  const tokens = to.split("");
  const col = tokens[0];
  const row = tokens[1];
  if (!col || !row) {
    throw new Error("Invalid notation: " + to);
  }
  const indexes = {
    x: col.charCodeAt(0) - "a".charCodeAt(0),
    y: parseInt(row, 10) - 1,
  };
  return {
    x: indexes.x * SIZE,
    y: 7 * SIZE - indexes.y * SIZE,
  };
};

export const toPosition = ({ x, y }: Vector) => {
  "worklet";
  const col = String.fromCharCode(97 + Math.round(x / SIZE));
  const row = `${8 - Math.round(y / SIZE)}`;
  return `${col}${row}` as Position;
};

export const PIECES = {
  r: require("../assets/br.png"),
  p: require("../assets/bp.png"),
  n: require("../assets/bn.png"),
  b: require("../assets/bb.png"),
  q: require("../assets/bq.png"),
  k: require("../assets/bk.png"),
  R: require("../assets/wr.png"),
  N: require("../assets/wn.png"),
  B: require("../assets/wb.png"),
  Q: require("../assets/wq.png"),
  K: require("../assets/wk.png"),
  P: require("../assets/wp.png"),
};

export const BLACK_PIECES = {
  p: require("../assets/bp.png"),
  r: require("../assets/br.png"),
  n: require("../assets/bn.png"),
  b: require("../assets/bb.png"),
  q: require("../assets/bq.png"),
  // k: require("../assets/bk.png"),
}

export const WHITE_PIECES = {
  P: require("../assets/wp.png"),
  R: require("../assets/wr.png"),
  N: require("../assets/wn.png"),
  B: require("../assets/wb.png"),
  Q: require("../assets/wq.png"),
  // K: require("../assets/wk.png"),
}