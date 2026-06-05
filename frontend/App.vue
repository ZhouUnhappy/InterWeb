<template>
  <div id="app">
    <header>
      <h1>📝 进度跟踪</h1>
      <div class="header-actions">
        <input
          v-model="searchKeyword"
          @keyup.enter="applySearch"
          placeholder="搜索公司/产品（回车搜索）"
          class="search-input"
        />
        <button
          @click="toggleFilter('noResume')"
          :class="['btn-filter', 'wide', { active: activeFilter === 'noResume' }]"
        >
          <span class="filter-content">
            <span v-if="activeFilter === 'noResume'" class="filter-check">✓</span>
            <span>未创建简历</span>
          </span>
        </button>
        <button
          @click="toggleFilter('notSubmitted')"
          :class="['btn-filter', { active: activeFilter === 'notSubmitted' }]"
        >
          <span class="filter-content">
            <span v-if="activeFilter === 'notSubmitted'" class="filter-check">✓</span>
            <span>未投递</span>
          </span>
        </button>
        <button
          @click="toggleFilter('submittedNointerv')"
          :class="['btn-filter', { active: activeFilter === 'submittedNointerv' }]"
        >
          <span class="filter-content">
            <span v-if="activeFilter === 'submittedNointerv'" class="filter-check">✓</span>
            <span>已投递</span>
          </span>
        </button>
        <button
          @click="toggleFilter('hasinterv')"
          :class="['btn-filter', { active: activeFilter === 'hasinterv' }]"
        >
          <span class="filter-content">
            <span v-if="activeFilter === 'hasinterv'" class="filter-check">✓</span>
            <span>有面试</span>
          </span>
        </button>
        <button @click="clearFilters" class="btn-secondary">清除筛选</button>
        <button @click="showAddCompany = true" class="btn-primary">+ 添加公司</button>
      </div>
    </header>

    <main>
      <!-- 添加公司弹窗 -->
      <div v-if="showAddCompany" class="modal" @click.self="showAddCompany = false">
        <div class="modal-content">
          <h2>添加公司</h2>
          <input v-model="newCompany.name" placeholder="公司名称" class="input" @keyup.enter="addCompany">
          <div class="modal-actions">
            <button @click="addCompany" class="btn-primary">确定</button>
            <button @click="showAddCompany = false" class="btn-secondary">取消</button>
          </div>
        </div>
      </div>

      <!-- 添加产品弹窗 -->
      <div v-if="showAddProduct" class="modal" @click.self="showAddProduct = false">
        <div class="modal-content">
          <h2>添加产品</h2>
          <input v-model="newProduct.name" placeholder="产品名称" class="input" @keyup.enter="addProduct">
          <div class="modal-actions">
            <button @click="addProduct" class="btn-primary">确定</button>
            <button @click="showAddProduct = false" class="btn-secondary">取消</button>
          </div>
        </div>
      </div>

      <!-- 添加面试轮次弹窗 -->
      <div v-if="showAddinterv" class="modal" @click.self="showAddinterv = false">
        <div class="modal-content">
          <h2>添加面试轮次</h2>
          <select v-model="newinterv.type" class="input" @change="onintervTypeChange('add')">
            <option value="电话">电话面试</option>
            <option value="技术">技术面试</option>
            <option value="+1">+1面试</option>
            <option value="+2">+2面试</option>
            <option value="交叉">交叉面试</option>
            <option value="HR">HR面试</option>
            <option value="__custom__">✏️ 自定义...</option>
          </select>
          <input v-if="newinterv.type === '__custom__'" v-model="newinterv.customType" placeholder="输入自定义面试类型" class="input" @keyup.enter="addinterv">
          <input v-model="newinterv.date" type="datetime-local" class="input">
          <textarea v-model="newinterv.notes" placeholder="备注（可选）" class="input" rows="3"></textarea>
          <div class="modal-actions">
            <button @click="addinterv" class="btn-primary">确定</button>
            <button @click="showAddinterv = false" class="btn-secondary">取消</button>
          </div>
        </div>
      </div>

      <!-- 编辑公司弹窗 -->
      <div v-if="showEditCompany" class="modal" @click.self="showEditCompany = false">
        <div class="modal-content">
          <h2>编辑公司</h2>
          <input v-model="editCompany.name" placeholder="公司名称" class="input" @keyup.enter="updateCompany">
          <label class="checkbox-row">
            <input v-model="editCompany.noPosition" type="checkbox">
            <span>无岗</span>
          </label>
          <div class="modal-actions">
            <button @click="updateCompany" class="btn-primary">确定</button>
            <button @click="showEditCompany = false" class="btn-secondary">取消</button>
          </div>
        </div>
      </div>

      <!-- 编辑产品弹窗 -->
      <div v-if="showEditProduct" class="modal" @click.self="showEditProduct = false">
        <div class="modal-content">
          <h2>编辑产品</h2>
          <input v-model="editProduct.name" placeholder="产品名称" class="input" @keyup.enter="updateProduct">
          <div class="modal-actions">
            <button @click="updateProduct" class="btn-primary">确定</button>
            <button @click="showEditProduct = false" class="btn-secondary">取消</button>
          </div>
        </div>
      </div>

      <!-- 编辑产品备注弹窗 -->
      <div v-if="showEditProductNote" class="modal" @click.self="showEditProductNote = false">
        <div class="modal-content">
          <h2>产品备注</h2>
          <textarea v-model="editProductNote.notes" placeholder="添加备注..." class="input" rows="5"></textarea>
          <div class="modal-actions">
            <button @click="updateProductNote" class="btn-primary">确定</button>
            <button @click="showEditProductNote = false" class="btn-secondary">取消</button>
          </div>
        </div>
      </div>

      <!-- 编辑投递时间弹窗 -->
      <div v-if="showEditSubmittedDate" class="modal" @click.self="showEditSubmittedDate = false">
        <div class="modal-content">
          <h2>修改投递时间</h2>
          <input v-model="editSubmittedDate.date" type="date" class="input" @keyup.enter="updateSubmittedDate">
          <div class="modal-actions">
            <button @click="updateSubmittedDate" class="btn-primary">确定</button>
            <button @click="showEditSubmittedDate = false" class="btn-secondary">取消</button>
          </div>
        </div>
      </div>

      <!-- 编辑面试弹窗 -->
      <div v-if="showEditinterv" class="modal" @click.self="showEditinterv = false">
        <div class="modal-content">
          <h2>编辑面试</h2>
          <select v-model="editinterv.type" class="input" @change="onintervTypeChange('edit')">
            <option value="电话">电话面试</option>
            <option value="技术">技术面试</option>
            <option value="+1">+1面试</option>
            <option value="+2">+2面试</option>
            <option value="交叉">交叉面试</option>
            <option value="HR">HR面试</option>
            <option value="__custom__">✏️ 自定义...</option>
          </select>
          <input v-if="editinterv.type === '__custom__'" v-model="editinterv.customType" placeholder="输入自定义面试类型" class="input" @keyup.enter="updateinterv">
          <input v-model="editinterv.date" type="datetime-local" class="input">
          <textarea v-model="editinterv.notes" placeholder="备注（可选）" class="input" rows="3"></textarea>
          <div class="modal-actions">
            <button @click="updateinterv" class="btn-primary">确定</button>
            <button @click="showEditinterv = false" class="btn-secondary">取消</button>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="sortedCompanies.length === 0" class="empty-state">
        <p>🎯 还没有添加任何公司</p>
        <p>点击右上角"添加公司"开始记录你的进度吧！</p>
      </div>

      <template v-else>
        <!-- 即将到来的面试 -->
        <div v-if="upcominginterv.length > 0" class="upcoming-section">
          <h2>📅 即将到来的面试</h2>
          <div class="upcoming-list">
            <div v-for="item in upcominginterv" :key="`${item.companyId}-${item.productId}-${item.interv.id}`" class="upcoming-item">
              <div class="upcoming-time">
                <div class="upcoming-date">{{ formatUpcomingDate(item.interv.date) }}</div>
              </div>
              <div class="upcoming-info">
                <div class="upcoming-company">{{ item.companyName }}</div>
                <div class="upcoming-product">{{ item.productName }}</div>
                <div class="upcoming-type">{{ item.interv.type }}面试</div>
              </div>
              <div v-if="item.interv.notes" class="upcoming-notes">💬 {{ item.interv.notes }}</div>
            </div>
          </div>
        </div>

        <!-- 公司列表 -->
        <div class="companies-list">
          <div
            v-for="(company, index) in filteredCompanies"
            :key="company.id"
            class="company-card"
            :class="{ 'drag-over': dragOverCompanyIndex === index, 'dragging': draggedCompanyIndex === index }"
            draggable="true"
            @dragstart="onCompanyDragStart(index)"
            @dragover.prevent="onCompanyDragOver(index)"
            @dragleave="onCompanyDragLeave"
            @drop="onCompanyDrop(index)"
            @dragend="onCompanyDragEnd"
          >
          <div class="company-header">
            <span class="drag-handle" title="拖拽排序">⋮⋮</span>
            <h2>{{ company.name }}</h2>
            <span
              class="resume-status clickable"
              :class="{
                active: company.resumeCreated === true,
                inactive: company.resumeCreated === false,
                unnecessary: company.resumeCreated === 'unnecessary'
              }"
              @click="toggleResumeCreated(company)"
              title="点击切换状态"
            >
              {{ getResumeStatusText(company.resumeCreated) }}
            </span>
            <div class="company-actions">
              <button @click="openEditCompany(company)" class="btn-small" title="编辑公司">✏️ 编辑</button>
              <button @click="moveCompanyToTop(company)" class="btn-small" title="移到最前">⬆️ 置顶</button>
              <button @click="moveCompanyToBottom(company)" class="btn-small" title="移到最后">⬇️ 置底</button>
              <button @click="openAddProduct(company.id)" class="btn-small">+ 产品</button>
              <button @click="deleteCompany(company.id)" class="btn-delete">删除</button>
            </div>
          </div>

          <div v-if="company.noPosition || company.products.length > 0" class="products-list">
            <span v-if="company.noPosition" class="no-position-tag">无岗</span>
            <div
              v-for="(product, pIndex) in getFilteredProducts(company)"
              :key="product.id"
              class="product-section"
              :class="{ 'drag-over': draggedCompanyId === company.id && dragOverProductIndex === pIndex, 'dragging': draggedCompanyId === company.id && draggedProductIndex === pIndex }"
              draggable="true"
              @dragstart="onProductDragStart(company.id, pIndex)"
              @dragover.prevent="onProductDragOver(company.id, pIndex)"
              @dragleave="onProductDragLeave"
              @drop="onProductDrop(company.id, pIndex)"
              @dragend="onProductDragEnd"
            >
              <div class="product-header">
                <span class="drag-handle-small" title="拖拽排序">⋮⋮</span>
                <h3>📦 {{ product.name }}</h3>
                <span
                  class="product-status"
                  :class="{
                    submitted: product.submitted,
                    clickable: !product.intervs || product.intervs.length === 0,
                    disabled: product.intervs && product.intervs.length > 0
                  }"
                  @click="toggleProductSubmitted(company.id, product)"
                  :title="product.intervs && product.intervs.length > 0 ? '有面试记录，不可修改' : '点击切换状态'"
                >
                  {{ product.submitted ? '✓ 已投递' : '✗ 未投递' }}
                </span>
                <span
                  v-if="product.submitted && product.submittedDate"
                  class="submitted-date clickable"
                  @click="openEditSubmittedDate(company.id, product)"
                  title="点击修改投递时间"
                >
                  📅 {{ formatSubmittedDate(product.submittedDate) }}
                </span>
                <div>
                  <button @click="openEditProductNote(company.id, product)" class="btn-small" title="备注">💬</button>
                  <button @click="openEditProduct(company.id, product)" class="btn-small" title="编辑产品">✏️</button>
                  <button @click="openAddinterv(company.id, product.id)" class="btn-small">+ 面试</button>
                  <button @click="deleteProduct(company.id, product.id)" class="btn-delete-small">删除</button>
                </div>
              </div>

              <!-- 产品备注显示 -->
              <div v-if="product.notes" class="product-notes">
                💬 {{ product.notes }}
              </div>

              <div v-if="product.intervs.length > 0" class="interv-list">
                <div v-for="(interv, index) in product.intervs" :key="interv.id" class="interv-item">
                  <div class="interv-badge">第{{ index + 1 }}轮</div>
                  <div class="interv-type">{{ interv.type }}</div>
                  <div class="interv-date">
                    <div class="date-exact">{{ formatDate(interv.date) }}</div>
                    <div class="time-elapsed">{{ getTimeElapsed(interv.date) }}</div>
                  </div>
                  <div v-if="interv.notes" class="interv-notes">💬 {{ interv.notes }}</div>
                  <button @click="openEditinterv(company.id, product.id, interv)" class="btn-small" title="编辑面试">✏️</button>
                  <button @click="deleteinterv(company.id, product.id, interv.id)" class="btn-delete-small">删除</button>
                </div>

                <!-- 工作日统计 -->
                <div class="last-interv-summary">
                  ⏰ 距离最后一次面试：<strong>{{ getWorkdaysSince(product.intervs[product.intervs.length - 1].date) }}</strong> 个工作日
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_BASE = 'http://localhost:40001/api'

