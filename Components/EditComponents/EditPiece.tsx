import React, { useCallback } from "react";
import { StyleSheet, Image } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { toTranslation, SIZE, toPosition, PIECES } from "../Notation";

const styles = StyleSheet.create({
  piece: {
    width: SIZE,
    height: SIZE,
  },
});


const matTranslate = ({x, y}) => {
  'worklet';
  return {x: Math.round(x / SIZE), y: Math.round(y / SIZE)};
}

const EditPiece = ({ id, name, position, board, removeSelf }) => {
  // console.log(board);
  const isGestureActive = useSharedValue(false);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const translateX = useSharedValue(position.x * SIZE);
  const translateY = useSharedValue(position.y * SIZE);
  const movePiece = useCallback(
    (to) => {
      const from = { x: offsetX.value, y: offsetY.value };
      const fromArr = matTranslate(from);

      // If dragged off board, then remove piece from board.
      if ((to.x > 7 || to.x < 0 || to.y > 7 || to.y < 0)) {
        if (board[fromArr.y][fromArr.x] === 'k' || board[fromArr.y][fromArr.x] === 'K') {
          to = matTranslate(from);  // Return King to original location
        } else {  // Remove from View (Lazy method)
          translateX.value = -100;
          translateY.value = -100;
          // board[fromArr.y][fromArr.x] = '';
          removeSelf(id, {y: fromArr.y, x: fromArr.x});
          return;
        }
      }

      console.log('Piece at 2: ' + board[to.y][to.x]);
      console.log('From: ' + fromArr.x + ", " + fromArr.y);
      const toArr = board[to.y][to.x] === '' ? to : fromArr;
      console.log('To: ' + toArr.x + ", " + toArr.y);
      // const move = moves.find((m) => m.from === from && m.to === to);
      translateX.value = withTiming(toArr.x * SIZE, {},
        () => (offsetX.value = translateX.value)
      );
      translateY.value = withTiming(toArr.y * SIZE, {}, () => {
        offsetY.value = translateY.value;
        isGestureActive.value = false;
      });
      const toPiece = board[toArr.y][toArr.x];
      board[toArr.y][toArr.x] = board[fromArr.y][fromArr.x];
      board[fromArr.y][fromArr.x] = toPiece;
      
    },
    [board, isGestureActive, offsetX, offsetY, translateX, translateY]
  );
  const onGestureEvent = useAnimatedGestureHandler({
    onStart: () => {
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
      isGestureActive.value = true;
    },
    onActive: ({ translationX, translationY }) => {
      translateX.value = offsetX.value + translationX;
      translateY.value = offsetY.value + translationY;
    },
    onEnd: () => {
      runOnJS(movePiece)(
        matTranslate({ x: translateX.value, y: translateY.value })
      );
    },
  });
  const style = useAnimatedStyle(() => ({
    position: "absolute",
    zIndex: isGestureActive.value ? 100 : 10,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));
  const original = useAnimatedStyle(() => {
    return {
      position: "absolute",
      width: SIZE,
      height: SIZE,
      zIndex: 0,
      backgroundColor: "transparent",
      transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
    };
  });
  const underlay = useAnimatedStyle(() => {
    const position = toPosition({ x: translateX.value, y: translateY.value });
    const translation = toTranslation(position);
    return {
      position: "absolute",
      width: SIZE,
      height: SIZE,
      zIndex: 0,
      backgroundColor: "transparent",
      transform: [{ translateX: translation.x }, { translateY: translation.y }],
    };
  });
  return (
    <>
      <Animated.View style={original} />
      <Animated.View style={underlay} />
      <PanGestureHandler onGestureEvent={onGestureEvent} enabled={true}>
        <Animated.View style={style}>
            <Image source={PIECES[name]} style={styles.piece} />
        </Animated.View>
      </PanGestureHandler>
    </>
  );
};

export default EditPiece;
