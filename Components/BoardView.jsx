import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import ChessContainer from './BoardComponents/ChessContainer'


const pieceMap = {
    "p": "Pawn",
    "r": "Rook",
    "n": "Knight",
    "k": "King",
    "q": "Queen",
    "b": "Bishop"
}


function extractMove(move) {
    const color = move['color'] === 'w' ? 'White' : 'Black';
    const from = move['from'];
    const to = move['to'];
    const piece = move['piece'];
    // const captured = move['captured'];
    return "Move " + color + " " + pieceMap[piece] + " from " + from + " to " + to
}


export default function BoardView() {
    const route = useRoute();
    const { fen, bestMoves } = route.params;
    const [moveDescriptor, setMoveDescriptor] = useState("");
    const turn = bestMoves['color'];
    console.log(bestMoves);

    useEffect(() => {
        setMoveDescriptor(extractMove(bestMoves));
    }, [bestMoves]);


    return (
        <View style={styles.container}>
            <View style={styles.titleContainer} >
                <Text style={styles.title}>Best Move for {turn === 'w' ? 'White' : 'Black'}</Text>
            </View>

            <View style={{flex: 0.75, backgroundColor: '#000'}}>
                <ChessContainer pieces={fen} pressEvent={() => console.log("made it")}/>
            </View>

            <View style={styles.captionContainer}>
                <Text style={styles.subText}>{moveDescriptor}</Text>
            </View>
            
            {/* <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={prevPress} style={styles.button}>
                    <Text style={styles.buttonText}>Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={nextPress} style={styles.button}>
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
            </View> */}
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

    titleContainer: {
        width: '100%',
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: 40,
        backgroundColor: '#333',
    },

    title: {
        fontSize: 30,
        fontWeight: '500',
        color: '#fff',
    },

    subText: {
        fontSize: 28,
        fontStyle: 'italic',
        color: '#fff',
    },

    captionContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 80,
        padding: 20,
        backgroundColor: '#333'
    },

});
