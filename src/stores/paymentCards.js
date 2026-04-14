import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'subees-payment-cards'

const defaultCards = () => ([
  { cardId: 1, cardName: '현대카드', issuer: '현대', typeLabel: '신용카드', lastDigits: '4921', memo: 'OTT 정기결제 전용', isPrimary: true },
  { cardId: 2, cardName: '토스카드', issuer: '토스', typeLabel: '체크카드', lastDigits: '1104', memo: 'AI / 소액 정기결제', isPrimary: false },
  { cardId: 3, cardName: '하나카드', issuer: '하나', typeLabel: '신용카드', lastDigits: '8219', memo: '클라우드 / 업무형 결제', isPrimary: false },
  { cardId: 4, cardName: '신한카드', issuer: '신한', typeLabel: '신용카드', lastDigits: '1028', memo: '예비 결제수단', isPrimary: false },
])

const loadCards = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultCards()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? parsed : defaultCards()
  } catch (error) {
    return defaultCards()
  }
}

const saveCards = (value) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export const usePaymentCardsStore = defineStore('paymentCards', () => {
  const cards = ref(loadCards())
  const selectedCardId = ref(cards.value.find((card) => card.isPrimary)?.cardId ?? cards.value[0]?.cardId ?? null)

  const selectedCard = computed(() => cards.value.find((card) => card.cardId === selectedCardId.value) ?? null)
  const primaryCard = computed(() => cards.value.find((card) => card.isPrimary) ?? cards.value[0] ?? null)
  const cardOptions = computed(() => cards.value.map((card) => card.cardName))
  const cardCount = computed(() => cards.value.length)

  const persist = () => saveCards(cards.value)

  const selectCard = (cardId) => {
    selectedCardId.value = cardId
  }

  const setPrimaryCard = (cardId) => {
    cards.value = cards.value.map((card) => ({ ...card, isPrimary: card.cardId === cardId }))
    selectedCardId.value = cardId
    persist()
  }

  const addCard = (payload) => {
    const nextId = Math.max(0, ...cards.value.map((card) => card.cardId)) + 1
    const nextCard = {
      cardId: nextId,
      cardName: payload.cardName.trim(),
      issuer: payload.issuer.trim() || payload.cardName.trim(),
      typeLabel: payload.typeLabel || '신용카드',
      lastDigits: String(payload.lastDigits || '').slice(-4),
      memo: payload.memo?.trim() || '',
      isPrimary: cards.value.length === 0,
    }
    cards.value = [...cards.value, nextCard]
    if (nextCard.isPrimary) selectedCardId.value = nextCard.cardId
    persist()
    return nextCard
  }

  const updateCard = (payload) => {
    cards.value = cards.value.map((card) => card.cardId === payload.cardId ? {
      ...card,
      cardName: payload.cardName.trim(),
      issuer: payload.issuer.trim() || payload.cardName.trim(),
      typeLabel: payload.typeLabel || card.typeLabel,
      lastDigits: String(payload.lastDigits || '').slice(-4),
      memo: payload.memo?.trim() || '',
    } : card)
    persist()
  }

  const deleteCard = (cardId) => {
    const target = cards.value.find((card) => card.cardId === cardId)
    if (!target) return
    cards.value = cards.value.filter((card) => card.cardId !== cardId)
    if (target.isPrimary && cards.value.length) {
      cards.value = cards.value.map((card, index) => ({ ...card, isPrimary: index === 0 }))
      selectedCardId.value = cards.value[0].cardId
    } else if (selectedCardId.value === cardId) {
      selectedCardId.value = cards.value[0]?.cardId ?? null
    }
    persist()
  }

  return { cards, selectedCardId, selectedCard, primaryCard, cardOptions, cardCount, selectCard, setPrimaryCard, addCard, updateCard, deleteCard }
})
