import { defineStore } from 'pinia'

const initialForm = () => ({
  categoryName: 'OTT',
  subscriptionName: '넷플릭스',
  customSubscriptionName: '',
  serviceIconFileName: '',
  paymentAmount: 17000,
  billingCycle: 'MONTHLY',
  paymentCardName: '현대카드',
  customPaymentCardName: '',
  paymentStartDate: '2026-04-11',
  note: '',
})

export const useSubscriptionFormStore = defineStore('subscriptionForm', {
  state: () => ({
    currentStep: 1,
    subscriptionForm: initialForm(),
  }),
  getters: {
    resolvedSubscriptionName(state) {
      return state.subscriptionForm.subscriptionName === '직접 입력'
        ? state.subscriptionForm.customSubscriptionName.trim()
        : state.subscriptionForm.subscriptionName
    },
    requestPayload(state) {
      const resolvedSubscriptionName = state.subscriptionForm.subscriptionName === '직접 입력'
        ? state.subscriptionForm.customSubscriptionName.trim()
        : state.subscriptionForm.subscriptionName

      return {
        categoryName: state.subscriptionForm.categoryName,
        subscriptionName: resolvedSubscriptionName,
        paymentAmount: Number(state.subscriptionForm.paymentAmount || 0),
        billingCycle: state.subscriptionForm.billingCycle,
        paymentCardName: state.subscriptionForm.paymentCardName === '직접 입력'
          ? state.subscriptionForm.customPaymentCardName.trim()
          : state.subscriptionForm.paymentCardName,
        paymentStartDate: state.subscriptionForm.paymentStartDate,
        note: state.subscriptionForm.note?.trim() || '',
      }
    },
  },
  actions: {
    goToStep(step) {
      this.currentStep = Math.min(Math.max(step, 1), 4)
    },
    nextStep() {
      this.currentStep = Math.min(this.currentStep + 1, 4)
    },
    prevStep() {
      this.currentStep = Math.max(this.currentStep - 1, 1)
    },
    setCategory(categoryName, defaultService, defaultAmount) {
      this.subscriptionForm.categoryName = categoryName
      this.subscriptionForm.subscriptionName = defaultService
      this.subscriptionForm.customSubscriptionName = ''
      if (typeof defaultAmount === 'number') {
        this.subscriptionForm.paymentAmount = defaultAmount
      }
    },
    setSubscription(subscriptionName, defaultAmount) {
      this.subscriptionForm.subscriptionName = subscriptionName
      if (subscriptionName !== '직접 입력') {
        this.subscriptionForm.customSubscriptionName = ''
      }
      if (typeof defaultAmount === 'number') {
        this.subscriptionForm.paymentAmount = defaultAmount
      }
    },
    setIconFileName(fileName) {
      this.subscriptionForm.serviceIconFileName = fileName
    },
    setPaymentCardName(paymentCardName) {
      this.subscriptionForm.paymentCardName = paymentCardName
      if (paymentCardName !== '직접 입력') {
        this.subscriptionForm.customPaymentCardName = ''
      }
    },
    setBillingCycle(billingCycle) {
      this.subscriptionForm.billingCycle = billingCycle
    },
    resetForm() {
      this.currentStep = 1
      this.subscriptionForm = initialForm()
    },
  },
})
