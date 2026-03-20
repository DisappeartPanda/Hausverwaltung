export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          billing_email: string | null
          theme: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          billing_email?: string | null
          theme?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          billing_email?: string | null
          theme?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          email_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer' | 'tenant'
          is_default: boolean
          invited_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member' | 'viewer' | 'tenant'
          is_default?: boolean
          invited_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer' | 'tenant'
          is_default?: boolean
          invited_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      objects: {
        Row: {
          id: string
          organization_id: string
          name: string
          city: string
          street: string | null
          postal_code: string | null
          construction_year: number | null
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          city: string
          street?: string | null
          postal_code?: string | null
          construction_year?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          city?: string
          street?: string | null
          postal_code?: string | null
          construction_year?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      units: {
        Row: {
          id: string
          organization_id: string
          object_id: string | null
          title: string
          floor: string | null
          size_sqm: number | null
          rooms: number | null
          cold_rent: number | null
          nebenkosten: number | null
          status: 'frei' | 'vermietet' | 'reserviert' | 'renovierung'
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          object_id?: string | null
          title: string
          floor?: string | null
          size_sqm?: number | null
          rooms?: number | null
          cold_rent?: number | null
          nebenkosten?: number | null
          status?: 'frei' | 'vermietet' | 'reserviert' | 'renovierung'
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          object_id?: string | null
          title?: string
          floor?: string | null
          size_sqm?: number | null
          rooms?: number | null
          cold_rent?: number | null
          nebenkosten?: number | null
          status?: 'frei' | 'vermietet' | 'reserviert' | 'renovierung'
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      tenants: {
        Row: {
          id: string
          organization_id: string
          unit_id: string | null
          auth_user_id: string | null
          first_name: string
          last_name: string
          email: string
          phone: string | null
          date_of_birth: string | null
          move_in_date: string | null
          move_out_date: string | null
          deposit_amount: number | null
          deposit_paid: boolean
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          unit_id?: string | null
          auth_user_id?: string | null
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          date_of_birth?: string | null
          move_in_date?: string | null
          move_out_date?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          unit_id?: string | null
          auth_user_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          date_of_birth?: string | null
          move_in_date?: string | null
          move_out_date?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      maintenance: {
        Row: {
          id: string
          organization_id: string
          object_id: string | null
          unit_id: string | null
          title: string
          description: string | null
          scheduled_date: string
          completed_date: string | null
          status: 'offen' | 'in_bearbeitung' | 'wartend' | 'erledigt' | 'abgebrochen'
          priority: 'niedrig' | 'mittel' | 'hoch' | 'kritisch'
          estimated_cost: number | null
          actual_cost: number | null
          assigned_to: string | null
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          object_id?: string | null
          unit_id?: string | null
          title: string
          description?: string | null
          scheduled_date: string
          completed_date?: string | null
          status?: 'offen' | 'in_bearbeitung' | 'wartend' | 'erledigt' | 'abgebrochen'
          priority?: 'niedrig' | 'mittel' | 'hoch' | 'kritisch'
          estimated_cost?: number | null
          actual_cost?: number | null
          assigned_to?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          object_id?: string | null
          unit_id?: string | null
          title?: string
          description?: string | null
          scheduled_date?: string
          completed_date?: string | null
          status?: 'offen' | 'in_bearbeitung' | 'wartend' | 'erledigt' | 'abgebrochen'
          priority?: 'niedrig' | 'mittel' | 'hoch' | 'kritisch'
          estimated_cost?: number | null
          actual_cost?: number | null
          assigned_to?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      defects: {
        Row: {
          id: string
          organization_id: string
          object_id: string | null
          unit_id: string | null
          title: string
          description: string | null
          level: 'niedrig' | 'mittel' | 'hoch' | 'kritisch'
          status: 'offen' | 'in_bearbeitung' | 'wartend' | 'erledigt' | 'abgebrochen'
          reported_by: string | null
          reported_at: string
          resolved_at: string | null
          resolved_by: string | null
          assigned_to: string | null
          images: string[] | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          object_id?: string | null
          unit_id?: string | null
          title: string
          description?: string | null
          level: 'niedrig' | 'mittel' | 'hoch' | 'kritisch'
          status?: 'offen' | 'in_bearbeitung' | 'wartend' | 'erledigt' | 'abgebrochen'
          reported_by?: string | null
          reported_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          assigned_to?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          object_id?: string | null
          unit_id?: string | null
          title?: string
          description?: string | null
          level?: 'niedrig' | 'mittel' | 'hoch' | 'kritisch'
          status?: 'offen' | 'in_bearbeitung' | 'wartend' | 'erledigt' | 'abgebrochen'
          reported_by?: string | null
          reported_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          assigned_to?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          organization_id: string
          target_type: 'object' | 'unit' | 'tenant' | 'maintenance' | 'defect' | 'organization'
          target_id: string
          uploaded_by: string
          title: string
          category: string | null
          file_name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          is_public: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          target_type: 'object' | 'unit' | 'tenant' | 'maintenance' | 'defect' | 'organization'
          target_id: string
          uploaded_by: string
          title: string
          category?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          target_type?: 'object' | 'unit' | 'tenant' | 'maintenance' | 'defect' | 'organization'
          target_id?: string
          uploaded_by?: string
          title?: string
          category?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      set_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      user_is_org_owner: {
        Args: {
          user_uuid: string
          org_uuid: string
        }
        Returns: boolean
      }
      get_user_default_org: {
        Args: {
          user_uuid: string
        }
        Returns: string
      }
    }
    Enums: {
      org_role: 'owner' | 'admin' | 'member' | 'viewer' | 'tenant'
      unit_status: 'frei' | 'vermietet' | 'reserviert' | 'renovierung'
      task_status: 'offen' | 'in_bearbeitung' | 'wartend' | 'erledigt' | 'abgebrochen'
      priority_level: 'niedrig' | 'mittel' | 'hoch' | 'kritisch'
      document_target_type: 'object' | 'unit' | 'tenant' | 'maintenance' | 'defect' | 'organization'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Hilfstypen für häufige Operationen
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Spezifische Typ-Exports
export type Organization = Tables<'organizations'>
export type Profile = Tables<'profiles'>
export type OrganizationMember = Tables<'organization_members'>
export type Object = Tables<'objects'>
export type Unit = Tables<'units'>
export type Tenant = Tables<'tenants'>
export type Maintenance = Tables<'maintenance'>
export type Defect = Tables<'defects'>
export type Document = Tables<'documents'>