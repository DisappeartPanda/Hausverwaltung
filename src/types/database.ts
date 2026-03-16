export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          billing_email: string | null;
          theme: "dark-green" | "dark-blue" | "light";
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          billing_email?: string | null;
          theme?: "dark-green" | "dark-blue" | "light";
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          billing_email?: string | null;
          theme?: "dark-green" | "dark-blue" | "light";
          created_at?: string | null;
        };
      };

      profiles: {
        Row: {
          id: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          default_role: "guest" | "tenant" | "landlord";
          created_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          default_role?: "guest" | "tenant" | "landlord";
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          default_role?: "guest" | "tenant" | "landlord";
          created_at?: string | null;
        };
      };

      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: "tenant" | "landlord";
          is_default: boolean;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role: "tenant" | "landlord";
          is_default?: boolean;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: "tenant" | "landlord";
          is_default?: boolean;
          created_at?: string | null;
        };
      };

      objects: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          city: string;
          street: string | null;
          postal_code: string | null;
          unit_count: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          city: string;
          street?: string | null;
          postal_code?: string | null;
          unit_count?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          city?: string;
          street?: string | null;
          postal_code?: string | null;
          unit_count?: number | null;
          created_at?: string | null;
        };
      };

      units: {
        Row: {
          id: string;
          organization_id: string;
          object_id: string | null;
          title: string;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          object_id?: string | null;
          title: string;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          object_id?: string | null;
          title?: string;
          status?: string | null;
          created_at?: string | null;
        };
      };

      tenants: {
        Row: {
          id: string;
          organization_id: string;
          unit_id: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          move_in_date: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          unit_id?: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          move_in_date?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          unit_id?: string | null;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          move_in_date?: string | null;
          created_at?: string | null;
        };
      };

      maintenance: {
        Row: {
          id: string;
          organization_id: string;
          object_id: string | null;
          title: string;
          scheduled_date: string | null;
          status: string;
          note: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          object_id?: string | null;
          title: string;
          scheduled_date?: string | null;
          status?: string;
          note?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          object_id?: string | null;
          title?: string;
          scheduled_date?: string | null;
          status?: string;
          note?: string | null;
          created_at?: string | null;
        };
      };

      defects: {
        Row: {
          id: string;
          organization_id: string;
          object_id: string | null;
          unit_id: string | null;
          title: string;
          level: string;
          status: string;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          object_id?: string | null;
          unit_id?: string | null;
          title: string;
          level: string;
          status?: string;
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          object_id?: string | null;
          unit_id?: string | null;
          title?: string;
          level?: string;
          status?: string;
          description?: string | null;
          created_at?: string | null;
        };
      };

      documents: {
        Row: {
          id: string;
          organization_id: string;
          target_type: string;
          target_id: string;
          title: string;
          category: string | null;
          file_name: string;
          file_path: string | null;
          file_size: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          target_type: string;
          target_id: string;
          title: string;
          category?: string | null;
          file_name: string;
          file_path?: string | null;
          file_size?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          target_type?: string;
          target_id?: string;
          title?: string;
          category?: string | null;
          file_name?: string;
          file_path?: string | null;
          file_size?: number | null;
          created_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};