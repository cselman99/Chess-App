import React, { useEffect, useState, useCallback } from 'react';
import { TouchableOpacity,
    StyleSheet,
    Text, 
    View, 
    Dimensions, 
    Image, 
    Button } from 'react-native';
import { PanGestureHandler } from "react-native-gesture-handler";
import { useRoute } from '@react-navigation/native';
import EditContainer from './EditComponents/EditContainer'
import { Chess } from 'chess.js';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native-paper';
import { minimax } from './Minimax'
import { toPosition, toTranslation, SIZE, PIECES, WHITE_PIECES, BLACK_PIECES } from './Notation'
import Animated, {
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
  } from "react-native-reanimated";
import EditPiece from './EditComponents/EditPiece';
import switch_symbol from '../assets/switch_symbol.png';
import { ip } from './Constants'

const mapPieces = {
    'white-pawn': 'P',
    'white-rook': 'R',
    'white-bishop': 'B',
    'white-knight': 'N',
    'white-king': 'K',
    'white-queen': 'Q',
    'black-pawn': 'p',
    'black-rook': 'r',
    'black-bishop': 'b',
    'black-knight': 'n',
    'black-king': 'k',
    'black-queen': 'q',
}


function rotateCW(matrix) {
    const n = matrix.length;
    const x = Math.floor(n/ 2);
    const y = n - 1;
    var k;
    for (let i = 0; i < x; i++) {
       for (let j = i; j < y - i; j++) {
          k = matrix[i][j];
          matrix[i][j] = matrix[y - j][i];
          matrix[y - j][i] = matrix[y - i][y - j];
          matrix[y - i][y - j] = matrix[j][y - i]
          matrix[j][y - i] = k
       }
    }
}


function rotateCCW(matrix) {
    const n = matrix.length;
    const x = Math.floor(n/ 2);
    const y = n - 1;
    var k;
    for (let i = 0; i < x; i++) {
       for (let j = i; j < y - i; j++) {
            k = matrix[i][j];
            matrix[i][j] = matrix[j][y - i];  // 0,2  1,2
            matrix[j][y - i] = matrix[y - i][y - j]; // 2,2  2,1
            matrix[y - i][y - j] = matrix[y - j][i]  // 2,0  1,0
            matrix[y - j][i] = k
       }
    }
}


function buildMat(pieces) {
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
    
    if (pieces == undefined) {
        console.log("Could not detect pieces. Returning to home page.");
    } else {
        for (var i = 0; i < pieces.length; i++) {
            pieceName = pieces[i][0];
            pieceLoc = pieces[i][1];
            x = pieceLoc[0];
            y = pieceLoc[1];
            // console.log(`${x}, ${y} - ${pieceName}}`);
            board[y - 1][x - 1] = mapPieces[pieceName];
        }
    }
    rotateCCW(board);
    return board // Rotate perspective 90 deg CCW
}

