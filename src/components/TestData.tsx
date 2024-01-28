import CompassUtils from "@/util/CompassUtils";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TestData({ heading, location, x, y, z }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.titleData}>Magnetometer values</Text>
      <Text style={styles.bodyData}>{`x: ${Number.parseFloat(x.toFixed(2))}    y: ${Number.parseFloat(y.toFixed(2))}    z: ${Number.parseFloat(z.toFixed(2))}`}</Text>

      <Text style={styles.titleData}>Compass values</Text>
      <Text style={styles.bodyData}>{`True Heading: ${heading && heading.trueHeading}`}</Text>
      <Text style={styles.bodyData}>{`Mag Heading: ${heading && heading.magHeading}`}</Text>
      <Text style={styles.bodyData}>{`Direction: ${CompassUtils.getCardinalDirection(heading && heading.trueHeading)}`}</Text>
      {/* <Text style={styles.bodyData}>{`HeadingAsync: ${JSON.stringify(heading)}`}</Text> */}

      <Text style={styles.titleData}>Location values</Text>
      <Text style={styles.bodyData}>{`Speed: ${location && location.coords.speed}`}</Text>
      <Text style={styles.bodyData}>{`Altitude: ${location && location.coords.altitude}`}</Text>
      <Text style={styles.bodyData}>{`Latitude: ${location && location.coords.latitude}`}</Text>
      <Text style={styles.bodyData}>{`Longitude: ${location && location.coords.longitude}`}</Text>
      <Text style={styles.bodyData}>{`Heading: ${location && location.coords.heading}`}</Text>
      {/* <Text style={styles.bodyData}>{`Raw: ${JSON.stringify(location)}`}</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  titleData: {
    fontSize: 18,
    marginTop: 10,
    color: "#555",
    fontWeight: "bold",
  },
  bodyData: {
    fontSize: 18,
    color: "#555",
  },
});
