import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_EMOJI = { pending:'⏳', confirmed:'✅', shipped:'🚚', delivered:'🎉', cancelled:'❌' };

// ── Orders List ───────────────────────────────────────────────
export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 10, ...(status && { status }) });
    api.get(`/orders?${params}`)
      .then(r => { setOrders(r.data.data.orders); setTotalPages(r.data.data.pagination.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, status]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">My Orders</h1>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input w-auto text-sm">
          <option value="">All Status</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {!orders.length ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="font-display text-xl font-bold mb-2">No orders yet</h2>
          <Link to="/products" className="btn-primary inline-block mt-2">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`}
              className="card p-4 flex items-center justify-between hover:border-2 hover:border-primary/20 transition-all">
              <div>
                <p className="font-semibold text-sm text-gray-800">Order #{order.id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-gray-500 mt-0.5">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold text-gray-900 mt-1">₹{order.total_amount?.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <span className={`badge ${STATUS_COLORS[order.status]} font-medium`}>
                  {STATUS_EMOJI[order.status]} {order.status}
                </span>
                <p className="text-xs text-primary mt-2">View Details →</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg font-medium text-sm transition-colors ${p === page ? 'bg-primary text-white' : 'bg-white border border-gray-200 hover:border-primary text-gray-600'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Order Detail ──────────────────────────────────────────────
export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><div className="skeleton h-96 rounded-2xl" /></div>;
  if (!order) return <div className="max-w-3xl mx-auto px-4 py-16 text-center"><p>Order not found</p></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/orders" className="text-primary text-sm hover:underline">← All Orders</Link>
      </div>

      <div className="card p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-display text-xl font-bold">Order #{order.id.slice(-8).toUpperCase()}</h1>
            <p className="text-gray-500 text-sm mt-1">{new Date(order.created_at).toLocaleString('en-IN')}</p>
          </div>
          <span className={`badge ${STATUS_COLORS[order.status]} font-medium text-sm px-3 py-1`}>
            {STATUS_EMOJI[order.status]} {order.status}
          </span>
        </div>

        {/* Order items */}
        <h2 className="font-semibold text-gray-700 mb-3">Items Ordered</h2>
        <div className="space-y-3 mb-4">
          {order.order_items?.map(item => (
            <div key={item.id} className="flex gap-3 items-center p-3 bg-gray-50 rounded-xl">
              {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-14 h-14 object-cover rounded-lg" />}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.unit_price?.toLocaleString('en-IN')}</p>
              </div>
              <p className="font-bold text-sm">₹{item.total_price?.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.total_amount?.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between text-gray-600"><span>Delivery</span><span className="text-green-600">FREE</span></div>
          <div className="flex justify-between font-bold text-base mt-2">
            <span>Total</span><span>₹{order.total_amount?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="card p-4 text-sm text-gray-600">
        <h3 className="font-semibold text-gray-800 mb-2">Payment & Delivery</h3>
        <p>Payment: <strong className="text-gray-800">{order.payment_method?.toUpperCase()}</strong></p>
        <p>Payment Status: <strong className={order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>{order.payment_status}</strong></p>
      </div>
    </div>
  );
}
