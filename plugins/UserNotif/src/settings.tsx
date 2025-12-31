import { React, ReactNative as RN } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { showToast } from "@vendetta/ui/toasts";

export default function Settings() {
  const [ids, setIds] = React.useState(storage.userIds.join(","));
  const [trackFriends, setTrackFriends] = React.useState(storage.trackFriends);

  function apply() {
    storage.userIds = ids.split(",").map(i => i.trim()).filter(Boolean);
    storage.trackFriends = trackFriends;
    showToast("saved");
  }

  return (
    <RN.ScrollView style={{ flex: 1, backgroundColor: "#1e1f22", padding: 20 }}>
      <RN.View style={{
        backgroundColor: "#2b2d31",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16
      }}>
        <RN.View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <RN.Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            Track Friends
          </RN.Text>
          <RN.Switch value={trackFriends} onValueChange={setTrackFriends} />
        </RN.View>
      </RN.View>

      <RN.View style={{
        backgroundColor: "#2b2d31",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20
      }}>
        <RN.Text style={{ color: "#fff", fontSize: 15, marginBottom: 8 }}>
          Specific User IDs
        </RN.Text>
        <RN.TextInput
          value={ids}
          onChangeText={setIds}
          placeholder="123, 456, 789"
          placeholderTextColor="#888"
          style={{
            backgroundColor: "#1e1f22",
            borderRadius: 8,
            padding: 12,
            color: "#fff",
            fontSize: 14
          }}
        />
      </RN.View>

      <RN.TouchableOpacity
        onPress={apply}
        style={{
          backgroundColor: "#5865f2",
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: "center"
        }}
      >
        <RN.Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
          Apply
        </RN.Text>
      </RN.TouchableOpacity>
    </RN.ScrollView>
  );
}
