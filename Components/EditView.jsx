import React, { useState, useCallback, useRef } from 'react';
import { TouchableOpacity,
    StyleSheet,
    Text, 
    View, 
    Dimensions, 
    Image } from 'react-native';
import { PanGestureHandler } from "react-native-gesture-handler";
import { useRoute } from '@react-navigation/native';
import EditContainer from './EditComponents/EditContainer'
import { Chess } from 'chess.js';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native-paper';
import { minimax } from './Minimax'
import { SIZE, PIECES, WHITE_PIECES, BLACK_PIECES } from './Notation'
import Animated, {
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
  } from "react-native-reanimated";
import EditPiece from './EditComponents/EditPiece';
import { ip } from './Constants';
import * as eh from './EditHelpers';


function printMat(mat) {
    for (var i = 0; i < mat.length; i++) {
        var temp = ''
        for(var j = 0; j < mat.length; j++) {
            if (mat[i][j] == '') {
                temp += "_ ";
            } else {
                temp += mat[i][j] + " ";
            }
        }
        console.log(temp);
    }
}


export default function EditView() {
    const route = useRoute();
    const navigation = useNavigation();
    const { pieces, turn, enpassant, castleWhite, castleBlack } = route.params;
    const [mat, setMat] = useState(eh.buildMat(pieces));
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    var relX = 0.06 * windowWidth;
    const listPieces = ['Q', 'B', 'N', 'R', 'P'];

    const piecePickerWhite = {
        'pieces': WHITE_PIECES,
        'label': 'w',
    }

    const piecePickerBlack = {
        'pieces': BLACK_PIECES,
        'label': 'b',
    }

    const [isLoading, setIsLoading] = useState(false);
    const [boardBoundaries, setBoardBoundaries] = useState({x: 0, y: 0, w: 0, h: 0});
    const [selectBoundaries, setSelectBoundaries] = useState({x: 0, y: 0, w: 0, h: 0});
    const [pieceList, setPieceList] = useState([]);
    const [piecePicker, setPiecePicker] = useState(piecePickerWhite);

    const piecePickerRef = useRef(piecePicker);
    
    const removePiece = (id, position) => {
        console.log('removing piece ' + id);
        const matClone = mat;
        matClone[position.y][position.x] = '';
        setMat(matClone);
        setPieceList(buildPieceList(matClone))
        printMat(mat);
    }

    function pieceFactory(pl) {
        const newList = pl.map( val => {
            return (
                <EditPiece
                    key={val.id}
                    id={val.id}
                    name={val.name}
                    position={val.position}
                    board={mat}
                    removeSelf={removePiece}
                />);
        });
        return newList;
    }

    const picker = (
        <View style={[styles.scrollContainer, {justifyContent: 'space-between', width: '88%', left: '6%'}]} >
            <View style={styles.scrollContainer}>
                {Object.entries(piecePicker['pieces']).reverse().map((key, index, value) => {
                    relX += SIZE;
                    return ( getAnimatedPiece(key, index, relX, listPieces[index]) );
                })}
            </View>
            <View styles={{height: SIZE, width: SIZE}}>
                <TouchableOpacity onPress={() => {
                    setPiecePicker((prevState) => {
                        piecePickerRef.current = prevState.label === 'w' ? piecePickerBlack : piecePickerWhite
                        return prevState.label === 'w' ? piecePickerBlack : piecePickerWhite
                    });
                }} >
                    <Image source={require('../assets/switch_symbol.png')}
                        style={{ width: SIZE, height: SIZE }} />
                </TouchableOpacity>
            </View>
        </View>
    );


    const minimaxConfirm = async () => {
        setIsLoading(true);
        console.log("Finding best moves...");
        const fen = eh.matToFen(mat, turn, enpassant, castleBlack, castleWhite);
        const game = new Chess(fen);
        const [bestMove, value] = await minimax(game, 3, true, turn, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
        console.log(bestMove);
        console.log('Done. Score: ' + value);
        navigation.navigate('BoardView', {'fen': fen, 'bestMoves': bestMove});
        setIsLoading(false);
    }

    const stockfishConfirm = async () => {
        setIsLoading(true);
        console.log("Retrieving stockfish move...");
        const fen = eh.matToFen(mat, turn, enpassant, castleBlack, castleWhite);
        console.log(fen);
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

    function getAnimatedPiece(key, index, relX, piece) {
        const position = {x: 0, y: 0};
        const isGestureActive = useSharedValue(false);
        const offsetX = useSharedValue(0);
        const offsetY = useSharedValue(0);
        const translateX = useSharedValue(position.x * SIZE);
        const translateY = useSharedValue(position.y * SIZE);
    
        const findSquare = (coords) => {
            const res = {x: Math.round(coords.x / SIZE) - 1, y: Math.round(coords.y / SIZE)};
            return res;
        }
    
        const movePiece = useCallback(
            (to) => {
                const page_margin = Math.ceil((boardBoundaries.h - boardBoundaries.w) / 2);
                const top =  boardBoundaries.y + page_margin
                var coords = {x: relX + selectBoundaries.x + to.x, y: selectBoundaries.y + to.y - top};
                const newTo = findSquare(coords);
                if (newTo.x > 7 || newTo.x < 0 || newTo.y > 7 || newTo.y < 0 || mat[newTo.y][newTo.x] !== '') {
                    console.log('Denied:  ' + newTo.x + ", " + newTo.y);
                    return;
                }
                const pieceName = piecePickerRef.current.label === 'w' ? piece : piece.toLowerCase();
                translateX.value = 0;
                translateY.value = 0;
                isGestureActive.value = false;

                const matClone = mat;
                matClone[newTo.y][newTo.x] = pieceName;
                setMat(matClone);

                const merged = buildPieceList(matClone);
                setPieceList(merged);

                console.log("Adding new piece " + pieceName);
                printMat(mat);
            },
            [mat, pieceList, isGestureActive, offsetX, offsetY, translateX, translateY]
        );
        const gestureEvent = useAnimatedGestureHandler({
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
                { x: translateX.value, y: translateY.value }
            );
            translateX.value = offsetX.value;
            translateY.value = offsetY.value;
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
    
        return (
            <PanGestureHandler onGestureEvent={gestureEvent}
                enabled={true}>
                <Animated.View style={style}>
                    <Image id={`${index}`} source={PIECES[key[0]]} style={styles.piece} />
                </Animated.View>
            </PanGestureHandler>);
    }

    function buildPieceList(mat) {
        var pieceId = -1;
        const mappedPieces2D = mat.map((row, y) =>
            (row.map((piece, x) => {
                if (piece !== '') {
                    pieceId += 1;
                    return (
                        {
                            id: pieceId,
                            name: piece,
                            position: { x: x, y: y },
                        }
                    );
                }
            })).filter(val => val != undefined)
        );
        var merged = mappedPieces2D.reduce(function(prev, next) {
            return prev.concat(next);
        });
        return merged;
    }


    return (
        <View style={styles.container}>

            {isLoading ? <ActivityIndicator animating={isLoading} size='large' color={'#3740ff'} style={{position: 'absolute', width: windowWidth / 2, height: windowHeight / 1.5, zIndex: 100}} /> : <></>}

            <View style={{flex: 4, backgroundColor: '#fff', marginTop: 0}} onLayout={(event) => {
                var {x, y, width, height} = event.nativeEvent.layout;
                setBoardBoundaries({ x: x, y: y, w: width, h: height });
                setPieceList(buildPieceList(mat));
            }}>
                <EditContainer key={pieceList} mat={pieceFactory(pieceList)}/> 
            </View>

            <View style={{display: 'flex', flexDirection: 'row', width: '100%'}} onLayout={(event) => {
                var {x, y, width, height} = event.nativeEvent.layout;
                setSelectBoundaries({ x: x, y: y, w: width, h: height });
            }}>
                {picker}
            </View>

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
    scrollContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    piece: {
        height: SIZE,
        width: SIZE
    },

});