// 数据状态
const companies = ref([])
const loading = ref(false)

// 搜索和筛选状态
const searchKeyword = ref('')
const searchQuery = ref('')
const activeFilter = ref(null) // 改为单个激活的筛选器

// 弹窗状态
const showAddCompany = ref(false)
const showAddProduct = ref(false)
const showAddinterv = ref(false)
const showEditCompany = ref(false)
const showEditProduct = ref(false)
const showEditinterv = ref(false)
const showEditProductNote = ref(false)
const showEditSubmittedDate = ref(false)

// 表单数据
const newCompany = ref({ name: '' })
const newProduct = ref({ name: '', companyId: null })
const newinterv = ref({ type: '电话', customType: '', date: '', notes: '', companyId: null, productId: null })

// 编辑表单数据
const editCompany = ref({ id: null, name: '', noPosition: false })
const editProduct = ref({ id: null, companyId: null, name: '' })
const editinterv = ref({ id: null, companyId: null, productId: null, type: '', customType: '', date: '', notes: '' })
const editProductNote = ref({ id: null, companyId: null, notes: '' })
const editSubmittedDate = ref({ id: null, companyId: null, date: '' })

// 拖拽状态
const draggedCompanyIndex = ref(null)
const draggedProductIndex = ref(null)
const draggedCompanyId = ref(null)
const dragOverCompanyIndex = ref(null)
const dragOverProductIndex = ref(null)

