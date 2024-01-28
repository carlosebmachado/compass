import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Animated, StatusBar, Alert, TouchableHighlight, Dimensions } from "react-native";
// import { StatusBar } from "expo-status-bar";

import { Magnetometer, MagnetometerMeasurement } from "expo-sensors";
import { watchHeadingAsync, watchPositionAsync, requestForegroundPermissionsAsync, Accuracy, LocationHeadingObject, LocationObject, LocationObjectCoords } from "expo-location";


import CompassUtils from "@/util/CompassUtils";
import { colors } from "@/constants";

import Compass from "@/components/Compass";

import compassImage from "@/compass-black.png";

const windowDimensions = Dimensions.get("window");

export default function App() {
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 } as MagnetometerMeasurement);
  const [subscription, setSubscription] = useState<any>(null);
  const [headingData, setHeadingData] = useState<LocationHeadingObject>({ trueHeading: 0, magHeading: 0, accuracy: 0 } as LocationHeadingObject);
  const [locationData, setLocationData] = useState<LocationObject>({ coords: { speed: 0, altitude: 0, latitude: 0, longitude: 0, heading: 0 }, timestamp: 0, mocked: false } as LocationObject);
  const [heading, setHeading] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [direction, setDirection] = useState("N");
  const [compassRotation, setCompassRotation] = useState(0);
  const [useTrueHeading, setUseTrueHeading] = useState(true);
  const [compassRotaion, setCompassRotaion] = useState(0);

  function processHeadingData() {
    if (!headingData) return;

    if (useTrueHeading) {
      setHeading(headingData.trueHeading);
      setDirection(CompassUtils.getCardinalDirection(headingData.trueHeading));
    } else {
      setHeading(headingData.magHeading);
      setDirection(CompassUtils.getCardinalDirection(headingData.magHeading));
    }

    setCompassRotaion(360 - heading);
  }

  function processLocationData() {
    if (!locationData) return;
    setLongitude(locationData.coords.longitude);
    setLatitude(locationData.coords.latitude);
    setSpeed(locationData.coords.speed || 0);
    setAltitude(locationData.coords.altitude || 0);
  }

  async function subscribe() {
    Magnetometer.setUpdateInterval(500);
    setSubscription(
      Magnetometer.addListener((result: MagnetometerMeasurement) => {
        setMagnetometerData(result);
      })
    );

    let { status } = await requestForegroundPermissionsAsync();

    if (status !== "granted") {
      // ToastAndroid.show("Permission to access location was denied", ToastAndroid.LONG);
      Alert.alert("Permission to access location was denied");
      return;
    }

    watchHeadingAsync((heading) => {
      setHeadingData(heading);
      processHeadingData();
    });

    watchPositionAsync({ accuracy: Accuracy.Balanced, timeInterval: 1000 }, (location) => {
      setLocationData(location);
      processLocationData();
    });
  }

  function unsubscribe() {
    // Magnetometer.removeAllListeners();
    subscription?.remove();
    setSubscription(null);
  }

  useEffect(() => {
    (async () => {})();

    subscribe();
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={"black"} barStyle={"light-content"} animated={true} showHideTransition={"fade"} />

      <View style={styles.titleBarContainer}>
        <Text style={styles.appName}>Compass</Text>
        <TouchableHighlight onPress={() => {}}>
          <Text>...</Text>
        </TouchableHighlight>
      </View>

      <View style={styles.compassContainer}>
        {/* <Animated.Image source={compassImage} style={[styles.compassImage, { transform: [{ rotate: compassRotaion + "deg" }] }]} /> */}
        <Compass />
        {/* <View style={styles.compassDataContainer}>
          <Text style={styles.compassData}>{`${heading}º`}</Text>
          <Text style={styles.compassData}>{`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`}</Text>
          <Text style={styles.compassData}>{`${altitude > 1 ? Math.round(altitude) : altitude.toFixed(1)}m`}</Text>
        </View> */}
      </View>

      <View style={styles.copyrightContainer}>
        <Text>© Carlos Machado</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light100,
    width: "100%",
    height: windowDimensions.height,
  },
  titleBarContainer: {
    position: "absolute",
    top: 0,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  compassContainer: {
    // width: 250,
    // height: 250,
    width: windowDimensions.width * 0.9,
    height: windowDimensions.width * 0.9,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#ffffff",
    // borderRadius: windowDimensions.width * 0.45,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.3,
    // shadowRadius: 3,
    // elevation: 5,
  },
  compassDataContainer: {
    position: "absolute",
    // top: (""+console.log(self.window.outerHeight) || self.window.outerHeight / 2 - self.window.innerHeight / 2) || "50%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  compassData: {
    fontSize: 18,
    color: colors.dark100,
  },
  compassImage: {
    width: windowDimensions.width * 0.9,
    height: windowDimensions.width * 0.9,
  },
  copyrightContainer: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
