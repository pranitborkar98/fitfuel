"use client";

import { useMemo, useState } from "react";
import styles from "./orders.module.css";

type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

type OrderItem = {
  kind: "PLAN" | "DISH";
  dishName: string | null;
  addOnLabel: string | null;
  diet: string | null;
  duration: string | null;
  mealsPerDay: string | null;
  totalRs: number;
  quantity: number;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  subtotalRs: number;
  gstRs: number;
  discountRs: number;
  totalRs: number;
  couponCode: string | null;
  payuTxnId: string | null;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  user: { name: string | null; email: string | null; phone: string | null };
  address: {
    line1: string;
    line2: string | null;
    area: string;
    city: string;
    pincode: string;
    landmark: string | null;
  } | null;
  items: OrderItem[];
};

type UpdatedOrder = Pick<Order, "id" | "paymentStatus" | "status">;
type PaymentAction = Exclude<PaymentStatus, "PENDING">;
type ApiResponse = { order: UpdatedOrder; reconciled?: boolean; error?: string };

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const orderDate = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function pretty(value: string | null | undefined) {
  if (!value) return "—";
  return value.replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase());
}

function statusClass(status: PaymentStatus) {
  if (status === "SUCCESS") return styles.statusSuccess;
  if (status === "PENDING") return styles.statusPending;
  if (status === "FAILED") return styles.statusFailed;
  return styles.statusRefunded;
}

function itemLabel(item: OrderItem) {
  if (item.kind === "DISH") {
    return [item.dishName ?? "Dish", item.addOnLabel].filter(Boolean).join(" · ");
  }
  return [item.diet, item.duration, item.mealsPerDay].map(pretty).filter((value) => value !== "—").join(" · ");
}

