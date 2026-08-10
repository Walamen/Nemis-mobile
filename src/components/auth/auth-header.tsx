import { Image } from 'expo-image';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

const HEADER_HEIGHT_RATIO = 0.4;
const WAVE_WIDTH_RATIO = 1;

/**
 * Shared wave-divided header for the (auth) screens (login, reset password):
 * the brand image on top with a curved white wave into the form below.
 * The curve is a plain View (no react-native-svg in this project) — a
 * circle wide enough to span the screen, centered on the header's bottom
 * edge, so only its arc shows.
 */
export function AuthHeader() {
  const { width, height } = useWindowDimensions();
  const headerHeight = height * HEADER_HEIGHT_RATIO;
  const waveDiameter = width * WAVE_WIDTH_RATIO;

  return (
    <>
      <View style={{ height: headerHeight }}>
        <Image
          style={StyleSheet.absoluteFill}
          source={require('@/assets/images/splash-screen.jpg')}
          contentFit="cover"
        />
      </View>
      <View
        style={[
          styles.waveCurve,
          {
            top: headerHeight - waveDiameter / 2,
            left: (width - waveDiameter) / 2,
            width: waveDiameter,
            height: waveDiameter,
            borderRadius: waveDiameter / 2,
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  waveCurve: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});
