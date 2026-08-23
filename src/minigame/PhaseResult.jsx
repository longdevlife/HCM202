import React from 'react';
import { getPolicyCycle } from './policyCycles.js';

const METRIC_LABELS = {
  foodSecurity: { label: 'An Ninh Lương Thực', icon: '🌾', color: '#10b981' },
  industrialOutput: { label: 'Sản Lượng Công Nghiệp', icon: '🏭', color: '#0ea5e9' },
  socialStability: { label: 'Ổn Định Xã Hội', icon: '🤝', color: '#f59e0b' },
  foreignCurrency: { label: 'Dự Trữ Ngoại Tệ', icon: '💵', color: '#8b5cf6' },
  policySupport: { label: 'Ủng Hộ Đổi Mới Thể Chế', icon: '🏛️', color: '#ec4899' }
};

export const PhaseResult = ({
  phaseId,
  result,
  playerScoreData = null,
  phaseEndsAt = null,
  isFinished = false
}) => {
  const cycle = getPolicyCycle(phaseId);
  const macroDelta = result?.macroDelta || {};
  const macro = result?.macro || {};
  const agri = result?.agriculture;
  const ind = result?.industry;

  return (
    <div className="phase-result-container bg-slate-900/95 border border-slate-700/80 rounded-xl p-4 shadow-2xl text-slate-100 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-700/60 pb-3 mb-4 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold mr-2">
            Kết Quả Năm {cycle?.year || ''}
          </span>
          <h3 className="text-base font-bold text-slate-100 inline">
            Quyết định đa số: <span className="text-amber-400 font-extrabold">{result?.winningOptionTitle || 'Chính sách đã chọn'}</span>
          </h3>
        </div>
        {phaseEndsAt && !isFinished && (
          <div className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30 font-semibold">
            Chuyển phase sau: {Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000))}s
          </div>
        )}
      </div>

      {/* Individual Player Score Delta if available */}
      {playerScoreData && (
        <div className="mb-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Điểm số cá nhân vòng này</span>
            <span className="text-lg font-black text-amber-400">
              {playerScoreData.scoreDelta >= 0 ? `+${playerScoreData.scoreDelta}` : playerScoreData.scoreDelta} Điểm
            </span>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed font-mono">
            {playerScoreData.explanation || playerScoreData.lastExplanation || ''}
          </div>
        </div>
      )}

      {/* Macro Impact Metrics Grid */}
      <div className="mb-4">
        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Tác Động Chỉ Số Vĩ Mô</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {Object.entries(METRIC_LABELS).map(([key, meta]) => {
            const delta = macroDelta[key] || 0;
            const currentVal = macro[key] ?? 50;

            return (
              <div key={key} className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span>{meta.icon} {meta.label}</span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-bold text-slate-100">{currentVal}</span>
                  <span className={`text-xs font-black font-mono px-1.5 py-0.5 rounded ${
                    delta > 0 ? 'bg-emerald-500/20 text-emerald-400' :
                    delta < 0 ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-700/50 text-slate-400'
                  }`}>
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-700/60 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, currentVal))}%`,
                      backgroundColor: meta.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Formula & Technical Breakdown */}
      {(agri || ind) && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs">
          <div className="text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
            <span>📐</span>
            <span>Mô Hình Toán Kinh Tế & Phân Bổ</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 font-mono text-slate-300">
            {agri && (
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <div className="text-emerald-400 font-bold mb-1">Nông nghiệp: Ya = α·(Lc)^β·(Ie)^(1-β)</div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div>• Tỷ lệ khoán sản phẩm (Ie): {agri.Ie} (θ kiểm soát: {agri.theta})</div>
                  <div>• Lao động tập trung (Lc): {agri.Lc}%</div>
                  <div>• Hệ số sản lượng nông nghiệp (Ya): <strong className="text-emerald-300">{agri.YaPercent}%</strong> ({agri.Ya})</div>
                </div>
              </div>
            )}

            {ind && (
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <div className="text-cyan-400 font-bold mb-1">Công nghiệp (Kế hoạch 3 phần): Ei = Σ(γi·Pi)</div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div>• P1 (Pháp lệnh): {Math.round(ind.P1 * 100)}% | P2 (Tự cân đối): {Math.round(ind.P2 * 100)}% | P3 (Phụ thêm): {Math.round(ind.P3 * 100)}%</div>
                  <div>• Chỉ số hiệu quả công nghiệp (Ei): <strong className="text-cyan-300">{ind.Ei}</strong></div>
                  {ind.administrativePenalty ? (
                    <div className="text-red-400 font-bold mt-1 bg-red-500/10 p-1 rounded border border-red-500/30">
                      ⚠️ Phạt hành chính: P1 ({Math.round(ind.P1 * 100)}%) &lt; P1Req (40%) [-10 ủng hộ, -5 sản lượng]
                    </div>
                  ) : (
                    <div className="text-emerald-400 text-[10px] mt-1">
                      ✓ Đạt chỉ tiêu pháp lệnh tối thiểu (P1 &ge; 40%)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
