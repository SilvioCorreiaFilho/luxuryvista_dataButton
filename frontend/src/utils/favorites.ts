export const isFavorite = (propertyId: string): boolean => {
  const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
  return savedProperties.includes(propertyId);
};

export const toggleFavorite = (propertyId: string): boolean => {
  const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
  const index = savedProperties.indexOf(propertyId);

  if (index === -1) {
    savedProperties.push(propertyId);
    localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
    return true;
  } else {
    savedProperties.splice(index, 1);
    localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
    return false;
  }
};
