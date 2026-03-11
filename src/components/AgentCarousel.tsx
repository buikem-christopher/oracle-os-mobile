import React, { useState, useRef, useCallback } from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { AgentCard } from '@/components/AgentCard';
import { Bot, ChevronLeft, ChevronRight } from 'lucide-react';

export const AgentCarousel: React.FC = () => {
  const { agents, settings } = useOracle();
  const activeAgents = agents.filter(a => a.state !== 'killed' && a.state !== 'expired');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scroll = useCallback((dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 280;
    const gap = 12;
    const delta = dir === 'left' ? -(cardWidth + gap) : (cardWidth + gap);
    scrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardWidth = el.firstElementChild?.clientWidth || 280;
    const idx = Math.round(el.scrollLeft / (cardWidth + 12));
    setActiveIndex(Math.max(0, Math.min(idx, activeAgents.length - 1)));
  }, [activeAgents.length]);

  if (activeAgents.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Bot className="w-4 h-4" />
          Active Agents
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{activeAgents.length}/{settings.maxAgents}</span>
          {activeAgents.length > 1 && (
            <div className="flex gap-1">
              <button onClick={() => scroll('left')} className="p-1 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button onClick={() => scroll('right')} className="p-1 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable carousel */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {activeAgents.map(agent => (
          <div 
            key={agent.id} 
            className="snap-center shrink-0"
            style={{ width: 'min(85vw, 320px)' }}
          >
            <AgentCard agent={agent} />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {activeAgents.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {activeAgents.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex 
                  ? 'w-4 bg-primary' 
                  : 'w-1.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
