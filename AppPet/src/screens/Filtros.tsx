// AppPet\src\screens\Filtros.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  Platform, 
  // Importação necessária para criar elementos HTML no Web
  unstable_createElement as createElement 
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types'; 
import DateTimePicker from '@react-native-community/datetimepicker';

type FiltrosScreenProps = NativeStackScreenProps<RootStackParamList, 'Filtros'>;

// --- Imports de Imagens ---
const Cachorro_Selecionado = require('../../assets/icons/animais/cachorro.png');
const Cachorro_NaoSelecionado = require('../../assets/icons/animais/cachorroVerde.png');
const Gato_Selecionado = require('../../assets/icons/animais/gato.png');
const Gato_NaoSelecionado = require('../../assets/icons/animais/gatoVerde.png');
const Passaro_Selecionado = require('../../assets/icons/animais/passaro.png');
const Passaro_NaoSelecionado = require('../../assets/icons/animais/passaroVerde.png');
// Trocado de Réptil para Silvestre (Tartaruga)
const Silvestre_Selecionado = require('../../assets/icons/animais/tartaruga.png');
const Silvestre_NaoSelecionado = require('../../assets/icons/animais/tartarugaVerde.png');

// --- Interfaces de Componentes ---
interface FiltroGroupProps {
  title: string;
  children: React.ReactNode;
}

const FiltroGroup = ({ title, children }: FiltroGroupProps) => (
  <View style={styles.groupContainer}>
    <Text style={styles.groupTitle}>{title}</Text>
    {children}
  </View>
);

interface FiltroOpcaoProps {
  label: string;
  iconSource?: any; 
  isSelected: boolean;
  onPress: () => void;
  styleProp?: any;
}

