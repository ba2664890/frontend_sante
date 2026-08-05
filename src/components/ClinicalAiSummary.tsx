import React from 'react';

export const parseAiSummary = (text: string) => {
  if (!text) return null;
  let cleanText = text
    .replace(/<\/?s>/g, '')
    .replace(/\[\/?INST\]/g, '')
    .trim();

  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.map((line, idx) => {
    const boldHeaderMatch = line.match(/^[* \-–\u2022]*\*\*([^*]+)\*\*[\s:]*(.*)$/) || line.match(/^[* \-–\u2022]*\*([^*]+)\*[\s:]*(.*)$/);
    if (boldHeaderMatch) {
      const [, header, content] = boldHeaderMatch as string[];
      return {
        id: idx,
        type: 'section',
        header: header.replace(/[:*]/g, '').trim(),
        content: content.replace(/[*]/g, '').trim()
      };
    }

    const isListItem = line.startsWith('-') || line.startsWith('*') || line.startsWith('•');
    if (isListItem) {
      return {
        id: idx,
        type: 'list_item',
        content: line.replace(/^[\s*\-\u2022]+/, '').replace(/[*]/g, '').trim()
      };
    }

    return {
      id: idx,
      type: 'paragraph',
      content: line.replace(/[*]/g, '').trim()
    };
  });
};

export const ClinicalAiSummary: React.FC<{ text?: string; isSidebar?: boolean }> = ({ text, isSidebar = false }) => {
  if (!text) return null;
  const parsed = parseAiSummary(text) as any[];
  if (!parsed || parsed.length === 0) return null;

  const getIcon = (header: string) => {
    const h = header.toLowerCase();
    if (h.includes('profil') || h.includes('épidém') || h.includes('identité') || h.includes('facteur')) return 'assignment_ind';
    if (h.includes('résultat') || h.includes('dépist') || h.includes('analyse')) return 'biotech';
    if (h.includes('recommand') || h.includes('conduite') || h.includes('trait') || h.includes('suivi')) return 'healing';
    return 'clinical_notes';
  };

  const getColorClasses = (header: string) => {
    const h = header.toLowerCase();
    if (h.includes('profil') || h.includes('épidém') || h.includes('identité') || h.includes('facteur')) return {
      bg: 'bg-[#f2fbff]', border: 'border-[#bec9c9]/10', iconBg: 'bg-[#006669]/10', iconColor: 'text-[#006669]'
    };
    if (h.includes('résultat') || h.includes('dépist') || h.includes('analyse')) return {
      bg: 'bg-[#fffbf0]', border: 'border-[#eec290]/20', iconBg: 'bg-[#9a6a23]/10', iconColor: 'text-[#9a6a23]'
    };
    return {
      bg: 'bg-[#fdf3f0]', border: 'border-[#ffdbcf]/40', iconBg: 'bg-[#9a4523]/10', iconColor: 'text-[#9a4523]'
    };
  };

  return (
    <div className="space-y-4">
      {parsed.map((item) => {
        if (item.type === 'section') {
          const colors = getColorClasses(item.header);
          return (
            <div key={item.id} className={`p-4 rounded-2xl border ${colors.border} ${colors.bg} transition-all hover:shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${colors.iconBg} ${colors.iconColor} flex items-center justify-center flex-shrink-0`}>
                  <span className="material-symbols-outlined text-[18px]">{getIcon(item.header)}</span>
                </div>
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#091e25]">{item.header}</h5>
              </div>
              <p className={`text-[#3e4949] leading-relaxed ${isSidebar ? 'text-[11px]' : 'text-xs'}`}>
                {item.content}
              </p>
            </div>
          );
        }

        if (item.type === 'list_item') {
          return (
            <div key={item.id} className="flex gap-2 items-start pl-2">
              <span className="material-symbols-outlined text-[#006669] text-[16px] mt-0.5">check_circle</span>
              <p className={`text-[#3e4949] leading-relaxed ${isSidebar ? 'text-[11px]' : 'text-xs'}`}>{item.content}</p>
            </div>
          );
        }

        return (
          <p key={item.id} className={`text-[#3e4949] leading-relaxed ${isSidebar ? 'text-[11px]' : 'text-xs'} italic pl-2 border-l-2 border-[#bec9c9]/30`}>
            {item.content}
          </p>
        );
      })}
    </div>
  );
};

export default ClinicalAiSummary;
