"""
Ejecuta todos los inserts de DataV2 en orden sobre la BD dockerizada.
Se lanza como servicio 'db-seeder' en docker-compose y termina al acabar.
"""
import os
import sys
import subprocess
import psycopg2

BASE = os.path.dirname(os.path.abspath(__file__))


def get_conn():
    return psycopg2.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        port=os.environ.get('DB_PORT', '5432'),
        database=os.environ.get('DB_NAME', 'postgres'),
        user=os.environ.get('DB_USER', 'postgres'),
        password=os.environ.get('DB_PASSWORD', '1234'),
        options="-c client_encoding=UTF8",
    )


def run_sql(filename):
    path = os.path.join(BASE, filename)
    print(f"\n[SQL] {filename}")
    with open(path, encoding='utf-8') as f:
        sql = f.read()
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()
        print(f"  ✅ OK")
    except Exception as exc:
        conn.rollback()
        print(f"  ❌ Error: {exc}")
        sys.exit(1)
    finally:
        cur.close()
        conn.close()


def run_py(filename):
    path = os.path.join(BASE, filename)
    print(f"\n[PY] {filename}")
    result = subprocess.run(
        [sys.executable, path],
        cwd=BASE,
        env={**os.environ},
    )
    if result.returncode != 0:
        print(f"  ❌ Script terminó con código {result.returncode}")
        sys.exit(1)
    print(f"  ✅ OK")


STEPS = [
    # Datos maestros (SQL)
    ('sql', '01municipios.sql'),
    ('sql', '02intereses.sql'),
    ('sql', '03users.sql'),
    ('sql', '05cuali.sql'),
    # Datos reales desde CSV (Python)
    ('py',  '06culture_insert.py'),
    ('py',  '07event_insert.py'),
    ('py',  '08gastro_insert.py'),
    # Relaciones y reseñas (SQL) — dependen de los datos anteriores
    ('sql', 'gastronomy_qualifications.sql'),
    ('sql', 'reviews_culture.sql'),
    ('sql', 'reviews_event.sql'),
    ('sql', 'reviews_gastronomy.sql'),
    ('sql', 'user_interests_pivot.sql'),
]

print("=" * 50)
print("  SustraiApp — DB Seeder")
print("=" * 50)

for kind, name in STEPS:
    if kind == 'sql':
        run_sql(name)
    else:
        run_py(name)

print("\n" + "=" * 50)
print("  Seeding completado ✅")
print("=" * 50)
