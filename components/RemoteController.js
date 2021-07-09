import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Text, TextInput } from 'react-native';

const services_ports = {
    'agri': 30000,
    'protezionecivile': 30001
}

export default function RemoteController(props) {
    const [socket, setData] = useState(props.socket);
    const [serverReply, setServerReply] = useState('Connected');
    const [text, setText] = useState('');


    const sendPacket = (command) => {
        try {
            socket.send(`${command}`, undefined, undefined, services_ports[props.namespace], `${props.namespace}.udp.aviot.it`, function (err) {
                if (err) throw err
                console.log('Message sent!')
            });
        } catch (err) {
            console.log(err);
        }
    }

    socket.once('message', function (data, rinfo) {
        var str = String.fromCharCode.apply(null, new Uint8Array(data));
        console.log(
            'Received ' + str + ' ' + JSON.stringify(rinfo),
        );
        setServerReply('Received ' + str + ' ' + JSON.stringify(rinfo));
    });


    return (
        <View style={styles.container}>
            <View style={styles.align_center}>
                <Text style={styles.title}>{props.device.current_name}</Text>
            </View>
            <View style={styles.align_center}>
                <Text>Reply from server</Text>
                <Text>{serverReply}</Text>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15 }}>
                <TextInput onChangeText={new_text => setText(new_text)} style={styles.input}></TextInput>
                <View style={{ width: "33%", marginTop: 2 }}>
                    <Button title="Send" onPress={() => sendPacket(text)} />
                </View>
            </View>
            <View style={{ marginTop: 15 }}>
                <Button title="SET MODE" onPress={() => sendPacket('set_mode')} />
            </View>
            <View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={styles.rowButtons}>
                    <Button title="ARM" onPress={() => sendPacket('arming')} />
                </View>
                <View style={styles.rowButtons}>
                    <Button title="LAND" onPress={() => sendPacket('land')} />
                </View>
                <View style={styles.rowButtons}>
                    <Button title="TAKE-OFF" onPress={() => sendPacket('takeoff')} />
                </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={styles.rowButtons}>
                    <Button title="SET" onPress={() => sendPacket('set')} />
                </View>
                <View style={styles.rowButtons}>
                    <Button title="DELETE" onPress={() => sendPacket('delete')} />
                </View>
                <View style={styles.rowButtons}>
                    <Button title="RESET" onPress={() => sendPacket('reset')} />
                </View>
            </View>
            <View style={styles.button}>
                <Button title="Back to list" onPress={props.returnToList} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        //alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    align_center: {
        alignItems: 'center',
    },
    title: {
        fontSize: 40,
        color: "black"
    },
    input: {
        height: 40,
        width: "66%",
        borderWidth: 1,
    },
    rowButtons: {
        width: "33%",
        marginRight: 1,
    },
    button: {
        width: "100%",
        marginTop: 10,
        marginBottom: 10
    }
});