// 排序后的公司列表
const sortedCompanies = computed(() => {
  return [...companies.value].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 999999
    const orderB = b.order !== undefined ? b.order : 999999
    return orderA - orderB
  })
})

// 筛选后的公司列表
const filteredCompanies = computed(() => {
  let result = sortedCompanies.value

  // 应用搜索
  if (searchQuery.value) {
    const keyword = searchQuery.value.toLowerCase()
    result = result.map(company => {
      const companyMatches = company.name.toLowerCase().includes(keyword)

      if (companyMatches) {
        // 公司名匹配，返回整个公司
        return company
      } else {
        // 检查产品是否匹配
        const matchedProducts = company.products.filter(p =>
          p.name.toLowerCase().includes(keyword)
        )

        if (matchedProducts.length > 0) {
          // 产品匹配，返回只包含匹配产品的公司
          return {
            ...company,
            products: matchedProducts,
            _isFiltered: true
          }
        }

        return null
      }
    }).filter(Boolean)
  }

  // 应用筛选器
  if (activeFilter.value) {
    result = result.map(company => {
      let filteredProducts = company.products

      if (activeFilter.value === 'notSubmitted') {
        filteredProducts = filteredProducts.filter(p => !p.submitted)
        // 如果有未投递的产品，或者公司没有任何产品，则显示该公司
        if (filteredProducts.length > 0 || company.products.length === 0) {
          return {
            ...company,
            products: filteredProducts,
            _isFiltered: true
          }
        }
        return null
      } else if (activeFilter.value === 'submittedNointerv') {
        filteredProducts = filteredProducts.filter(p => p.submitted && (!p.intervs || p.intervs.length === 0))
        // 按投递时间降序排序（最新的在前，没有时间的排在最后）
        filteredProducts.sort((a, b) => {
          if (!a.submittedDate && !b.submittedDate) return 0
          if (!a.submittedDate) return 1  // a 没有时间，排在后面
          if (!b.submittedDate) return -1 // b 没有时间，排在后面
          return new Date(b.submittedDate) - new Date(a.submittedDate)
        })
      } else if (activeFilter.value === 'hasinterv') {
        filteredProducts = filteredProducts.filter(p => p.intervs && p.intervs.length > 0)
      } else if (activeFilter.value === 'noResume') {
        // 筛选未创建简历的公司（resumeCreated === false 或 undefined）
        if (company.resumeCreated === false || company.resumeCreated === undefined) {
          return company
        }
        return null
      }

      if (filteredProducts.length > 0) {
        return {
          ...company,
          products: filteredProducts,
          _isFiltered: true
        }
      }

      return null
    }).filter(Boolean)
  }

  // 如果是"已投递"筛选，按投递时间对公司列表进行排序
  if (activeFilter.value === 'submittedNointerv') {
    result.sort((companyA, companyB) => {
      // 获取每个公司中最新的投递时间
      const getLatestSubmittedDate = (company) => {
        const products = company.products || []
        const dates = products
          .map(p => p.submittedDate)
          .filter(Boolean)
          .map(d => new Date(d))

        if (dates.length === 0) return null
        return Math.max(...dates)
      }

      const dateA = getLatestSubmittedDate(companyA)
      const dateB = getLatestSubmittedDate(companyB)

      // 没有时间的排在后面
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1

      // 都有时间，按降序排列（最新的在前）
      return dateB - dateA
    })
  }

  return result
})

