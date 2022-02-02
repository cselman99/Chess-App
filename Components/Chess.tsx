import React from "react";
import { View, StyleSheet } from "react-native";
import Board from "./Board";

// =========================================================================================== //
// Chess Board Source code from:
// https://github.com/wcandillon/can-it-be-done-in-react-native/tree/master/season4/src/Chess
// =========================================================================================== //

const Chess = (pieces) => {
  var board = [
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '']];

  var x;
  var y;
  var pieceName;
  var pieceLoc;

  const contents = pieces['pieces']['pieces'];  // Gross JSON notation. NEED TO FIX
  console.log(contents);
  console.log(contents.length);
  if (contents == undefined) {
    console.log("Could not detect pieces");
    alert("Could not detect pieces.");
  } else {
    for (var i = 0; i < contents.length; i++) {
      pieceName = contents[i][0];
      pieceLoc = contents[i][1];
      x = pieceLoc[0];
      y = pieceLoc[1];
      board[y][x] = pieceName
      console.log(`${x}, ${y} – ${pieceName}}`);
    }
  }

  var counter;
  var fen_notation = '';
  for (var i = 0; i < board.length; i++) {
    counter = 0;
    for (var j = 0; j < board.length; j++) {
      if (board[i][j] === '') {
        counter += 1;
      } else {
        if (counter > 0) {
          fen_notation += '' + counter;
        }
        counter = 0;
        fen_notation += board[i][j];
      }
    }
    if (counter > 0) {
      fen_notation += '' + counter;
    }
    fen_notation += '/';
  }

  fen_notation = fen_notation.substring(0, fen_notation.length - 1);
  fen_notation += ' b - c3 0 10'; // temp
  console.log(fen_notation);

  return (
    <View style={styles.container}>
      <Board fem={fen_notation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});

export default Chess;