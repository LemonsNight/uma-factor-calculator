
import React, { useState, useEffect, useCallback } from 'react';
import { RANKS, calculateFactors, calculateRankFromFactors, RANK_MAP } from './constants';
import { Rank, FactorCalculationResult } from './types';
import RankBadge from './components/RankBadge';
import { getInheritanceAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<'stars' | 'rank'>('stars');
  const [currentRank, setCurrentRank] = useState<Rank>('G');
  const [targetRank, setTargetRank] = useState<Rank>('A');
  const [inputStars, setInputStars] = useState<number>(7);
  const [result, setResult] = useState<FactorCalculationResult>({ factors: 0, isPossible: true, steps: 0 });
  const [predictedRank, setPredictedRank] = useState<Rank | null>(null);
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    if (mode === 'stars') {
      const calcResult = calculateFactors(currentRank, targetRank);
      setResult(calcResult);
    } else {
      const rank = calculateRankFromFactors(currentRank, inputStars);
      setPredictedRank(rank);
    }
  }, [currentRank, targetRank, inputStars, mode]);

  const fetchAdvice = useCallback(async () => {
    setLoadingAdvice(true);
    let promptTarget = targetRank;
    let promptFactors = result.isPossible ? result.factors : 10;

    if (mode === 'rank' && predictedRank) {
      promptTarget = predictedRank;
      promptFactors = inputStars;
    }

    const resultText = await getInheritanceAdvice(
      currentRank, 
      promptTarget, 
      promptFactors
    );
    setAdvice(resultText || '无建议可用');
    setLoadingAdvice(false);
  }, [currentRank, targetRank, result, mode, inputStars, predictedRank]);

  const handleRankClick = (type: 'current' | 'target', rank: Rank) => {
    if (type === 'current') {
      setCurrentRank(rank);
      const rankIdx = RANKS.findIndex(r => r.rank === rank);
      const targetIdx = RANKS.findIndex(r => r.rank === targetRank);
      if (targetIdx <= rankIdx && rankIdx < RANKS.length - 1) {
        setTargetRank(RANKS[rankIdx + 1].rank);
      }
    } else {
      const currentIdx = RANKS.findIndex(r => r.rank === currentRank);
      const targetIdx = RANKS.findIndex(r => r.rank === rank);
      if (targetIdx > currentIdx) {
        setTargetRank(rank);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-8">
        <div className="inline-block p-2 bg-white rounded-2xl shadow-sm mb-4">
          <img 
            src="https://picsum.photos/seed/uma/200/200" 
            alt="Uma Header" 
            className="w-24 h-24 rounded-xl object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold text-pink-600">赛马娘因子计算器</h1>
        <p className="text-gray-500 text-sm italic font-medium">精确计算初始适性补正</p>
      </header>

      <main className="space-y-6">
        {/* Mode Switcher */}
        <div className="flex bg-white/50 p-1 rounded-2xl shadow-inner">
          <button 
            onClick={() => setMode('stars')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === 'stars' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            计算所需因子
          </button>
          <button 
            onClick={() => setMode('rank')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === 'rank' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            预测最终适性
          </button>
        </div>

        {/* Input Card */}
        <section className="bg-white rounded-3xl shadow-xl p-6 border border-pink-100">
          <div className="space-y-8">
            {/* Current Rank */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">初始适性</label>
              <div className="flex flex-wrap gap-3 justify-center">
                {RANKS.map((r) => (
                  <RankBadge 
                    key={`cur-${r.rank}`}
                    data={r}
                    isSelected={currentRank === r.rank}
                    onClick={() => handleRankClick('current', r.rank)}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-center py-2">
              <div className="bg-pink-50 rounded-full p-2">
                <i className="fa-solid fa-arrow-down text-pink-400"></i>
              </div>
            </div>

            {/* Target or Stars */}
            {mode === 'stars' ? (
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">目标适性</label>
                <div className="flex flex-wrap gap-3 justify-center">
                  {RANKS.map((r) => (
                    <RankBadge 
                      key={`tar-${r.rank}`}
                      data={r}
                      isSelected={targetRank === r.rank}
                      onClick={() => handleRankClick('target', r.rank)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">投入因子星数</label>
                <div className="px-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-pink-400">1⭐</span>
                    <span className="text-2xl font-black text-pink-600">{inputStars}⭐</span>
                    <span className="text-xs font-bold text-pink-400">18⭐</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="18" 
                    value={inputStars} 
                    onChange={(e) => setInputStars(parseInt(e.target.value))}
                    className="w-full h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                  <div className="grid grid-cols-4 gap-1 mt-4">
                    {[1, 4, 7, 10].map(val => (
                      <button 
                        key={val}
                        onClick={() => setInputStars(val)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${inputStars === val ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-pink-500 border-pink-100 hover:bg-pink-50'}`}
                      >
                        {val}星
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Result Card */}
        {mode === 'stars' ? (
          <section className={`rounded-3xl shadow-xl p-8 text-white text-center transform hover:scale-[1.02] transition-all duration-300 ${result.isPossible ? 'bg-gradient-to-br from-pink-500 to-rose-400' : 'bg-gradient-to-br from-gray-600 to-slate-500'}`}>
            {result.isPossible ? (
              <>
                <h2 className="text-lg font-medium opacity-90 mb-2">初始所需因子</h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-6xl font-black">{result.factors}</span>
                  <span className="text-xl font-bold self-end mb-2">星</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm bg-white/10 rounded-2xl p-4">
                  <div className="border-r border-white/20">
                    <p className="opacity-80">跨越档位</p>
                    <p className="text-lg font-bold">{result.steps} 阶</p>
                  </div>
                  <div>
                    <p className="opacity-80">建议组合</p>
                    <p className="text-lg font-bold">
                      {Math.floor(result.factors / 3)}×3⭐ + {result.factors % 3}⭐
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-4">
                <i className="fa-solid fa-circle-exclamation text-4xl mb-4 text-yellow-300"></i>
                <h2 className="text-2xl font-black mb-2 text-yellow-100">无法直接到达</h2>
                <p className="text-sm opacity-90 px-4 leading-relaxed">
                  {result.message}
                  <br />
                  <span className="mt-2 block font-bold text-yellow-200">需在育成过程中通过继承事件(Inheritance)随机触发。</span>
                </p>
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-3xl shadow-xl p-8 text-white text-center transform hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-pink-500 to-rose-400">
            <h2 className="text-lg font-medium opacity-90 mb-2">预计初始适性</h2>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex flex-col items-center">
                <span className="text-xs opacity-70 mb-1">从</span>
                <span className="text-4xl font-black">{currentRank}</span>
              </div>
              <i className="fa-solid fa-chevron-right text-2xl opacity-50"></i>
              <div className="flex flex-col items-center">
                <span className="text-xs opacity-70 mb-1">到达</span>
                <span className={`text-7xl font-black ${predictedRank ? RANK_MAP[predictedRank].color : ''}`}>
                  {predictedRank || '-'}
                </span>
              </div>
            </div>
            {predictedRank && (
              <div className="bg-white/10 rounded-2xl p-4 text-sm">
                <p className="opacity-90">
                  投入 <span className="font-bold">{inputStars}</span> 星因子，
                  提升了 <span className="font-bold">{RANK_MAP[predictedRank].index - RANK_MAP[currentRank].index}</span> 个阶级
                </p>
                {predictedRank === 'A' && RANK_MAP[currentRank].index + (inputStars >= 10 ? 4 : inputStars >= 7 ? 3 : inputStars >= 4 ? 2 : inputStars >= 1 ? 1 : 0) > 6 && (
                  <p className="mt-2 text-xs text-yellow-200 font-bold">
                    * 初始因子最高只能到达 A 级
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* Advice Section */}
        <section className="bg-white rounded-3xl shadow-md p-6 border-l-4 border-pink-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <i className="fa-solid fa-wand-magic-sparkles text-pink-400"></i>
              育成策略建议 (AI)
            </h3>
            <button 
              onClick={fetchAdvice}
              disabled={loadingAdvice}
              className="text-xs font-bold bg-pink-50 text-pink-600 px-4 py-2 rounded-full hover:bg-pink-100 transition-colors disabled:opacity-50 border border-pink-100"
            >
              {loadingAdvice ? '正在思考...' : '分析攻略'}
            </button>
          </div>
          
          <div className="min-h-[100px] text-sm text-gray-600 leading-relaxed">
            {advice ? (
              <div className="prose prose-pink prose-sm whitespace-pre-wrap">
                {advice}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-gray-400 italic">
                <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center mb-3">
                  <i className="fa-solid fa-book-open text-pink-200 text-xl"></i>
                </div>
                <p>点击按钮，获取关于从 {currentRank} 升至 {mode === 'stars' ? targetRank : (predictedRank || '目标')} 的专业建议</p>
              </div>
            )}
          </div>
        </section>

        {/* Rule Explanation */}
        <section className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-2">
            <i className="fa-solid fa-circle-info"></i>
            因子补正规则说明
          </h4>
          <ul className="text-xs text-amber-800/70 space-y-2">
            <li>• <strong>初始因子上限：</strong> 每次育成开始前，单项适性最多只能通过因子提升 <span className="text-amber-900 font-bold underline">4个阶级</span> (对应10星因子)。</li>
            <li>• <strong>继承事件：</strong> 若初始适性为 F 或 G，即使带满 10 星因子也无法直接到达 A。必须在育成第二、三年 4 月初的继承事件中祈祷触发“额外跳阶”。</li>
            <li>• <strong>1-4-7-10 规则：</strong> 1阶=1星, 2阶=4星, 3阶=7星, 4阶=10星。</li>
          </ul>
        </section>
      </main>

      <footer className="mt-12 text-center text-gray-400 text-xs pb-10">
        <p>数据基于游戏公认算法。祝各位训练员早日育成 S 适性马娘！</p>
      </footer>
    </div>
  );
};

export default App;
