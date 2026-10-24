// Supabase Edge Function: dodo-webhook
// Handles Dodo Payments webhooks to:
//   1. Upgrade user account to Pro in `profiles` table (existing)
//   2. Record plan_type ('byok' or 'cloud') in `user_plans` table (new - Part 2)

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://nlfbtfwcsvoaliuvfwya.supabase.co"
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

// -----------------------------------------------------------------------------
// Product ID → Plan Type mapping
// BYOK products: user brings their own API keys
// Cloud products: LiteDaemon provides managed API keys (cloud service)
// -----------------------------------------------------------------------------
const BYOK_PRODUCT_IDS = new Set([
  "pdt_0Nq1FwtH5b6kZwUUltVpV", // BYOK India Monthly
  "pdt_0Nq1GZ0tpiOdOzJV3Ai1Y", // BYOK India Annual
  "pdt_0Nq1I8tfZuKu3QR4Zd8et", // BYOK Global Monthly
  "pdt_0Nq1IWgNwfCebIPUT5z1s",  // BYOK Global Annual
])

const CLOUD_PRODUCT_IDS = new Set([
  "pdt_0Nq1H1dHTZzfrQ1tdeYCP", // Cloud India Monthly
  "pdt_0Nq1Hjj1bZUR5HQ9hgraU", // Cloud India Annual
  "pdt_0Nq1IsTBvSZVraoe1aXnz", // Cloud Global Monthly
  "pdt_0Nq1JGEZBp3f6bfs9CnE2", // Cloud Global Annual
])

function getPlanType(productId: string): "byok" | "cloud" | null {
  if (BYOK_PRODUCT_IDS.has(productId)) return "byok"
  if (CLOUD_PRODUCT_IDS.has(productId)) return "cloud"
  return null
}

// Helper: fetch with service role auth headers
function supabaseHeaders() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const payload = await req.json()
    console.log("Dodo webhook event received:", JSON.stringify(payload))

    const eventType = payload.type || payload.event || ""
    const data = payload.data || {}
    const email = data.customer?.email || data.email
    const productId = data.product_id || data.items?.[0]?.price?.product_id || ""
    const subscriptionId = data.subscription_id || data.id || ""

    if (!email) {
      return new Response(JSON.stringify({ message: "No email found in event, skipped" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const isPro =
      eventType.includes("payment.succeeded") ||
      eventType.includes("subscription.active") ||
      eventType.includes("subscription.renewed") ||
      data.status === "active" ||
      data.status === "succeeded"

    // Only Cloud subscriptions grant Pro status. BYOK is free forever.
    const planType = productId ? getPlanType(productId) : null
    const isCloudPro = isPro && planType === "cloud"
    const plan = isCloudPro ? "pro" : "free"
    const status = isPro ? "active" : (data.status || "inactive")


    // -------------------------------------------------------------------------
    // Step 1 (existing): Update `profiles` table with plan + status
    // -------------------------------------------------------------------------
    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`,
      {
        method: "PATCH",
        headers: supabaseHeaders(),
        body: JSON.stringify({
          plan: plan,
          status: status,
          updated_at: new Date().toISOString(),
        }),
      }
    )
    const profileResult = await profileRes.json().catch(() => null)
    console.log(`Profiles updated for ${email}: plan=${plan}, status=${status}`, profileResult)

    // -------------------------------------------------------------------------
    // Step 2 (new): Upsert `user_plans` table with plan_type ('byok' or 'cloud')
    // We look up the user's UUID from `profiles` first, then upsert user_plans.
    // -------------------------------------------------------------------------
    if (isPro && productId) {
      const planType = getPlanType(productId)

      if (planType) {
        // Look up the user's UUID via their email in profiles
        const lookupRes = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id`,
          {
            method: "GET",
            headers: supabaseHeaders(),
          }
        )
        const lookupData = await lookupRes.json().catch(() => [])
        const userId = Array.isArray(lookupData) && lookupData[0]?.id

        if (userId) {
          // Upsert into user_plans — one row per user, update if they switch plans
          const plansRes = await fetch(
            `${SUPABASE_URL}/rest/v1/user_plans`,
            {
              method: "POST",
              headers: {
                ...supabaseHeaders(),
                Prefer: "resolution=merge-duplicates,return=representation",
              },
              body: JSON.stringify({
                user_id: userId,
                plan_type: planType,
                dodo_product_id: productId,
                dodo_subscription_id: subscriptionId,
                updated_at: new Date().toISOString(),
              }),
            }
          )
          const plansResult = await plansRes.json().catch(() => null)
          console.log(`user_plans upserted for ${email}: plan_type=${planType}`, plansResult)
        } else {
          console.warn(`Could not find user UUID for email: ${email}`)
        }
      } else {
        console.warn(`Unknown product_id: ${productId} — skipping user_plans upsert`)
      }
    }

    return new Response(
      JSON.stringify({ success: true, email, plan, status, productId }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (err) {
    console.error("Webhook processing error:", err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
