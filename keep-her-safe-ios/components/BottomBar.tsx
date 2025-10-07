import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AccountButton from "../assets/images/accountNavButton.svg";
import LocationButton from "../assets/images/locationNavButton.svg";
import SOSNavButton from "../assets/images/sosNavButton.svg";

type BottomBarProps = {
    onPressLocation: () => void;
    onPressSOS: () => void;
    onPressAccount: () => void;
}

export default function BottomBar({ onPressLocation, onPressSOS, onPressAccount }: BottomBarProps) {
    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={styles.buttonsBar}>
                {/* <TouchableOpacity onPress={onPressCheckIn}>
                </TouchableOpacity> */}

                <TouchableOpacity onPress={onPressLocation}>
                    <LocationButton width={48} height={48} />
                </TouchableOpacity>
             
                <TouchableOpacity onPress={onPressSOS} style={styles.sosButton}>
                    <SOSNavButton/>
                </TouchableOpacity>

                <TouchableOpacity onPress={onPressAccount}>
                    <AccountButton width={45} height={43}/>
                </TouchableOpacity>
            </View>
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
    },   
   
    // 
    buttonsBar: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-around',
        overflow: 'visible',

        paddingTop: 20,
        gap: 100,
        width: '100%',
        height: 100,
        borderRadius: 30,
        backgroundColor: '#fff',
    },

    // Styling for SOS Button on Nav Bar
    sosButton: {
        display: 'flex',
        position: 'absolute', 
        justifyContent: 'center',
        alignItems: 'center',
        top: -25,
        width: 78, 
        height: 78
    }
});


