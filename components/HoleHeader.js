// ================================
// components/HoleHeader.js
// ================================
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