export function matToFen(board, turn='w', enpassant='-', blackCastle='-', whiteCastle='-') {
    var castle = "";
    if (blackCastle !== '-' && whiteCastle !== '-') {
        castle = whiteCastle + blackCastle;
    } else if (blackCastle !== '-' && whiteCastle === '-') {
        castle = blackCastle;
    } else if (blackCastle === '-' && whiteCastle !== '-') {
        castle = whiteCastle;
    } else {
        castle = "-";
    }
    if (board == undefined) {
        console.log('Matrix is undefined. Cannot convert to fen');
        return '';
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
    fen_notation += ' ' + turn + ' ' + castle + ' ' + enpassant + ' 0 10';
    console.log(fen_notation);
    return fen_notation;
}


function matTranslate({x, y}) {
    'worklet';
    var xs = Math.round(x / SIZE);
    var ys = Math.round(y / SIZE);
    
    return {x: xs, y: ys};
  }


export default function EditView() {
    const [isLoading, setIsLoading] = useState(false);
    const route = useRoute();
    const navigation = useNavigation();
    const { pieces, turn, enpassant, castleWhite, castleBlack } = route.params;
    const mat = buildMat(pieces);

    const [piecePicker, setPiecePicker] = useState({
        'pieces': WHITE_PIECES,
        'label': 'w',
    });

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const position = {x: 0, y: 0};

    const isGestureActive = useSharedValue(false);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const translateX = useSharedValue(position.x * SIZE);
    const translateY = useSharedValue(position.y * SIZE);

    const movePiece = useCallback(
        (to) => {
        if (to.x > 7 || to.x < 0 || to.y > 7 || to.y < 0 || mat[to.y][to.x] !== '') {
            return;
        } else {
            // translateX.value = withTiming(to.x * SIZE, {},
            //     () => (offsetX.value = translateX.value)
            // );
            // translateY.value = withTiming(to.y * SIZE, {}, () => {
            //     offsetY.value = translateY.value;
            //     isGestureActive.value = false;
            // });

            translateX.value = 0;
            translateY.value = 0;
            isGestureActive.value = false;
            mat[toArr.y][toArr.x] = 'P';
        }
        
        },
        [mat, isGestureActive, offsetX, offsetY, translateX, translateY]
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
        position: "relative",
        zIndex: isGestureActive.value ? 100 : 10,
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
    }));

    const picker = (
        <View style={styles.scrollContainer}>
            {Object.entries(piecePicker['pieces']).reverse().map((key, index, value) => {
                return (
                        <PanGestureHandler onGestureEvent={onGestureEvent} enabled={true}>
                            <Animated.View style={style}>
                                <Image id={`${index}`} key={`${index}`} source={PIECES[key[0]]} style={styles.piece} />
                            </Animated.View>
                        </PanGestureHandler>
                );
            })}
            <Button title='muck' onPress={() => setPiecePicker({
                    label: piecePicker['label'] === 'w' ? 'b' : 'w',
                    pieces: piecePicker['label'] === 'w' ? BLACK_PIECES : WHITE_PIECES
                })} >
                {/* <Image source={switch_symbol} style={styles.piece} /> */}
            </Button>
        </View>
    );

    const minimaxConfirm = async () => {
        setIsLoading(true);
        console.log("Finding best moves...");
        const fen = matToFen(mat, turn, enpassant, castleBlack, castleWhite);
        const game = new Chess(fen);
        const [bestMove, value] = await minimax(game, 6, true, turn, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
        console.log(bestMove);
        console.log('Done. Score: ' + value);
        navigation.navigate('BoardView', {'fen': fen, 'bestMoves': bestMove});
        setIsLoading(false);
    }

    const stockfishConfirm = async () => {
        setIsLoading(true);
        console.log("Retrieving stockfish move...");
        const fen = matToFen(mat, turn, enpassant, castleBlack, castleWhite);
        const response = await fetch(ip + ':3000/stockfish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'move': fen, 'time': 5})
        })
            .then(response => response.json())
            .catch(er => console.log(er));

        console.log(response);
        if (response['status'] == 'SUCCESS') {
            const dataPackage = {
                color: turn,
                from: response['from'],
                to: response['to'],
                piece: response['piece'].toLowerCase(),
            }
            navigation.navigate('BoardView', {'fen': fen, 'bestMoves': dataPackage});
        }
        setIsLoading(false);
    }

    return (
        <View style={styles.container}>

            {isLoading ? <ActivityIndicator animating={isLoading} size='large' color={'#3740ff'} style={{position: 'absolute', width: windowWidth / 2, height: windowHeight / 1.5, zIndex: 100}} /> : <></>}

            <View style={{flex: 4, backgroundColor: '#fff', marginTop: 0}}>
                {/* <ChessContainer pieces={fen} /> */}
                <EditContainer mat={mat} handlePress={null} />
            </View>

            {/* <ScrollView horizontal={true} style={styles.scrollView}> */}
            <View style={{display: 'flex', flexDirection: 'row'}}>
                {picker}
            </View>
            {/* </ScrollView> */}

            <View style={styles.captionContainer}>
                <Text style={[styles.subText, {fontWeight: 'bold'}]}>Directions:</Text>
                <Text style={styles.subText}>Add or remove pieces as needed.</Text>
                <Text style={styles.subText}>Press Confirm when board looks correct.</Text>
            </View>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={minimaxConfirm} style={styles.button}>
                    <Text style={styles.buttonText}>Minimax</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={stockfishConfirm} style={styles.button}>
                    <Text style={styles.buttonText}>Stockfish</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
    
}


const styles = StyleSheet.create({

    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },

    button: {
        width: 140,
        height: 50,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        marginBottom:12,
    },

    buttonText: {
        color: '#fff',
        fontSize: 22,
    },

    buttonContainer: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },

    subText: {
        fontSize: 20,
        fontStyle: 'italic',
    },

    captionContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        width: '100%',
        height: 80,
        padding: 20,
    },

    scrollView: {
        height: 0,
        backgroundColor: '#ddd',
    },

    scrollContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',    
    },

});