// 是否有激活的筛选器
const hasActiveFilters = computed(() => {
  return searchQuery.value || activeFilter.value
})

// 应用搜索
function applySearch() {
  searchQuery.value = searchKeyword.value.trim()
}

// 切换筛选器（互斥）
function toggleFilter(filterName) {
  if (activeFilter.value === filterName) {
    activeFilter.value = null // 取消当前筛选
  } else {
    activeFilter.value = filterName // 激活新筛选
  }
}

// 清除所有筛选
function clearFilters() {
  searchKeyword.value = ''
  searchQuery.value = ''
  activeFilter.value = null
}

// 获取简历状态文本
function getResumeStatusText(status) {
  if (status === true) return '✓ 已创建简历'
  if (status === 'unnecessary') return '○ 无需简历'
  return '✗ 未创建简历'
}

// 即将到来的面试（今天及以后）
const upcominginterv = computed(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0) // 今天零点

  const upcoming = []

  companies.value.forEach(company => {
    company.products.forEach(product => {
      product.intervs.forEach(interv => {
        const intervDate = new Date(interv.date)
        if (intervDate >= now) {
          upcoming.push({
            companyId: company.id,
            companyName: company.name,
            productId: product.id,
            productName: product.name,
            interv: interv
          })
        }
      })
    })
  })

  // 按时间升序排序
  return upcoming.sort((a, b) => new Date(a.interv.date) - new Date(b.interv.date))
})

// 获取排序后的产品列表
function getSortedProducts(company) {
  return [...company.products].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 999999
    const orderB = b.order !== undefined ? b.order : 999999
    return orderA - orderB
  })
}

