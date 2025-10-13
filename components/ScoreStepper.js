import { Pressable, Text, View } from 'react-native';


export default function ScoreStepper({ value, onChange }) {
return (
<View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
<Pressable onPress={() => onChange(Math.max(0, value - 1))} style={{ padding: 16, borderRadius: 12, backgroundColor: '#EAF7EF' }}>
<Text style={{ fontSize: 24 }}>−</Text>
</Pressable>
<Text style={{ fontSize: 40, fontWeight: '700' }}>{value}</Text>
<Pressable onPress={() => onChange(value + 1)} style={{ padding: 16, borderRadius: 12, backgroundColor: '#EAF7EF' }}>
<Text style={{ fontSize: 24 }}>＋</Text>
</Pressable>
</View>
);
}