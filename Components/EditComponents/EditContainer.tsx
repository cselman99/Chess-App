import React from "react";
import { View, StyleSheet } from "react-native";
import EditBoard from "./EditBoard";


const EditContainer = (data) => {
  const mat = data['mat'];

  return (
    <View style={styles.container}>
      <EditBoard key={mat} mat={mat} />
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