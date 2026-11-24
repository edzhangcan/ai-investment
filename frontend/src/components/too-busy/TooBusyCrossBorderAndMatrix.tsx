import React from 'react';
import { Globe } from 'lucide-react';
import { BilingualHoverCard } from '../BilingualHoverCard';
import { TooBusyCrossBorderDuet, TooBusyEquivalentEtfMatrix } from '../../types';

interface CrossBorderAndMatrixProps {
  duetData?: TooBusyCrossBorderDuet | null;
  etfMatrix?: TooBusyEquivalentEtfMatrix;
  usdCapInput: string;
  cadCapInput: string;
  onChangeUsdCap: (val: string) => void;
  onChangeCadCap: (val: string) => void;
  onSubmitDuet: (e: React.FormEvent) => void;
  duetLoading: boolean;
  isZh: boolean;
}

/**
 * Side-by-side Cross-Border Two-Account Barbell Calculator (US 3x Dual USD + CA 2x Long-Only CAD)
 * and the 5-Family Equivalent ETF Matrix explaining structural US vs. Canada constraints.
 */
export const TooBusyCrossBorderAndMatrix: React.FC<CrossBorderAndMatrixProps> = ({
  duetData,
  etfMatrix,
  usdCapInput,
  cadCapInput,
  onChangeUsdCap,
  onChangeCadCap,
  onSubmitDuet,
  duetLoading,
  isZh,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {duetData && (
        <div className="lg:col-span-5 prism-card p-6">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border-subtle">
            <Globe className="w-5 h-5 text-violet-600" />
            <div>
              <h3 className="text-base font-extrabold text-content-primary">
                <BilingualHoverCard termKey="CrossBorderBarbell">
                  <span>{isZh ? '美加跨市场双账户联动计算器' : 'US + Canada Cross-Border Barbell Calculator'}</span>
                </BilingualHoverCard>
              </h3>
              <p className="text-[11px] text-content-muted">
                {isZh
                  ? '美元账户负责 3倍双向攻击 (含 SQQQ)，加元账户负责 2倍零换汇稳健防守'
                  : 'US pod runs 3x Dual Attack (USD, 0% FX); CA pod runs 2x Long-Only (CAD, 0% FX)'}
              </p>
            </div>
          </div>

          <form onSubmit={onSubmitDuet} className="grid grid-cols-3 gap-2.5 items-end mb-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-content-secondary mb-1">
                {isZh ? '美元账户资金 ($ USD)' : 'US Account ($ USD)'}
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={usdCapInput}
                onChange={(e) => onChangeUsdCap(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-xl px-2.5 py-2 font-mono font-bold text-content-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-secondary mb-1">
                {isZh ? '加元账户资金 ($ CAD)' : 'CA Account ($ CAD)'}
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={cadCapInput}
                onChange={(e) => onChangeCadCap(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-xl px-2.5 py-2 font-mono font-bold text-content-primary"
              />
            </div>
            <button
              type="submit"
              disabled={duetLoading}
              className="py-2 px-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-extrabold cursor-pointer transition-all"
            >
              {duetLoading ? '...' : (isZh ? '联动试算' : 'Calculate')}
            </button>
          </form>

          <div className="space-y-3 text-xs">
            {duetData.usd_pod && (
              <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-800/60">
                <div className="flex items-center justify-between font-black text-rose-800 dark:text-rose-200">
                  <span>US Pod: {isZh ? duetData.usd_pod.role_zh : duetData.usd_pod.role_en}</span>
                  <span className="font-mono">{isZh ? duetData.usd_pod.allocation_summary_zh : duetData.usd_pod.allocation_summary_en}</span>
                </div>
                <p className="text-[11px] text-content-secondary mt-1">
                  {isZh ? duetData.usd_pod.rationale_zh : duetData.usd_pod.rationale_en}
                </p>
              </div>
            )}

            {duetData.cad_pod && (
              <div className="p-3.5 rounded-xl bg-sky-50/60 dark:bg-sky-950/25 border border-sky-200 dark:border-sky-800/60">
                <div className="flex items-center justify-between font-black text-sky-800 dark:text-sky-200">
                  <span>CA Pod: {isZh ? duetData.cad_pod.role_zh : duetData.cad_pod.role_en}</span>
                  <span className="font-mono">{isZh ? duetData.cad_pod.allocation_summary_zh : duetData.cad_pod.allocation_summary_en}</span>
                </div>
                <p className="text-[11px] text-content-secondary mt-1">
                  {isZh ? duetData.cad_pod.rationale_zh : duetData.cad_pod.rationale_en}
                </p>
              </div>
            )}

            {duetData.blended_summary && (
              <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-subtle space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] font-black">
                  <span>Bull Cap: {duetData.blended_summary.effective_bull_leverage}</span>
                  <span>Bear Short: {duetData.blended_summary.effective_bear_leverage}</span>
                  <span className="text-violet-700 dark:text-violet-300">
                    Today: {duetData.blended_summary.today_effective_leverage}
                  </span>
                </div>
                <p className="text-[11px] text-content-secondary leading-relaxed">
                  {isZh ? duetData.blended_summary.synergy_note_zh : duetData.blended_summary.synergy_note_en}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {etfMatrix && (
        <div className="lg:col-span-7 prism-card p-6">
          <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-base font-extrabold text-content-primary">
                {isZh ? '5 大同类可替代 ETF 家族与美加市场制度差异' : '5 Equivalent ETF Families & US vs. Canada Structural Differences'}
              </h3>
              <p className="text-[11px] text-content-muted">
                {isZh ? '除了 TQQQ / SQQQ / SGOV 之外的合法同等替代方案' : 'Alternative index/sector ETFs & why Canada behaves differently than US markets'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto mb-4">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-content-muted font-black uppercase">
                  <th className="py-2 pr-2">{isZh ? '指数家族' : 'Index Family'}</th>
                  <th className="py-2 pr-2">{isZh ? '杠杆/货币' : 'Lev / CCY'}</th>
                  <th className="py-2 pr-2">{isZh ? '做多 ETF' : 'Long'}</th>
                  <th className="py-2 pr-2">{isZh ? '反向/防御' : 'Short / Cash'}</th>
                  <th className="py-2">{isZh ? '适用场景' : 'Beginner Guidance'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {etfMatrix.families.map((fam) => (
                  <tr key={fam.family_id} className="hover:bg-surface-subtle/60">
                    <td className="py-2 pr-2 font-bold text-content-primary">{isZh ? fam.index_name_zh : fam.index_name_en}</td>
                    <td className="py-2 pr-2 font-mono text-content-secondary">{fam.leverage} ({fam.currency})</td>
                    <td className="py-2 pr-2 font-mono font-black text-emerald-700 dark:text-emerald-400">{fam.long_etf}</td>
                    <td className="py-2 pr-2 font-mono text-content-primary">{fam.short_etf} / {fam.cash_etf}</td>
                    <td className="py-2 text-content-secondary">{isZh ? fam.best_for_zh : fam.best_for_en}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {etfMatrix.us_vs_canada_differences.map((diff, idx) => (
              <div key={diff.id || idx} className="p-3 rounded-xl bg-surface-subtle border border-border-subtle text-[11px]">
                <div className="font-extrabold text-content-primary mb-1">{isZh ? diff.title_zh : diff.title_en}</div>
                <p className="text-content-secondary leading-relaxed">{isZh ? diff.detail_zh : diff.detail_en}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
