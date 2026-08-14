export interface DatabaseConnection {
  id: string;
  application: string;
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  is_read_only: boolean;
  last_tested_at: string | null;
  last_test_ok: boolean | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseColumn {
  id: string;
  name: string;
  data_type: string;
  is_nullable: boolean;
  is_primary_key: boolean;
  ordinal_position: number;
  description: string;
}

export interface DatabaseTable {
  id: string;
  name: string;
  description: string;
  columns: DatabaseColumn[];
}

export interface DatabaseRelationship {
  id: string;
  constraint_name: string;
  from_table: string;
  from_column: string;
  to_table: string;
  to_column: string;
}

export interface DatabaseSchema {
  id: string;
  connection: string;
  name: string;
  discovered_at: string;
  tables: DatabaseTable[];
  relationships: DatabaseRelationship[];
}
