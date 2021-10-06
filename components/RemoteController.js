import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Text, TextInput, ScrollView, TouchableWithoutFeedback } from 'react-native';
import _ from 'lodash';

const MESSAGES_PER_SECOND = 3;

const dateTimeOfNow = () => {
    var timestamp = Date.now();
    var d = new Date(timestamp);

    return ("00" + d.getDate()).slice(-2) + "-" +
        ("00" + (d.getMonth() + 1)).slice(-2) + "-" +
        d.getFullYear() + " " +
        ("00" + d.getHours()).slice(-2) + ":" +
        ("00" + d.getMinutes()).slice(-2) + ":" +
        ("00" + d.getSeconds()).slice(-2)
};

/**
 * Creates a view where it is possible to pilot a drone. This view has many buttons that send UDP datagrams
 * to the cluster wss.
 * @param {*} props Contains the property "namespace", the UDP socket instance, the selected "device" and the method returnToList.
 * @returns {Component} RemoteController
 */
export default function RemoteController(props) {
    const [socket, setData] = useState(props.socket);
    const [serverReply, setServerReply] = useState('Connected');
    const [text, setText] = useState('');
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [altitude, setAltitude] = useState(0);
    const [velocity, setVelocity] = useState(0.5);
    const [velocityMap, setVelocityMap] = useState({ x: 0, y: 0, z: 0, _x: 0, _y: 0, _z: 0 }); // first three are linear directions, last three are radial directions
    const [xDirection, setXDirection] = useState('none');
    const [yDirection, setYDirection] = useState('none');
    const [zDirection, setZDirection] = useState('none');
    const [_zDirection, set_ZDirection] = useState('none');
    const [copterId, setCopterId] = useState(`fccs_${props.device.mac_address.replace(/:/g, "").toLowerCase()}`);
    const [moveDroneInterval, setMoveDroneInterval] = useState(null);

    /**
     * Sends a datagram containing a message passed as property.
     * @param {*} msg 
     */
    const sendPacket = (msg) => {
        try {
            socket.send(`${msg}`, undefined, undefined, props.port, `udp.${props.namespace}.aviot.it`, function (err) {
                if (err) throw err
                console.log('Message sent!');
            });
        } catch (err) {
            console.log(err);
        }
    }

    socket.once('message', function (data, rinfo) {
        var data_json_str = String.fromCharCode.apply(null, new Uint8Array(data));
        console.log(
            'Received ' + data_json_str + ' ' + JSON.stringify(rinfo),
        );
        try {
            setServerReply([JSON.parse(data_json_str), JSON.stringify(rinfo)]);
        } catch (err) {
            console.log("Message ERROR: ", err);
        }
        socket.removeAllListeners();
    });

    /**
     * Send a datagram containing a message that is a json with two fields:
     * @param {*} event String referring to which event/action must be triggered
     * @param {*} data Json containing the needed data for the specified event
     */
    const emitEvent = (event, data) => {
        const dgram_msg = {
            event,
            data
        }
        sendPacket(JSON.stringify(dgram_msg));
    };

    /**
     * Allows to specify the drone's velocity and its movements direction.
     * @param {*} key String named as one of the linear axis (x,y,z) or radial axis (_x,_y,_z). If null is passed, it means that the drone must stop.
     * @param {*} value Float value for the speed
     */
    const setVelocityMapValue = (key, value, mustCheck) => {
        if (mustCheck)
            value = onCheckLimit(value);
        var newVelocityMap = _.cloneDeep(velocityMap);
        if (key) {
            newVelocityMap[key] = value;
        }
        setVelocityMap(newVelocityMap);
        return newVelocityMap;
    };

    /**
     * Stops the drone if it was moving.
     */
    const stopDrone = () => {
        var newVelocityMap = { x: 0, y: 0, z: 0, _x: 0, _y: 0, _z: 0 };
        setXDirection('none');
        setYDirection('none');
        setZDirection('none');
        setVelocityMap(newVelocityMap);
        try {
            if (moveDroneInterval !== null) {
                clearInterval(moveDroneInterval);
                setMoveDroneInterval(null);
                console.log("Cleared interval");
            }
        } catch (err) {
            console.log(err);
        }
    };

    /*useEffect(() => {
        const interval = setInterval(() => emitEvent('cmd_vel', { copterId, linear: { x: velocityMap['x'], y: velocityMap['y'], z: velocityMap['z'] }, radial: { _x: velocityMap['_x'], _y: velocityMap['_y'], _z: velocityMap['_z'] } }), MESSAGES_PER_SECOND);
        //setMoveDroneInterval(interval);
        return () => clearInterval(interval);
    }, []);*/

    /**
     * It toggles the buttons and set the variables to send messages.
     * @param {*} axis Either x, y, z
     * @param {*} direction Direction on the specified axis (left/right, forward/backward, up/down)
     * @param {*} key The key of the velocityMap (x,y,z,_x,_y,_z)
     * @param {*} value The velocity value
     */
    const setDroneVelocity = (axis, direction, key, value) => {
        //emitEvent('arm', { copterId }); // this will force arming the drone and will change the mode of the drone in "GUIDED", needed to pilot it
        console.log(axis, direction, key, value);
        switch (axis) {
            case 'x':
                if (direction === xDirection) {
                    setXDirection('none');
                    value = 0;
                } else {
                    setXDirection(direction);
                }
                break;
            case 'y':
                if (direction === yDirection) {
                    setYDirection('none');
                    value = 0;
                } else {
                    setYDirection(direction);
                }
                break;
            case 'z':
                if (direction === zDirection) {
                    setZDirection('none');
                    value = 0;
                } else {
                    setZDirection(direction);
                }
                break;
            case '_z':
                if (direction === _zDirection) {
                    set_ZDirection('none');
                    value = 0;
                } else {
                    set_ZDirection(direction);
                }
                break;
            default:
        }
        const newVelocityMap = setVelocityMapValue(key, value, true);
        try {
            if (moveDroneInterval === null) {
                var interval = setInterval(() => emitEvent('cmd_vel', { copterId, linear: { x: newVelocityMap['x'], y: newVelocityMap['y'], z: newVelocityMap['z'] }, angular: { x: newVelocityMap['_x'], y: newVelocityMap['_y'], z: newVelocityMap['_z'] } }), 1000 / MESSAGES_PER_SECOND);
                setMoveDroneInterval(interval);
                console.log("Created interval");
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Clear the interval and reset passed variables related to the movement.
     * @param {*} axis Either x, y, z
     * @param {*} direction Direction on the specified axis (left/right, forward/backward, up/down)
     * @param {*} key The key of the velocityMap (x,y,z,_x,_y,_z)
     * @param {*} value The velocity value
     */
    const clearDroneVelocity = (axis, key) => {
        switch (axis) {
            case 'x':
                setXDirection('none');
                break;
            case 'y':
                setYDirection('none');
                break;
            case 'z':
                setZDirection('none');
                break;
            case '_z':
                set_ZDirection('none');
                break;
            default:
        }
        setVelocityMapValue(key, 0, false);
        try {
            if (moveDroneInterval !== null) {
                clearInterval(moveDroneInterval);
                setMoveDroneInterval(null);
                console.log("Cleared interval");
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * It prints the server reply in a way that is possible to read.
     * @param {*} data Array containing two jsons.
     */
    const formatReplyMessage = (data) => {
        if (data && data[0].event)
            return `Message received!\nEvent: ${data[0].event}\nData: ${JSON.stringify(data[0].data)}\nTime: ${dateTimeOfNow()}`;
        return "Connected";
    };

    /**
     * It checkes if the given velocity is inside the limits (0.1,3). It sets the value after completing the checks.
     * @param {*} newVelocity 
     */
    const onCheckLimit = (newVelocity) => {
        /*if (newVelocity >= 0) {
            if (newVelocity < 0.1) {
                newVelocity = 0.1;
            } else if (newVelocity > 3) {
                newVelocity = 3;
            }
        } else {
            if (newVelocity > -0.1) {
                newVelocity = -0.1;
            } else if (newVelocity < -3) {
                newVelocity = -3;
            }
        }*/
        setVelocity(Math.abs(newVelocity));
        return newVelocity;
    }


    return (
        <ScrollView style={styles.container}>
            <View style={styles.align_center}>
                <Text style={styles.title}>{props.device.current_name}</Text>
            </View>
            <View style={styles.align_center}>
                <Text style={{ fontWeight: "bold" }}>Commands</Text>
            </View>
            {/*<View style={{ marginTop: 15 }}>
                <Button title="SET MODE" onPress={() => sendPacket('set_mode')} />
            </View>*/}
            <View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={styles.row_buttons}>
                    <Button title="ARM" onPress={() => emitEvent('arm', { copterId })} />
                </View>
                <View style={styles.row_buttons}>
                    <Button title="LAND" onPress={() => emitEvent('land', { copterId, latitude, longitude, altitude: 0 })} />
                </View>
                <View style={styles.row_buttons}>
                    <Button title="TAKE-OFF" onPress={() => emitEvent('takeoff', { copterId, latitude, longitude, altitude: 1 })} />
                </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15, borderWidth: 0 }}>
                <View style={[styles.row_buttons, { width: "66%", justifyContent: 'center' }]}>
                    <Button title="SET ABSOLUTE ALTITUDE" onPress={() => emitEvent('takeoff', { copterId, latitude, longitude, altitude })} />
                </View>
                <View style={styles.row_buttons}>
                    <TextInput onChangeText={(value) => setAltitude(value)} value={altitude.toString()} keyboardType="numeric" style={{ borderWidth: 1, paddingTop: 3, paddingBottom: 2, textAlign: 'center' }} />
                </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15, borderWidth: 1 }}>
                <View style={[styles.row_buttons, { width: "66%", justifyContent: 'center' }]}>
                    <Text style={{ textAlign: 'center', color: 'black', fontWeight: 'bold' }}>SET MOVEMENT SPEED</Text>
                </View>
                <View style={styles.row_buttons}>
                    <TextInput onChangeText={(value) => setVelocity(value)} value={velocity.toString()} keyboardType="numeric" style={{ borderLeftWidth: 1, paddingTop: 3, paddingBottom: 2, textAlign: 'center' }} />
                </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15, justifyContent: "center" }}>
                <View style={{ ...button_styles.button, ...styles.row_buttons, ...styles.left_row_button, backgroundColor: _zDirection === 'rleft' ? "darkblue" : "#2196F3" }} >
                    <TouchableWithoutFeedback onPressIn={() => setDroneVelocity('_z', 'rleft', '_z', -velocity)} onPressOut={() => clearDroneVelocity('_z', '_z')}>
                        <Text style={button_styles.text}>ROTATE L</Text>
                    </TouchableWithoutFeedback>
                </View>
                <View style={{ ...button_styles.button, ...styles.row_buttons, backgroundColor: xDirection === 'forward' ? "darkblue" : "#2196F3" }} >
                    <TouchableWithoutFeedback onPressIn={() => setDroneVelocity('x', 'forward', 'x', velocity)} onPressOut={() => clearDroneVelocity('x', 'x')}>
                        <Text style={button_styles.text}>FORWARD</Text>
                    </TouchableWithoutFeedback>
                </View>
                <View style={{ ...button_styles.button, ...styles.row_buttons, ...styles.left_row_button, backgroundColor: _zDirection === 'rright' ? "darkblue" : "#2196F3" }} >
                    <TouchableWithoutFeedback onPressIn={() => setDroneVelocity('_z', 'rright', '_z', velocity)} onPressOut={() => clearDroneVelocity('_z', '_z')}>
                        <Text style={button_styles.text}>ROTATE R</Text>
                    </TouchableWithoutFeedback>
                </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={{ ...button_styles.button, ...styles.row_buttons, ...styles.left_row_button, backgroundColor: yDirection === 'left' ? "darkblue" : "#2196F3" }} >
                    <TouchableWithoutFeedback onPressIn={() => setDroneVelocity('y', 'left', 'y', -velocity)} onPressOut={() => clearDroneVelocity('y', 'y')}>
                        <Text style={button_styles.text}>SIDEWAY   LEFT</Text>
                    </TouchableWithoutFeedback>
                </View>
                <View style={{ ...button_styles.button, ...styles.row_buttons, ...styles.right_row_button, backgroundColor: yDirection === 'right' ? "darkblue" : "#2196F3" }} >
                    <TouchableWithoutFeedback onPressIn={() => setDroneVelocity('y', 'right', 'y', velocity)} onPressOut={() => clearDroneVelocity('y', 'y')}>
                        <Text style={button_styles.text}>SIDEWAY RIGHT</Text>
                    </TouchableWithoutFeedback>
                </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15, justifyContent: "center" }}>
                <View style={{ ...button_styles.button, ...styles.row_buttons, backgroundColor: xDirection === 'backward' ? "darkblue" : "#2196F3" }} >
                    <TouchableWithoutFeedback onPressIn={() => setDroneVelocity('x', 'backward', 'x', -velocity)} onPressOut={() => clearDroneVelocity('x', 'x')}>
                        <Text style={button_styles.text}>BACKWARD</Text>
                    </TouchableWithoutFeedback>
                </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={{ ...button_styles.button, ...styles.row_buttons, backgroundColor: zDirection === 'up' ? "darkblue" : "#2196F3" }} >
                    <TouchableWithoutFeedback onPressIn={() => setDroneVelocity('z', 'up', 'z', -velocity)} onPressOut={() => clearDroneVelocity('z', 'z')}>
                        <Text style={button_styles.text}>UP</Text>
                    </TouchableWithoutFeedback>
                </View>
                <View style={{ ...button_styles.button, ...styles.row_buttons }}>
                    <Button title="STOP" onPress={() => stopDrone()} />
                </View>
                <View style={{ ...button_styles.button, ...styles.row_buttons, backgroundColor: zDirection === 'down' ? "darkblue" : "#2196F3" }} >
                    <TouchableWithoutFeedback onPressIn={() => setDroneVelocity('z', 'down', 'z', velocity)} onPressOut={() => clearDroneVelocity('z', 'z')}>
                        <Text style={button_styles.text}>DOWN</Text>
                    </TouchableWithoutFeedback>
                </View>
            </View>

            <View style={{ marginBottom: 30 }} />

            <View style={styles.align_center}>
                <Text style={{ fontWeight: "bold" }}>Reply from server</Text>
                <Text style={{ textAlign: "center" }}>{formatReplyMessage(serverReply)}</Text>
            </View>

            <View style={{ marginBottom: 30 }} />

            <View style={styles.button}>
                <Button title="Back to list" onPress={props.returnToList} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        //alignItems: 'center',
        //justifyContent: 'center',
        //marginTop: 0,
    },
    align_center: {
        alignItems: 'center',
    },
    title: {
        fontSize: 40,
        color: "black",
        marginBottom: 20,
    },
    input: {
        height: 40,
        width: "66%",
        borderWidth: 1,
    },
    row_buttons: {
        width: "33%",
        marginRight: 1,
    },
    button: {
        width: "100%",
        marginTop: 10,
        marginBottom: 10
    },
    left_row_button: {
        left: 0,
        position: "relative",
    },
    right_row_button: {
        right: 0,
        position: "absolute",
    },
    button_pressed: {
        backgroundColor: "black"
    }
});


const button_styles = StyleSheet.create({
    button: Platform.select({
        ios: {},
        android: {
            elevation: 4,
            // Material design blue from https://material.google.com/style/color.html#color-color-palette
            backgroundColor: '#2196F3',
            borderRadius: 2,
        },
    }),
    text: {
        textAlign: 'center',
        margin: 8,
        ...Platform.select({
            ios: {
                // iOS blue from https://developer.apple.com/ios/human-interface-guidelines/visual-design/color/
                color: '#007AFF',
                fontSize: 18,
            },
            android: {
                color: 'white',
                fontWeight: '500',
            },
        }),
    },
    buttonDisabled: Platform.select({
        ios: {},
        android: {
            elevation: 0,
            backgroundColor: '#dfdfdf',
        },
    }),
    textDisabled: Platform.select({
        ios: {
            color: '#cdcdcd',
        },
        android: {
            color: '#a1a1a1',
        },
    }),
});