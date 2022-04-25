import React from "react";
import { View, StyleSheet } from "react-native";
import Board from "./Board";

// =========================================================================================== //
// Chess Board Source code from:
// https://github.com/wcandillon/can-it-be-done-in-react-native/tree/master/season4/src/Chess
// =========================================================================================== //

const ChessContainer = (data) => {
  const fen_notation = data['pieces'];

  return (
    <View style={styles.container}>
      <Board fen={fen_notation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});

export default ChessContainer;