<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import { createQrMatrix } from '@/core/qr/matrix'
import { EAPMethods, EAPPhase2Methods, getQrCodeText, type EAPMethod, type EAPPhase2Method, type WifiEncryption } from '@/core/qr/wifi'
import { useQrCanvas } from '@/composables/use-qr-canvas'
import { useHistoryStore } from '@/stores/history'
import { useDebounceFn } from '@/composables/use-debounce'
import { usePremiumQuota } from '@/composables/use-premium-quota'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'wifi-qr'
useToolShare(TOOL_ID)
const history = useHistoryStore()
const instance = getCurrentInstance()
const { drawPreview, exportPng, saveToAlbum } = useQrCanvas()

const ENCRYPTIONS: { label: string; value: WifiEncryption }[] = [
  { label: '无密码', value: 'nopass' },
  { label: 'WPA/WPA2', value: 'WPA' },
  { label: 'WEP', value: 'WEP' },
  { label: 'WPA2-EAP', value: 'WPA2-EAP' },
]

const ssid = ref('')
const password = ref('')
const encryption = ref<WifiEncryption>('WPA')
const isHiddenSSID = ref(false)
const eapMethod = ref<EAPMethod | ''>('')
const eapAnonymous = ref(false)
const eapIdentity = ref('')
const eapPhase2Method = ref<EAPPhase2Method>('None')
const batchInput = ref('')

const encryptionIndex = computed(() => ENCRYPTIONS.findIndex(item => item.value === encryption.value))
const eapMethodIndex = computed(() => Math.max(0, EAPMethods.indexOf(eapMethod.value as EAPMethod)))
const eapPhase2Index = computed(() => EAPPhase2Methods.indexOf(eapPhase2Method.value))

const payload = computed(() => getQrCodeText({
  ssid: ssid.value,
  password: password.value,
  encryption: encryption.value,
  eapMethod: eapMethod.value || undefined,
  isHiddenSSID: isHiddenSSID.value,
  eapAnonymous: eapAnonymous.value,
  eapIdentity: eapIdentity.value,
  eapPhase2Method: eapPhase2Method.value,
}))
const matrix = computed(() => (payload.value ? createQrMatrix(payload.value) : null))

const { left, requestUse } = usePremiumQuota('wifi-batch')
const batchLabel = computed(() =>
  left.value.free > 0 ? '批量生成并保存（今日免费 1 次）' : '批量生成并保存（看广告解锁）',
)

async function render() {
  if (!matrix.value) {
    return
  }
  await nextTick()
  try {
    await drawPreview('wifi-qr-preview', matrix.value, instance?.proxy)
  }
  catch {
    // canvas 节点尚未就绪时忽略，onReady 会补画
  }
}
watch(matrix, render)
onReady(render)

async function saveStandard() {
  if (!matrix.value) {
    return
  }
  const filePath = await exportPng(matrix.value, { size: 540, watermark: true })
  await saveToAlbum(filePath)
}

async function saveBatch() {
  const lines = batchInput.value.split('\n').map(line => line.trim()).filter(Boolean)
  const payloads = lines
    .map((line) => {
      const [lineSsid, linePassword = ''] = line.split(',')
      return getQrCodeText({
        ssid: (lineSsid ?? '').trim(),
        password: linePassword.trim(),
        encryption: 'WPA',
      })
    })
    .filter((text): text is string => !!text)

  if (!payloads.length) {
    uni.showToast({ title: '每行格式：SSID,密码', icon: 'none' })
    return
  }
  const source = await requestUse()
  if (source === 'none') {
    uni.showToast({ title: '未解锁，明天再试', icon: 'none' })
    return
  }
  let saved = 0
  for (const text of payloads) {
    const batchMatrix = createQrMatrix(text)
    if (!batchMatrix) {
      continue
    }
    const filePath = await exportPng(batchMatrix, { size: 540, watermark: true })
    if (await saveToAlbum(filePath)) {
      saved++
    }
  }
  uni.showToast({ title: `已保存 ${saved} 张`, icon: 'none' })
}

const saveSnapshot = useDebounceFn(() => {
  history.saveSnapshot(TOOL_ID, {
    ssid: ssid.value,
    password: password.value,
    encryption: encryption.value,
    isHiddenSSID: isHiddenSSID.value,
    eapMethod: eapMethod.value,
    eapAnonymous: eapAnonymous.value,
    eapIdentity: eapIdentity.value,
    eapPhase2Method: eapPhase2Method.value,
  })
}, 400)
watch([ssid, password, encryption, isHiddenSSID, eapMethod, eapAnonymous, eapIdentity, eapPhase2Method], saveSnapshot)

