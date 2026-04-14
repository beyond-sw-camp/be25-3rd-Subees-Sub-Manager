<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppShell from '@/components/layout/AppShell.vue'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionFormStore } from '@/stores/subscriptionForm'
import { usePaymentCardsStore } from '@/stores/paymentCards'
import { categoryImage, serviceImage } from '@/utils/imageAssets'
import AppAsset from '@/components/ui/AppAsset.vue'

const authStore = useAuthStore()
const router = useRouter()
const subscriptionFormStore = useSubscriptionFormStore()
const paymentCardsStore = usePaymentCardsStore()
const { currentStep, subscriptionForm, resolvedSubscriptionName, requestPayload } = storeToRefs(subscriptionFormStore)
const { cardOptions } = storeToRefs(paymentCardsStore)

const showCardPicker = ref(false)

const steps = [1, 2, 3, 4]

const categoryCatalog = [
  {
    categoryName: 'OTT',
    label: 'OTT',
    description: '영상 스트리밍 서비스',
    preview: 'N',
    image: categoryImage('OTT'),
    services: [
      { subscriptionName: '넷플릭스', paymentAmount: 17000, image: serviceImage('넷플릭스') },
      { subscriptionName: '티빙', paymentAmount: 13900, image: serviceImage('티빙') },
      { subscriptionName: '디즈니+', paymentAmount: 9900, image: serviceImage('디즈니+') },
      { subscriptionName: '웨이브', paymentAmount: 10900, image: serviceImage('웨이브') },
    ],
  },
  {
    categoryName: 'Music',
    label: '음악',
    description: '음악 스트리밍 서비스',
    preview: 'M',
    image: categoryImage('Music'),
    services: [
      { subscriptionName: 'Spotify', paymentAmount: 10900, image: serviceImage('Spotify') },
      { subscriptionName: '멜론', paymentAmount: 10900, image: serviceImage('멜론') },
      { subscriptionName: 'Apple Music', paymentAmount: 11900, image: serviceImage('Apple Music') },
      { subscriptionName: '지니', paymentAmount: 8400, image: serviceImage('지니') },
    ],
  },
  {
    categoryName: 'AI',
    label: 'AI',
    description: '생산성·LLM 기반 서비스',
    preview: 'A',
    image: categoryImage('AI'),
    services: [
      { subscriptionName: 'ChatGPT', paymentAmount: 29000, image: serviceImage('ChatGPT') },
      { subscriptionName: 'Gemini', paymentAmount: 29000, image: serviceImage('Gemini') },
      { subscriptionName: 'Claude', paymentAmount: 29000, image: serviceImage('Claude') },
      { subscriptionName: '직접 입력', paymentAmount: 0, image: null },
    ],
  },
  {
    categoryName: 'Cloud',
    label: '클라우드',
    description: '클라우드·협업 서비스',
    preview: 'C',
    image: categoryImage('Cloud'),
    services: [
      { subscriptionName: '카카오 톡서랍', paymentAmount: 3900, image: serviceImage('카카오 톡서랍') },
      { subscriptionName: 'iCloud+', paymentAmount: 4400, image: serviceImage('iCloud+') },
      { subscriptionName: '직접 입력', paymentAmount: 0, image: null },
    ],
  },
  {
    categoryName: 'Etc',
    label: '그 외',
    description: '멤버십·생활형 서비스',
    preview: 'E',
    image: categoryImage('Etc'),
    services: [
      { subscriptionName: '쿠팡와우', paymentAmount: 7890, image: serviceImage('쿠팡와우') },
      { subscriptionName: '배민클럽', paymentAmount: 3990, image: serviceImage('배민클럽') },
      { subscriptionName: '이모티콘 플러스', paymentAmount: 4900, image: serviceImage('이모티콘 플러스') },
      { subscriptionName: '직접 입력', paymentAmount: 0, image: null },
    ],
  },
]

const billingCycles = [
  { label: '매월 결제', value: 'MONTHLY' },
  { label: '매년 결제', value: 'YEARLY' },
]

const progressPercent = computed(() => `${(currentStep.value / 4) * 100}%`)

