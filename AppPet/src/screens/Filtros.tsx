import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types'; 
import DateTimePicker from '@react-native-community/datetimepicker';

type FiltrosScreenProps = NativeStackScreenProps<RootStackParamList, 'Filtros'>;
const Cachorro_Selecionado = require('../../assets/icons/animais/cachorro.png');
const Cachorro_NaoSelecionado = require('../../assets/icons/animais/cachorroVerde.png');
const Gato_Selecionado = require('../../assets/icons/animais/gato.png');
const Gato_NaoSelecionado = require('../../assets/icons/animais/gatoVerde.png');
const Passaro_Selecionado = require('../../assets/icons/animais/passaro.png');
const Passaro_NaoSelecionado = require('../../assets/icons/animais/passaroVerde.png');
const Reptil_Selecionado = require('../../assets/icons/animais/tartaruga.png');
const Reptil_NaoSelecionado = require('../../assets/icons/animais/tartarugaVerde.png');

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
      styleProp, // Aplica o estilo customizado (como o dateOptionButton)
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


export default function Filtros({ navigation }: FiltrosScreenProps) {
  const [selectedSize, setSelectedSize] = useState<string>('< 7kg');
  const [selectedPrice, setSelectedPrice] = useState<string>('< R$40'); 
  const [selectedTipo, setSelectedTipo] = useState<string>('Cachorro');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const availableBairros = ['Canto do Forte', 'Boqueirão', 'Guilhermina', 'Aviação', 'Tupi', 'Ocian', 'Mirim', 'Maracanã', 'Caiçara', 'Jardim Real', 'Flórida', 'Solemar'];
  
  const [dataEntrada, setDataEntrada] = useState<Date | null>(null);
  const [dataSaida, setDataSaida] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [dateField, setDateField] = useState<'entrada' | 'saida' | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const Tipo = ['Cachorro', 'Gato', 'Passáro', 'Reptil'];
  const sizeOptions = ['< 7kg', '7-18kg', '18-25kg', '25-45kg'];
  const priceOptions = ['< R$40', 'R$40 - R$80', 'R$80 >'];

const handleDateChange = (event, selectedDate) => {
        // Para iOS (que mostra o picker como modal/popover), o 'event.type' é 'set'.
        // Para Android, 'event.type' pode ser 'set' ou 'dismissed' (cancel).
        if (event.type === 'set' || Platform.OS === 'ios') {
            const dateToSet = selectedDate || currentDate; // Usa a data selecionada ou a data atual se for nulo
            
            if (dateField === 'entrada') {
                setDataEntrada(dateToSet);
            } else if (dateField === 'saida') {
                setDataSaida(dateToSet);
            }
            setCurrentDate(dateToSet); // Atualiza a data para ser a data selecionada na próxima vez
        }
        
        // Esconde o DatePicker após a seleção ou cancelamento
        setShowDatePicker(false);
        setDateField(null);
    };

    const handleOpenDatePicker = (field: 'entrada' | 'saida', initialDate: Date | null) => {
        setDateField(field);
        setCurrentDate(initialDate || new Date()); // Define a data inicial
        setShowDatePicker(true);
    };

  const getTipoIcon = (tipo: string, isSelected: boolean) => {
    switch (tipo) {
      case 'Cachorro':
        return isSelected ? Cachorro_Selecionado : Cachorro_NaoSelecionado;
      case 'Gato':
        return isSelected ? Gato_Selecionado : Gato_NaoSelecionado;
      case 'Passáro':
        return isSelected ? Passaro_Selecionado : Passaro_NaoSelecionado;
      case 'Reptil':
        return isSelected ? Reptil_Selecionado : Reptil_NaoSelecionado;
      default:
        return undefined;
    }
  };

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setSearchText(region);
  };

  const filteredRegions = availableBairros.filter(region =>
    region.toLowerCase().includes(searchText.toLowerCase())
  );
  
  const formatDate = (date: Date | null) => {
    if (!date) return 'Escolha uma opção...';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };


