export const saveCharacterData = (data: any): {success: boolean, error?: string} => {
  try {
    localStorage.setItem('daggerheartCharacter', JSON.stringify(data));
    return { success: true };
  } catch (error) {
    console.error('Error saving character data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save character data' 
    };
  }
};

export const loadCharacterData = (): any | null => {
  try {
    const data = localStorage.getItem('daggerheartCharacter');
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    
    // Initialize default slots if they don't exist
    const initSlots = (length: number) => 
      Array.from({ length }, () => ({ used: false, locked: false }));
    
    return {
      // Core info
      name: parsed.name || '',
      class: parsed.class || '',
      level: parsed.level || 1,
      origin: parsed.origin || '',
      domain: parsed.domain || '',
      
      // Stats
      stats: {
        AGILITY: parsed.stats?.AGILITY || { value: 0, locked: false },
        STRENGTH: parsed.stats?.STRENGTH || { value: 0, locked: false },
        FINESSE: parsed.stats?.FINNESSE || { value: 0, locked: false },
        INSTINCT: parsed.stats?.INSTINCT || { value: 0, locked: false },
        PRESENCE: parsed.stats?.PRESENCE || { value: 0, locked: false },
        KNOWLEDGE: parsed.stats?.KNOWLEDGE || { value: 0, locked: false },
      },
      
      // Evasion
      evasion: parsed.evasion || { value: 0, locked: false },
      
      // Armor
      armor: {
        max: parsed.armor?.max || 0,
        locked: parsed.armor?.locked || false,
        slots: parsed.armor?.slots || initSlots(12)
      },
      
      // Damage Thresholds
      damageThresholds: {
        minor: parsed.damageThresholds?.minor || 6,
        major: parsed.damageThresholds?.major || 12,
        severe: parsed.damageThresholds?.severe || 18,
        locked: parsed.damageThresholds?.locked || false
      },
      
      // Health
      health: {
        max: parsed.health?.max || 6,
        slots: parsed.health?.slots || initSlots(12)
      },
      
      // Stress
      stress: {
        max: parsed.stress?.max || 6,
        slots: parsed.stress?.slots || initSlots(12)
      }
    };
  } catch (error) {
    console.error('Error loading character data:', error);
    return null;
  }
};