const prompt = computed(() => {
  if (currentStep.value === 1) return '어떤 카테고리의 구독을 추가할까요?'
  if (currentStep.value === 2) return '어떤 서비스를 구독할지 선택하세요.'
  if (currentStep.value === 3) return '결제 정보를 입력해주세요'
  return '마지막으로 내용을 확인할게요.'
})

const stepGuide = computed(() => {
  if (currentStep.value === 1) return 'OTT, 음악, AI처럼 먼저 큰 종류를 고르면 다음 단계 서비스 목록이 바로 정리됩니다.'
  if (currentStep.value === 2) return '자주 쓰는 서비스가 보이면 바로 선택하고, 없으면 직접 입력으로 넘어가면 됩니다.'
  if (currentStep.value === 3) return '금액, 주기, 카드, 시작일만 채우면 등록에 필요한 핵심 정보는 끝납니다.'
  return '마지막 확인에서 이름·금액·카드·결제일만 다시 보고 저장하면 됩니다.'
})

const selectedCategory = computed(() => {
  return categoryCatalog.find((item) => item.categoryName === subscriptionForm.value.categoryName) ?? categoryCatalog[0]
})

const selectedCategoryLabel = computed(() => selectedCategory.value.label)
const customServiceMode = computed(() => subscriptionForm.value.subscriptionName === '직접 입력')
const selectedServiceLabel = computed(() => resolvedSubscriptionName.value || '직접 입력 서비스')
const serviceInitial = computed(() => selectedServiceLabel.value.trim().slice(0, 1).toUpperCase() || '?')

const serviceOptions = computed(() => {
  const base = selectedCategory.value.services
  return base.some((service) => service.subscriptionName === '직접 입력')
    ? base
    : [...base, { subscriptionName: '직접 입력', paymentAmount: 0 }]
})

const isStepValid = computed(() => {
  if (currentStep.value === 1) return Boolean(subscriptionForm.value.categoryName)
  if (currentStep.value === 2) {
    if (customServiceMode.value) return subscriptionForm.value.customSubscriptionName.trim().length > 0
    return Boolean(subscriptionForm.value.subscriptionName)
  }
  if (currentStep.value === 3) {
    return Boolean(
      subscriptionForm.value.paymentAmount &&
      subscriptionForm.value.billingCycle &&
      subscriptionForm.value.paymentStartDate &&
      ((subscriptionForm.value.paymentCardName !== '직접 입력' && subscriptionForm.value.paymentCardName) ||
        (subscriptionForm.value.paymentCardName === '직접 입력' && subscriptionForm.value.customPaymentCardName.trim())),
    )
  }
  return true
})

const formatCurrency = (value) => `${new Intl.NumberFormat('ko-KR').format(Number(value || 0))}원`

const selectCategory = (category) => {
  const defaultService = category.services[0]?.subscriptionName ?? '직접 입력'
  const defaultAmount = category.services[0]?.paymentAmount ?? 0
  subscriptionFormStore.setCategory(category.categoryName, defaultService, defaultAmount)
}

const selectService = (service) => {
  subscriptionFormStore.setSubscription(service.subscriptionName, service.paymentAmount)
}

const pickCard = (card) => {
  subscriptionFormStore.setPaymentCardName(card)
  showCardPicker.value = false
}

const handleIconFileChange = (event) => {
  const file = event.target.files?.[0]
  subscriptionFormStore.setIconFileName(file?.name ?? '')
}

const clearIconFile = () => {
  subscriptionFormStore.setIconFileName('')
}

const goNext = () => {
  if (!isStepValid.value) return
  subscriptionFormStore.nextStep()
}

const submitDraft = () => {
  window.alert('구독이 등록되었습니다.')
  router.push('/subscriptions')
}

watch(
  () => subscriptionForm.value.categoryName,
  (nextCategory) => {
    const matchedCategory = categoryCatalog.find((item) => item.categoryName === nextCategory)
    if (!matchedCategory) return

    const availableServices = matchedCategory.services.map((item) => item.subscriptionName)
    if (!availableServices.includes(subscriptionForm.value.subscriptionName)) {
      const fallback = matchedCategory.services[0]
      if (fallback) {
        subscriptionFormStore.setSubscription(fallback.subscriptionName, fallback.paymentAmount)
      }
    }
  },
)
</script>

