/* eslint-disable */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axiosClient from '../api/axiosClient';
import { Loader2, AlertTriangle, BookOpen, Trash2, Clock, XCircle, QrCode, X, ShieldAlert } from 'lucide-react';

// ────────────────────────────────────────────────────────────
// Config VietQR – thay BANK_ID và ACCOUNT_NO theo tài khoản thật
// ────────────────────────────────────────────────────────────
const VIETQR_BANK    = '970422';        // MB Bank (BIN)
const VIETQR_ACCOUNT = '0123456789';    // Số tài khoản nhận tiền
const VIETQR_NAME    = 'THU%20VIEN%20SACH'; // Tên chủ tài khoản (URL-encoded)
const LATE_FEE       = 50000;

function buildVietQRUrl(borrowId) {
  const info = `Phi%20tre%20han%20don%20${borrowId}`;
  return `https://img.vietqr.io/image/${VIETQR_BANK}-${VIETQR_ACCOUNT}-compact2.jpg?amount=${LATE_FEE}&addInfo=${info}&accountName=${VIETQR_NAME}`;
}

// Kiểm tra quá hạn (chỉ áp dụng khi chưa trả)
function isOverdue(item) {
  if (item.status === 1) return false; // đã trả rồi
  const due = item.dueDate || item.returnDate || item.DueDate || item.ReturnDate;
  if (!due) return false;
  return new Date(due) < new Date();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ────────────────────────────────────────────────────────────
// Modal QR thanh toán
// ────────────────────────────────────────────────────────────
const LateFeeModal = ({ borrow, onClose, onPaid }) => {
  const qrUrl = buildVietQRUrl(borrow.id);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-orange-500 px-6 py-5 flex justify-between items-start">
          <div>
            <div className="text-white/70 text-[10px] font-black uppercase tracking-widest">Phí trả trễ</div>
            <div className="text-white text-3xl font-black mt-1">
              {LATE_FEE.toLocaleString('vi-VN')}₫
            </div>
          </div>
          <button onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors mt-1">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col items-center gap-4">
          <p className="text-slate-500 text-xs text-center leading-relaxed">
            Đơn mượn <span className="font-bold text-slate-700">"{borrow.book?.title || `#${borrow.bookId}`}"</span> đã
            quá hạn. Vui lòng quét mã QR để thanh toán phí trả trễ.
          </p>

          {/* QR */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-3 bg-slate-50">
            <img
              src={qrUrl}
              alt="VietQR thanh toán phí trễ"
              className="w-56 h-56 object-contain rounded-xl"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback nếu ảnh lỗi */}
            <div className="w-56 h-56 hidden items-center justify-center flex-col gap-2 text-slate-400">
              <QrCode size={48} />
              <span className="text-xs text-center">Không tải được QR.<br/>Vui lòng thử lại.</span>
            </div>
          </div>

          <div className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-500 space-y-1">
            <div className="flex justify-between"><span>Ngân hàng:</span><span className="font-bold text-slate-700">MB Bank</span></div>
            <div className="flex justify-between"><span>Số TK:</span><span className="font-bold text-slate-700 font-mono">{VIETQR_ACCOUNT}</span></div>
            <div className="flex justify-between"><span>Số tiền:</span><span className="font-bold text-rose-600">{LATE_FEE.toLocaleString('vi-VN')}₫</span></div>
            <div className="flex justify-between"><span>Nội dung:</span><span className="font-bold text-slate-700">Phi tre han don {borrow.id}</span></div>
          </div>

          <p className="text-[10px] text-slate-400 text-center">
            Sau khi thanh toán, nhấn <strong>"Xác nhận đã thanh toán"</strong>. Thủ thư sẽ kiểm duyệt và mở lại quyền mượn sách.
          </p>

          <button
            onClick={onPaid}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-3 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-emerald-100 text-sm"
          >
            ✓ Xác nhận đã thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// Component chính
// ────────────────────────────────────────────────────────────
const Borrows = () => {
  const [borrows, setBorrows]       = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [modalBorrow, setModalBorrow] = useState(null); // borrow đang hiện modal QR
  // Danh sách id đã "xác nhận thanh toán" (lưu local, chờ thủ thư duyệt)
  const [paidIds, setPaidIds]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('lateFee_paid') || '[]'); } catch { return []; }
  });

  const storedUser = useMemo(() => {
    const data = localStorage.getItem('user');
    if (!data) return null;
    try {
      const u = JSON.parse(data);
      return {
        id: u.id || u.Id || u.userId,
        username: u.username || u.Username,
        role: (u.role || u.Role || 'User').toString().toLowerCase()
      };
    } catch { return null; }
  }, []);

  const isAdmin = storedUser?.role === 'admin';

  const fetchData = useCallback(async (isMounted) => {
    if (isMounted) setIsLoading(true);
    try {
      const res = await axiosClient.get('/Borrows');
      const rawData = Array.isArray(res) ? res : (res.data || []);
      if (isMounted) {
        if (isAdmin) {
          setBorrows(rawData);
        } else {
          const myId = storedUser?.id?.toString().toLowerCase();
          const filtered = rawData.filter(item => {
            const itemUserId = (item.userId || item.UserId)?.toString().toLowerCase();
            return itemUserId === myId;
          });
          setBorrows(filtered);
        }
      }
    } catch {
      console.log('Lỗi kết nối');
    } finally {
      if (isMounted) setIsLoading(false);
    }
  }, [isAdmin, storedUser?.id]);

  useEffect(() => {
    let active = true;
    fetchData(active);
    return () => { active = false; };
  }, [fetchData]);

  const handleReturn = async (id) => {
    if (!window.confirm('Xác nhận đã thu hồi sách này?')) return;
    try {
      await axiosClient.put(`/Borrows/return/${id}`);
      fetchData(true);
    } catch { alert('Lỗi cập nhật'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return;
    try {
      await axiosClient.delete(`/Borrows/${id}`);
      fetchData(true);
    } catch { alert('Lỗi xóa'); }
  };

  const handleConfirmPaid = (borrowId) => {
    const updated = [...paidIds, borrowId];
    setPaidIds(updated);
    localStorage.setItem('lateFee_paid', JSON.stringify(updated));
    setModalBorrow(null);
    alert('Đã ghi nhận xác nhận thanh toán. Thủ thư sẽ kiểm duyệt và mở lại quyền mượn sách của bạn!');
  };

  // Kiểm tra user có đơn quá hạn chưa thanh toán không
  const hasUnpaidOverdue = !isAdmin && borrows.some(
    item => isOverdue(item) && !paidIds.includes(item.id)
  );

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin text-blue-500" size={40} />
      <p className="text-slate-400 font-medium italic">Đang tải lịch sử...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3">
            <BookOpen className="text-blue-600" size={36} />
            {isAdmin ? 'QUẢN LÝ MƯỢN TRẢ' : 'LỊCH SỬ MƯỢN SÁCH'}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Xin chào, <span className="text-blue-600 font-bold">{storedUser?.username}</span>
            {isAdmin ? ' (Quản trị viên)' : ' (Thành viên)'}
          </p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 text-right">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng đơn</div>
          <div className="text-3xl font-black text-slate-700">{borrows.length}</div>
        </div>
      </div>

      {/* Banner cảnh báo khóa mượn */}
      {hasUnpaidOverdue && (
        <div className="mb-6 flex items-start gap-4 bg-rose-50 border border-rose-200 rounded-2xl px-6 py-4 shadow-sm">
          <ShieldAlert className="text-rose-500 shrink-0 mt-0.5" size={24} />
          <div>
            <div className="font-black text-rose-700 text-sm uppercase tracking-wide">
              Tài khoản bị tạm khóa quyền mượn
            </div>
            <p className="text-rose-600 text-xs mt-1 leading-relaxed">
              Bạn có đơn mượn quá hạn chưa thanh toán phí trễ. Vui lòng thanh toán <strong>50.000₫/đơn</strong> để tiếp tục mượn sách.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Người mượn</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tên Sách</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Hạn trả</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
              {!isAdmin && (
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Phí trễ</th>
              )}
              {isAdmin && (
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Phí trễ</th>
              )}
              {isAdmin && (
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Hành động</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {borrows.map((item) => {
              const overdue   = isOverdue(item);
              const alreadyPaid = paidIds.includes(item.id);
              const dueDate   = item.dueDate || item.returnDate || item.DueDate || item.ReturnDate;

              return (
                <tr key={item.id}
                    className={`hover:bg-blue-50/20 transition-colors group ${overdue && !alreadyPaid ? 'bg-rose-50/40' : ''}`}>
                  {/* Người mượn */}
                  <td className="p-6">
                    <div className="font-bold text-slate-700">{item.borrowerName || 'Thành viên'}</div>
                    <div className="text-[10px] text-slate-400 font-mono">UID: {item.userId?.substring(0, 8)}...</div>
                  </td>

                  {/* Tên sách */}
                  <td className="p-6">
                    <div className="font-extrabold text-slate-800">{item.book?.title || `Sách #${item.bookId}`}</div>
                  </td>

                  {/* Hạn trả */}
                  <td className="p-6 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold
                      ${item.status === 1
                        ? 'bg-slate-100 text-slate-400'
                        : overdue
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-blue-50 text-blue-600'}`}>
                      <Clock size={11} />
                      {formatDate(dueDate)}
                      {overdue && item.status !== 1 && (
                        <span className="ml-1 bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase">
                          Quá hạn
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td className="p-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase
                      ${item.status === 1
                        ? 'bg-emerald-100 text-emerald-700'
                        : overdue && alreadyPaid
                          ? 'bg-violet-100 text-violet-700'
                          : overdue
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'}`}>
                      {item.status === 1
                        ? 'Đã trả'
                        : overdue && alreadyPaid
                          ? 'Đã trả phí muộn'
                          : overdue
                            ? 'Quá hạn'
                            : 'Đang mượn'}
                    </span>
                  </td>

                  {/* Cột phí trễ (user) */}
                  {!isAdmin && (
                    <td className="p-6 text-center">
                      {overdue && item.status !== 1 ? (
                        alreadyPaid ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-teal-50 text-teal-600 text-[10px] font-black uppercase">
                            ✓ Chờ duyệt
                          </span>
                        ) : (
                          <button
                            onClick={() => setModalBorrow(item)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500
                                       text-white text-[10px] font-black uppercase shadow-lg shadow-rose-100
                                       hover:opacity-90 hover:scale-105 transition-all"
                          >
                            <QrCode size={13} />
                            Trả phí trễ 50.000₫
                          </button>
                        )
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  )}

                  {/* Cột phí trễ (admin) */}
                  {isAdmin && (
                    <td className="p-6 text-center">
                      {overdue && item.status !== 1 ? (
                        alreadyPaid ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-black uppercase border border-violet-200">
                            ✓ Đã trả phí
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 text-rose-500 text-[10px] font-black uppercase border border-rose-200">
                            ✗ Chưa trả phí
                          </span>
                        )
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  )}

                  {/* Cột hành động (admin) */}
                  {isAdmin && (
                    <td className="p-6">
                      <div className="flex justify-center gap-2 flex-wrap">
                        {item.status !== 1 && (
                          overdue && !alreadyPaid ? (
                            <button
                              onClick={() => handleReturn(item.id)}
                              title="Người dùng chưa trả phí trễ"
                              className="bg-orange-500 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-orange-600 shadow-lg shadow-orange-100 flex items-center gap-1"
                            >
                              <span>⚠</span> TRẢ SÁCH
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReturn(item.id)}
                              className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                            >
                              TRẢ SÁCH
                            </button>
                          )
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {borrows.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <AlertTriangle className="text-slate-200" size={48} />
            <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">Không tìm thấy dữ liệu</div>
          </div>
        )}
      </div>

      {/* Modal QR */}
      {modalBorrow && (
        <LateFeeModal
          borrow={modalBorrow}
          onClose={() => setModalBorrow(null)}
          onPaid={() => handleConfirmPaid(modalBorrow.id)}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
      `}</style>
    </div>
  );
};

export default Borrows;