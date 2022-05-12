import React, { useState, useRef } from 'react';
import { 
    TouchableOpacity,
    StyleSheet, 
    Text, 
    View, 
    ImageBackground, 
    TextInput,
    Image,
    } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { buildMat } from './EditHelpers';


export default function BoundView() {
    const route = useRoute();
    const { pieces } = route.params;
    const [turn, setTurn] = useState('w');
    const [enpassant, setEnpassant] = useState('-');
    const [castleWhite, setCastleWhite] = useState('-')
    const [castleBlack, setCastleBlack] = useState('-')

    const logo = '../assets/Chess_qdt60.png';
    const navigation = useNavigation();

    const submitPressed = () => {
        const packageContent = {'pieces': pieces,
                                'turn': turn.toLowerCase(),
                                'enpassant': enpassant,
                                'castleWhite': castleWhite,
                                'castleBlack': castleBlack}
        navigation.navigate('EditView', packageContent);
    }

    var uploadButton = (
        <>
        <TouchableOpacity onPress={submitPressed} style={styles.buttonSpecial}>
            <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
        </>
    )

    return (
        <View style={styles.root}>
            <View style={{position: 'absolute', top: '3%'}}>
                <Image source={require(logo)} style={{'height': 60, 'width': 60}} />
            </View>
            <View style={[styles.textbox, {borderWidth: 0, height: '15%'}]}>
                <Text style={styles.question}>Color to move?</Text>
                <View style={[styles.inline, styles.twobuttons]}>
                    <View style={[styles.buttonBackground, turn === 'w' ? styles.active : styles.inactive]} >
                        <TouchableOpacity onPress={() => setTurn('w')} >
                            <Image source={require('../assets/wp.png')} styles={styles.squareButton} />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.buttonBackground, turn === 'b' ? styles.active : styles.inactive]} >
                        <TouchableOpacity onPress={() => setTurn('b')} >
                            <Image source={require('../assets/bp.png')} styles={styles.squareButton} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View style={styles.textbox}>
                <Text style={styles.question}>Current En Passant?</Text>
                <TextInput
                    style={{height: 20}}
                    autoCorrect={false}
                    maxLength={2}
                    onChangeText={newText => setEnpassant(newText)}
                    defaultValue={enpassant}
                />
            </View>
            <View style={styles.textbox}>
                <Text style={styles.question}>Black castling status?</Text>
                <TextInput
                    style={{height: 40}}
                    maxLength={2}
                    onChangeText={newText => setCastleBlack(newText)}
                    defaultValue={castleBlack}
                />
            </View>
            <View style={styles.textbox}>
                <Text style={styles.question}>White castling status?</Text>
                <TextInput
                    style={{height: 40}}
                    maxLength={2}
                    onChangeText={newText => setCastleWhite(newText)}
                    defaultValue={castleWhite}
                />
            </View>
            {uploadButton}
        </View>
    );

}


const styles = StyleSheet.create({
    textbox: {
        borderColor: '#000000',
        borderWidth: 1.5,
        height: '12%',
        marginBottom: '8%',
        width: '100%',
        alignContent: 'center',
    },
    question: {
        fontSize: 24,
        color: '#fff',
        backgroundColor: '#000',
        width: '100%',
        height: 30,
        textAlign: 'center',
    },
    root: {
      height: '100%',
      width: '100%',
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonContainer: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
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
    buttonSpecial: {
        width: 250,
        height: 60,
        backgroundColor: '#000',
        color: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        marginBottom:12,
    },
    inline: {
        display: 'flex',
        flexDirection: 'row'
    },
    twobuttons: {
        width: '100%',
        height: '100%',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        // backgroundColor: 'red'
    },
    buttonBackground: {
        width: 80,
        height: 80,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    active: {
        backgroundColor: 'yellow',
    },
    inactive: {
        backgroundColor: '#ddd',
    },
    squareButton: {
        width: 60,
        height: 60,
        borderWidth: 2,
        borderColor: 'black',
        overflow: 'hidden',
    }
});