const handleApplyFilters = () => {
      console.log('Filtros Aplicados:', { 
          selectedTipo, 
          selectedRegion, 
          dataEntrada: formatDate(dataEntrada), 
          dataSaida: formatDate(dataSaida), 
          selectedSize, 
          selectedPrice 
      });
      navigation.navigate('Home');
  };

  const CornerIconClickable = () => (
    <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.cornerImageContainer}>
      <Image
        source={require('../../assets/icons/LogoPATA.png')} 
        style={styles.cornerImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );


  return (
    <View style={styles.container}>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={currentDate}
          mode={'date'} // Queremos um seletor de data (calendário)
          display={Platform.OS === 'ios' ? 'spinner' : 'default'} // Estilo nativo
          onChange={handleDateChange}
          minimumDate={new Date()} // Opcional: Não permite datas passadas
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          <CornerIconClickable />
          <Text style={styles.mainTitle}>Filtros</Text>

          <FiltroGroup title="Tipo do Pet:">
            <View style={styles.optionsGrid}>
              {Tipo.map((tipo) => (
                <FiltroOpcao
                  key={tipo}
                  label={tipo}
                  iconSource={getTipoIcon(tipo, selectedTipo === tipo)} // Lógica de ícone atualizada
                  isSelected={selectedTipo === tipo}
                  onPress={() => setSelectedTipo(tipo)} // Corrigido para setSelectedTipo
                />
              ))}
            </View>
          </FiltroGroup>

          <FiltroGroup title="Região:">
            <View style={styles.optionsColumn}>
                <TextInput
                    style={styles.autocompleteInput} // Novo estilo para o TextInput
                    placeholder="Digite a cidade ou bairro..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {/* Exibição das opções filtradas */}
                {searchText.length > 0 && filteredRegions.map((region) => (
                    <TouchableOpacity
                        key={region}
                        style={styles.autocompleteOption} // Novo estilo
                        onPress={() => handleRegionSelect(region)}
                    >
                        <Text style={styles.autocompleteOptionText}>{region}</Text>
                    </TouchableOpacity>
                ))}
            </View>
          </FiltroGroup>

        <View style={styles.groupContainer}>
        <Text style={styles.groupTitle}>Datas:</Text>
                        <View style={styles.datesRowContainer}> 
                            
                            {/* DATA DE ENTRADA */}
                            <View style={styles.datePickerWrapper}>
                                <Text style={styles.dateLabel}>Entrada</Text>
                                <FiltroOpcao
                                    label={formatDate(dataEntrada)}
                                    isSelected={!!dataEntrada}
                                    onPress={() => handleOpenDatePicker('entrada', dataEntrada)}
                                    // Novo estilo para botão de data (menor)
                                    styleProp={styles.dateOptionButton} 
                                />
                            </View>

                            {/* DATA DE SAÍDA */}
                            <View style={styles.datePickerWrapper}>
                                <Text style={styles.dateLabel}>Saída</Text>
                                <FiltroOpcao
                                    label={formatDate(dataSaida)}
                                    isSelected={!!dataSaida}
                                    onPress={() => handleOpenDatePicker('saida', dataSaida)}
                                    // Novo estilo para botão de data (menor)
                                    styleProp={styles.dateOptionButton} 
                                />
                            </View>
                        </View>
                    </View>

          <FiltroGroup title="Tamanhos:">
            <View style={styles.optionsGrid}>
              {sizeOptions.map((size) => (
                <FiltroOpcao
                  key={size}
                  label={size}
                  iconSource={selectedSize === size ? Cachorro_Selecionado : Cachorro_NaoSelecionado}
                  isSelected={selectedSize === size}
                  onPress={() => setSelectedSize(size)}
                />
              ))}
            </View>
          </FiltroGroup>
          
          <FiltroGroup title="Preços de Diária:">
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
              <Text style={styles.applyButtonText}>Aplicar</Text>
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
  // Estrutura geral
  container: {
    flex: 1,
    backgroundColor: '#B3D18C',
  },
    scrollContainer: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 30,         
    marginBottom: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  mainTitle: { 
    fontSize: 24, 
    fontWeight: '500', 
    color: '#556A44', 
    marginBottom: 22, 
    textAlign: 'center',
    marginTop: 100,
},

  //LOGO DO PET
  cornerImageContainer: {
    position: 'absolute',
    top: -50, 
    right: -80, 
    width: 265, 
    height: 210,
    zIndex: 10, 
  },
  cornerImage: {
    width: '100%', // Preenche o TouchableOpacity
    height: '100%', // Preenche o TouchableOpacity
    resizeMode: 'contain',
},

  // --- Estilos de Grupo ---
  groupContainer: {
    backgroundColor: '#FFF6E2', 
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#B3D18C', 
    padding: 15,
    marginBottom: 25,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: '400', 
    color: '#556A44', 
    marginBottom: 10,
  },

  // --- Estilos de Opções de Filtro (Botões) ---
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10, 
  },
  optionsColumn: {
    gap: 10, 
  },
  optionButton: {
    height: 80,
    minWidth: '48%', 
    maxWidth: '48%',
    backgroundColor: '#FFF6E2',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#B3D18C',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    flexDirection: 'column', 
  },

  // Estilo específico para opções em coluna (Preços)
  optionButtonColumn: {
    height: 55, // Altura menor
    width: '100%', 
    maxWidth: '100%',
    flexDirection: 'row', // Texto no centro
  },
  // Quando Selecionado
  optionButtonSelected: {
    backgroundColor: '#85B65E', 
    borderColor: '#B3D18C', 
    borderWidth: 3,
  },
  optionIcon: {
    width: 35,
    height: 35,
    marginBottom: 5,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#596350ff', 
  },
  optionTextSelected: {
    color: '#FFF6E2', 
  },
  
  // --- Estilos de Rating (Estrelas) ---
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 10,
  },
  starIcon: {
    width: 40,
    height: 40,
  },
  
  // --- Estilo do Botão Aplicar ---
  applyButton: {
    marginTop: -10,
    marginBottom: -30,
    width: 150,
    padding: 12,
    backgroundColor: '#85B65E', // Um verde sólido
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#B3D18C',
    alignItems: 'center',
    alignSelf: 'center',
  },
  applyButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF6E2',
  },

