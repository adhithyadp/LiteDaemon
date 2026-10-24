/**
 * LiteDaemon — Commercial SaaS Website JavaScript
 * Handles: localized geo-pricing, billing frequency toggle, navigation effects, and scroll reveals
 */

// ─── Dodo Payments Live Checkout Config ──────────────────────────────────────
const CHECKOUT_BASE = 'https://checkout.dodopayments.com/buy/'

const CLOUD_PRODUCT_IDS = {
  india: {
    monthly: 'pdt_0Nq1H1dHTZzfrQ1tdeYCP',
    annual:  'pdt_0Nq1Hjj1bZUR5HQ9hgraU',
  },
  global: {
    monthly: 'pdt_0Nq1IsTBvSZVraoe1aXnz',
    annual:  'pdt_0Nq1JGEZBp3f6bfs9CnE2',
  },
}

const CLOUD_PRICES = {
  india: {
    monthly: { symbol: '₹', amount: '400', period: '/month', effective: '₹400/mo billed monthly', saving: '20%' },
    annual:  { symbol: '₹', amount: '3,849', period: '/year', effective: '₹320/mo · Billed annually (Save 20%)', saving: '20%' },
  },
  global: {
    monthly: { symbol: '$', amount: '15', period: '/month', effective: '$15/mo billed monthly', saving: '20%' },
    annual:  { symbol: '$', amount: '144', period: '/year', effective: '$12/mo · Billed annually (Save 20%)', saving: '20%' },
  },
}

// ─── Auto-Detect Region (India vs Global) ────────────────────────────────────
function detectRegion() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase()
    if (tz.includes('calcutta') || tz.includes('kolkata') || tz.includes('india') || tz.includes('ist')) {
      return 'india'
    }
    const languages = navigator.languages || [navigator.language]
    if (languages.some(l => l.toLowerCase().endsWith('-in') || l.toLowerCase() === 'hi')) {
      return 'india'
    }
  } catch (e) {}
  return 'global'
}

let region  = detectRegion() // 'india' | 'global'
let billing = 'monthly'      // 'monthly' | 'annual'

// Background fast country lookup (graceful fallback)
fetch('https://api.country.is/')
  .then(res => res.json())
  .then(data => {
    if (data && data.country === 'IN') {
      window.setRegion('india')
    } else if (data && data.country) {
      window.setRegion('global')
    }
  })
  .catch(() => {})

// ─── Nav Scroll Effect ────────────────────────────────────────────────────────
const nav = document.getElementById('nav')
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20)
  })
}

// ─── Pricing Toggles ─────────────────────────────────────────────────────────
window.setRegion = function (r) {
  region = r
  const btnIndia = document.getElementById('btn-india')
  const btnGlobal = document.getElementById('btn-global')
  if (btnIndia) btnIndia.classList.toggle('active', r === 'india')
  if (btnGlobal) btnGlobal.classList.toggle('active', r === 'global')
  updatePricing()
}

window.toggleBilling = function () {
  billing = billing === 'monthly' ? 'annual' : 'monthly'
  const toggle = document.getElementById('billing-toggle')
  if (toggle) toggle.classList.toggle('on', billing === 'annual')
  updatePricing()
}

function updatePricing() {
  const cloud = CLOUD_PRICES[region][billing]
  const cloudId = CLOUD_PRODUCT_IDS[region][billing]

  // Cloud price elements
  const cloudCurrency = document.getElementById('cloud-currency')
  const cloudAmount   = document.getElementById('cloud-amount')
  const cloudPeriod   = document.getElementById('cloud-period')
  const cloudNote     = document.getElementById('cloud-annual-note')
  const cloudBtn      = document.getElementById('cloud-btn')
  const saveBadge     = document.getElementById('save-badge')

  if (cloudCurrency) cloudCurrency.textContent = cloud.symbol
  if (cloudAmount)   cloudAmount.textContent   = cloud.amount
  if (cloudPeriod)   cloudPeriod.textContent   = cloud.period

  if (cloudNote) {
    cloudNote.textContent = cloud.effective
    cloudNote.style.display = billing === 'annual' ? 'block' : 'none'
  }

  if (saveBadge) {
    saveBadge.textContent = 'Save 20%'
  }

  // Cloud checkout link directly to Dodo Payments
  if (cloudBtn) {
    cloudBtn.href = CHECKOUT_BASE + cloudId
  }
}

// Initial pricing render
window.setRegion(region)

// ─── Scroll Reveal Animations ────────────────────────────────────────────────
const revealEls = document.querySelectorAll(
  '.feature-card, .plan-card, .download-card, .hero-proof, .hero-visual, .section-title, .section-subtitle, .comparison-table'
)
revealEls.forEach(el => el.classList.add('reveal'))

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60)
        observer.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.08 }
)
revealEls.forEach(el => observer.observe(el))

// ─── Waveform Animation ──────────────────────────────────────────────────────
;(function animatePill() {
  const pill = document.querySelector('.hero-visual-pill')
  if (!pill) return
  let active = true
  setInterval(() => {
    active = !active
    pill.style.opacity = active ? '1' : '0.75'
    pill.style.transform = active ? 'translateY(0)' : 'translateY(-2px)'
    pill.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
  }, 1400)
})()
