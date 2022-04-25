import React from "react";
import { View, StyleSheet } from "react-native";
import EditBoard from "./EditBoard";


const EditContainer = (data) => {
  const mat = data['mat'];
  const handlePress = data['handlePress'];

  return (
    <View style={styles.container}>
      <EditBoard mat={mat} handlePress={handlePress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});

export default EditContainer;