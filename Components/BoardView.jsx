import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Chess from './Chess'


export default function BoardView() {
    const [moveNum, setMoveNum] = useState(1);
    const [moveDescriptor, setMoveDescriptor] = useState("Bishop to E4");
    const route = useRoute();
    const { pieces } = route.params;


    const prevPress = () => {
        if (moveNum == 1) {
            return;
        }
        setMoveNum(moveNum - 1);
    }

    const nextPress = () => {
        if (moveNum == 10) {
            return;
        }
        setMoveNum(moveNum + 1);
    }


    return (
        <View style={styles.container}>
            <View style={styles.titleContainer} >
                <Text style={styles.title}>#{moveNum} Move</Text>
            </View>

            <View style={{flex: 2.5, backgroundColor: '#000'}}>
                <Chess pieces={pieces} />
            </View>

            <View style={styles.captionContainer}>
                <Text style={styles.subText}>{moveDescriptor}</Text>
            </View>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={prevPress} style={styles.button}>
                    <Text style={styles.buttonText}>Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={nextPress} style={styles.button}>
                    <Text style={styles.buttonText}>Next</Text>
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

    titleContainer: {
        width: '100%',
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: 40,
        backgroundColor: '#000',
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
        backgroundColor: '#000'
    },

});