// 获取筛选后的产品列表（用于显示）
function getFilteredProducts(company) {
  // 如果公司已经被筛选过（_isFiltered标记），直接使用其products
  if (company._isFiltered) {
    return getSortedProducts(company)
  }
  return getSortedProducts(company)
}

// 公司拖拽开始
function onCompanyDragStart(index) {
  draggedCompanyIndex.value = index
}

// 公司拖拽悬停
function onCompanyDragOver(index) {
  if (draggedCompanyIndex.value !== null && draggedCompanyIndex.value !== index) {
    dragOverCompanyIndex.value = index
  }
}

// 公司拖拽离开
function onCompanyDragLeave() {
  dragOverCompanyIndex.value = null
}

// 公司拖拽结束
function onCompanyDragEnd() {
  draggedCompanyIndex.value = null
  dragOverCompanyIndex.value = null
}

// 公司拖拽放下
async function onCompanyDrop(targetIndex) {
  dragOverCompanyIndex.value = null

  if (draggedCompanyIndex.value === null || draggedCompanyIndex.value === targetIndex) {
    draggedCompanyIndex.value = null
    return
  }

  const sorted = sortedCompanies.value
  const draggedCompany = sorted[draggedCompanyIndex.value]

  // 重新排列
  sorted.splice(draggedCompanyIndex.value, 1)
  sorted.splice(targetIndex, 0, draggedCompany)

  // 更新 order 字段
  const orderMap = {}
  sorted.forEach((company, index) => {
    orderMap[company.id] = index
    company.order = index
  })

  // 同步到服务器
  try {
    await fetch(`${API_BASE}/companies-order`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderMap })
    })
  } catch (error) {
    console.error('更新公司顺序失败:', error)
  }

  draggedCompanyIndex.value = null
}

// 产品拖拽开始
function onProductDragStart(companyId, pIndex) {
  draggedCompanyId.value = companyId
  draggedProductIndex.value = pIndex
}

// 产品拖拽悬停
function onProductDragOver(companyId, pIndex) {
  if (draggedCompanyId.value === companyId &&
      draggedProductIndex.value !== null &&
      draggedProductIndex.value !== pIndex) {
    dragOverProductIndex.value = pIndex
  }
}

// 产品拖拽离开
function onProductDragLeave() {
  dragOverProductIndex.value = null
}

// 产品拖拽结束
function onProductDragEnd() {
  draggedCompanyId.value = null
  draggedProductIndex.value = null
  dragOverProductIndex.value = null
}

// 产品拖拽放下
async function onProductDrop(companyId, targetIndex) {
  dragOverProductIndex.value = null

  if (draggedCompanyId.value !== companyId ||
      draggedProductIndex.value === null ||
      draggedProductIndex.value === targetIndex) {
    draggedProductIndex.value = null
    draggedCompanyId.value = null
    return
  }

  const company = companies.value.find(c => c.id === companyId)
  if (!company) return

  const sorted = getSortedProducts(company)
  const draggedProduct = sorted[draggedProductIndex.value]

  // 重新排列
  sorted.splice(draggedProductIndex.value, 1)
  sorted.splice(targetIndex, 0, draggedProduct)

  // 更新 order 字段
  const orderMap = {}
  sorted.forEach((product, index) => {
    orderMap[product.id] = index
    product.order = index
  })

  // 同步到服务器
  try {
    await fetch(`${API_BASE}/companies/${companyId}/products-order`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderMap })
    })
  } catch (error) {
    console.error('更新产品顺序失败:', error)
  }

  draggedProductIndex.value = null
  draggedCompanyId.value = null
}

// 公司移到顶部
async function moveCompanyToTop(company) {
  // 找到原始的 company 对象（因为筛选时可能传入的是副本）
  const originalCompany = companies.value.find(c => c.id === company.id)
  if (!originalCompany) return

  // 使用排序后的完整列表
  const sorted = sortedCompanies.value

  if (sorted.length === 0) return
  if (sorted[0].id === originalCompany.id) return // 已经在最前了

  // 获取第一个公司的 order 值，将当前公司的 order 设置为比它小
  const firstCompanyOrder = sorted[0].order !== undefined ? sorted[0].order : 0
  const newOrder = firstCompanyOrder - 1

  // 更新原始公司对象的 order
  originalCompany.order = newOrder

  // 同步到服务器
  try {
    await fetch(`${API_BASE}/companies/${originalCompany.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newOrder })
    })
  } catch (error) {
    console.error('移动公司失败:', error)
  }
}

// 公司移到底部
async function moveCompanyToBottom(company) {
  // 找到原始的 company 对象（因为筛选时可能传入的是副本）
  const originalCompany = companies.value.find(c => c.id === company.id)
  if (!originalCompany) return

  // 使用排序后的完整列表
  const sorted = sortedCompanies.value

  if (sorted.length === 0) return
  if (sorted[sorted.length - 1].id === originalCompany.id) return // 已经在最后了

  // 获取最后一个公司的 order 值，将当前公司的 order 设置为比它大
  const lastCompanyOrder = sorted[sorted.length - 1].order !== undefined ? sorted[sorted.length - 1].order : 0
  const newOrder = lastCompanyOrder + 1

  // 更新原始公司对象的 order
  originalCompany.order = newOrder

  // 同步到服务器
  try {
    await fetch(`${API_BASE}/companies/${originalCompany.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newOrder })
    })
  } catch (error) {
    console.error('移动公司失败:', error)
  }
}

