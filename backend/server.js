import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 40001
const DATA_FILE_NAME = process.env.DATA_FILE || 'interv.json'
const DATA_FILE = path.join(__dirname, 'data', DATA_FILE_NAME)

// 中间件
app.use(cors())
app.use(express.json())

// 读取数据
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取数据失败:', error)
    return []
  }
}

// 写入数据
async function writeData(data) {
  try {
    // 确保目录存在
    const dir = path.dirname(DATA_FILE)
    await fs.mkdir(dir, { recursive: true })

    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('写入数据失败:', error)
    return false
  }
}

// 获取所有公司数据
app.get('/api/companies', async (req, res) => {
  const companies = await readData()
  res.json(companies)
})

// 添加公司
app.post('/api/companies', async (req, res) => {
  const companies = await readData()
  const newCompany = {
    id: Date.now(),
    name: req.body.name,
    resumeCreated: req.body.resumeCreated !== undefined ? req.body.resumeCreated : false,
    noPosition: Boolean(req.body.noPosition),
    products: [],
    order: companies.length
  }
  companies.push(newCompany)
  await writeData(companies)
  res.json(newCompany)
})

// 删除公司
app.delete('/api/companies/:id', async (req, res) => {
  const companies = await readData()
  const companyId = parseInt(req.params.id)
  const filtered = companies.filter(c => c.id !== companyId)
  await writeData(filtered)
  res.json({ success: true })
})

// 更新公司
app.put('/api/companies/:id', async (req, res) => {
  const companies = await readData()
  const companyId = parseInt(req.params.id)
  const company = companies.find(c => c.id === companyId)
  if (company) {
    if (req.body.name !== undefined) {
      company.name = req.body.name
    }
    if (req.body.resumeCreated !== undefined) {
      company.resumeCreated = req.body.resumeCreated
    }
    if (req.body.noPosition !== undefined) {
      company.noPosition = Boolean(req.body.noPosition)
    }
    if (req.body.order !== undefined) {
      company.order = req.body.order
    }
    await writeData(companies)
    res.json(company)
  } else {
    res.status(404).json({ error: '公司不存在' })
  }
})

// 批量更新公司顺序
app.put('/api/companies-order', async (req, res) => {
  const companies = await readData()
  const orderMap = req.body.orderMap // { companyId: order }

  companies.forEach(company => {
    if (orderMap[company.id] !== undefined) {
      company.order = orderMap[company.id]
    }
  })

  await writeData(companies)
  res.json({ success: true })
})

// 添加产品
app.post('/api/companies/:id/products', async (req, res) => {
  const companies = await readData()
  const companyId = parseInt(req.params.id)
  const company = companies.find(c => c.id === companyId)

  if (company) {
    const newProduct = {
      id: Date.now(),
      name: req.body.name,
      submitted: req.body.submitted !== undefined ? req.body.submitted : false,
      intervs: [],
      order: company.products.length
    }
    company.products.push(newProduct)
    await writeData(companies)
    res.json(newProduct)
  } else {
    res.status(404).json({ error: '公司不存在' })
  }
})

// 更新产品
app.put('/api/companies/:cid/products/:pid', async (req, res) => {
  const companies = await readData()
  const companyId = parseInt(req.params.cid)
  const productId = parseInt(req.params.pid)
  const company = companies.find(c => c.id === companyId)

  if (company) {
    const product = company.products.find(p => p.id === productId)
    if (product) {
      if (req.body.name !== undefined) {
        product.name = req.body.name
      }
      if (req.body.submitted !== undefined) {
        product.submitted = req.body.submitted
      }
      if (req.body.submittedDate !== undefined) {
        product.submittedDate = req.body.submittedDate
      }
      if (req.body.order !== undefined) {
        product.order = req.body.order
      }
      if (req.body.notes !== undefined) {
        product.notes = req.body.notes
      }
      await writeData(companies)
      res.json(product)
    } else {
      res.status(404).json({ error: '产品不存在' })
    }
  } else {
    res.status(404).json({ error: '公司不存在' })
  }
})