<template>
  <AppShell title="hidden">
    <section class="wizard mx-auto w-full max-w-[1500px]">
      <div class="mb-5 rounded-card border border-[rgba(46,34,10,0.08)] bg-[rgba(255,253,247,0.92)] px-7 py-6 shadow-soft">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-base font-bold text-neutral-900">{{ authStore.nickname || '사용자' }}님, 구독·결제·캘린더를 한 곳에 정리했어요!</p>
            <p class="mt-1 body-copy">카테고리 선택부터 결제 정보 입력까지 순서대로 등록할 수 있습니다.</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <RouterLink to="/calendar" class="chip-button">캘린더</RouterLink>
            <RouterLink to="/subscriptions/new" class="chip-button is-selected">구독추가</RouterLink>
            <RouterLink to="/dashboard" class="chip-button">대시보드</RouterLink>
          </div>
        </div>
      </div>

      <div class="wizard__top">
        <div class="wizard__step">{{ currentStep }}/4</div>
        <div class="utility-gauge"><span :style="{ width: progressPercent }"></span></div>
      </div>

      <div class="wizard__body shell-card">
        <div class="wizard__heading">{{ prompt }}</div>
        <p class="page-description mt-2 !max-w-3xl">자주 쓰는 항목부터 차례대로 선택하면 빠르게 등록할 수 있어요.</p>
        <div class="guide-card mt-4 !rounded-[24px] !p-4">
          <p class="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-300">등록 안내</p>
          <p class="mt-2 text-sm font-bold text-neutral-900">{{ stepGuide }}</p>
        </div>

        <div v-if="currentStep === 1" class="wizard__block">
          <div class="wizard__selection">
            <div class="wizard__selection-label">현재 선택한 종류</div>
            <div class="wizard__selection-value">{{ selectedCategoryLabel }}</div>
            <div class="text-sm text-neutral-500">선택한 카테고리는 다음 단계 서비스 목록에 바로 반영돼요.</div>
          </div>

          <div class="wizard__tile-grid">
            <button
              v-for="category in categoryCatalog"
              :key="category.categoryName"
              type="button"
              class="wizard__tile"
              :class="{ 'wizard__tile--active': subscriptionForm.categoryName === category.categoryName }"
              @click="selectCategory(category)"
            >
              <div v-if="subscriptionForm.categoryName === category.categoryName" class="wizard__tile-check">선택됨</div>
              <div class="wizard__tile-image">
                <AppAsset
                type="category"
                :value="category.label"
                fallback="grid"
                :size="18"
                wrapper-class="inline-flex items-center justify-center"
                image-class="h-24 w-24 object-contain lg:h-28 lg:w-28 xl:h-32 xl:w-32"
                icon-class="text-[#8A6A00]"
              />
              </div>
              <div class="wizard__tile-title">{{ category.label }}</div>
              <div class="text-sm text-neutral-500">{{ category.description }}</div>
            </button>
          </div>
        </div>

        <div v-else-if="currentStep === 2" class="wizard__block">
          <div class="wizard__selection">
            <div class="wizard__selection-label">현재 선택한 서비스</div>
            <div class="wizard__selection-value">{{ selectedServiceLabel }}</div>
            <div class="text-sm text-neutral-500">로고가 있는 서비스는 아이콘 이미지를 함께 보여주고, 직접 입력 항목만 fallback으로 처리합니다.</div>
          </div>

          <div class="wizard__chip-grid">
            <button
              v-for="service in serviceOptions"
              :key="service.subscriptionName"
              type="button"
              class="wizard__service-chip"
              :class="{ 'wizard__service-chip--active': subscriptionForm.subscriptionName === service.subscriptionName }"
              @click="selectService(service)"
            >
              <span class="wizard__service-chip-icon">
                <AppAsset
                type="service"
                :value="service.subscriptionName"
                fallback="sparkles"
                :size="16"
                wrapper-class="inline-flex items-center justify-center"
                image-class="h-11 w-11 object-contain"
                icon-class="text-[#8A6A00]"
              />
              </span>
              <span>{{ service.subscriptionName === '직접 입력' ? '직접입력' : service.subscriptionName }}</span>
            </button>
          </div>

          <div v-if="customServiceMode" class="field-block">
            <label class="form-label">서비스명 직접입력</label>
            <input
              v-model="subscriptionForm.customSubscriptionName"
              type="text"
              class="form-input mt-2"
              placeholder="예: Adobe Creative Cloud"
            />
          </div>

          <div class="wizard__icon-box">
            <div class="wizard__icon-preview">
              <AppAsset
              type="service"
              :value="selectedServiceLabel"
              secondary-type="category"
              :secondary-value="subscriptionForm.categoryName"
              fallback="sparkles"
              :size="20"
              wrapper-class="inline-flex items-center justify-center"
              image-class="h-20 w-20 object-contain"
              icon-class="text-[#8A6A00]"
            />
            </div>
            <div>
              <div class="text-sm font-extrabold text-neutral-900">서비스 아이콘</div>
              <div class="mt-1 text-sm leading-6 text-neutral-500">기본 로고가 있으면 먼저 보여주고, 원하는 이미지를 올려 교체할 수도 있어요.</div>
              <div class="mt-2 text-xs font-semibold text-neutral-500">{{ subscriptionForm.serviceIconFileName || '기본 아이콘 사용 중' }}</div>
            </div>
            <div class="wizard__icon-actions">
              <label class="secondary-button !min-h-11 cursor-pointer !px-4">
                업로드
                <input type="file" class="hidden" accept="image/*" @change="handleIconFileChange" />
              </label>
              <button type="button" class="secondary-button !min-h-11 !px-4" :disabled="!subscriptionForm.serviceIconFileName" @click="clearIconFile">삭제</button>
            </div>
          </div>
        </div>

        <div v-else-if="currentStep === 3" class="wizard__block">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="form-label">결제 금액</label>
              <input v-model="subscriptionForm.paymentAmount" type="number" min="0" class="form-input mt-2" placeholder="예: 17000" />
            </div>

            <div>
              <label class="form-label">결제 주기</label>
              <div class="wizard__subline mt-2">
                <button
                  v-for="cycle in billingCycles"
                  :key="cycle.value"
                  type="button"
                  class="chip-button"
                  :class="{ 'is-selected': subscriptionForm.billingCycle === cycle.value }"
                  @click="subscriptionFormStore.setBillingCycle(cycle.value)"
                >
                  {{ cycle.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <div class="flex items-center justify-between gap-3">
                <label class="form-label">결제 카드</label>
                <div class="flex items-center gap-3">
                  <RouterLink to="/payment-cards" class="wizard__pick-link">카드 관리</RouterLink>
                  <button type="button" class="wizard__pick-link" @click="showCardPicker = !showCardPicker">이미지로 선택</button>
                </div>
              </div>
              <div class="wizard__card-input mt-2">
                <div class="wizard__card-thumb">
                  <AppAsset
                  type="card"
                  :value="subscriptionForm.paymentCardName === '직접 입력' ? subscriptionForm.customPaymentCardName : subscriptionForm.paymentCardName"
                  fallback="creditcard"
                  :size="18"
                  wrapper-class="inline-flex items-center justify-center"
                  image-class="h-12 w-12 object-contain"
                  icon-class="text-[#8A6A00]"
                  badge-class="inline-flex min-w-[44px] items-center justify-center rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-[-0.02em]"
                />
                </div>
                <input
                  v-if="subscriptionForm.paymentCardName !== '직접 입력'"
                  :value="subscriptionForm.paymentCardName"
                  class="form-input wizard__card-field"
                  placeholder="예: 현대카드"
                  readonly
                />
                <input
                  v-else
                  v-model="subscriptionForm.customPaymentCardName"
                  class="form-input wizard__card-field"
                  placeholder="예: 카카오뱅크 체크카드"
                />
              </div>
            </div>

            <div>
              <label class="form-label">결제 시작일</label>
              <input v-model="subscriptionForm.paymentStartDate" type="date" class="form-input mt-2" />
            </div>
          </div>

          <div v-if="showCardPicker" class="picker-grid mt-4">
            <button
              v-for="card in [...cardOptions, '직접 입력']"
              :key="card"
              type="button"
              class="picker-card"
              :class="{ 'picker-card--active': subscriptionForm.paymentCardName === card }"
              @click="pickCard(card)"
            >
              <div class="picker-card__img">
                <AppAsset
                type="card"
                :value="card"
                fallback="creditcard"
                :size="16"
                wrapper-class="inline-flex items-center justify-center"
                image-class="h-12 w-12 object-contain"
                icon-class="text-[#8A6A00]"
                badge-class="inline-flex min-w-[48px] items-center justify-center rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-[-0.02em]"
              />
              </div>
              <div class="picker-card__label">{{ card }}</div>
            </button>
          </div>
        </div>

        <div v-else class="wizard__confirm">
          <div class="wizard__review">
            <div class="wizard__review-top">
              <div class="wizard__review-icon">
                <AppAsset
                type="service"
                :value="selectedServiceLabel"
                secondary-type="category"
                :secondary-value="subscriptionForm.categoryName"
                fallback="sparkles"
                :size="20"
                wrapper-class="inline-flex items-center justify-center"
                image-class="h-20 w-20 object-contain"
                icon-class="text-[#8A6A00]"
              />
              </div>
              <div>
                <div class="wizard__review-name">{{ selectedServiceLabel }}</div>
                <div class="text-sm text-neutral-500">{{ selectedCategoryLabel }}</div>
              </div>
            </div>
            <div class="wizard__row"><span>금액</span><strong>{{ formatCurrency(subscriptionForm.paymentAmount) }}</strong></div>
            <div class="wizard__row"><span>주기</span><strong>{{ subscriptionForm.billingCycle === 'YEARLY' ? '매년 결제' : '매월 결제' }}</strong></div>
            <div class="wizard__row"><span>결제일</span><strong>{{ subscriptionForm.paymentStartDate || '-' }}</strong></div>
            <div class="wizard__row"><span>카드</span><strong>{{ subscriptionForm.paymentCardName === '직접 입력' ? (subscriptionForm.customPaymentCardName || '직접 입력 예정') : (subscriptionForm.paymentCardName || '미등록') }}</strong></div>
          </div>

          <div>
            <label class="form-label">메모를 남길 수 있어요 (선택)</label>
            <textarea
              v-model="subscriptionForm.note"
              rows="4"
              class="form-input mt-2 min-h-[120px] resize-none py-4"
              placeholder="예: 가족과 공유 중, 학생 할인 확인 필요"
            ></textarea>
          </div>

          <div class="rounded-[20px] border border-[rgba(46,34,10,0.08)] bg-neutral-900 p-4 text-xs leading-6 text-white">
            <div class="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/60">API payload preview</div>
            <pre class="overflow-x-auto whitespace-pre-wrap break-all">{{ JSON.stringify(requestPayload, null, 2) }}</pre>
          </div>
        </div>

        <div class="wizard__actions">
          <button v-if="currentStep > 1" type="button" class="secondary-button !w-full" @click="subscriptionFormStore.prevStep()">이전</button>
          <button v-if="currentStep < 4" type="button" class="primary-button !w-full" :disabled="!isStepValid" @click="goNext">다음</button>
          <button v-else type="button" class="primary-button !w-full" @click="submitDraft">구독 추가하기</button>
        </div>
      </div>
    </section>
  </AppShell>
</template>

<style scoped>
.wizard__top {
  display: grid;
  gap: 14px;
  margin-bottom: 18px;
}

.wizard__step {
  color: #8a6a00;
  font-weight: 800;
}

.utility-gauge {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(46, 34, 10, 0.08);
}

.utility-gauge > span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #f2d221, #eed03b);
  transition: width 0.2s ease;
}

.wizard__body {
  padding: clamp(24px, 2.3vw, 34px);
}

.wizard__heading {
  font-size: clamp(28px, 4vw, 38px);
  font-weight: 900;
  line-height: 1.22;
  color: #1e180d;
}

.wizard__block,
.wizard__confirm {
  margin-top: 28px;
  display: grid;
  gap: 14px;
}

.wizard__selection,
.wizard__icon-box,
.wizard__review,
.wizard__card-input {
  border: 1px solid rgba(46, 34, 10, 0.08);
  border-radius: 22px;
  background: rgba(247, 241, 227, 0.78);
}

.wizard__selection {
  padding: 18px 20px;
  display: grid;
  gap: 4px;
  background: rgba(242, 210, 33, 0.12);
}

.wizard__selection-label {
  font-size: 12px;
  font-weight: 800;
  color: #61563d;
}

.wizard__selection-value {
  font-size: 22px;
  font-weight: 900;
  color: #1e180d;
}

.wizard__tile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
}

