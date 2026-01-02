import { React, ReactNative as RN, NavigationNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";

const { ScrollView } = findByProps("ScrollView");
const { TableRowGroup, TableRow, Stack } = findByProps(
  "TableSwitchRow",
  "TableCheckboxRow",
  "TableRowGroup",
  "Stack",
  "TableRow"
);

const getToken = findByProps("getToken").getToken;

const HOUSES = [
  {
    id: 1,
    name: "Bravery",
  },
  {
    id: 2,
    name: "Brilliance",
  },
  {
    id: 3,
    name: "Balance",
  },
  {
    id: 0,
    name: "Remove Badge",
    description: "Remove your HypeSquad badge"
  },
];

function applyHypeSquad(value: number) {
  const token = getToken();
  if (!token) return showToast("Failed to get token", getAssetIDByName("Small"));

  if (![0, 1, 2, 3].includes(value)) {
    showToast("Only 0-3 allowed", getAssetIDByName("Small"));
    return;
  }

  if (value === 0) {
    fetch("https://discord.com/api/v9/hypesquad/online", {
      method: "DELETE",
      headers: { Authorization: token },
    })
      .then(res =>
        showToast(
          res.ok ? "HypeSquad badge removed" : `Failed: ${res.status}`,
          getAssetIDByName(res.ok ? "Check" : "Small")
        )
      )
      .catch(e => showToast(`Error: ${e.message}`, getAssetIDByName("Small")));
    return;
  }

  const house = HOUSES.find(h => h.id === value);
  fetch("https://discord.com/api/v9/hypesquad/online", {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ house_id: value }),
  })
    .then(res =>
      showToast(
        res.ok ? `Joined House ${house?.name}!` : `Failed: ${res.status}`,
        getAssetIDByName(res.ok ? "Check" : "Small")
      )
    )
    .catch(e => showToast(`Error: ${e.message}`, getAssetIDByName("Small")));
}

function HouseSelectorPage() {
  useProxy(storage);
  const navigation = NavigationNative.useNavigation();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <Stack spacing={8}>
        <TableRowGroup title="Choose Your House">
          {HOUSES.map(house => (
            <TableRow
              key={house.id}
              label={house.name}
              subLabel={house.description}
              onPress={() => {
                storage.hsValue = house.id;
                applyHypeSquad(house.id);
                navigation.goBack();
              }}
            />
          ))}
        </TableRowGroup>
      </Stack>
    </ScrollView>
  );
}

export default function Settings() {
  useProxy(storage);
  const navigation = NavigationNative.useNavigation();

  const currentHouse = HOUSES.find(h => h.id === storage.hsValue);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <Stack spacing={8}>
        <TableRowGroup title="HypeSquad">
          <TableRow
            label="Current House"
            subLabel={currentHouse ? currentHouse.description : "No house selected"}
            trailing={<TableRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "Select House",
                render: HouseSelectorPage,
              })
            }
          />
        </TableRowGroup>

        <TableRowGroup title="Information">
          <TableRow
            label="How to Change"
            subLabel="Tap 'Current House' above to select a different house or remove your badge"
          />
        </TableRowGroup>
      </Stack>
    </ScrollView>
  );
}
