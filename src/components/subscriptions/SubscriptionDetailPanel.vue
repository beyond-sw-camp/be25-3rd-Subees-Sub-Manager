<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import AppAsset from '@/components/ui/AppAsset.vue'
import { usePaymentCardsStore } from '@/stores/paymentCards'

const props = defineProps({
  item: { type: Object, default: null },
})

const emit = defineEmits(['save', 'delete', 'toggle-status'])

const isEditing = ref(false)
const paymentCardsStore = usePaymentCardsStore()
const { cardOptions } = storeToRefs(paymentCardsStore)

const editForm = reactive({
  subscriptionId: null,
  categoryName: '',
  subscriptionName: '',
  paymentAmount: 0,
  billingCycle: 'MONTHLY',
  paymentCardName: '',
  paymentStartDate: '',
  nextPaymentDate: '',
  note: '',
  status: 'ACTIVE',
})

const syncForm = (item) => {
  Object.assign(editForm, {
    subscriptionId: item?.subscriptionId ?? null,
    categoryName: item?.categoryName ?? '',
    subscriptionName: item?.subscriptionName ?? '',
    paymentAmount: item?.paymentAmount ?? 0,
    billingCycle: item?.billingCycle ?? 'MONTHLY',
    paymentCardName: item?.paymentCardName ?? '',
    paymentStartDate: item?.paymentStartDate ?? '',
    nextPaymentDate: item?.nextPaymentDate ?? '',
    note: item?.note ?? '',
    status: item?.status ?? 'ACTIVE',
  })
}

watch(
  () => props.item,
  (item) => {
    syncForm(item)
    isEditing.value = false
  },
  { immediate: true }
)

const formatCurrency = (value) =>
  `${new Intl.NumberFormat('ko-KR').format(Number(value || 0))}원`

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(`${dateString}T00:00:00`)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const cycleLabel = computed(() =>
  editForm.billingCycle === 'YEARLY' ? '매년 결제' : '매월 결제'
)

const save = () => {
  emit('save', {
    ...editForm,
    paymentAmount: Number(editForm.paymentAmount || 0),
  })
  isEditing.value = false
}

const cancelEdit = () => {
  syncForm(props.item)
  isEditing.value = false
}

const toggleStatus = () => {
  if (!props.item?.subscriptionId) return

  emit('toggle-status', {
    subscriptionId: props.item.subscriptionId,
    status: props.item.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE',
  })
}
</script>

