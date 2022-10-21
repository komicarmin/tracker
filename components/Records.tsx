import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Button, Card, DataTable, TextInput } from 'react-native-paper';

import { retrieveData, SingleNodeClient } from "@iota/iota.js";
import { Converter } from "@iota/util.js";

import useCrypto from '../hooks/useCrypto';
import useActors from '../hooks/useActors';
import Config from '../constants/Config';

export interface Record {
  actor: string,
  type: string,
  date: string,
  timestamp: number,
  valid: boolean,
}

export default function Records() {
  const client = new SingleNodeClient(Config.API_ENDPOINT_PRIVATE);

  const actors = useActors();
  const { validateSignature, decrypt } = useCrypto();

  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);

  const timestampToDate = (timestamp: number) => {
    var a = new Date(timestamp * 1000);
    var year = a.getFullYear();
    var month = a.getMonth() + 1;
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + "." + month + "." + year + " " + hour + ':' + min + ':' + sec;
    return time;
  }

  const getRecords = async (order_id: string) => {
    setLoading(true);

    let recordList = [];

    const index = Converter.utf8ToBytes("TRACK-" + order_id);
    const found = await client.messagesFind(index);

    for (let i = 0; i < found.messageIds.length; i++) {
      const result = await retrieveData(client, found.messageIds[i]);
      const metadata = await client.messageMetadata(found.messageIds[i]);
      const milestone = metadata.referencedByMilestoneIndex ? await client.milestone(metadata.referencedByMilestoneIndex) : undefined;

      if (result) {
        const message = JSON.parse(Converter.bytesToUtf8(result.data!));
        const data = JSON.parse(decrypt(Uint8Array.from(message.data)));

        const publicKey = actors.find(a => a.actor == data.actor)!.pubKey;
        const valid = validateSignature(JSON.stringify(data), Uint8Array.from(message.signature), publicKey);

        let rec: Record = {
          actor: data.actor,
          type: data.type,
          date: timestampToDate(milestone?.timestamp!),
          timestamp: milestone?.timestamp!,
          valid: valid
        };

        recordList.push(rec)
        recordList.sort((r1, r2) => r2.timestamp - r1.timestamp);
      }
    }

    setRecords(recordList);
    setLoading(false)
  }

  const [form, setForm] = useState({
    order_id: "",
  });

  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.formCard}>
        <Text style={styles.title}>Track order</Text>
        <View style={styles.inputGroup}>
          <TextInput
            mode="outlined"
            label="Order id"
            value={form.order_id}
            onChangeText={text => handleChange("order_id", text)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Button
            mode="contained"
            onPress={() => getRecords(form.order_id)}>Submit</Button>
        </View>
      </Card>


      {loading ? <Text style={styles.text}>Loading...</Text> : null}
      <DataTable>
        <DataTable.Header>
          <DataTable.Title style={{ flex: 1 }}>Actor</DataTable.Title>
          <DataTable.Title style={{ flex: 1 }}>Type</DataTable.Title>
          <DataTable.Title style={{ flex: 2 }}>Date</DataTable.Title>
        </DataTable.Header>

        {records?.map((rec, i) => (
          <DataTable.Row key={"record-" + i}>
            <DataTable.Cell style={{ flex: 1 }}><Text style={{ color: rec.valid ? "#2e7d32" : "#d32f2f" }}>{rec.actor}</Text></DataTable.Cell>
            <DataTable.Cell style={{ flex: 1 }}><Text style={{ color: rec.valid ? "#2e7d32" : "#d32f2f" }}>{rec.type}</Text></DataTable.Cell>
            <DataTable.Cell style={{ flex: 2 }}><Text style={{ color: rec.valid ? "#2e7d32" : "#d32f2f" }}>{rec.date}</Text></DataTable.Cell>
          </DataTable.Row>
        ))}

      </DataTable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingVertical: 30,
    paddingHorizontal: 15,
    justifyContent: "flex-start",
    backgroundColor: "whitesmoke",
  },
  text: {
    color: "#FF0000"
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 25,
  },
  formCard: {
    padding: 15,
    marginBottom: 25,
    backgroundColor: "white"
  },
  newRecordForm: {
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: 20,
  }
});