async function updatePayment(id: string, paymentStatus: PaymentAction): Promise<ApiResponse> {
  const response = await fetch("/api/admin/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "setPaymentStatus", id, paymentStatus }),
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse | null;
  if (!response.ok || !payload?.order) throw new Error(payload?.error ?? "Order reconciliation failed.");
  return payload;
}

export default function OrdersView({ orders }: { orders: Order[] }) {
  const [list, setList] = useState(orders);
  const [query, setQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "">("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return list.filter((order) => {
      if (paymentFilter && order.paymentStatus !== paymentFilter) return false;
      if (!needle) return true;
      const haystack = [
        order.orderNumber,
        order.user.name,
        order.user.email,
        order.user.phone,
        order.address?.area,
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [list, paymentFilter, query]);

  const paidRevenue = filtered
    .filter((order) => order.paymentStatus === "SUCCESS")
    .reduce((total, order) => total + order.totalRs, 0);
  const attentionCount = filtered.filter((order) => ["PENDING", "FAILED"].includes(order.paymentStatus)).length;

  function applyUpdate(updated: UpdatedOrder) {
    setList((current) => current.map((order) => (
      order.id === updated.id ? { ...order, paymentStatus: updated.paymentStatus, status: updated.status } : order
    )));
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Customer operations</p>
          <h1>Orders and payments</h1>
          <p>Find an order, verify what was sold, and repair payment accounting without creating duplicate access.</p>
        </div>
        <div className={styles.headerCount} aria-label={`${list.length} recent orders`}>
          <strong>{list.length}</strong>
          <span>recent orders</span>
        </div>
      </header>

      <section className={styles.metrics} aria-label="Filtered order summary">
        <article>
          <span>Shown</span>
          <strong>{filtered.length}</strong>
          <small>of {list.length} loaded</small>
        </article>
        <article>
          <span>Paid revenue</span>
          <strong>{money.format(paidRevenue)}</strong>
          <small>from the current view</small>
        </article>
        <article className={attentionCount > 0 ? styles.attentionMetric : undefined}>
          <span>Needs attention</span>
          <strong>{attentionCount}</strong>
          <small>pending or failed</small>
        </article>
      </section>

      <section className={styles.filters} aria-label="Order filters">
        <label>
          <span>Search orders</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Order number, customer, phone or area"
          />
        </label>
        <label>
          <span>Payment status</span>
          <select
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value as PaymentStatus | "")}
          >
            <option value="">All payments</option>
            <option value="PENDING">Pending</option>
            <option value="SUCCESS">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </label>
      </section>

      <section className={styles.orderList} aria-label="Orders">
        <div className={styles.columnHead} aria-hidden="true">
          <span>Order</span><span>Customer</span><span>Payment</span><span>Order status</span><span>Total</span><span />
        </div>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <strong>No matching orders</strong>
            <span>Try clearing the search or payment filter.</span>
          </div>
        ) : filtered.map((order) => {
          const isExpanded = expanded === order.id;
          const detailId = `order-details-${order.id}`;
          return (
            <article className={styles.order} key={order.id}>
              <button
                type="button"
                className={styles.orderSummary}
                onClick={() => setExpanded(isExpanded ? null : order.id)}
                aria-expanded={isExpanded}
                aria-controls={detailId}
              >
                <span className={styles.orderIdentity}>
                  <strong>{order.orderNumber}</strong>
                  <small>{orderDate.format(new Date(order.createdAt))}</small>
                </span>
                <span className={styles.customer}>
                  <strong>{order.user.name ?? "Unnamed customer"}</strong>
                  <small>{order.user.phone ?? order.user.email ?? "No contact saved"}</small>
                </span>
                <span>
                  <span className={`${styles.status} ${statusClass(order.paymentStatus)}`}>{pretty(order.paymentStatus)}</span>
                  <small className={styles.method}>{pretty(order.paymentMethod)}</small>
                </span>
                <span className={styles.orderState}>{pretty(order.status)}</span>
                <strong className={styles.total}>{money.format(order.totalRs)}</strong>
                <span className={styles.chevron} aria-hidden="true">{isExpanded ? "−" : "+"}</span>
              </button>

              {isExpanded ? (
                <div className={styles.details} id={detailId}>
                  <section>
                    <h2>What they ordered</h2>
                    <div className={styles.itemList}>
                      {order.items.length === 0 ? <p>No order items were saved.</p> : order.items.map((item, index) => (
                        <div className={styles.item} key={`${item.kind}-${index}`}>
                          <span>
                            <strong>{itemLabel(item)}</strong>
                            <small>{item.quantity > 1 ? `Quantity ${item.quantity}` : pretty(item.kind)}</small>
                          </span>
                          <strong>{money.format(item.totalRs)}</strong>
                        </div>
                      ))}
                    </div>

                    <h2>Delivery address</h2>
                    {order.address ? (
                      <address>
                        {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
                        {order.address.area}, {order.address.city} {order.address.pincode}
                        {order.address.landmark ? <><br />Near {order.address.landmark}</> : null}
                      </address>
                    ) : <p>No delivery address on this order.</p>}
                  </section>

                  <section>
                    <h2>Amount paid</h2>
                    <dl className={styles.amounts}>
                      <div><dt>Subtotal</dt><dd>{money.format(order.subtotalRs)}</dd></div>
                      {order.discountRs > 0 ? (
                        <div><dt>Discount{order.couponCode ? ` · ${order.couponCode}` : ""}</dt><dd>−{money.format(order.discountRs)}</dd></div>
                      ) : null}
                      <div><dt>GST</dt><dd>{money.format(order.gstRs)}</dd></div>
                      <div className={styles.amountTotal}><dt>Total</dt><dd>{money.format(order.totalRs)}</dd></div>
                    </dl>

                    <h2>Payment reference</h2>
                    <p className={styles.reference}>{order.payuTxnId ?? "No PayU reference — likely cash on delivery"}</p>

                    <PaymentControl order={order} onUpdated={applyUpdate} />
                  </section>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </main>
  );
}

function PaymentControl({ order, onUpdated }: { order: Order; onUpdated: (updated: UpdatedOrder) => void }) {
  const [busy, setBusy] = useState<PaymentAction | "RECONCILE" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const actions: Array<{ value: PaymentAction; label: string; tone?: "danger" }> =
    order.paymentStatus === "PENDING"
      ? [{ value: "SUCCESS", label: "Mark as paid" }, { value: "FAILED", label: "Mark as failed", tone: "danger" }]
      : order.paymentStatus === "FAILED"
        ? [{ value: "SUCCESS", label: "Payment recovered" }]
        : order.paymentStatus === "SUCCESS"
          ? [{ value: "REFUNDED", label: "Record refund", tone: "danger" }]
          : [];

  async function submit(paymentStatus: PaymentAction, reconcile = false) {
    const confirmed = window.confirm(
      reconcile
        ? "Re-run access and commercial accounting for this paid order? This operation is safe to retry."
        : paymentStatus === "REFUNDED"
          ? "Only continue if the customer’s money has already been returned. FitFuel will record the refund and reverse access, coupon, credit and referral accounting."
          : paymentStatus === "SUCCESS"
            ? "Confirm that payment was received? FitFuel will confirm the order and create or repair customer access and accounting."
            : "Confirm that this payment failed? The order will be closed and any partial accounting reversed.",
    );
    if (!confirmed) return;

    setBusy(reconcile ? "RECONCILE" : paymentStatus);
    setError(null);
    setMessage(null);
    try {
      const result = await updatePayment(order.id, paymentStatus);
      onUpdated(result.order);
      setMessage(result.reconciled ? "Access and commercial accounting checked." : "Payment and order status updated.");
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Order reconciliation failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={styles.paymentControl}>
      <h2>Payment actions</h2>
      <div className={styles.paymentActions}>
        {order.paymentStatus === "SUCCESS" ? (
          <button type="button" disabled={busy !== null} onClick={() => submit("SUCCESS", true)}>
            {busy === "RECONCILE" ? "Checking…" : "Repair access & accounting"}
          </button>
        ) : null}
        {actions.map((action) => (
          <button
            type="button"
            className={action.tone === "danger" ? styles.dangerButton : undefined}
            disabled={busy !== null}
            onClick={() => submit(action.value)}
            key={action.value}
          >
            {busy === action.value ? "Saving…" : action.label}
          </button>
        ))}
        {order.paymentStatus === "REFUNDED" ? <p className={styles.finalState}>Refunded is a final payment state.</p> : null}
      </div>
      <p className={styles.paymentHelp}>
        Paid creates or repairs access and accounting. “Record refund” never moves money at PayU; use it only after the refund is complete.
      </p>
      {message ? <p className={styles.successMessage} role="status">{message}</p> : null}
      {error ? <p className={styles.errorMessage} role="alert">{error}</p> : null}
    </div>
  );
}