<template>
  <section class="shell-card p-6 md:p-7">
    <template v-if="item">
      <div class="flex items-start gap-4 border-b border-[rgba(46,34,10,0.08)] pb-5">
        <div class="grid h-16 w-16 place-items-center rounded-[22px] border border-[rgba(46,34,10,0.06)] bg-white">
          <AppAsset
            type="service"
            :value="item.subscriptionName"
            secondary-type="category"
            :secondary-value="item.categoryName"
            fallback="sparkles"
            :size="22"
            wrapper-class="inline-flex items-center justify-center"
            image-class="h-10 w-10 object-contain"
            icon-class="text-[#8A6A00]"
          />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-sm font-semibold text-[#8A6A00]">구독 상세</p>
            <span
              class="rounded-full px-3 py-1 text-[11px] font-extrabold ring-1"
              :class="item.status === 'ACTIVE'
                ? 'bg-[rgba(242,210,33,0.16)] text-[#8A6A00] ring-[rgba(242,210,33,0.2)]'
                : 'bg-[rgba(46,34,10,0.06)] text-neutral-500 ring-[rgba(46,34,10,0.08)]'"
            >
              {{ item.status === 'ACTIVE' ? '활성' : '일시정지' }}
            </span>
          </div>

          <h2 class="mt-2 text-[24px] font-bold tracking-[-0.03em] text-neutral-900">
            {{ item.subscriptionName }}
          </h2>

          <p class="mt-2 text-sm leading-6 text-neutral-500">
            항목 상세, 수정, 삭제, 상태 전환까지 같은 패널에서 처리할 수 있습니다.
          </p>
        </div>
      </div>

      <div v-if="!isEditing" class="mt-5 grid gap-4">
        <div class="rounded-[22px] border border-[rgba(46,34,10,0.08)] bg-white px-5 py-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">구독 상태</p>
              <p class="mt-2 text-base font-bold text-neutral-900">
                {{ item.status === 'ACTIVE' ? '현재 활성 상태' : '일시정지 상태' }}
              </p>
            </div>
            <button
              type="button"
              class="secondary-button !min-h-11 !px-4"
              @click="toggleStatus"
            >
              {{ item.status === 'ACTIVE' ? '일시정지' : '다시 활성화' }}
            </button>
          </div>
          <p class="mt-2 text-sm leading-6 text-neutral-500">
            정기 결제를 잠시 멈추거나 다시 활성화해 목록과 캘린더 노출 상태를 바로 조정할 수 있습니다.
          </p>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <div class="rounded-[22px] border border-[rgba(46,34,10,0.08)] bg-brand-50 px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">카테고리명</p>
            <div class="mt-2 flex items-center gap-3">
              <AppAsset
                type="category"
                :value="item.categoryName"
                fallback="grid"
                :size="18"
                wrapper-class="inline-flex items-center justify-center"
                image-class="h-8 w-8 rounded-lg bg-white p-1 ring-1 ring-[rgba(46,34,10,0.08)] object-contain"
                icon-class="text-[#8A6A00]"
              />
              <p class="text-base font-bold text-neutral-900">{{ item.categoryName }}</p>
            </div>
          </div>

          <div class="rounded-[22px] border border-[rgba(46,34,10,0.08)] bg-brand-50 px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">결제 금액</p>
            <p class="mt-2 text-base font-bold text-neutral-900">{{ formatCurrency(item.paymentAmount) }}</p>
          </div>

          <div class="rounded-[22px] border border-[rgba(46,34,10,0.08)] bg-brand-50 px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">결제 카드</p>
            <div class="mt-2 flex items-center gap-3">
              <AppAsset
                type="card"
                :value="item.paymentCardName"
                fallback="creditcard"
                :size="18"
                wrapper-class="inline-flex items-center justify-center"
                image-class="h-8 w-8 rounded-lg bg-white p-1 ring-1 ring-[rgba(46,34,10,0.08)] object-contain"
                icon-class="text-[#8A6A00]"
                badge-class="inline-flex min-w-[52px] items-center justify-center rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-[-0.02em]"
              />
              <p class="text-base font-bold text-neutral-900">{{ item.paymentCardName }}</p>
            </div>
          </div>

          <div class="rounded-[22px] border border-[rgba(46,34,10,0.08)] bg-brand-50 px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">결제 주기</p>
            <p class="mt-2 text-base font-bold text-neutral-900">{{ cycleLabel }}</p>
          </div>

          <div class="rounded-[22px] border border-[rgba(46,34,10,0.08)] bg-brand-50 px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">등록일</p>
            <p class="mt-2 text-base font-bold text-neutral-900">{{ formatDate(item.registeredAt || item.paymentStartDate) }}</p>
          </div>

          <div class="rounded-[22px] border border-[rgba(46,34,10,0.08)] bg-brand-50 px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">다음 결제일</p>
            <p class="mt-2 text-base font-bold text-neutral-900">{{ formatDate(item.nextPaymentDate) }}</p>
          </div>
        </div>

        <div class="rounded-[22px] border border-[rgba(46,34,10,0.08)] bg-white px-5 py-4">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">메모</p>
          <p class="mt-2 text-sm leading-7 text-neutral-700">
            {{ item.note || '입력된 메모가 없습니다.' }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3 pt-1">
          <button type="button" class="primary-button" @click="isEditing = true">수정</button>
          <button type="button" class="secondary-button" @click="toggleStatus">
            {{ item.status === 'ACTIVE' ? '일시정지' : '다시 활성화' }}
          </button>
          <button
            type="button"
            class="secondary-button text-danger hover:bg-[rgba(186,107,82,0.08)]"
            @click="emit('delete', item.subscriptionId)"
          >
            삭제
          </button>
        </div>
      </div>

      <div v-else class="mt-5 grid gap-4">
        <div>
          <label class="form-label">구독 항목명</label>
          <input v-model="editForm.subscriptionName" type="text" class="form-input mt-2" />
        </div>

        <div>
          <label class="form-label">카테고리명</label>
          <input v-model="editForm.categoryName" type="text" class="form-input mt-2" />
        </div>

        <div>
          <label class="form-label">결제 금액</label>
          <input v-model="editForm.paymentAmount" type="number" min="0" class="form-input mt-2" />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="form-label">결제 카드</label>
            <select v-model="editForm.paymentCardName" class="form-input mt-2">
              <option v-for="name in cardOptions" :key="name" :value="name">{{ name }}</option>
            </select>
            <RouterLink to="/payment-cards" class="mt-2 inline-flex text-sm font-semibold text-[#8A6A00]">
              등록 카드 관리하기
            </RouterLink>
          </div>

          <div>
            <label class="form-label">결제 주기</label>
            <select v-model="editForm.billingCycle" class="form-input mt-2">
              <option value="MONTHLY">매월 결제</option>
              <option value="YEARLY">매년 결제</option>
            </select>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="form-label">결제 시작일</label>
            <input v-model="editForm.paymentStartDate" type="date" class="form-input mt-2" />
          </div>

          <div>
            <label class="form-label">다음 결제일</label>
            <input v-model="editForm.nextPaymentDate" type="date" class="form-input mt-2" />
          </div>
        </div>

        <div class="rounded-[22px] border border-[rgba(46,34,10,0.08)] bg-brand-50 px-5 py-4 text-sm text-neutral-700">
          <p class="font-semibold text-neutral-900">현재 선택한 결제 주기</p>
          <p class="mt-2">{{ cycleLabel }}</p>
        </div>

        <div>
          <label class="form-label">메모</label>
          <textarea
            v-model="editForm.note"
            rows="5"
            class="form-input mt-2 min-h-[140px] resize-none py-4"
          ></textarea>
        </div>

        <div class="flex flex-wrap gap-3 pt-1">
          <button type="button" class="primary-button" @click="save">저장</button>
          <button type="button" class="secondary-button" @click="cancelEdit">취소</button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="flex min-h-[480px] items-center justify-center rounded-[24px] border border-dashed border-neutral-300 bg-brand-50 px-6 text-center">
        <div>
          <p class="text-base font-semibold text-neutral-900">선택된 구독이 없습니다</p>
          <p class="mt-2 text-sm leading-6 text-neutral-500">
            왼쪽 목록에서 구독 항목을 선택하면 상세 정보가 열립니다.
          </p>
        </div>
      </div>
    </template>
  </section>
</template>