.wizard__tile {
  position: relative;
  padding: 20px;
  border: 1px solid rgba(46, 34, 10, 0.08);
  border-radius: 22px;
  background: rgba(255, 253, 247, 0.92);
  display: grid;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
}

.wizard__tile:hover,
.wizard__service-chip:hover,
.picker-card:hover {
  transform: translateY(-1px);
}

.wizard__tile--active {
  border-color: rgba(242, 210, 33, 0.34);
  background: rgba(242, 210, 33, 0.12);
  box-shadow: 0 0 0 3px rgba(242, 210, 33, 0.1);
}

.wizard__tile-check {
  position: absolute;
  right: 12px;
  top: 12px;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 900;
  background: #f2d221;
  color: #231a07;
}

.wizard__tile-image,
.wizard__service-chip-icon,
.wizard__icon-preview,
.wizard__review-icon,
.wizard__card-thumb,
.picker-card__img {
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: rgba(255, 253, 247, 0.92);
  border: 1px solid rgba(46, 34, 10, 0.08);
  color: #8a6a00;
  font-weight: 900;
}

.wizard__tile-image {
  height: 176px;
  font-size: 34px;
  background: linear-gradient(180deg, rgba(242,210,33,0.18), rgba(255,253,247,0.98));
}

.wizard__tile-title {
  font-size: 16px;
  font-weight: 900;
  color: #1e180d;
}

