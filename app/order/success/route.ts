// Backward-compatible PayU callback route. Older checkout sessions may still
// post here, so route them through the same authoritative reconciliation used
// by every current checkout. This path must never create an order from callback
// fields: the signed response can only confirm a server-created pending order.
export { GET, POST } from "@/app/api/payments/payu/success/route";
