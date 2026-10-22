// Supabase Edge Function: dodo-webhook
// Handles Dodo Payments webhooks to automatically upgrade user accounts to Pro

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://nlfbtfwcsvoaliuvfwya.supabase.co"
const SERVICE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZmJ0Zndjc3ZvYWxpdXZmd3lhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjY4NDcyNywiZXhwIjoyMTA4MjYwNzI3fQ.0JfbVNam3uxwmZXsyb__oCuWgMRJPjoDe3nAgJcAoZw"

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

    const plan = isPro ? "pro" : "free"
    const status = isPro ? "active" : (data.status || "inactive")

    // Update profiles directly via Supabase PostgREST with Service Role Key
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`,
      {
        method: "PATCH",
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          plan: plan,
          status: status,
          updated_at: new Date().toISOString(),
        }),
      }
    )

    const result = await updateRes.json().catch(() => null)
    console.log(`Updated user ${email}: plan=${plan}, status=${status}`, result)

    return new Response(JSON.stringify({ success: true, email, plan, status, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("Webhook processing error:", err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
