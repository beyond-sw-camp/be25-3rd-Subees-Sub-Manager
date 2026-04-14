<script setup>
defineProps({
 // modelValue: { type: String, default: '' },
  selectedSort: { type: String, default: 'latest' },
})

// const emit = defineEmits(['update:modelValue', 'select-sort'])
const emit = defineEmits(['select-sort'])


const sortOptions = [
  { label: '최신순', value: 'latest' },
  { label: '조회수순', value: 'views' },
  // { label: '스크랩순', value: 'scraps' },
]
</script>

<template>
      <div class="flex flex-wrap gap-2 justify-end">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          type="button"
          class="chip-button !min-h-[34px] !px-3.5 !text-[12px]"
          :class="{ 'is-selected': option.value === selectedSort }"
          @click="emit('select-sort', option.value)"
        >
          {{ option.label }}
        </button>
      </div>
</template>

<!-- <template>
  <section class="shell-card p-3.5">
    <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div class="w-full max-w-xl">
        <label class="form-label" for="community-search">검색</label>
        <div class="mt-2 flex gap-3">
          <input
            id="community-search"
            :value="modelValue"
            type="text"
            class="form-input !min-h-[46px]"
            placeholder="서비스명, 키워드, 작성자"
            @input="emit('update:modelValue', $event.target.value)"
          />
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          type="button"
          class="chip-button !min-h-[34px] !px-3.5 !text-[12px]"
          :class="{ 'is-selected': option.value === selectedSort }"
          @click="emit('select-sort', option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </section>
</template> -->


