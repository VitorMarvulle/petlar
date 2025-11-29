// AppPet\src\screens\Reserva.tsx - COM VALIDAÇÕES COMPLETAS

import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  Image, Platform, Modal, ActivityIndicator
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types'; 
import DateTimePicker from '@react-native-community/datetimepicker';

const API_BASE_URL = 'http://localhost:8000'; // ⚠️ Ajuste para seu IP se necessário

// --- INTERFACES ---
interface Pet {
  id_pet: number;
  id_tutor: number;
  nome: string;
  especie: string;
  raca?: string;
  idade?: number;
  idade_unidade?: string;
  peso?: number;
  peso_unidade?: string;
  observacoes?: string;
  fotos_urls?: string[];
}

// --- COMPONENTES AUXILIARES ---
const CustomAlert = ({
  visible, title, message, onClose
}: {
  visible: boolean; title: string; message: string; onClose: () => void;
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

const FiltroGroup = ({ title, children, styleProp }: any) => (
  <View style={[styles.groupContainer, styleProp]}>
    <Text style={styles.groupTitle}>{title}</Text>
    {children}
  </View>
);

const PetSelectionCard = ({ pet, isSelected, onToggleSelect }: any) => {
  const imageUrl = (pet.fotos_urls && pet.fotos_urls.length > 0) 
    ? pet.fotos_urls[0] 
    : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=200&fit=crop';
  
  const idadeText = pet.idade 
    ? `${pet.idade} ${pet.idade_unidade || 'ano'}${pet.idade > 1 ? 's' : ''}`
    : '';
  const pesoText = pet.peso 
    ? `${pet.peso}${pet.peso_unidade || 'kg'}`
    : '';
  
  return (
    <TouchableOpacity style={styles.petSelectionCard} onPress={onToggleSelect} activeOpacity={0.8}>
      <View style={styles.petImageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.petImage} resizeMode="cover" />
        {isSelected && (
          <View style={styles.checkmarkContainer}>
            <Image source={require('../../assets/icons/check.png')} style={styles.checkmarkIcon} />
          </View>
        )}
      </View>
      <View style={styles.petDetails}>
        <Text style={styles.petName}>{pet.nome}</Text>
        <Text style={styles.petDetailText}>
          <Text style={styles.boldText}>Espécie:</Text> {pet.especie}
        </Text>
        {pet.raca && (
          <Text style={styles.petDetailText}>
            <Text style={styles.boldText}>Raça:</Text> {pet.raca}
          </Text>
        )}
        {(idadeText || pesoText) && (
          <Text style={styles.petDetailText}>
            {idadeText && `${idadeText}`}
            {idadeText && pesoText && ' • '}
            {pesoText && `${pesoText}`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const PetSelectionDropdown = ({ 
  selectedPets, setSelectedPets, maxPetsAllowed, showAlert, userPets, loading
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleToggleSelect = (petId: number) => {
    setSelectedPets((prev: number[]) => {
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
        disabled={loading}
      >
        <Text style={styles.dropdownLabel}>{displayLabel}</Text>
        <Text style={styles.dropdownLimit}>Máx: {maxPetsAllowed}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownContent}>
          {loading ? (
            <ActivityIndicator size="small" color="#556A44" style={{ padding: 20 }} />
          ) : userPets.length === 0 ? (
            <Text style={styles.noPetsText}>Você ainda não possui pets cadastrados.</Text>
          ) : (
            userPets.map((pet: Pet) => (
              <PetSelectionCard
                key={pet.id_pet}
                pet={pet}
                isSelected={selectedPets.includes(pet.id_pet)}
                onToggleSelect={() => handleToggleSelect(pet.id_pet)}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
};

const PriceSummaryCard = ({ daysCount, petsCount, pricePerDayBase }: any) => {
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

const DatePickerComponent = ({ label, date, onDateChange, minimumDate }: any) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(date || new Date());

  const formatDate = (d: Date | null) =>
    d ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Escolha uma data...';

  const handleWebDateChange = (e: any) => {
    const selectedDate = new Date(e.target.value + 'T00:00:00');
    onDateChange(selectedDate);
  };

  const handleMobileDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    
    if (event.type === 'set' && selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        onDateChange(selectedDate);
      }
    } else if (event.type === 'dismissed') {
      setShowPicker(false);
    }
  };

  const handleIOSConfirm = () => {
    onDateChange(tempDate);
    setShowPicker(false);
  };

  if (Platform.OS === 'web') {
    const dateValue = date ? date.toISOString().split('T')[0] : '';
    const minDateValue = minimumDate ? minimumDate.toISOString().split('T')[0] : '';
    return (
      <View style={styles.datePickerWrapper}>
        <Text style={styles.dateLabel}>{label}</Text>
        <input
          type="date"
          value={dateValue}
          min={minDateValue}
          onChange={handleWebDateChange}
          style={{
            width: '100%', height: 45, backgroundColor: date ? '#85B65E' : '#FFF6E2',
            borderRadius: 10, border: date ? '3px solid #B3D18C' : '2px solid #B3D18C',
            paddingLeft: 12, paddingRight: 12, fontSize: 16, fontWeight: '500',
            color: date ? '#FFF6E2' : '#596350', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.datePickerWrapper}>
      <Text style={styles.dateLabel}>{label}</Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={[styles.dateOptionButton, !!date && styles.dateOptionButtonSelected]}
        activeOpacity={0.7}
      >
        <Text style={[styles.optionText, !!date && styles.optionTextSelected]}>
          {formatDate(date)}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <Modal transparent visible={showPicker} animationType="slide">
          <View style={styles.modalPickerOverlay}>
            <View style={styles.modalPickerContainer}>
              {Platform.OS === 'ios' && (
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.pickerCancelButton}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleIOSConfirm}>
                    <Text style={styles.pickerConfirmButton}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              )}
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleMobileDateChange}
                minimumDate={minimumDate}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

// --- TELA PRINCIPAL ---
type ReservaScreenProps = NativeStackScreenProps<RootStackParamList, 'Reserva'>;

export default function Reserva({ navigation, route }: ReservaScreenProps) {
  const { id_usuario, id_anfitriao, preco_diaria } = route.params;
  
  const [selectedPets, setSelectedPets] = useState<number[]>([]);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [dataEntrada, setDataEntrada] = useState<Date | null>(null);
  const [dataSaida, setDataSaida] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const MAX_PETS_ALLOWED = 3;
  const PRICE_PER_DAY = Number(preco_diaria) || 65.00;

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '' });
  
  const showAlert = (title: string, message: string) => {
    setAlertData({ title, message });
    setAlertVisible(true);
  };

  useEffect(() => {
    const fetchUserPets = async () => {
      try {
        setLoadingPets(true);
        const response = await fetch(`${API_BASE_URL}/pets/tutor/${id_usuario}`);
        
        if (!response.ok) throw new Error('Erro ao buscar pets');

        const data = await response.json();
        setUserPets(data);
      } catch (error) {
        console.error('Erro ao buscar pets:', error);
        showAlert('Erro', 'Não foi possível carregar seus pets. Tente novamente.');
      } finally {
        setLoadingPets(false);
      }
    };

    if (id_usuario) {
      fetchUserPets();
    }
  }, [id_usuario]);

  const calculateDays = (entrada: Date | null, saida: Date | null): number => {
    if (!entrada || !saida) return 0;
    const diffTime = Math.abs(saida.getTime() - entrada.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysCount = useMemo(() => calculateDays(dataEntrada, dataSaida), [dataEntrada, dataSaida]);
  const petsCount = selectedPets.length;

  // --- FUNÇÃO DE ENVIO COM VALIDAÇÕES ---
  const handleApplyFilters = async () => {
    // Validações Frontend Básicas
    if (petsCount === 0) {
      showAlert("Atenção", "Selecione pelo menos um pet para a reserva.");
      return;
    }
    if (daysCount === 0 || !dataEntrada || !dataSaida) {
      showAlert("Atenção", "Selecione datas de entrada e saída válidas.");
      return;
    }
    if (dataEntrada >= dataSaida) {
      showAlert("Data Inválida", "A data de saída deve ser posterior à data de entrada.");
      return;
    }

    try {
      setSubmitting(true);

      const valorTotalReserva = Number((daysCount * petsCount * PRICE_PER_DAY).toFixed(2));

      const reservaData = {
        id_tutor: id_usuario,
        id_anfitriao: id_anfitriao,
        data_inicio: dataEntrada.toISOString().split('T')[0],
        data_fim: dataSaida.toISOString().split('T')[0],
        status: "pendente",
        pets_tutor: selectedPets,
        valor_diaria: PRICE_PER_DAY,
        qtd_pets: petsCount,
        qtd_dias: daysCount,
        valor_total_reserva: valorTotalReserva
      };

      console.log('Enviando payload:', reservaData);

      const response = await fetch(`${API_BASE_URL}/reservas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservaData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Backend retorna mensagens detalhadas das validações
        throw new Error(result.detail || 'Erro ao criar reserva');
      }

      console.log('Reserva criada:', result);
      
      const totalFormatted = valorTotalReserva.toFixed(2).replace('.', ',');
      
      showAlert(
        "Sucesso!", 
        `Reserva solicitada!\n\nValor Total: R$ ${totalFormatted}\n\nAguarde a confirmação do anfitrião.`
      );

      setTimeout(() => {
        setSelectedPets([]);
        setDataEntrada(null);
        setDataSaida(null);
        navigation.goBack();
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao criar reserva:', error);
      showAlert("Não foi possível reservar", error.message || "Ocorreu um erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  };

  const CornerIconClickable = () => (
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cornerImageContainer}>
      <Image source={require('../../assets/icons/LogoPATA.png')} style={styles.cornerImage} resizeMode="contain" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
              userPets={userPets}
              loading={loadingPets}
            />
          </FiltroGroup>

          <View style={styles.groupContainer}>
            <Text style={styles.groupTitle}>Datas da Hospedagem:</Text>
            <View style={styles.datesRowContainer}>
              <DatePickerComponent
                label="Entrada"
                date={dataEntrada}
                onDateChange={setDataEntrada}
                minimumDate={new Date()}
              />

              <DatePickerComponent
                label="Saída"
                date={dataSaida}
                onDateChange={setDataSaida}
                minimumDate={dataEntrada || new Date()}
              />
            </View>
          </View>

          {daysCount > 0 && petsCount > 0 && (
            <PriceSummaryCard
              daysCount={daysCount}
              petsCount={petsCount}
              pricePerDayBase={PRICE_PER_DAY}
            />
          )}

          <TouchableOpacity 
            style={[styles.applyButton, submitting && styles.applyButtonDisabled]} 
            onPress={handleApplyFilters}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF6E2" />
            ) : (
              <Text style={styles.applyButtonText}>Reservar</Text>
            )}
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

// Styles (mantidos iguais ao original)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#B3D18C' },
  scrollContainer: { flexGrow: 1 },
  innerContainer: { flex: 1, marginHorizontal: 12, marginTop: 30, marginBottom: 45, backgroundColor: '#FFFFFF', borderRadius: 40, paddingHorizontal: 30, paddingVertical: 10 },
  mainTitle: { fontSize: 24, fontWeight: '500', color: '#556A44', marginBottom: 22, textAlign: 'center', marginTop: 120 },
  cornerImageContainer: { position: 'absolute', top: -50, right: -80, width: 265, height: 210, zIndex: 10 },
  cornerImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  groupContainer: { backgroundColor: '#FFF6E2', borderRadius: 15, borderWidth: 2, borderColor: '#B3D18C', padding: 15, marginBottom: 25 },
  groupTitle: { fontSize: 20, fontWeight: '400', color: '#556A44', marginBottom: 10 },
  datesRowContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 5 },
  datePickerWrapper: { width: '48%', alignItems: 'center' },
  dateLabel: { fontSize: 16, fontWeight: '500', color: '#556A44', marginBottom: 5, alignSelf: 'flex-start' },
  dateOptionButton: { width: '100%', height: 45, backgroundColor: '#FFF6E2', borderRadius: 10, borderWidth: 2, borderColor: '#B3D18C', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  dateOptionButtonSelected: { backgroundColor: '#85B65E', borderColor: '#B3D18C', borderWidth: 3 },
  optionText: { fontSize: 16, fontWeight: '500', color: '#596350ff' },
  optionTextSelected: { color: '#FFF6E2' },
  applyButton: { marginTop: 20, marginBottom: -30, width: 150, padding: 12, backgroundColor: '#85B65E', borderRadius: 15, borderWidth: 3, borderColor: '#B3D18C', alignItems: 'center', alignSelf: 'center' },
  applyButtonDisabled: { opacity: 0.6 },
  applyButtonText: { fontSize: 20, fontWeight: '700', color: '#FFF6E2' },
  decoracaoImage: { width: 150, height: 150, alignSelf: 'center', marginBottom: 10, top: 200, right: 130 },
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 55, width: '100%', backgroundColor: '#FFF6E2', borderRadius: 10, borderWidth: 2, borderColor: '#B3D18C', paddingHorizontal: 15, marginBottom: 10 },
  dropdownButtonOpen: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 },
  dropdownLabel: { fontSize: 16, color: '#596350ff', fontWeight: '500' },
  dropdownLimit: { fontSize: 14, color: '#85B65E', fontWeight: '700' },
  dropdownContent: { backgroundColor: '#E0EFD3', borderWidth: 2, borderColor: '#B3D18C', borderTopWidth: 0, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, padding: 10, marginBottom: 15 },
  noPetsText: { fontSize: 16, color: '#556A44', textAlign: 'center', padding: 10 },
  petSelectionCard: { flexDirection: 'row', backgroundColor: '#FFF6E2', borderRadius: 8, padding: 8, marginBottom: 10, borderWidth: 1, borderColor: '#B3D18C' },
  petImageContainer: { width: 60, height: 60, borderRadius: 6, overflow: 'hidden', marginRight: 10, position: 'relative' },
  petImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  checkmarkContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(133, 182, 94, 0.7)', justifyContent: 'center', alignItems: 'center' },
  checkmarkIcon: { width: 30, height: 30, tintColor: '#FFFFFF' },
  petDetails: { flex: 1, justifyContent: 'center' },
  petName: { fontSize: 16, fontWeight: '700', color: '#4d654bff', marginBottom: 2 },
  petDetailText: { fontSize: 13, color: '#556A44', marginBottom: 2 },
  boldText: { fontWeight: 'bold' },
  priceSummaryCard: { backgroundColor: '#E0EFD3', borderRadius: 15, borderWidth: 2, borderColor: '#B3D18C', padding: 15, marginBottom: 30 },
  priceSummaryTitle: { fontSize: 18, fontWeight: '700', color: '#556A44', marginBottom: 10, textAlign: 'center' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  priceLabel: { fontSize: 15, color: '#556A44', fontWeight: '500' },
  priceValue: { fontSize: 15, color: '#556A44', fontWeight: '700' },
  priceDivider: { height: 1, backgroundColor: '#B3D18C', marginVertical: 8 },
  priceRowTotal: { marginTop: 5 },
  priceLabelTotal: { fontSize: 18, color: '#4d654bff', fontWeight: '800' },
  priceValueTotal: { fontSize: 18, color: '#4d654bff', fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: '#FFF6E2', borderRadius: 20, paddingVertical: 25, paddingHorizontal: 20, borderWidth: 3, borderColor: '#B3D18C', alignItems: 'center', elevation: 6 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#556A44', marginBottom: 10, textAlign: 'center' },
  modalMessage: { fontSize: 16, color: '#556A44', textAlign: 'center', marginBottom: 20 },
  modalButton: { backgroundColor: '#85B65E', borderRadius: 10, paddingHorizontal: 45, paddingVertical: 10, borderWidth: 2, borderColor: '#B3D18C' },
  modalButtonText: { color: '#FFF6E2', fontSize: 18, fontWeight: '700' },
  modalPickerOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalPickerContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 20 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#B3D18C' },
  pickerCancelButton: { fontSize: 16, color: '#556A44', fontWeight: '500' },
  pickerConfirmButton: { fontSize: 16, color: '#85B65E', fontWeight: '700' },
});