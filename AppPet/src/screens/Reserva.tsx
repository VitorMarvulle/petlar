import React, { useState, useMemo } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  Image, TextInput, Platform, Modal 
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types'; 
import DateTimePicker from '@react-native-community/datetimepicker';

// --- ALERTA CUSTOMIZADO ---
const CustomAlert = ({
  visible,
  title,
  message,
  onClose,
}: {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>

        <TouchableOpacity style={styles.modalButton} onPress={onClose}>
          <Text style={styles.modalButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const ICON_AVATAR = require('../../assets/icons/user.png');
const ICON_CHECK = require('../../assets/icons/check.png');

const mockUserPets = [
  { id: 'p1', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=200&fit=crop', name: "Nina", species: "Gato", age: "8 anos", weight: "3kg", comportamento: 'Calma', specifications: "Gosta de sachê pela manhã, ODEIA colo, arranha." },
  { id: 'p2', imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=300&h=200&fit=crop', name: "Bolinho Fofo", species: "Gato", age: "3 meses", weight: "0.5kg", comportamento: 'Medrosa', specifications: "Gosta de sachê pela manhã, é bastante falante." },
  { id: 'p3', imageUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=300&h=200&fit=crop', name: "Thor", species: "Cachorro", age: "5 anos", weight: "20kg", comportamento: 'Brincalhão', specifications: "Precisa de 3 passeios diários, come ração especial." },
];

const PRICE_PER_DAY_BASE = 65.00;

interface FiltroGroupProps {
  title: string;
  children: React.ReactNode;
  styleProp?: any;
}

const FiltroGroup = ({ title, children, styleProp }: FiltroGroupProps) => (
  <View style={[styles.groupContainer, styleProp]}>
    <Text style={styles.groupTitle}>{title}</Text>
    {children}
  </View>
);

const PetSelectionCard = ({
  pet,
  isSelected,
  onToggleSelect,
}: {
  pet: typeof mockUserPets[0];
  isSelected: boolean;
  onToggleSelect: () => void;
}) => (
  <TouchableOpacity style={styles.petSelectionCard} onPress={onToggleSelect} activeOpacity={0.8}>
    <View style={styles.petImageContainer}>
      <Image source={{ uri: pet.imageUrl }} style={styles.petImage} resizeMode="cover" />
      {isSelected && (
        <View style={styles.checkmarkContainer}>
          <Image source={ICON_CHECK} style={styles.checkmarkIcon} />
        </View>
      )}
    </View>
    <View style={styles.petDetails}>
      <Text style={styles.petName}>{pet.name}</Text>
      <Text style={styles.petDetailText}><Text style={styles.boldText}>Espécie:</Text> {pet.species}</Text>
      <Text style={styles.specificationsText} numberOfLines={2}>{pet.specifications}</Text>
    </View>
  </TouchableOpacity>
);

const PetSelectionDropdown = ({ 
  selectedPets, 
  setSelectedPets, 
  maxPetsAllowed,
  showAlert
}: { 
  selectedPets: string[]; 
  setSelectedPets: React.Dispatch<React.SetStateAction<string[]>>; 
  maxPetsAllowed: number;
  showAlert: (title: string, message: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleToggleSelect = (petId: string) => {
    setSelectedPets(prev => {
      if (prev.includes(petId)) {
        return prev.filter(id => id !== petId);
      } else {
        if (prev.length >= maxPetsAllowed) {
          showAlert('Limite Atingido', `Este Host só permite um máximo de ${maxPetsAllowed} Pet(s) por reserva.`);
          return prev;
        }
        return [...prev, petId];
      }
    });
  };

  const displayLabel = selectedPets.length > 0 
    ? `${selectedPets.length} Pet(s) Selecionado(s)` 
    : "Selecione seu(s) pet(s) ...";

  return (
    <View>
      <TouchableOpacity 
        style={[styles.dropdownButton, isOpen && styles.dropdownButtonOpen]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownLabel}>{displayLabel}</Text>
        <Text style={styles.dropdownLimit}>Máx: {maxPetsAllowed}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownContent}>
          {mockUserPets.map((pet) => (
            <PetSelectionCard
              key={pet.id}
              pet={pet}
              isSelected={selectedPets.includes(pet.id)}
              onToggleSelect={() => handleToggleSelect(pet.id)}
            />
          ))}
          {mockUserPets.length === 0 && (
            <Text style={styles.noPetsText}>Você ainda não possui pets cadastrados.</Text>
          )}
        </View>
      )}
    </View>
  );
};

const PriceSummaryCard = ({ daysCount, petsCount, pricePerDayBase }: { 
  daysCount: number; 
  petsCount: number; 
  pricePerDayBase: number; 
}) => {
  const dailyPricePerQuantity = petsCount * pricePerDayBase;
  const totalValue = daysCount * dailyPricePerQuantity;
  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  return (
    <View style={styles.priceSummaryCard}>
      <Text style={styles.priceSummaryTitle}>Resumo da Reserva</Text>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Valor Base (1 Pet) por Diária</Text>
        <Text style={styles.priceValue}>{formatCurrency(pricePerDayBase)}</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Quantidade de Pets</Text>
        <Text style={styles.priceValue}>{petsCount}</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Diárias Selecionadas</Text>
        <Text style={styles.priceValue}>{daysCount} dia(s)</Text>
      </View>
      <View style={styles.priceDivider} />
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Valor por Diária ({petsCount} Pets)</Text>
        <Text style={styles.priceValue}>{formatCurrency(dailyPricePerQuantity)}</Text>
      </View>
      <View style={[styles.priceRow, styles.priceRowTotal]}>
        <Text style={styles.priceLabelTotal}>Total da Locação</Text>
        <Text style={styles.priceValueTotal}>{formatCurrency(totalValue)}</Text>
      </View>
    </View>
  );
};

// --------------------------------------------------------------
// --------------------- TELA PRINCIPAL --------------------------
// --------------------------------------------------------------
type ReservaScreenProps = NativeStackScreenProps<RootStackParamList, 'Reserva'>;

export default function Reserva({ navigation }: ReservaScreenProps) {
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [dataEntrada, setDataEntrada] = useState<Date | null>(null);
  const [dataSaida, setDataSaida] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [dateField, setDateField] = useState<'entrada' | 'saida' | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const MAX_PETS_ALLOWED = 3;

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '' });
  const showAlert = (title: string, message: string) => {
    setAlertData({ title, message });
    setAlertVisible(true);
  };

  const calculateDays = (entrada: Date | null, saida: Date | null): number => {
    if (!entrada || !saida) return 0;
    const diffTime = Math.abs(saida.getTime() - entrada.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysCount = useMemo(() => calculateDays(dataEntrada, dataSaida), [dataEntrada, dataSaida]);
  const petsCount = selectedPets.length;

  const handleApplyFilters = () => {
    if (petsCount === 0) {
      showAlert("Erro", "Selecione pelo menos um pet para a reserva.");
      return;
    }
    if (daysCount === 0) {
      showAlert("Erro", "Selecione as datas de entrada e saída válidas.");
      return;
    }
    showAlert("Reserva Solicitada", `Total: R$ ${(daysCount * petsCount * PRICE_PER_DAY_BASE).toFixed(2).replace('.', ',')}`);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' || Platform.OS === 'ios') {
      const dateToSet = selectedDate || currentDate;
      if (dateField === 'entrada') setDataEntrada(dateToSet);
      else if (dateField === 'saida') setDataSaida(dateToSet);
      setCurrentDate(dateToSet);
    }
    setDateField(null);
  };

  const handleOpenDatePicker = (field: 'entrada' | 'saida', initialDate: Date | null) => {
    setDateField(field);
    setCurrentDate(initialDate || new Date());
    setShowDatePicker(true);
  };

  const formatDate = (date: Date | null) =>
    date ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Escolha uma opção...';

  const CornerIconClickable = () => (
    <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.cornerImageContainer}>
      <Image source={require('../../assets/icons/LogoPATA.png')} style={styles.cornerImage} resizeMode="contain" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={currentDate}
          mode={'date'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          <CornerIconClickable />
          <Text style={styles.mainTitle}>Fazer Reserva</Text>

          <FiltroGroup title={`Selecione seu pet (Máx: ${MAX_PETS_ALLOWED})`}>
            <PetSelectionDropdown
              selectedPets={selectedPets}
              setSelectedPets={setSelectedPets}
              maxPetsAllowed={MAX_PETS_ALLOWED}
              showAlert={showAlert}
            />
          </FiltroGroup>

          <View style={styles.groupContainer}>
            <Text style={styles.groupTitle}>Datas da Hospedagem:</Text>
            <View style={styles.datesRowContainer}>
              <View style={styles.datePickerWrapper}>
                <Text style={styles.dateLabel}>Entrada</Text>
                <TouchableOpacity
                  onPress={() => handleOpenDatePicker('entrada', dataEntrada)}
                  style={[styles.dateOptionButton, !!dataEntrada && styles.dateOptionButtonSelected]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, !!dataEntrada && styles.optionTextSelected]}>
                    {formatDate(dataEntrada)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.datePickerWrapper}>
                <Text style={styles.dateLabel}>Saída</Text>
                <TouchableOpacity
                  onPress={() => handleOpenDatePicker('saida', dataSaida)}
                  style={[styles.dateOptionButton, !!dataSaida && styles.dateOptionButtonSelected]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, !!dataSaida && styles.optionTextSelected]}>
                    {formatDate(dataSaida)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {daysCount > 0 && petsCount > 0 && (
            <PriceSummaryCard
              daysCount={daysCount}
              petsCount={petsCount}
              pricePerDayBase={PRICE_PER_DAY_BASE}
            />
          )}

          <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
            <Text style={styles.applyButtonText}>Reservar</Text>
          </TouchableOpacity>

          <Image
            source={require('../../assets/icons/Pata.png')}
            style={styles.decoracaoImage}
            resizeMode="contain"
          />

          <CustomAlert
            visible={alertVisible}
            title={alertData.title}
            message={alertData.message}
            onClose={() => setAlertVisible(false)}
          />
        </View>
      </ScrollView>
    </View>
  );
}


// -------------------------------------------------------------------
// ----------------------------- STYLES ------------------------------
// -------------------------------------------------------------------

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
        width: '100%', 
        height: '100%', 
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

    // --- Estilos de Opções de Data (Reaproveitado e Adaptado) ---
    datesRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: 5,
    },
    datePickerWrapper: {
        width: '48%', 
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 16,
        fontWeight: '500', 
        color: '#556A44',
        marginBottom: 5,
        alignSelf: 'flex-start',
    },
    // Estilo customizado para os botões de data (mais fino)
    dateOptionButton: {
        width: '100%',
        height: 45, 
        backgroundColor: '#FFF6E2',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#B3D18C',
        justifyContent: 'center',
        alignItems: 'center', 
        paddingHorizontal: 8,
    },
    dateOptionButtonSelected: {
        backgroundColor: '#85B65E', 
        borderColor: '#B3D18C', 
        borderWidth: 3,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#596350ff', 
    },
    optionTextSelected: {
        color: '#FFF6E2', 
    },
    
    // --- Estilo do Botão Aplicar (Agora Reservar) ---
    applyButton: {
        marginTop: 20, // Ajuste para o novo layout
        marginBottom: -30,
        width: 150,
        padding: 12,
        backgroundColor: '#85B65E', 
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

    // --- NOVOS ESTILOS DE SELEÇÃO DE PET ---
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 55, 
        width: '100%',
        backgroundColor: '#FFF6E2',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#B3D18C',
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    dropdownButtonOpen: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginBottom: 0,
    },
    dropdownLabel: {
        fontSize: 16,
        color: '#596350ff',
        fontWeight: '500',
    },
    dropdownLimit: {
        fontSize: 14,
        color: '#85B65E',
        fontWeight: '700',
    },
    dropdownContent: {
        backgroundColor: '#E0EFD3', // Cor suave para o conteúdo do dropdown
        borderWidth: 2,
        borderColor: '#B3D18C',
        borderTopWidth: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        padding: 10,
        marginBottom: 15,
    },
    noPetsText: {
        fontSize: 16,
        color: '#556A44',
        textAlign: 'center',
        padding: 10,
    },

    // --- ESTILOS DO CARD DE SELEÇÃO DE PET (Baseado no PerfilTutor) ---
    petSelectionCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF6E2',
        borderRadius: 8,
        padding: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#B3D18C',
    },
    petImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 6,
        overflow: 'hidden',
        marginRight: 10,
        position: 'relative',
    },
    petImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    checkmarkContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(133, 182, 94, 0.7)', // Verde semi-transparente
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkIcon: {
        width: 30,
        height: 30,
        tintColor: '#FFFFFF',
    },
    petDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    petName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4d654bff',
        marginBottom: 2,
    },
    petDetailText: {
        fontSize: 13,
        color: '#556A44',
    },
    boldText: {
        fontWeight: 'bold',
    },
    specificationsText: {
        fontSize: 12,
        color: '#556A44',
        fontStyle: 'italic',
    },

    // --- NOVOS ESTILOS DO CARD DE RESUMO DE PREÇO ---
    priceSummaryCard: {
        backgroundColor: '#E0EFD3', // Cor de fundo suave
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#B3D18C',
        padding: 15,
        marginBottom: 30,
    },
    priceSummaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#556A44',
        marginBottom: 10,
        textAlign: 'center',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    priceLabel: {
        fontSize: 15,
        color: '#556A44',
        fontWeight: '500',
    },
    priceValue: {
        fontSize: 15,
        color: '#556A44',
        fontWeight: '700',
    },
    priceDivider: {
        height: 1,
        backgroundColor: '#B3D18C',
        marginVertical: 8,
    },
    priceRowTotal: {
        marginTop: 5,
    },
    priceLabelTotal: {
        fontSize: 18,
        color: '#4d654bff',
        fontWeight: '800',
    },
    priceValueTotal: {
        fontSize: 18,
        color: '#4d654bff',
        fontWeight: '800',
    },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFF6E2',
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderWidth: 3,
    borderColor: '#B3D18C',
    alignItems: 'center',
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#556A44',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#556A44',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#85B65E',
    borderRadius: 10,
    paddingHorizontal: 45,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#B3D18C',
  },
  modalButtonText: {
    color: '#FFF6E2',
    fontSize: 18,
    fontWeight: '700',
  },
});
