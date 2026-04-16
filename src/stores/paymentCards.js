import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getCards as getCardsApi,
  createCard as createCardApi,
  updateCard as updateCardApi,
  deleteCard as deleteCardApi,
} from '@/api/card'

export const usePaymentCardsStore = defineStore('paymentCards', () => {
  const cards = ref([])
  const selectedCardId = ref(null)

  const cardCount = computed(() => cards.value.length)

  const fetchCards = async () => {
    const response = await getCardsApi()
    cards.value = response.data.data ?? []
  }

  const addCard = async (payload) => {
    const response = await createCardApi(payload)
    return response.data
  }

  const updateCard = async ({ paymentId, ...payload }) => {
    const response = await updateCardApi(paymentId, payload)
    return response.data
  }

  const deleteCard = async (paymentId) => {
    const response = await deleteCardApi(paymentId)
    return response.data
  }

  const selectCard = (paymentId) => {
    selectedCardId.value = paymentId
  }

  return {
    cards,
    cardCount,
    selectedCardId,
    fetchCards,
    addCard,
    updateCard,
    deleteCard,
    selectCard,
  }
})