.wizard__chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.wizard__service-chip {
  border: 1px solid rgba(46, 34, 10, 0.08);
  background: rgba(255, 253, 247, 0.92);
  border-radius: 999px;
  min-height: 64px;
  padding: 0 20px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 800;
  transition: transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
}

.wizard__service-chip--active,
.picker-card--active {
  border-color: rgba(242, 210, 33, 0.34);
  background: rgba(242, 210, 33, 0.16);
  box-shadow: 0 0 0 3px rgba(242, 210, 33, 0.1);
}

.wizard__service-chip-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  font-size: 12px;
  background: linear-gradient(180deg, rgba(242,210,33,0.16), rgba(255,253,247,0.96));
}

.field-block {
  margin-top: 14px;
}

.wizard__icon-box {
  margin-top: 16px;
  padding: 16px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
}

.wizard__icon-preview,
.wizard__review-icon {
  width: 88px;
  height: 88px;
  border-radius: 20px;
  font-size: 18px;
}

.wizard__icon-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.wizard__subline {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.wizard__pick-link {
  border: 0;
  background: transparent;
  color: #8a6a00;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.wizard__card-input {
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.wizard__card-thumb {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  flex-shrink: 0;
}

.wizard__card-field {
  min-height: 44px;
  border: 0 !important;
  background: transparent !important;
  padding: 0 6px !important;
  box-shadow: none !important;
}

.wizard__review {
  padding: 18px;
  display: grid;
  gap: 14px;
}

.wizard__review-top {
  display: flex;
  gap: 12px;
  align-items: center;
}

.wizard__review-name {
  font-size: 18px;
  font-weight: 900;
  color: #1e180d;
}

.wizard__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #61563d;
}

.wizard__row strong {
  color: #1e180d;
}

.wizard__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 28px;
}

.wizard__actions > :only-child {
  grid-column: 1 / -1;
}

.picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.picker-card {
  border: 1px solid rgba(46, 34, 10, 0.08);
  background: rgba(255, 253, 247, 0.92);
  border-radius: 20px;
  padding: 12px;
  display: grid;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
}

.picker-card__img {
  height: 124px;
  font-size: 24px;
}

.picker-card__label {
  font-size: 13px;
  font-weight: 800;
  color: #1e180d;
}

@media (max-width: 1280px) {
  .wizard__icon-box {
    grid-template-columns: auto 1fr;
  }

  .wizard__icon-actions {
    grid-column: 1 / -1;
  }
}

@media (max-width: 1120px) {
  .wizard__actions {
    grid-template-columns: 1fr;
  }
}
</style>
