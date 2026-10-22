/**
 * LiteDaemon — Website JavaScript
 * Handles: pricing toggle, region toggle, nav scroll, scroll reveal animations
 */

// ─── Dodo Payments checkout URLs ─────────────────────────────────────────────
// Format: https://test.checkout.dodopayments.com/buy/PRODUCT_ID  (test mode)
// Format: https://checkout.dodopayments.com/buy/PRODUCT_ID       (live mode)
const CHECKOUT_BASE = 'https://checkout.dodopayments.com/buy/'

const PRODUCT_IDS = {
  byok: {
    india:  { monthly: 'pdt_0Nq1FwtH5b6kZwUUltVpV', annual: 'pdt_0Nq1GZ0tpiOdOzJV3Ai1Y' },
    global: { monthly: 'pdt_0Nq1I8tfZuKu3QR4Zd8et', annual: 'pdt_0Nq1IWgNwfCebIPUT5z1s' },
  },
  cloud: {
    india:  { monthly: 'pdt_0Nq1H1dHTZzfrQ1tdeYCP', annual: 'pdt_0Nq1Hjj1bZUR5HQ9hgraU' },
    global: { monthly: 'pdt_0Nq1IsTBvSZVraoe1aXnz', annual: 'pdt_0Nq1JGEZBp3f6bfs9CnE2' },
  },
}

const PRICES = {
  byok: {
    india:  { monthly: { symbol: '₹', amount: '149',  period: '/month', annualTotal: '₹1,199/year', annualMonthly: '₹100/mo', saving: '33%' },
               annual:  { symbol: '₹', amount: '1,199', period: '/year',  annualTotal: '',             annualMonthly: '₹100/mo', saving: '33%' } },
    global: { monthly: { symbol: '$', amount: '3.99', period: '/month', annualTotal: '$35/year',      annualMonthly: '$2.92/mo', saving: '27%' },
               annual:  { symbol: '$', amount: '35',   period: '/year',  annualTotal: '',              annualMonthly: '$2.92/mo', saving: '27%' } },
  },
  cloud: {
    india:  { monthly: { symbol: '₹', amount: '400',   period: '/month', annualTotal: '₹3,849/year', annualMonthly: '₹320/mo', saving: '20%' },
               annual:  { symbol: '₹', amount: '3,849', period: '/year',  annualTotal: '',             annualMonthly: '₹320/mo', saving: '20%' } },
    global: { monthly: { symbol: '$', amount: '15',    period: '/month', annualTotal: '$144/year',    annualMonthly: '$12/mo',  saving: '20%' },
               annual:  { symbol: '$', amount: '144',   period: '/year',  annualTotal: '',             annualMonthly: '$12/mo',  saving: '20%' } },
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

let region  = detectRegion()   // 'india' | 'global'
let billing = 'monthly' // 'monthly' | 'annual'

// Fast country verification
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


// ─── NAV scroll effect ────────────────────────────────────────────────────────
const nav = document.getElementById('nav')
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30)
})

// ─── Pricing toggles ─────────────────────────────────────────────────────────
window.setRegion = function (r) {
  region = r
  document.getElementById('btn-india').classList.toggle('active', r === 'india')
  document.getElementById('btn-global').classList.toggle('active', r === 'global')
  updatePricing()
}

window.toggleBilling = function () {
  billing = billing === 'monthly' ? 'annual' : 'monthly'
  const toggle = document.getElementById('billing-toggle')
  toggle.classList.toggle('on', billing === 'annual')
  updatePricing()
}

function updatePricing() {
  const byok  = PRICES.byok[region][billing]
  const cloud = PRICES.cloud[region][billing]
  const byokId  = PRODUCT_IDS.byok[region][billing]
  const cloudId = PRODUCT_IDS.cloud[region][billing]

  // BYOK price
  document.getElementById('byok-currency').textContent = byok.symbol
  document.getElementById('byok-amount').textContent   = byok.amount
  document.getElementById('byok-period').textContent   = byok.period

  // Cloud price
  document.getElementById('cloud-currency').textContent = cloud.symbol
  document.getElementById('cloud-amount').textContent   = cloud.amount
  document.getElementById('cloud-period').textContent   = cloud.period

  // Annual notes
  const byokNote  = document.getElementById('byok-annual-note')
  const cloudNote = document.getElementById('cloud-annual-note')

  if (billing === 'annual') {
    byokNote.style.display  = 'block'
    cloudNote.style.display = 'block'
    byokNote.textContent    = `Billed annually · Save ${byok.saving} vs monthly`
    cloudNote.textContent   = `Billed annually · Save ${cloud.saving} vs monthly`
    document.getElementById('save-badge').textContent = `Save up to ${byok.saving}`
  } else {
    byokNote.style.display  = 'none'
    cloudNote.style.display = 'none'
    document.getElementById('save-badge').textContent = 'Save up to 33%'
  }

  // Checkout buttons
  document.getElementById('byok-btn').href  = CHECKOUT_BASE + byokId
  document.getElementById('cloud-btn').href = CHECKOUT_BASE + cloudId
}

// Init
window.setRegion(region)

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
const revealEls = document.querySelectorAll(
  '.feature-card, .plan-card, .download-card, .hero-proof, .hero-visual, .section-title, .section-subtitle'
)
revealEls.forEach(el => el.classList.add('reveal'))

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80)
        observer.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.1 }
)
revealEls.forEach(el => observer.observe(el))

// ─── Animated waveform bars ───────────────────────────────────────────────────
// Continuously animate the "listening" indicator bar heights
;(function animateBars() {
  const pill = document.querySelector('.hero-visual-pill')
  if (!pill) return
  let visible = true
  setInterval(() => {
    visible = !visible
    pill.style.opacity = visible ? '1' : '0.6'
    pill.style.transition = 'opacity 0.5s'
  }, 1200)
})()

// ─── RAM bar animation ────────────────────────────────────────────────────────
// Animate the RAM comparison bars when they come into view
const barObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fills = entry.target.querySelectorAll('.feature-bar-fill')
        fills.forEach(f => {
          const target = f.style.width
          f.style.width = '0%'
          setTimeout(() => { f.style.width = target }, 200)
        })
        barObserver.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.3 }
)
const ramCard = document.getElementById('feature-ram')
if (ramCard) barObserver.observe(ramCard)