// 切换公司简历创建状态（三态循环：未创建 -> 已创建 -> 无需 -> 未创建）
async function toggleResumeCreated(company) {
  let newStatus
  if (company.resumeCreated === false || company.resumeCreated === undefined) {
    newStatus = true // 未创建 -> 已创建
  } else if (company.resumeCreated === true) {
    newStatus = 'unnecessary' // 已创建 -> 无需
  } else {
    newStatus = false // 无需 -> 未创建
  }

  try {
    await fetch(`${API_BASE}/companies/${company.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeCreated: newStatus })
    })
    company.resumeCreated = newStatus
  } catch (error) {
    console.error('更新简历状态失败:', error)
    alert('❌ 更新失败')
  }
}

// 切换产品投递状态
async function toggleProductSubmitted(companyId, product) {
  // 如果有面试记录，不允许修改
  if (product.intervs && product.intervs.length > 0) {
    return
  }

  const newStatus = !product.submitted
  const updateData = { submitted: newStatus }

  // 如果切换为已投递，自动记录当前日期
  if (newStatus) {
    const today = new Date().toISOString().split('T')[0]
    updateData.submittedDate = today
  }

  try {
    await fetch(`${API_BASE}/companies/${companyId}/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
    product.submitted = newStatus
    if (newStatus) {
      product.submittedDate = updateData.submittedDate
    }
  } catch (error) {
    console.error('更新投递状态失败:', error)
    alert('❌ 更新失败')
  }
}

// 加载数据
async function loadData() {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/companies`)
    companies.value = await response.json()

    // 自动同步：如果产品有面试记录但未标记为已投递，则自动更新
    for (const company of companies.value) {
      for (const product of company.products) {
        if (product.intervs && product.intervs.length > 0 && !product.submitted) {
          product.submitted = true
          // 同步到服务器
          fetch(`${API_BASE}/companies/${company.id}/products/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submitted: true })
          }).catch(err => console.error('同步投递状态失败:', err))
        }
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    alert('❌ 加载数据失败，请确保后端服务已启动')
  } finally {
    loading.value = false
  }
}

// 添加公司
async function addCompany() {
  if (!newCompany.value.name) {
    alert('请输入公司名称')
    return
  }

  // 检查是否已存在同名公司
  const companyName = newCompany.value.name.trim()
  const existingCompany = companies.value.find(c => c.name.trim() === companyName)
  if (existingCompany) {
    // 已存在同名公司，自动填入搜索框并筛选
    searchKeyword.value = companyName
    applySearch()
    newCompany.value = { name: '' }
    showAddCompany.value = false
    return
  }

  try {
    const response = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: companyName })
    })
    const company = await response.json()

    // 设置最小的 order 值，让新公司排在最前面
    const minOrder = Math.min(...companies.value.map(c => c.order !== undefined ? c.order : 999999), 0)
    company.order = minOrder - 1

    companies.value.unshift(company)

    // 同步 order 到服务器
    await fetch(`${API_BASE}/companies/${company.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: company.order })
    })

    newCompany.value = { name: '' }
    showAddCompany.value = false

    // 清除筛选，显示新添加的公司
    clearFilters()
  } catch (error) {
    console.error('添加公司失败:', error)
    alert('❌ 添加失败')
  }
}

// 打开编辑公司弹窗
function openEditCompany(company) {
  editCompany.value = {
    id: company.id,
    name: company.name,
    noPosition: Boolean(company.noPosition)
  }
  showEditCompany.value = true
}

// 更新公司
async function updateCompany() {
  if (!editCompany.value.name) {
    alert('请输入公司名称')
    return
  }

  // 检查是否已存在同名公司（排除自己）
  const companyName = editCompany.value.name.trim()
  const existingCompany = companies.value.find(c => c.id !== editCompany.value.id && c.name.trim() === companyName)
  if (existingCompany) {
    alert('❌ 已存在同名公司，请使用不同的名称')
    return
  }

  try {
    await fetch(`${API_BASE}/companies/${editCompany.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: companyName,
        noPosition: editCompany.value.noPosition
      })
    })
    const company = companies.value.find(c => c.id === editCompany.value.id)
    if (company) {
      company.name = companyName
      company.noPosition = editCompany.value.noPosition
    }
    showEditCompany.value = false
  } catch (error) {
    console.error('更新公司失败:', error)
    alert('❌ 更新失败')
  }
}

