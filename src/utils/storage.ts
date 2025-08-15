export const saveCharacterData = (data: any): {success: boolean, error?: string} => {
  try {
    localStorage.setItem('daggerheartCharacter', JSON.stringify(data));
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save character data' 
    };
  }
};

export const loadCharacterData = (): any | null => {
  try {
    const data = localStorage.getItem('daggerheartCharacter');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading character data:', error);
    return null;
  }
};