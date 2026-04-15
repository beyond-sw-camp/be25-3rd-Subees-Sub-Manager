<script setup>
import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AppShell from '@/components/layout/AppShell.vue'
import AppAsset from '@/components/ui/AppAsset.vue'
import { usePaymentCardsStore } from '@/stores/paymentCards'

const paymentCardsStore = usePaymentCardsStore()
const { cards, selectedCard, cardCount } = storeToRefs(paymentCardsStore)
const isEditing = ref(false)
const showDeleteConfirm = ref(false)
const pendingDeleteId = ref(null)

const form = reactive({ cardId: null, cardName: '', issuer: '', typeLabel: '신용카드', memo: '' })



const resetForm = () => {
  form.cardId = null
  form.cardName = ''
  form.issuer = ''
  form.typeLabel = '신용카드'
  form.memo = ''
  isEditing.value = false
}

const startEdit = (card) => {
  paymentCardsStore.selectCard(card.cardId)
  Object.assign(form, card)
  isEditing.value = true
}

const submitForm = () => {
  if (!form.cardName.trim()) return
  if (isEditing.value && form.cardId) paymentCardsStore.updateCard({ ...form })
  else paymentCardsStore.addCard({ ...form })
  resetForm()
}

const requestDelete = (cardId) => {
  pendingDeleteId.value = cardId
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (!pendingDeleteId.value) return
  paymentCardsStore.deleteCard(pendingDeleteId.value)
  if (form.cardId === pendingDeleteId.value) resetForm()
  pendingDeleteId.value = null
  showDeleteConfirm.value = false
}


</script>

