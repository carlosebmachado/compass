import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, StatusBar, Alert, Dimensions, Button } from "react-native";

import { Magnetometer, MagnetometerMeasurement } from "expo-sensors";
import { watchHeadingAsync, stopGeofencingAsync, watchPositionAsync, requestForegroundPermissionsAsync, Accuracy, LocationHeadingObject, LocationObject } from "expo-location";

import CompassUtils from "@/util/CompassUtils";
import { colors, settings } from "@/constants";

import Compass from "@/components/Compass";

const windowDimensions = Dimensions.get("window");

export default function App() {
  const [loading, setLoading] = useState(true);
  const [startedHeadingWatch, setStartedHeadingWatch] = useState(false);
  const [startedLocationWatch, setStartedLocationWatch] = useState(false);
  const [compassLoaded, setCompassLoaded] = useState(false);
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 } as MagnetometerMeasurement);
  const [subscription, setSubscription] = useState<any>(null);
  const [rawHeadingData, setRawHeadingData] = useState<LocationHeadingObject>({ trueHeading: 0, magHeading: 0, accuracy: 0 } as LocationHeadingObject);
  const [rawLocationData, setRawLocationData] = useState<LocationObject>({ coords: { speed: 0, altitude: 0, latitude: 0, longitude: 0, heading: 0 }, timestamp: 0, mocked: false } as LocationObject);
  const [heading, setHeading] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [direction, setDirection] = useState("N");
  const [compassRotation, setCompassRotation] = useState(0);
  const [useTrueHeading, setUseTrueHeading] = useState(true);

  function processHeadingData(headingData: LocationHeadingObject) {
    var currHeading = useTrueHeading ? headingData.trueHeading : headingData.magHeading;

    if (currHeading < 0) {
      currHeading += 360;
    }

    setHeading(currHeading);
    setDirection(CompassUtils.getCardinalDirection(currHeading));
    setCompassRotation(360 - currHeading);
  }

  function processLocationData(locationData: LocationObject) {
    setLongitude(locationData.coords.longitude);
    setLatitude(locationData.coords.latitude);
    setSpeed(locationData.coords.speed || 0);
    setAltitude(locationData.coords.altitude || 0);
  }

  async function subscribe() {
    if (!subscription) {
      Magnetometer.setUpdateInterval(settings.updateInterval);
      setSubscription(
        Magnetometer.addListener((result: MagnetometerMeasurement) => {
          setMagnetometerData(result);
        })
      );
    }

    let { status } = await requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return;
    }

    if (!startedHeadingWatch) {
      setStartedHeadingWatch(true);
      await watchHeadingAsync((headingData) => {
        setRawHeadingData(headingData);
        processHeadingData(headingData);
      });
    }

    if (!startedLocationWatch) {
      setStartedLocationWatch(true);
      await watchPositionAsync({ accuracy: Accuracy.Balanced, timeInterval: settings.updateInterval }, (locationData) => {
        setRawLocationData(locationData);
        processLocationData(locationData);
      });
    }
  }

  function unsubscribe() {
    subscription?.remove();
    setSubscription(null);
  }

  useEffect(() => {
    if (startedHeadingWatch && startedLocationWatch) {
      setLoading(false);
    }
    subscribe();
    return () => unsubscribe();
  }, [startedHeadingWatch, startedLocationWatch, compassLoaded]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.light100} barStyle={"dark-content"} animated={true} showHideTransition={"fade"} />

      <View style={styles.titleBarContainer}>
        <Text style={styles.appName}>Compass</Text>
      </View>

      <View style={styles.compassContainer}>
        <View
          style={{
            position: "absolute",
            width: 7,
            height: 50,
            backgroundColor: "#be0000",
            bottom: "83.58%",
            left: windowDimensions.width / 2 - 15 - 3.5,
            transform: [{ translateX: -5 }, { translateY: -5 }],
          }}
        ></View>
        <Compass heading={compassRotation} />
        <View style={styles.compassDataContainer}>
          <Text style={styles.compassDegree}>{`${heading.toFixed(1)}º ${direction}`}</Text>
          <Text style={styles.compassData}>{`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`}</Text>
          <Text style={styles.compassData}>{`${altitude > 1 ? Math.round(altitude) : altitude.toFixed(1)}m`}</Text>
        </View>
      </View>

      <View style={styles.copyrightContainer}>
        <Text>Your Simple Compass</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light100,
    width: windowDimensions.width,
    height: windowDimensions.height,
  },
  titleBarContainer: {
    position: "absolute",
    top: 0,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.dark400,
  },
  compassContainer: {
    width: windowDimensions.width * 0.9,
    height: windowDimensions.width * 0.9,
    justifyContent: "center",
    alignItems: "center",
  },
  compassDataContainer: {
    position: "absolute",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  compassDegree: {
    fontSize: 32,
    color: colors.dark400,
  },
  compassData: {
    fontSize: 12,
    color: colors.dark100,
  },
  compassImage: {
    width: windowDimensions.width * 0.9,
    height: windowDimensions.width * 0.9,
  },
  copyrightContainer: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
