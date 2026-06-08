INSERT INTO market_data.qualifications (id, codigo, nombre) VALUES
(0, 'repsol_sol',        'Repsol'),
(1, 'michelin_estrella', 'Michelin'),
(2, 'denominacion_origen', 'Denominación de Origen'),
(3, 'calidad_q',         'Q'),
(4, 'agricultura_eco',   'Agricultura Ecológica'),
(5, 'euskal_baserri',    'Euskal Baserri'),
(6, 'euskolabel',        'Eusko Label')
ON CONFLICT (id) DO NOTHING;