// --- Estilo da Imagem de Decoração ---
  decoracaoImage: {
      width: 150,
      height: 150,
      alignSelf: 'center',
      marginBottom: 10,
      top: 57, 
      right: 130, 
  },

  autocompleteInput: {
    height: 55, // Altura igual ao optionButtonColumn
    width: '100%',
    backgroundColor: '#FFF6E2',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#B3D18C',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#596350ff',
},
autocompleteOption: {
    padding: 12,
    backgroundColor: '#FFF6E2',
    borderBottomWidth: 1,
    borderBottomColor: '#B3D18C',
    borderRadius: 10,
    marginTop: 5,
},
autocompleteOptionText: {
    fontSize: 16,
    color: '#596350ff',
},


datesRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 5,
},
datePickerWrapper: {
    // Garante que cada wrapper ocupe metade da largura, subtraindo o gap
    width: '48%', 
    alignItems: 'center',
},
dateLabel: {
    fontSize: 16,
    fontWeight: '500', 
    color: '#556A44',
    marginBottom: 5,
    alignSelf: 'flex-start', // Alinha a label à esquerda do seu container
},
// Estilo customizado para os botões de data (mais fino)
dateOptionButton: {
    width: '100%',
    height: 45, // Altura menor
    maxWidth: '100%',
    flexDirection: 'row', // Alinha o texto ao centro
    paddingHorizontal: 8,
},
});