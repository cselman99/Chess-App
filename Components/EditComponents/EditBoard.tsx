import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions, Image, Text } from "react-native";
import { Chess } from "chess.js";
import Background from "../Background";
import EditPiece from "./EditPiece";
import { SIZE } from "../Notation";

const { width } = Dimensions.get("window");

const PIECES = {
  r: require("../../assets/br.png"),
  p: require("../../assets/bp.png"),
  n: require("../../assets/bn.png"),
  b: require("../../assets/bb.png"),
  q: require("../../assets/bq.png"),
  k: require("../../assets/bk.png"),
  R: require("../../assets/wr.png"),
  N: require("../../assets/wn.png"),
  B: require("../../assets/wb.png"),
  Q: require("../../assets/wq.png"),
  K: require("../../assets/wk.png"),
  P: require("../../assets/wp.png"),
};

function useConst<T>(initialValue: T | (() => T)): T {
  const ref = useRef<{ value: T }>();
  if (ref.current === undefined) {
    // Box the value in an object so we can tell if it's initialized even if the initializer
    // returns/is undefined
    ref.current = {
      value:
        typeof initialValue === "function"
          ? // eslint-disable-next-line @typescript-eslint/ban-types
            (initialValue as Function)()
          : initialValue,
    };
  }
  return ref.current.value;
}

const styles = StyleSheet.create({
  container: {
    width,
    height: width,
  },
  piece: {
    width: SIZE,
    height: SIZE,
  },
});


const EditBoard = (data) => {
  const mat = useConst(() => data["mat"]);

  return (
    <View style={styles.container}>
      <Background />
      {mat}
    </View>
  );
};

export default EditBoard;