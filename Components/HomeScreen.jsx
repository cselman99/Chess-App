import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ImageBackground, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import default_img from '../assets/default-image.jpeg';


export default function HomeScreen() {
    const navigation = useNavigation();
    const default_img_uri = Image.resolveAssetSource(default_img).uri;
    const [image, setImage] = useState(default_img_uri);
    const [filePopupMenu, setFilePopupMenu] = useState(false);
    const [imageUploadStatus, setImageUploadStatus] = useState(false);
    const [board, setBoard] = useState({})
    const logo = '../assets/Chess_qdt60.png';

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    useEffect(() => {
            if ('pieces' in board) {
                console.log("Set State completed", board);
                setImage(default_img_uri);
                setImageUploadStatus(false);
                navigation.navigate('BoardView', board);
            }
        }, [board])


    const selectFile = () => setFilePopupMenu(!filePopupMenu);
    const takePhoto = async () => {
        console.log("Take Photo Pressed");
        const res = await ImagePicker.getCameraPermissionsAsync();
        if (Platform.OS == "ios" && res.status !== 'granted') {
            const {s} = await ImagePicker.requestCameraPermissionsAsync();
            if (s.status !== 'granted') {
            alert("Features may be limited without access");
            return;
            }
        }
        const image = await ImagePicker.launchCameraAsync();

        if (!image.cancelled) {
            setImage(image.uri);
            setImageUploadStatus(true);
            setFilePopupMenu(!filePopupMenu);
        }
    };

    const choosePhoto = async () => {
        console.log("Choose Photo Pressed");
        const res = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (Platform.OS === "ios" && res.status !== 'granted') {
            const {s} = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log(s)
            if (s.status !== 'granted') {
            alert("Features may be limited without access");
            return;
            }
        }
        let image = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!image.cancelled) {
            setImage(image.uri);
            setImageUploadStatus(true);
            setFilePopupMenu(!filePopupMenu);
        }
    };

    const submitPressed = async () => {
        setFilePopupMenu(false);
        await uploadImage();
    }

    const uploadImage = async () => {
        // const data = new FormData();
        // data.append('name', 'Image Upload');
        // data.append('file', image);
        // let res = await fetch(
        //         'http://192.168.1.224:3000/submitImage',
        //         {
        //             method: 'post',
        //             body: data,
        //             headers: {
        //                 'Content-Type': 'multipart/form-data; ',
        //             },
        //         }
        //     );
        // let responseJson = await res.json();
        // if (responseJson.status == 1) {
        //     alert('Upload Successful');
        // }

        await fetch('http://192.168.1.224:3000/classify', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(pieces => setBoard(pieces))
            .catch(err => console.log("Failed to retrieve moves.\n" + err));
        return 1;
    };

    if (filePopupMenu) {
        var menu = (
            <>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={choosePhoto}>
            <Text style={styles.buttonText}>Choose From Library</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={selectFile}>
            <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            </>
        )
    } else {
        var menu = (
            <TouchableOpacity onPress={selectFile} style={styles.button}>
            <Text style={styles.buttonText}>Select File</Text>
            </TouchableOpacity>
        )
        }

        if (imageUploadStatus && !filePopupMenu) {
        var uploadButton = (
            <>
            <TouchableOpacity onPress={submitPressed} style={styles.buttonSpecial}>
                <Text style={styles.buttonText}>Upload</Text>
            </TouchableOpacity>
            </>
        )
    }

    return (
        <View style={[styles.container, {flexDirection: "column", justifyContent: "center", width: windowWidth, height: windowHeight}]}>
            <View style={{width: '100%', height: '92%'}} >
                <View style={[styles.centerContents, {flex: 2, backgroundColor: "#eee", paddingTop: 40}]}>
                    <View>
                        <ImageBackground source={{'uri': image}} style={{'height': '90%', 'width': undefined, 'aspectRatio': 1}}></ImageBackground>
                    </View>
                    <View style={{top: '-8%'}}>
                        <ImageBackground source={require(logo)} style={{'height': 60, 'width': 60}}></ImageBackground>
                    </View>
                </View>
                <View  style={[styles.centerContents, {flex: 1.2, justifyContent: 'flex-end'}]} >
                    {menu}
                    {uploadButton}
                </View>
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
      width: 250,
      height: 60,
      backgroundColor: '#3740ff',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 4,
      marginBottom:12,
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
  
    buttonText: {
      textAlign: 'center',
      fontSize: 15,
      color: '#fff',
    },
  
    centerContents: {
      justifyContent: 'center',
      alignItems: 'center', 
    }
  
  });
  