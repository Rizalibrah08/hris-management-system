import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function SubmitLeaveScreen() {
  const navigation = useNavigation();
  const [description, setDescription] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('+62 82150005000');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDurationModalVisible, setIsDurationModalVisible] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('');
  const [isDelegationModalVisible, setIsDelegationModalVisible] = useState(false);
  const [selectedDelegation, setSelectedDelegation] = useState('');
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [isSubmitConfirmVisible, setIsSubmitConfirmVisible] = useState(false);
  const [isSubmitSuccessVisible, setIsSubmitSuccessVisible] = useState(false);

  const leaveCategories = [
    'Sick Leave',
    'Annual Leave/Vacation Leave',
    'Maternity/Paternity Leave',
    'Bereavement Leave',
    'Personal Leave',
    'Jury Duty Leave',
    'Compassionate Leave'
  ];

  const taskDelegations = [
    'Jeane - UX Writer',
    'Alpheas - UI Designer',
    'John - UX Designer',
    'Alicia - Jr Product Manager',
    'Claudia - UI Designer',
    'Option 4',
    'Option 4 '
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getCalendarDays = () => {
    const baseDays = [
      [ {d: '25', prev: true}, {d: '26', prev: true}, {d: '27', prev: true}, {d: '28', prev: true}, {d: '29', prev: true}, {d: '30', prev: true}, {d: '1'} ],
      [ {d: '2'}, {d: '3'}, {d: '4'}, {d: '5'}, {d: '6'}, {d: '7'}, {d: '8'} ],
      [ {d: '9'}, {d: '10'}, {d: '11'}, {d: '12'}, {d: '13'}, {d: '14'}, {d: '15'} ],
      [ {d: '16'}, {d: '17'}, {d: '18'}, {d: '19'}, {d: '20'}, {d: '21'}, {d: '22'} ],
      [ {d: '23'}, {d: '24'}, {d: '25'}, {d: '26'}, {d: '27'}, {d: '28'}, {d: '29'} ],
      [ {d: '30'}, {d: '31'}, {d: '1', next: true}, {d: '2', next: true}, {d: '3', next: true}, {d: '4', next: true}, {d: '5', next: true} ],
    ];

    return baseDays.map(row => 
      row.map(cell => {
        if (cell.prev || cell.next) return cell;
        
        const dayNum = parseInt(cell.d);
        const startNum = rangeStart ? parseInt(rangeStart) : null;
        const endNum = rangeEnd ? parseInt(rangeEnd) : null;

        let start = false;
        let end = false;
        let mid = false;
        let isStandalone = false;

        if (startNum && dayNum === startNum) start = true;
        if (endNum && dayNum === endNum) end = true;
        if (startNum && endNum && dayNum > startNum && dayNum < endNum) mid = true;

        if (startNum && !endNum && dayNum === startNum) {
            isStandalone = true;
        }

        return { ...cell, start, end, mid, isStandalone };
      })
    );
  };

  const handleDayPress = (dayItem) => {
    if (dayItem.prev || dayItem.next) return;
    const dayStr = dayItem.d;
    
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(dayStr);
      setRangeEnd(null);
    } else if (rangeStart && !rangeEnd) {
      if (parseInt(dayStr) < parseInt(rangeStart)) {
        setRangeStart(dayStr);
      } else if (parseInt(dayStr) > parseInt(rangeStart)) {
        setRangeEnd(dayStr);
      }
    }
  };

  const DropdownInput = ({ label, placeholder, iconName, onPress, value }) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.inputContainer} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
        <Ionicons name={iconName} size={20} color="#8B5CF6" style={styles.inputIcon} />
        <Text style={[styles.inputTextPlaceholder, value && { color: '#111827' }]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down-outline" size={20} color="#8B5CF6" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Submit Leave</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Fill Leave Information</Text>
            <Text style={styles.cardSubtitle}>Information about leave details</Text>
            
            <DropdownInput 
              label="Leave Category" 
              placeholder="Select Leave category" 
              iconName="albums" 
              value={selectedCategory}
              onPress={() => setIsCategoryModalVisible(true)}
            />
            <DropdownInput 
              label="Leave Duration" 
              placeholder="Select Duration" 
              iconName="calendar" 
              value={selectedDuration}
              onPress={() => setIsDurationModalVisible(true)}
            />
            <DropdownInput 
              label="Task Delegation" 
              placeholder="Select Category" 
              iconName="person-circle" 
              value={selectedDelegation}
              onPress={() => setIsDelegationModalVisible(true)}
            />

            {/* Emergency Contact */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Emergency Contact During Leave Period</Text>
              <View style={styles.inputContainerRow}>
                <TouchableOpacity style={styles.countryCodeSelector}>
                  <Text style={styles.countryCodeText}>INA</Text>
                  <Ionicons name="chevron-down-outline" size={16} color="#8B5CF6" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
                <TextInput 
                  style={styles.textInputFullRow} 
                  value={emergencyPhone}
                  onChangeText={setEmergencyPhone}
                  placeholder="+62 800000000"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Leave Description */}
            <View style={[styles.inputWrapper, { marginBottom: 0 }]}>
              <Text style={styles.inputLabel}>Leave Description</Text>
              <TextInput 
                style={styles.textAreaContainer} 
                multiline={true}
                numberOfLines={6}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter Leave Description"
                textAlignVertical="top"
              />
            </View>
          </View>

        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => setIsSubmitConfirmVisible(true)}
          >
            <Text style={styles.submitButtonText}>Submit Now</Text>
          </TouchableOpacity>
        </View>

        {/* Leave Category Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isCategoryModalVisible}
          onRequestClose={() => setIsCategoryModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={StyleSheet.absoluteFill} 
              activeOpacity={1} 
              onPress={() => setIsCategoryModalVisible(false)}
            />
            <View style={styles.bottomSheetList}>
              <Text style={styles.modalTitleList}>Leave Category</Text>
              <Text style={styles.modalSubtitleList}>Select Leave category</Text>
              
              <ScrollView showsVerticalScrollIndicator={false} style={styles.optionsScroll}>
                {leaveCategories.map((cat, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.optionItem, 
                      selectedCategory === cat && styles.optionItemActive
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={styles.optionText}>{cat}</Text>
                    <Ionicons 
                      name={selectedCategory === cat ? "radio-button-on" : "radio-button-off-outline"} 
                      size={24} 
                      color={selectedCategory === cat ? "#8B5CF6" : "#9CA3AF"} 
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalFooterButtons}>
                <TouchableOpacity 
                  style={styles.btnSecondaryHalf} 
                  onPress={() => setIsCategoryModalVisible(false)}
                >
                  <Text style={styles.btnSecondaryText}>Close Message</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.btnPrimaryHalf} 
                  onPress={() => setIsCategoryModalVisible(false)}
                >
                  <Text style={styles.btnPrimaryText}>Submit Date</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>

        {/* Leave Duration Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isDurationModalVisible}
          onRequestClose={() => setIsDurationModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={StyleSheet.absoluteFill} 
              activeOpacity={1} 
              onPress={() => setIsDurationModalVisible(false)}
            />
            <View style={styles.bottomSheetList}>
              <Text style={styles.modalTitleList}>Leave Duration</Text>
              <Text style={styles.modalSubtitleList}>Select Leave Duration</Text>
              
              {/* Calendar Header */}
              <View style={styles.calendarHeader}>
                <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
                <Text style={styles.calendarMonthText}>November 2024</Text>
                <Ionicons name="chevron-forward" size={24} color="#8B5CF6" />
              </View>

              {/* Days of Week */}
              <View style={styles.daysOfWeekRow}>
                {daysOfWeek.map(day => (
                  <View key={day} style={styles.dayOfWeekBox}>
                    <Text style={styles.dayOfWeekText}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Calendar Grid wrapped in scroll to prevent pushing footer off-screen */}
              <View style={{ flexShrink: 1, marginBottom: 20 }}>
                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                  <View style={styles.calendarGrid}>
                    {getCalendarDays().map((row, rowIdx) => (
                      <View key={`row-${rowIdx}`} style={styles.calendarRow}>
                        {row.map((dayItem, colIdx) => (
                          <TouchableOpacity 
                            key={`cell-${rowIdx}-${colIdx}`} 
                            activeOpacity={1}
                            onPress={() => handleDayPress(dayItem)}
                            style={[
                              styles.calendarCell,
                              dayItem.mid && styles.calendarCellMid,
                              dayItem.start && !dayItem.isStandalone && styles.calendarCellStartIndicator,
                              dayItem.end && !dayItem.isStandalone && styles.calendarCellEndIndicator
                            ]}
                          >
                            <View style={[
                              styles.calendarDayCircle,
                              (dayItem.start || dayItem.end) && styles.calendarDayCircleActive
                            ]}>
                              <Text style={[
                                styles.calendarDayText,
                                (dayItem.prev || dayItem.next) && styles.calendarDayTextMuted,
                                (dayItem.start || dayItem.end) && styles.calendarDayTextActive
                              ]}>
                                {dayItem.d}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.modalFooterButtonsVertical}>
                <TouchableOpacity 
                  style={[styles.btnPrimaryFull, { marginBottom: 12 }]} 
                  onPress={() => {
                    if (rangeStart) {
                      let str = `${rangeStart} Nov`;
                      if (rangeEnd) str += ` - ${rangeEnd} Nov 2024`;
                      else str += ` 2024`;
                      setSelectedDuration(str);
                    }
                    setIsDurationModalVisible(false);
                  }}
                >
                  <Text style={styles.btnPrimaryText}>Submit Date</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.btnSecondaryFull} 
                  onPress={() => setIsDurationModalVisible(false)}
                >
                  <Text style={styles.btnSecondaryText}>Close Message</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>

        {/* Task Delegation Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isDelegationModalVisible}
          onRequestClose={() => setIsDelegationModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={StyleSheet.absoluteFill} 
              activeOpacity={1} 
              onPress={() => setIsDelegationModalVisible(false)}
            />
            <View style={styles.bottomSheetList}>
              <Text style={styles.modalTitleList}>Select Task Delegation</Text>
              <Text style={styles.modalSubtitleList}>Select Leave category</Text>
              
              <ScrollView showsVerticalScrollIndicator={false} style={styles.optionsScroll}>
                {taskDelegations.map((del, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.optionItem, 
                      selectedDelegation === del && styles.optionItemActive
                    ]}
                    onPress={() => setSelectedDelegation(del)}
                  >
                    <Text style={styles.optionText}>{del}</Text>
                    <Ionicons 
                      name={selectedDelegation === del ? "radio-button-on" : "radio-button-off-outline"} 
                      size={24} 
                      color={selectedDelegation === del ? "#8B5CF6" : "#9CA3AF"} 
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalFooterButtons}>
                <TouchableOpacity 
                  style={styles.btnSecondaryHalf} 
                  onPress={() => {
                    setSelectedDelegation(''); // Cancel clears selection
                    setIsDelegationModalVisible(false);
                  }}
                >
                  <Text style={styles.btnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.btnPrimaryHalf} 
                  onPress={() => setIsDelegationModalVisible(false)}
                >
                  <Text style={styles.btnPrimaryText}>Select</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>

        {/* Submit Confirmation Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isSubmitConfirmVisible}
          onRequestClose={() => setIsSubmitConfirmVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={StyleSheet.absoluteFill} 
              activeOpacity={1} 
              onPress={() => setIsSubmitConfirmVisible(false)}
            />
            <View style={[styles.bottomSheetList, { paddingTop: 60, alignItems: 'center' }]}>
              
              <View style={styles.floatingIconContainer}>
                <View style={styles.floatingIconBg}>
                  <Ionicons name="layers" size={40} color="#FFFFFF" />
                </View>
              </View>

              <Text style={styles.confirmTitle}>Submit Leave</Text>
              <Text style={styles.confirmSubtitle}>
                Double-check your leave details to ensure{'\n'}everything is correct. Do you want to proceed?
              </Text>

              <View style={{ width: '100%', marginTop: 32 }}>
                <TouchableOpacity 
                  style={[styles.btnPrimaryFull, { marginBottom: 16 }]} 
                  onPress={() => {
                    setIsSubmitConfirmVisible(false);
                    setTimeout(() => {
                      setIsSubmitSuccessVisible(true);
                    }, 300); // Wait for confirmation modal to close before opening success
                  }}
                >
                  <Text style={styles.btnPrimaryText}>Yes, Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.btnSecondaryFull} 
                  onPress={() => setIsSubmitConfirmVisible(false)}
                >
                  <Text style={styles.btnSecondaryText}>No, Let me check</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>

        {/* Submit Success Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isSubmitSuccessVisible}
          onRequestClose={() => setIsSubmitSuccessVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={StyleSheet.absoluteFill} 
              activeOpacity={1} 
              onPress={() => setIsSubmitSuccessVisible(false)}
            />
            <View style={[styles.bottomSheetList, { paddingTop: 60, alignItems: 'center' }]}>
              
              <View style={styles.floatingIconContainer}>
                <View style={styles.floatingIconBg}>
                  <Ionicons name="layers" size={40} color="#FFFFFF" />
                </View>
              </View>

              <Text style={styles.confirmTitle}>Leave Submitted!</Text>
              <Text style={styles.confirmSubtitle}>
                Your leave request has been sent for review! Wait for HR to review your request.
              </Text>

              <View style={{ width: '100%', marginTop: 32 }}>
                <TouchableOpacity 
                  style={styles.btnPrimaryFull} 
                  onPress={() => {
                    setIsSubmitSuccessVisible(false);
                    navigation.navigate('Main', {
                      screen: 'Leave',
                      params: { newLeaveAdded: true }
                    });
                  }}
                >
                  <Text style={styles.btnPrimaryText}>View Expense History</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Light gray background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDEBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 110, // make space for footer button
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '400',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  inputContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  countryCodeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    paddingRight: 10,
  },
  countryCodeText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  inputIcon: {
    marginRight: 12,
  },
  inputTextPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '400',
  },
  textInputFullRow: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
    padding: 0,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 16,
    height: 120,
    fontSize: 14,
    color: '#9CA3AF',
    backgroundColor: '#FFFFFF',
    fontWeight: '400',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20, // To stay consistent
    backgroundColor: '#F3F4F6',
  },
  submitButton: {
    backgroundColor: '#A78BFA', // Lighter purple color matched from image
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.7)',
    justifyContent: 'flex-end',
  },
  bottomSheetList: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalTitleList: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitleList: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  optionsScroll: {
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB', 
    borderRadius: 12,
    marginBottom: 12,
  },
  optionItemActive: {
    borderColor: '#8B5CF6',
  },
  optionText: {
    fontSize: 14,
    color: '#111827',
  },
  modalFooterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnSecondaryHalf: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    marginRight: 8,
  },
  btnPrimaryHalf: {
    flex: 1,
    backgroundColor: '#A78BFA',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginLeft: 8,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  btnSecondaryText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  btnPrimaryFull: {
    width: '100%',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  btnSecondaryFull: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  calendarMonthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayOfWeekBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    marginHorizontal: 2,
  },
  dayOfWeekText: {
    fontSize: 13,
    color: '#4B5563',
  },
  calendarGrid: {
    // marginBottom moved to wrapper view
  },
  calendarRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarCell: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCellMid: {
    backgroundColor: '#EDE9FE',
  },
  calendarCellStartIndicator: {
    backgroundColor: '#EDE9FE',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  calendarCellEndIndicator: {
    backgroundColor: '#EDE9FE',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  calendarDayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayCircleActive: {
    backgroundColor: '#8B5CF6',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#111827',
  },
  calendarDayTextMuted: {
    color: '#9CA3AF',
  },
  calendarDayTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalFooterButtonsVertical: {
    flexDirection: 'column',
  },
  floatingIconContainer: {
    position: 'absolute',
    top: -40,
    alignSelf: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingIconBg: {
    backgroundColor: '#8B5CF6',
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
});