onLoad((options) => {
  history.record(TOOL_ID)
  if (options?.restore === '1') {
    const s = history.getSnapshot(TOOL_ID)
    if (s) {
      ssid.value = String(s.ssid ?? '')
      password.value = String(s.password ?? '')
      encryption.value = (ENCRYPTIONS.some(item => item.value === s.encryption) ? s.encryption : 'WPA') as WifiEncryption
      isHiddenSSID.value = Boolean(s.isHiddenSSID ?? false)
      eapMethod.value = (EAPMethods.includes(s.eapMethod as EAPMethod) ? s.eapMethod : '') as EAPMethod | ''
      eapAnonymous.value = Boolean(s.eapAnonymous ?? false)
      eapIdentity.value = String(s.eapIdentity ?? '')
      eapPhase2Method.value = (EAPPhase2Methods.includes(s.eapPhase2Method as EAPPhase2Method) ? s.eapPhase2Method : 'None') as EAPPhase2Method
    }
  }
})
</script>

<template>
  <tool-page>
    <view class="card">
      <view class="card-title">WiFi 信息</view>
      <view class="field-label">加密方式</view>
      <picker
        mode="selector"
        :range="ENCRYPTIONS.map(item => item.label)"
        :value="encryptionIndex"
        @change="encryption = ENCRYPTIONS[Number($event.detail.value)].value"
      >
        <view class="picker-box">{{ ENCRYPTIONS[encryptionIndex].label }} ▾</view>
      </picker>

      <view class="field-label">名称（SSID）</view>
      <view class="row">
        <input v-model="ssid" class="input" placeholder="如 MyHomeWiFi">
        <view class="switch-item">
          <text>隐藏</text>
          <switch :checked="isHiddenSSID" color="#21B573" @change="isHiddenSSID = ($event as any).detail.value" />
        </view>
      </view>

      <template v-if="encryption !== 'nopass'">
        <view class="field-label">密码</view>
        <input v-model="password" class="input" password placeholder="WiFi 密码">
      </template>

      <template v-if="encryption === 'WPA2-EAP'">
        <view class="field-label">EAP 方法</view>
        <picker
          mode="selector"
          :range="[...EAPMethods]"
          :value="eapMethodIndex"
          @change="eapMethod = EAPMethods[Number($event.detail.value)]"
        >
          <view class="picker-box">{{ eapMethod || '请选择' }} ▾</view>
        </picker>
        <view class="field-label">身份（Identity）</view>
        <view class="row">
          <input v-model="eapIdentity" class="input" placeholder="EAP 身份">
          <view class="switch-item">
            <text>匿名</text>
            <switch :checked="eapAnonymous" color="#21B573" @change="eapAnonymous = ($event as any).detail.value" />
          </view>
        </view>
        <view class="field-label">Phase 2 方法</view>
        <picker
          mode="selector"
          :range="[...EAPPhase2Methods]"
          :value="eapPhase2Index"
          @change="eapPhase2Method = EAPPhase2Methods[Number($event.detail.value)]"
        >
          <view class="picker-box">{{ eapPhase2Method }} ▾</view>
        </picker>
      </template>
    </view>

    <view class="card preview-card">
      <view class="card-title">扫码连 WiFi</view>
      <view class="preview-wrap">
        <canvas id="wifi-qr-preview" type="2d" class="preview" />
        <view v-if="!matrix" class="preview-empty">填写 WiFi 信息后生成</view>
      </view>
      <view class="row actions">
        <button class="btn btn-plain" :disabled="!matrix" @click="saveStandard">
          保存二维码（带水印）
        </button>
      </view>
      <view class="muted hint">打印贴墙或分享给客人，扫码即连，无需口述密码。</view>
    </view>

    <view class="card">
      <view class="card-title">增值功能：批量生成</view>
      <textarea
        v-model="batchInput"
        class="textarea"
        placeholder="每行一个网络，格式：SSID,密码&#10;如：&#10;HomeWiFi,password1&#10;ShopWiFi,password2"
      />
      <view class="row actions">
        <button class="btn" @click="saveBatch">
          {{ batchLabel }}
        </button>
      </view>
      <view class="muted hint">单张生成与保存永久免费；批量为可选增值项，每日免费 1 次。</view>
    </view>
  </tool-page>
</template>

<style lang="scss" scoped>
.field-label {
  margin-top: 20rpx;
}

.picker-box {
  background-color: var(--bg);
  border: 1rpx solid var(--border);
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
  font-size: 26rpx;
}

.switch-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: var(--text-2);
}

.preview-card {
  display: flex;
  flex-direction: column;
}

.preview-wrap {
  position: relative;
  width: 500rpx;
  height: 500rpx;
  margin: 0 auto 24rpx;
}

.preview {
  width: 500rpx;
  height: 500rpx;
}

.preview-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
  font-size: 26rpx;
  background-color: var(--bg);
  border-radius: 12rpx;
}

.actions {
  margin-top: 16rpx;
}

.hint {
  margin-top: 16rpx;
  line-height: 1.6;
}
</style>