// 删除公司
async function deleteCompany(companyId) {
  if (!confirm('确定要删除这个公司吗？所有相关数据都会被删除！')) return

  try {
    await fetch(`${API_BASE}/companies/${companyId}`, { method: 'DELETE' })
    companies.value = companies.value.filter(c => c.id !== companyId)
  } catch (error) {
    console.error('删除公司失败:', error)
    alert('❌ 删除失败')
  }
}

// 打开添加产品弹窗
function openAddProduct(companyId) {
  newProduct.value.companyId = companyId
  newProduct.value.name = ''
  showAddProduct.value = true
}

// 添加产品
async function addProduct() {
  if (!newProduct.value.name) {
    alert('请输入产品名称')
    return
  }

  try {
    const response = await fetch(`${API_BASE}/companies/${newProduct.value.companyId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProduct.value.name })
    })
    const product = await response.json()

    const company = companies.value.find(c => c.id === newProduct.value.companyId)
    if (company) {
      // 设置最小的 order 值，让新产品排在最前面
      const minOrder = Math.min(...company.products.map(p => p.order !== undefined ? p.order : 999999), 0)
      product.order = minOrder - 1

      company.products.unshift(product)

      // 同步 order 到服务器
      await fetch(`${API_BASE}/companies/${newProduct.value.companyId}/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: product.order })
      })
    }

    newProduct.value = { name: '', companyId: null }
    showAddProduct.value = false
  } catch (error) {
    console.error('添加产品失败:', error)
    alert('❌ 添加失败')
  }
}

// 删除产品
async function deleteProduct(companyId, productId) {
  if (!confirm('确定要删除这个产品吗？所有面试记录都会被删除！')) return

  try {
    await fetch(`${API_BASE}/companies/${companyId}/products/${productId}`, { method: 'DELETE' })
    const company = companies.value.find(c => c.id === companyId)
    if (company) {
      company.products = company.products.filter(p => p.id !== productId)
    }
  } catch (error) {
    console.error('删除产品失败:', error)
    alert('❌ 删除失败')
  }
}

// 打开编辑产品弹窗
function openEditProduct(companyId, product) {
  editProduct.value = {
    id: product.id,
    companyId: companyId,
    name: product.name
  }
  showEditProduct.value = true
}

// 更新产品
async function updateProduct() {
  if (!editProduct.value.name) {
    alert('请输入产品名称')
    return
  }

  try {
    await fetch(`${API_BASE}/companies/${editProduct.value.companyId}/products/${editProduct.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editProduct.value.name })
    })
    const company = companies.value.find(c => c.id === editProduct.value.companyId)
    if (company) {
      const product = company.products.find(p => p.id === editProduct.value.id)
      if (product) {
        product.name = editProduct.value.name
      }
    }
    showEditProduct.value = false
  } catch (error) {
    console.error('更新产品失败:', error)
    alert('❌ 更新失败')
  }
}

// 打开编辑产品备注弹窗
function openEditProductNote(companyId, product) {
  editProductNote.value = {
    id: product.id,
    companyId: companyId,
    notes: product.notes || ''
  }
  showEditProductNote.value = true
}

// 更新产品备注
async function updateProductNote() {
  try {
    await fetch(`${API_BASE}/companies/${editProductNote.value.companyId}/products/${editProductNote.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: editProductNote.value.notes })
    })
    const company = companies.value.find(c => c.id === editProductNote.value.companyId)
    if (company) {
      const product = company.products.find(p => p.id === editProductNote.value.id)
      if (product) {
        product.notes = editProductNote.value.notes
      }
    }
    showEditProductNote.value = false
  } catch (error) {
    console.error('更新产品备注失败:', error)
    alert('❌ 更新失败')
  }
}

// 打开编辑投递时间弹窗
function openEditSubmittedDate(companyId, product) {
  editSubmittedDate.value = {
    id: product.id,
    companyId: companyId,
    date: product.submittedDate || new Date().toISOString().split('T')[0]
  }
  showEditSubmittedDate.value = true
}