// 批量更新产品顺序
app.put('/api/companies/:cid/products-order', async (req, res) => {
  const companies = await readData()
  const companyId = parseInt(req.params.cid)
  const company = companies.find(c => c.id === companyId)

  if (company) {
    const orderMap = req.body.orderMap // { productId: order }
    company.products.forEach(product => {
      if (orderMap[product.id] !== undefined) {
        product.order = orderMap[product.id]
      }
    })
    await writeData(companies)
    res.json({ success: true })
  } else {
    res.status(404).json({ error: '公司不存在' })
  }
})

// 删除产品
app.delete('/api/companies/:cid/products/:pid', async (req, res) => {
  const companies = await readData()
  const companyId = parseInt(req.params.cid)
  const productId = parseInt(req.params.pid)
  const company = companies.find(c => c.id === companyId)

  if (company) {
    company.products = company.products.filter(p => p.id !== productId)
    await writeData(companies)
    res.json({ success: true })
  } else {
    res.status(404).json({ error: '公司不存在' })
  }
})

// 添加面试
app.post('/api/companies/:cid/products/:pid/interv', async (req, res) => {
  const companies = await readData()
  const companyId = parseInt(req.params.cid)
  const productId = parseInt(req.params.pid)
  const company = companies.find(c => c.id === companyId)

  if (company) {
    const product = company.products.find(p => p.id === productId)
    if (product) {
      const newinterv = {
        id: Date.now(),
        type: req.body.type,
        date: req.body.date,
        notes: req.body.notes || ''
      }
      product.intervs.push(newinterv)
      // 按时间排序
      product.intervs.sort((a, b) => new Date(a.date) - new Date(b.date))
      await writeData(companies)
      res.json(newinterv)
    } else {
      res.status(404).json({ error: '产品不存在' })
    }
  } else {
    res.status(404).json({ error: '公司不存在' })
  }
})

// 更新面试
app.put('/api/companies/:cid/products/:pid/interv/:iid', async (req, res) => {
  const companies = await readData()
  const companyId = parseInt(req.params.cid)
  const productId = parseInt(req.params.pid)
  const intervId = parseInt(req.params.iid)
  const company = companies.find(c => c.id === companyId)

  if (company) {
    const product = company.products.find(p => p.id === productId)
    if (product) {
      const interv = product.intervs.find(i => i.id === intervId)
      if (interv) {
        if (req.body.type !== undefined) {
          interv.type = req.body.type
        }
        if (req.body.date !== undefined) {
          interv.date = req.body.date
        }
        if (req.body.notes !== undefined) {
          interv.notes = req.body.notes
        }
        await writeData(companies)
        res.json(interv)
      } else {
        res.status(404).json({ error: '面试不存在' })
      }
    } else {
      res.status(404).json({ error: '产品不存在' })
    }
  } else {
    res.status(404).json({ error: '公司不存在' })
  }
})

// 删除面试
app.delete('/api/companies/:cid/products/:pid/interv/:iid', async (req, res) => {
  const companies = await readData()
  const companyId = parseInt(req.params.cid)
  const productId = parseInt(req.params.pid)
  const intervId = parseInt(req.params.iid)
  const company = companies.find(c => c.id === companyId)

  if (company) {
    const product = company.products.find(p => p.id === productId)
    if (product) {
      product.intervs = product.intervs.filter(i => i.id !== intervId)
      await writeData(companies)
      res.json({ success: true })
    } else {
      res.status(404).json({ error: '产品不存在' })
    }
  } else {
    res.status(404).json({ error: '公司不存在' })
  }
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`✅ 后端服务器运行在 http://localhost:${PORT}`)
  console.log(`📁 数据文件位置: ${DATA_FILE}`)
})
