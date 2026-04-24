import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Star, MessageSquare, Trash2, User, Book as BookIcon, Quote } from 'lucide-react';

const Reviews = () => {
  // 1. Luôn khởi tạo mảng rỗng để tránh lỗi render
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Bỏ .data vì axiosClient đã bóc tách sẵn
    axiosClient.get('/Reviews')
      .then(res => {
        setReviews(Array.isArray(res) ? res : []);
      })
      .catch(err => console.error("Lỗi tải đánh giá:", err))
      .finally(() => setLoading(false));
  }, []);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star 
        key={index} 
        size={14} 
        className={index < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"} 
      />
    ));
  };

  if (loading) return <div className="p-8 text-slate-500 animate-pulse">Đang tải phản hồi...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Phản hồi từ độc giả</h1>
          <p className="text-slate-500 mt-1">Nơi lắng nghe ý kiến và cải thiện chất lượng kho sách.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              {/* Trang trí góc thẻ */}
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Quote size={64} />
              </div>

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm">
                    {rev.userName ? rev.userName.charAt(0).toUpperCase() : <User size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{rev.userName || "Người dùng ẩn danh"}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {renderStars(rev.rating)}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    if(window.confirm("Xóa đánh giá này?")) {
                      await axiosClient.delete(`/Reviews/${rev.id}`);
                      setReviews(reviews.filter(r => r.id !== rev.id));
                    }
                  }}
                  className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4 text-blue-600 bg-blue-50/50 px-3 py-1.5 rounded-xl w-fit border border-blue-100">
                <BookIcon size={14} />
                <span className="text-[11px] font-black uppercase tracking-tight truncate max-w-[150px]">
                  {rev.bookTitle || "Sách đã xóa"}
                </span>
              </div>

              <div className="relative">
                <p className="text-slate-600 text-sm italic leading-relaxed min-h-[60px]">
                  "{rev.comment || "Không có bình luận."}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1 opacity-60">Verified Reader</span>
                <span>{new Date(rev.reviewDate || Date.now()).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="text-slate-200" size={40} />
            </div>
            <p className="text-slate-400 font-medium tracking-tight">Chưa có đánh giá nào từ độc giả, chủ nhân ơi!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;