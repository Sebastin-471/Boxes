export const BOX_MAPPING = {
  'BODA': 'Caja Copa de Boda',
  'BODA_G': 'Caja Copa de Boda Grande',
  'XV': 'Caja Copa de 15 Años',
  'PEIN_G': 'Caja Peineta Grande',
  'PEIN_C': 'Caja Peineta Chica',
  'TIARA_A': 'Caja Tiara Ancha',
  'TIARA_M': 'Caja Tiara Mediana',
  'TIARA_D': 'Caja Tiara Delgada',
  'CUCH_CH': 'Caja Cuchillo Chino',
  'BQ_G': 'Caja Bouquet Grande',
  'BQ_P': 'Caja Bouquet Chica',
  'BQ_M': 'Caja Bouquet Mediana',
  'FACUSA': 'Caja Facusa',
  'COMUNION': 'Caja Comunión',
  'PERGAMINO': 'Caja Pergamino',
  'CLAVEL': 'Caja de Clavel',
  'ORQUIDEA': 'Caja de Orquidea'
};

export const getBoxLabel = (code) => BOX_MAPPING[code] || code;