// 更新投递时间
async function updateSubmittedDate() {
  if (!editSubmittedDate.value.date) {
    alert('请选择投递时间')
    return
  }

  try {
    await fetch(`${API_BASE}/companies/${editSubmittedDate.value.companyId}/products/${editSubmittedDate.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submittedDate: editSubmittedDate.value.date })
    })
    const company = companies.value.find(c => c.id === editSubmittedDate.value.companyId)
    if (company) {
      const product = company.products.find(p => p.id === editSubmittedDate.value.id)
      if (product) {
        product.submittedDate = editSubmittedDate.value.date
      }
    }
    showEditSubmittedDate.value = false
  } catch (error) {
    console.error('更新投递时间失败:', error)
    alert('❌ 更新失败')
  }
}

// 格式化投递日期
function formatSubmittedDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}


// 打开添加面试弹窗
function openAddinterv(companyId, productId) {
  newinterv.value.companyId = companyId
  newinterv.value.productId = productId
  // 设置默认时间为当前时间
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  newinterv.value.date = now.toISOString().slice(0, 16)
  showAddinterv.value = true
}

// 添加面试
async function addinterv() {
  if (!newinterv.value.date) {
    alert('请选择面试时间')
    return
  }

  // 处理自定义类型
  let finalType = newinterv.value.type
  if (finalType === '__custom__') {
    if (!newinterv.value.customType.trim()) {
      alert('请输入自定义面试类型')
      return
    }
    finalType = newinterv.value.customType.trim()
  }

  try {
    const response = await fetch(
      `${API_BASE}/companies/${newinterv.value.companyId}/products/${newinterv.value.productId}/interv`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: finalType,
          date: newinterv.value.date,
          notes: newinterv.value.notes
        })
      }
    )
    const interv = await response.json()

    const company = companies.value.find(c => c.id === newinterv.value.companyId)
    if (company) {
      const product = company.products.find(p => p.id === newinterv.value.productId)
      if (product) {
        product.intervs.push(interv)
        product.intervs.sort((a, b) => new Date(a.date) - new Date(b.date))

        // 自动设置为已投递状态
        if (!product.submitted) {
          product.submitted = true
          // 同步到服务器
          await fetch(`${API_BASE}/companies/${newinterv.value.companyId}/products/${newinterv.value.productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submitted: true })
          })
        }
      }
    }

    newinterv.value = { type: '电话', customType: '', date: '', notes: '', companyId: null, productId: null }
    showAddinterv.value = false
  } catch (error) {
    console.error('添加面试失败:', error)
    alert('❌ 添加失败')
  }
}

// 删除面试
async function deleteinterv(companyId, productId, intervId) {
  if (!confirm('确定要删除这次面试记录吗？')) return

  try {
    await fetch(`${API_BASE}/companies/${companyId}/products/${productId}/interv/${intervId}`, {
      method: 'DELETE'
    })
    const company = companies.value.find(c => c.id === companyId)
    if (company) {
      const product = company.products.find(p => p.id === productId)
      if (product) {
        product.intervs = product.intervs.filter(i => i.id !== intervId)
      }
    }
  } catch (error) {
    console.error('删除面试失败:', error)
    alert('❌ 删除失败')
  }
}

// 打开编辑面试弹窗
function openEditinterv(companyId, productId, interv) {
  // 检查是否是预设类型
  const presetTypes = ['电话', '技术', '+1', '+2', '交叉', 'HR']
  const isCustomType = !presetTypes.includes(interv.type)

  editinterv.value = {
    id: interv.id,
    companyId: companyId,
    productId: productId,
    type: isCustomType ? '__custom__' : interv.type,
    customType: isCustomType ? interv.type : '',
    date: interv.date,
    notes: interv.notes || ''
  }
  showEditinterv.value = true
}

// 更新面试
async function updateinterv() {
  if (!editinterv.value.type || !editinterv.value.date) {
    alert('请填写完整信息')
    return
  }

  // 处理自定义类型
  let finalType = editinterv.value.type
  if (finalType === '__custom__') {
    if (!editinterv.value.customType.trim()) {
      alert('请输入自定义面试类型')
      return
    }
    finalType = editinterv.value.customType.trim()
  }

  try {
    await fetch(`${API_BASE}/companies/${editinterv.value.companyId}/products/${editinterv.value.productId}/interv/${editinterv.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: finalType,
        date: editinterv.value.date,
        notes: editinterv.value.notes
      })
    })
    const company = companies.value.find(c => c.id === editinterv.value.companyId)
    if (company) {
      const product = company.products.find(p => p.id === editinterv.value.productId)
      if (product) {
        const interv = product.intervs.find(i => i.id === editinterv.value.id)
        if (interv) {
          interv.type = finalType
          interv.date = editinterv.value.date
          interv.notes = editinterv.value.notes
        }
      }
    }
    showEditinterv.value = false
  } catch (error) {
    console.error('更新面试失败:', error)
    alert('❌ 更新失败')
  }
}

// 处理面试类型选择变化
function onintervTypeChange(mode) {
  // 当切换到非自定义选项时，清空自定义输入
  if (mode === 'add' && newinterv.value.type !== '__custom__') {
    newinterv.value.customType = ''
  }
  if (mode === 'edit' && editinterv.value.type !== '__custom__') {
    editinterv.value.customType = ''
  }
}

// 格式化日期（具体日期时间）
function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short'
  })
}

// 格式化即将到来的面试日期
function formatUpcomingDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short'
  })
}

// 计算时间流逝（相对时间）
function getTimeElapsed(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

// 计算工作日（排除周末）
function getWorkdaysSince(dateStr) {
  const startDate = new Date(dateStr)
  const endDate = new Date()

  let workdays = 0
  let currentDate = new Date(startDate)

  // 从面试日期的下一天开始计算
  currentDate.setDate(currentDate.getDate() + 1)

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay()
    // 0 = 周日, 6 = 周六，排除这两天
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workdays++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return workdays
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
})
</script>
