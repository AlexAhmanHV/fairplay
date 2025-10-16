
// components/HoleHeader.js

// Displays the current hole number and progress within the round.
// Typically shown at the top of the round screen to orient the player.


import { Text, View } from 'react-native';


export default function HoleHeader({ current, total }) {
return (
<View style={{ alignItems: 'center', marginBottom: 24 }}>
<Text style={{ fontSize: 16, color: '#3C6E47' }}>Hål</Text>
<Text style={{ fontSize: 48, fontWeight: '800' }}>{current}</Text>
<Text style={{ color: '#6B6B6B' }}>{current} / {total}</Text>
</View>
);
}