const FiltroOpcao = ({ label, iconSource, isSelected, onPress, styleProp }: FiltroOpcaoProps) => (
  <TouchableOpacity 
    style={[
      styles.optionButton, 
      isSelected && styles.optionButtonSelected,
      !iconSource && styles.optionButtonColumn, 
      styleProp, 
    ]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    {iconSource ? ( 
      <Image source={iconSource} style={styles.optionIcon} resizeMode="contain" />
    ) : null}
    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// --- Componente de Data Compatível com Web e Nativo ---
const DateInput = ({ label, date, onDateChange, styleProp }: { 
    label: string, 
    date: Date | null, 
    onDateChange: (d: Date) => void,
    styleProp?: any
}) => {
    const [showPicker, setShowPicker] = useState(false);

    // Lógica WEB: Usa input HTML nativo
    if (Platform.OS === 'web') {
        const dateStr = date ? date.toISOString().split('T')[0] : '';
        return (
            <View style={[styles.optionButton, styles.optionButtonColumn, styleProp, { padding: 0, overflow: 'hidden' }]}>
                {/* Usando createElement para renderizar <input type="date"> no React Native Web */}
                {/* @ts-ignore */}
                {createElement('input', {
                    type: 'date',
                    value: dateStr,
                    onChange: (e: any) => {
                        if(e.target.value) onDateChange(new Date(e.target.value));
                    },
                    style: {
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        background: 'transparent',
                        color: '#556A44',
                        fontSize: '16px',
                        paddingLeft: '10px',
                        fontFamily: 'Inter',
                        fontWeight: '500'
                    }
                })}
            </View>
        );
    }

    // Lógica NATIVE (Android/iOS)
    const handleNativeChange = (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate) {
            onDateChange(selectedDate);
        }
    };

    return (
        <View>
            <TouchableOpacity 
                onPress={() => setShowPicker(true)}
                style={[styles.optionButton, styles.optionButtonColumn, styleProp]}
            >
                <Text style={styles.optionText}>{date ? date.toLocaleDateString('pt-BR') : label}</Text>
            </TouchableOpacity>
            
            {showPicker && (
                <DateTimePicker
                    value={date || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleNativeChange}
                    minimumDate={new Date()}
                />
            )}
        </View>
    );
};

// --- Tela Principal ---
export default function Filtros({ navigation, route }: FiltrosScreenProps) {
  const { usuario } = route.params || { usuario: { tipo: 'tutor' } }; 

  // MUDANÇA 1: Estados agora são ARRAYS para multi-seleção
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  
  const [selectedPrice, setSelectedPrice] = useState<string>('< R$40'); 
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  
  const availableBairros = ['Canto do Forte', 'Boqueirão', 'Guilhermina', 'Aviação', 'Tupi', 'Ocian', 'Mirim', 'Maracanã', 'Caiçara', 'Jardim Real', 'Flórida', 'Solemar', 'Mongaguá'];
  
  const [dataEntrada, setDataEntrada] = useState<Date | null>(null);
  const [dataSaida, setDataSaida] = useState<Date | null>(null);

  // MUDANÇA 2: 'Réptil' trocado para 'Silvestre' para bater com o banco
  const TiposDisponiveis = ['Cachorro', 'Gato', 'Passaro', 'Silvestre'];
  const sizeOptions = ['Pequeno', 'Médio', 'Grande'];
  const priceOptions = ['< R$40', 'R$40 - R$80', 'R$80 >'];

  // Lógica de Toggle (Multi-seleção)
  const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
      if (list.includes(item)) {
          setList(list.filter(i => i !== item));
      } else {
          setList([...list, item]);
      }
  };

  const getTipoIcon = (tipo: string, isSelected: boolean) => {
    switch (tipo) {
      case 'Cachorro': return isSelected ? Cachorro_Selecionado : Cachorro_NaoSelecionado;
      case 'Gato': return isSelected ? Gato_Selecionado : Gato_NaoSelecionado;
      case 'Passaro': return isSelected ? Passaro_Selecionado : Passaro_NaoSelecionado;
      case 'Silvestre': return isSelected ? Silvestre_Selecionado : Silvestre_NaoSelecionado;
      default: return undefined;
    }
  };

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setSearchText(region);
  };

  const filteredRegions = availableBairros.filter(region =>
    region.toLowerCase().includes(searchText.toLowerCase())
  );
  
  const handleApplyFilters = () => {
        // Lógica de Preço corrigida
        let min: number | undefined = undefined;
        let max: number | undefined = undefined;

        if (selectedPrice === '< R$40') {
            // Menor que 40: Mínimo 0 (ou undefined), Máximo 40
            max = 40;
        } else if (selectedPrice === 'R$40 - R$80') {
            // Entre 40 e 80
            min = 40;
            max = 80;
        } else if (selectedPrice === 'R$80 >') {
            // Maior que 80: Mínimo 80, Máximo sem limite (undefined)
            min = 80;
        }

        const tiposString = selectedTipos.length > 0 ? selectedTipos.join(',') : undefined;
        const sizesString = selectedSizes.length > 0 ? selectedSizes.join(',') : undefined;

        const filtrosParaApi = { 
            tipo: tiposString, 
            region: searchText || selectedRegion, 
            dataEntrada: dataEntrada ? dataEntrada.toISOString() : undefined, 
            dataSaida: dataSaida ? dataSaida.toISOString() : undefined, 
            size: sizesString, 
            priceMin: min, // Envia min
            priceMax: max  // Envia max
        };

        console.log('Filtros Aplicados:', filtrosParaApi);

        if (usuario?.tipo === 'anfitriao') {
          navigation.navigate('Home_Host', { usuario, filtros: filtrosParaApi });
        } else {
          navigation.navigate('Home', { usuario, filtros: filtrosParaApi });
        }
    };
    
  const CornerIconClickable = () => (
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cornerImageContainer}>
      <Image
        source={require('../../assets/icons/LogoPATA.png')} 
        style={styles.cornerImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          <CornerIconClickable />
          <Text style={styles.mainTitle}>Filtros</Text>

          {/* Grupo TIPO DO PET (Multi-seleção) */}
          <FiltroGroup title="Tipo do Pet:">
            <View style={styles.optionsGrid}>
              {TiposDisponiveis.map((tipo) => (
                <FiltroOpcao
                  key={tipo}
                  label={tipo}
                  iconSource={getTipoIcon(tipo, selectedTipos.includes(tipo))}
                  isSelected={selectedTipos.includes(tipo)}
                  onPress={() => toggleSelection(tipo, selectedTipos, setSelectedTipos)}
                />
              ))}
            </View>
          </FiltroGroup>

          {/* Grupo REGIÃO */}
          <FiltroGroup title="Região:">
            <View style={styles.optionsColumn}>
                <TextInput
                    style={styles.autocompleteInput}
                    placeholder="Digite a cidade ou bairro..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {searchText.length > 0 && filteredRegions.map((region) => (
                    <TouchableOpacity
                        key={region}
                        style={styles.autocompleteOption}
                        onPress={() => handleRegionSelect(region)}
                    >
                        <Text style={styles.autocompleteOptionText}>{region}</Text>
                    </TouchableOpacity>
                ))}
            </View>
          </FiltroGroup>

           {/* Grupo DATAS (Adaptado para Web) */}
           <FiltroGroup title="Datas:">
                <View style={styles.datesRowContainer}> 
                    <View style={styles.datePickerWrapper}>
                        <Text style={styles.dateLabel}>Entrada</Text>
                        <DateInput 
                            label="Escolha..."
                            date={dataEntrada}
                            onDateChange={setDataEntrada}
                            styleProp={styles.dateOptionButton}
                        />
                    </View>
                    <View style={styles.datePickerWrapper}>
                        <Text style={styles.dateLabel}>Saída</Text>
                        <DateInput 
                            label="Escolha..."
                            date={dataSaida}
                            onDateChange={setDataSaida}
                            styleProp={styles.dateOptionButton}
                        />
                    </View>
                </View>
            </FiltroGroup>

          {/* Grupo PORTE (Multi-seleção) */}
          <FiltroGroup title="Porte do Pet:">
            <View style={styles.optionsGrid}>
              {sizeOptions.map((size) => (
                <FiltroOpcao
                  key={size}
                  label={size}
                  iconSource={selectedSizes.includes(size) ? Cachorro_Selecionado : Cachorro_NaoSelecionado}
                  isSelected={selectedSizes.includes(size)}
                  onPress={() => toggleSelection(size, selectedSizes, setSelectedSizes)}
                />
              ))}
            </View>
          </FiltroGroup>
          
          {/* Grupo PREÇO */}
          <FiltroGroup title="Preço Máximo (Diária):">
            <View style={styles.optionsColumn}>
              {priceOptions.map((price) => (
                <FiltroOpcao
                  key={price}
                  label={price}
                  isSelected={selectedPrice === price}
                  onPress={() => setSelectedPrice(price)}
                />
              ))}
            </View>
          </FiltroGroup>

          <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
              <Text style={styles.applyButtonText}>Buscar</Text>
          </TouchableOpacity>

          <Image
              source={require('../../assets/icons/Pata.png')}
              style={styles.decoracaoImage} 
              resizeMode="contain"
            />
        </View> 
      </ScrollView>   
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#B3D18C' },
  scrollContainer: { flexGrow: 1 },
  innerContainer: { flex: 1, marginHorizontal: 12, marginTop: 30, marginBottom: 45, backgroundColor: '#FFFFFF', borderRadius: 40, paddingHorizontal: 30, paddingVertical: 10 },
  mainTitle: { fontSize: 24, fontWeight: '500', color: '#556A44', marginBottom: 22, textAlign: 'center', marginTop: 100 },
  
  cornerImageContainer: { position: 'absolute', top: -50, right: -80, width: 265, height: 210, zIndex: 10 },
  cornerImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  
  groupContainer: { backgroundColor: '#FFF6E2', borderRadius: 15, borderWidth: 2, borderColor: '#B3D18C', padding: 15, marginBottom: 25 },
  groupTitle: { fontSize: 20, fontWeight: '400', color: '#556A44', marginBottom: 10 },
  
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  optionsColumn: { gap: 10 },
  
  optionButton: { height: 80, minWidth: '48%', maxWidth: '48%', backgroundColor: '#FFF6E2', borderRadius: 10, borderWidth: 2, borderColor: '#B3D18C', justifyContent: 'center', alignItems: 'center', padding: 10, flexDirection: 'column' },
  optionButtonColumn: { height: 55, width: '100%', maxWidth: '100%', flexDirection: 'row' },
  optionButtonSelected: { backgroundColor: '#85B65E', borderColor: '#B3D18C', borderWidth: 3 },
  
  optionIcon: { width: 35, height: 35, marginBottom: 5 },
  optionText: { fontSize: 16, fontWeight: '500', color: '#596350ff' },
  optionTextSelected: { color: '#FFF6E2' },
  
  applyButton: { marginTop: -10, marginBottom: -30, width: 150, padding: 12, backgroundColor: '#85B65E', borderRadius: 15, borderWidth: 3, borderColor: '#B3D18C', alignItems: 'center', alignSelf: 'center' },
  applyButtonText: { fontSize: 20, fontWeight: '700', color: '#FFF6E2' },
  
  decoracaoImage: { width: 150, height: 150, alignSelf: 'center', marginBottom: 10, top: 57, right: 130 },
  
  autocompleteInput: { height: 55, width: '100%', backgroundColor: '#FFF6E2', borderRadius: 10, borderWidth: 2, borderColor: '#B3D18C', paddingHorizontal: 15, fontSize: 16, color: '#596350ff' },
  autocompleteOption: { padding: 12, backgroundColor: '#FFF6E2', borderBottomWidth: 1, borderBottomColor: '#B3D18C', borderRadius: 10, marginTop: 5 },
  autocompleteOptionText: { fontSize: 16, color: '#596350ff' },
  
  datesRowContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 5 },
  datePickerWrapper: { width: '48%', alignItems: 'center' },
  dateLabel: { fontSize: 16, fontWeight: '500', color: '#556A44', marginBottom: 5, alignSelf: 'flex-start' },
  dateOptionButton: { width: '100%', height: 45, maxWidth: '100%', flexDirection: 'row', paddingHorizontal: 8 },
});