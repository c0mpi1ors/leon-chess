import { View, Text, StyleSheet, FlatList, ImageBackground } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

interface MoveRecord {
  moveNumber: number;
  white?: string;
  black?: string;
}

// Wood theme colors - high contrast on wood background
const woodTheme = {
  text: '#FFF8DC', // Cream/cornsilk - light color for contrast
  textShadow: '#2F1810', // Dark brown shadow
  accent: '#FFD700', // Gold accent
  headerBorder: 'rgba(255, 215, 0, 0.5)', // Semi-transparent gold
  rowBorder: 'rgba(255, 248, 220, 0.2)', // Semi-transparent cream
};

export default function StepsScreen() {
  const params = useLocalSearchParams<{ moves: string }>();

  const moveHistory: MoveRecord[] = params.moves ? JSON.parse(params.moves) : [];
  const reversedHistory = [...moveHistory].reverse();

  const renderItem = ({ item }: { item: MoveRecord }) => (
    <View style={styles.row}>
      <Text style={styles.moveNumber}>{item.moveNumber}.</Text>
      <Text style={styles.moveText}>{item.white || '-'}</Text>
      <Text style={styles.moveText}>{item.black || '-'}</Text>
    </View>
  );

  return (
    <ImageBackground
      source={require('@/assets/images/wood-texture.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>#</Text>
          <Text style={styles.headerText}>白方</Text>
          <Text style={styles.headerText}>黑方</Text>
        </View>

        <FlatList
          data={reversedHistory}
          keyExtractor={(item) => item.moveNumber.toString()}
          renderItem={renderItem}
          style={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>暂无移动记录</Text>
          }
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: woodTheme.headerBorder,
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: woodTheme.accent,
    textShadowColor: woodTheme.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: woodTheme.rowBorder,
  },
  moveNumber: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    color: woodTheme.accent,
    textShadowColor: woodTheme.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  moveText: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    color: woodTheme.text,
    textShadowColor: woodTheme.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    color: woodTheme.text,
    textShadowColor: woodTheme.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
