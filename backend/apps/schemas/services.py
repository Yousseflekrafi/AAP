import psycopg

from .models import DatabaseColumn, DatabaseRelationship, DatabaseSchema, DatabaseTable

_COLUMNS_SQL = """
    SELECT table_name, column_name, data_type, is_nullable, ordinal_position
    FROM information_schema.columns
    WHERE table_schema = %s
    ORDER BY table_name, ordinal_position
"""

_PRIMARY_KEYS_SQL = """
    SELECT tc.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = %s
"""

_FOREIGN_KEYS_SQL = """
    SELECT
        tc.constraint_name,
        kcu.table_name AS from_table,
        kcu.column_name AS from_column,
        ccu.table_name AS to_table,
        ccu.column_name AS to_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = %s
"""


def discover_schema(connection, schema_name="public"):
    """Introspects the customer database read-only (information_schema
    only — never touches business tables) and syncs AAP's own metadata
    tables. Returns a summary dict. Idempotent: safe to re-run."""

    with psycopg.connect(
        host=connection.host,
        port=connection.port,
        dbname=connection.database,
        user=connection.username,
        password=connection.get_password(),
        connect_timeout=5,
    ) as conn:
        with conn.cursor() as cur:
            cur.execute(_COLUMNS_SQL, (schema_name,))
            columns_rows = cur.fetchall()

            cur.execute(_PRIMARY_KEYS_SQL, (schema_name,))
            primary_keys = {(table, column) for table, column in cur.fetchall()}

            cur.execute(_FOREIGN_KEYS_SQL, (schema_name,))
            foreign_keys = cur.fetchall()

    schema, _ = DatabaseSchema.objects.get_or_create(connection=connection, name=schema_name)

    tables_by_name = {}
    columns_by_key = {}
    for table_name, column_name, data_type, is_nullable, ordinal_position in columns_rows:
        table = tables_by_name.get(table_name)
        if table is None:
            table, _ = DatabaseTable.objects.get_or_create(schema=schema, name=table_name)
            tables_by_name[table_name] = table

        column, _ = DatabaseColumn.objects.update_or_create(
            table=table,
            name=column_name,
            defaults={
                "data_type": data_type,
                "is_nullable": is_nullable == "YES",
                "is_primary_key": (table_name, column_name) in primary_keys,
                "ordinal_position": ordinal_position,
            },
        )
        columns_by_key[(table_name, column_name)] = column

    DatabaseRelationship.objects.filter(from_table__schema=schema).delete()
    relationship_count = 0
    for constraint_name, from_table, from_column, to_table, to_column in foreign_keys:
        from_col = columns_by_key.get((from_table, from_column))
        to_col = columns_by_key.get((to_table, to_column))
        if from_col is None or to_col is None:
            continue
        DatabaseRelationship.objects.create(
            from_table=tables_by_name[from_table],
            from_column=from_col,
            to_table=tables_by_name[to_table],
            to_column=to_col,
            constraint_name=constraint_name,
        )
        relationship_count += 1

    return {
        "schema": schema.name,
        "tables": len(tables_by_name),
        "columns": len(columns_by_key),
        "relationships": relationship_count,
    }