<template>
  <AppShell title="hidden">
    <div class="grid gap-6">
      <section class="shell-card p-7 md:p-8">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p class="text-sm font-semibold text-[#8A6A00]">결제 카드 관리</p>
            <h1 class="mt-3 page-title !mt-0 !text-[34px] xl:!text-[42px]">구독 결제에 쓰는 카드를 한곳에서 관리하세요</h1>
            <p class="mt-3 max-w-4xl body-copy">카드 등록, 수정, 삭제, 기본 카드 지정까지 같은 화면에서 바로 처리할 수 있습니다.</p>
          </div>
          <div class="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
            <article v-for="item in pageStats" :key="item.label" class="ghost-card p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">{{ item.label }}</p>
              <p class="mt-3 text-2xl font-bold tracking-[-0.03em] text-neutral-900">{{ item.value }}</p>
              <p class="mt-2 body-copy">{{ item.note }}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div class="section-card">
          <div class="flex items-end justify-between gap-3 border-b border-[rgba(46,34,10,0.08)] pb-5">
            <div>
              <p class="text-sm font-semibold text-[#8A6A00]">등록 카드 목록</p>
              <h2 class="mt-2 section-heading">카드 {{ cardCount }}개</h2>
            </div>
            <button type="button" class="secondary-button !min-h-11 !px-4" @click="resetForm">새 카드 입력</button>
          </div>
          <div class="mt-5 grid gap-4 md:grid-cols-2">
            <article v-for="card in cards" :key="card.cardId" class="rounded-[24px] border border-[rgba(46,34,10,0.08)] bg-[rgba(255,253,247,0.88)] p-5">
              <div class="flex items-center gap-3">
                <div class="grid h-14 w-14 place-items-center rounded-[20px] border border-[rgba(46,34,10,0.08)] bg-white">
                  <AppAsset type="card" :value="card.cardName" fallback="creditcard" :size="18" wrapper-class="inline-flex items-center justify-center" image-class="h-9 w-9 object-contain" icon-class="text-[#8A6A00]" badge-class="inline-flex min-w-[48px] items-center justify-center rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-[-0.02em]" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-base font-bold text-neutral-900">{{ card.cardName }}</p>
                    <span v-if="card.isPrimary" class="rounded-full bg-[rgba(242,210,33,0.16)] px-3 py-1 text-[11px] font-extrabold text-[#8A6A00]">기본 카드</span>
                  </div>
                  <p class="mt-1 text-sm text-neutral-500">{{ card.typeLabel }} · {{ formatLastDigits(card.lastDigits) }}</p>
                </div>
              </div>
              <div class="mt-4 rounded-[18px] bg-brand-50 px-4 py-3 text-sm text-neutral-600">
                <p class="font-semibold text-neutral-900">{{ card.issuer }}</p>
                <p class="mt-1 leading-6">{{ card.memo || '메모를 아직 입력하지 않았습니다.' }}</p>
              </div>
              <div class="mt-4 flex flex-wrap gap-2.5">
                <button type="button" class="primary-button !min-h-11 !px-4" @click="startEdit(card)">수정</button>
                <button type="button" class="secondary-button !min-h-11 !px-4" @click="paymentCardsStore.setPrimaryCard(card.cardId)">기본 카드 지정</button>
                <button type="button" class="danger-ghost-button !min-h-11 !px-4" @click="requestDelete(card.cardId)">삭제</button>
              </div>
            </article>
          </div>
        </div>

        <aside class="shell-card p-6 xl:sticky xl:top-6 xl:self-start">
          <p class="text-sm font-semibold text-[#8A6A00]">{{ isEditing ? '카드 수정' : '카드 등록' }}</p>
          <h2 class="mt-2 text-[24px] font-bold tracking-[-0.03em] text-neutral-900">{{ isEditing ? selectedCard?.cardName : '새 결제 카드 추가' }}</h2>
          <p class="mt-2 text-sm leading-6 text-neutral-500">구독 등록 화면에서 바로 선택할 수 있도록 실제 카드명을 기준으로 관리합니다.</p>
          <div class="mt-5 grid gap-4">
            <label class="grid gap-2"><span class="form-label">카드명</span><input v-model="form.cardName" class="form-input" placeholder="예: 하나카드" /></label>
            <label class="grid gap-2"><span class="form-label">카드사 / 발급처</span><input v-model="form.issuer" class="form-input" placeholder="예: 하나" /></label>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="grid gap-2"><span class="form-label">카드 유형</span><select v-model="form.typeLabel" class="form-input"><option value="신용카드">신용카드</option><option value="체크카드">체크카드</option><option value="법인카드">법인카드</option></select></label>
              <label class="grid gap-2"><span class="form-label">마지막 4자리</span><input v-model="form.lastDigits" class="form-input" maxlength="4" placeholder="예: 4921" /></label>
            </div>
            <label class="grid gap-2"><span class="form-label">메모</span><textarea v-model="form.memo" rows="5" class="form-input min-h-[140px] resize-none py-4" placeholder="이 카드로 주로 결제하는 구독을 간단히 적어두세요."></textarea></label>
          </div>
          <div class="mt-6 flex flex-wrap gap-3">
            <button type="button" class="primary-button" @click="submitForm">{{ isEditing ? '카드 저장' : '카드 등록' }}</button>
            <button type="button" class="secondary-button" @click="resetForm">취소</button>
          </div>
        </aside>
      </section>
    </div>

    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-4">
      <div class="w-full max-w-md rounded-modal bg-brand-50 p-6 shadow-floating">
        <p class="text-sm font-semibold text-danger">카드 삭제</p>
        <h3 class="mt-2 text-xl font-bold tracking-[-0.02em] text-neutral-900">등록한 카드를 삭제하시겠습니까?</h3>
        <p class="mt-3 text-sm leading-6 text-neutral-500">삭제 후에는 구독 수정 화면에서 다시 선택할 수 없으며, 필요하면 다시 등록해야 합니다.</p>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="secondary-button" @click="showDeleteConfirm = false">취소</button>
          <button type="button" class="primary-button bg-danger hover:bg-red-600 active:bg-red-700" @click="confirmDelete">삭제</button>
        </div>
      </div>
    </div>
  </AppShell>
</template>
