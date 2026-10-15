export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      abandoned_checkouts: {
        Row: {
          admin_alert_had_phone: boolean | null
          admin_alert_phone_update_sent_at: string | null
          admin_alert_sent_at: string | null
          converted_order_id: string | null
          coupon_code: string | null
          created_at: string
          email: string | null
          id: string
          landing_referrer: string | null
          name: string | null
          phone: string | null
          product_id: string | null
          quantity: number
          recovery_email_sent_at: string | null
          session_token: string
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          admin_alert_had_phone?: boolean | null
          admin_alert_phone_update_sent_at?: string | null
          admin_alert_sent_at?: string | null
          converted_order_id?: string | null
          coupon_code?: string | null
          created_at?: string
          email?: string | null
          id?: string
          landing_referrer?: string | null
          name?: string | null
          phone?: string | null
          product_id?: string | null
          quantity?: number
          recovery_email_sent_at?: string | null
          session_token: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          admin_alert_had_phone?: boolean | null
          admin_alert_phone_update_sent_at?: string | null
          admin_alert_sent_at?: string | null
          converted_order_id?: string | null
          coupon_code?: string | null
          created_at?: string
          email?: string | null
          id?: string
          landing_referrer?: string | null
          name?: string | null
          phone?: string | null
          product_id?: string | null
          quantity?: number
          recovery_email_sent_at?: string | null
          session_token?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_checkouts_converted_order_id_fkey"
            columns: ["converted_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          max_uses: number | null
          partner_name: string
          uses_count: number | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          partner_name: string
          uses_count?: number | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          partner_name?: string
          uses_count?: number | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json | null
          page: string | null
          session_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json | null
          page?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json | null
          page?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          converted: boolean
          coupon_code: string | null
          created_at: string
          email: string
          id: string
          source: string
        }
        Insert: {
          converted?: boolean
          coupon_code?: string | null
          created_at?: string
          email: string
          id?: string
          source?: string
        }
        Update: {
          converted?: boolean
          coupon_code?: string | null
          created_at?: string
          email?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      motion1_interest: {
        Row: {
          created_at: string
          email: string
          id: string
          marketing_opt_in: boolean
          name: string
          source: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          whatsapp: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          marketing_opt_in?: boolean
          name: string
          source?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          marketing_opt_in?: boolean
          name?: string
          source?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      order_status_history: {
        Row: {
          created_at: string
          id: string
          mp_payment_id: string | null
          mp_status_detail: string | null
          new_status: string
          order_id: string
          previous_status: string | null
          source: string
        }
        Insert: {
          created_at?: string
          id?: string
          mp_payment_id?: string | null
          mp_status_detail?: string | null
          new_status: string
          order_id: string
          previous_status?: string | null
          source?: string
        }
        Update: {
          created_at?: string
          id?: string
          mp_payment_id?: string | null
          mp_status_detail?: string | null
          new_status?: string
          order_id?: string
          previous_status?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          coupon_released_at: string | null
          created_at: string
          customer_cpf: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          discount_amount: number
          final_amount: number | null
          id: string
          idempotency_key: string | null
          landing_referrer: string | null
          last_utm_campaign: string | null
          last_utm_content: string | null
          last_utm_medium: string | null
          last_utm_source: string | null
          last_utm_term: string | null
          mp_payment_id: string | null
          mp_status_detail: string | null
          openai_capi_sent_at: string | null
          oppref: string | null
          paid_at: string | null
          payment_status: string
          product_name: string | null
          product_price: number
          purchase_event_sent_at: string | null
          quantity: number | null
          shipping_cep: string | null
          shipping_city: string | null
          shipping_complement: string | null
          shipping_cost: number
          shipping_neighborhood: string | null
          shipping_number: string | null
          shipping_order_id: string | null
          shipping_real_cost: number | null
          shipping_service_name: string | null
          shipping_state: string | null
          shipping_street: string | null
          sku: string
          status_changed_at: string | null
          stock_released_at: string | null
          subtotal_amount: number | null
          tiktok_capi_sent_at: string | null
          total_amount: number
          tracking_code: string | null
          tracking_notified_at: string | null
          ttclid: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          coupon_code?: string | null
          coupon_released_at?: string | null
          created_at?: string
          customer_cpf: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          discount_amount?: number
          final_amount?: number | null
          id?: string
          idempotency_key?: string | null
          landing_referrer?: string | null
          last_utm_campaign?: string | null
          last_utm_content?: string | null
          last_utm_medium?: string | null
          last_utm_source?: string | null
          last_utm_term?: string | null
          mp_payment_id?: string | null
          mp_status_detail?: string | null
          openai_capi_sent_at?: string | null
          oppref?: string | null
          paid_at?: string | null
          payment_status?: string
          product_name?: string | null
          product_price: number
          purchase_event_sent_at?: string | null
          quantity?: number | null
          shipping_cep?: string | null
          shipping_city?: string | null
          shipping_complement?: string | null
          shipping_cost?: number
          shipping_neighborhood?: string | null
          shipping_number?: string | null
          shipping_order_id?: string | null
          shipping_real_cost?: number | null
          shipping_service_name?: string | null
          shipping_state?: string | null
          shipping_street?: string | null
          sku?: string
          status_changed_at?: string | null
          stock_released_at?: string | null
          subtotal_amount?: number | null
          tiktok_capi_sent_at?: string | null
          total_amount: number
          tracking_code?: string | null
          tracking_notified_at?: string | null
          ttclid?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          coupon_code?: string | null
          coupon_released_at?: string | null
          created_at?: string
          customer_cpf?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number
          final_amount?: number | null
          id?: string
          idempotency_key?: string | null
          landing_referrer?: string | null
          last_utm_campaign?: string | null
          last_utm_content?: string | null
          last_utm_medium?: string | null
          last_utm_source?: string | null
          last_utm_term?: string | null
          mp_payment_id?: string | null
          mp_status_detail?: string | null
          openai_capi_sent_at?: string | null
          oppref?: string | null
          paid_at?: string | null
          payment_status?: string
          product_name?: string | null
          product_price?: number
          purchase_event_sent_at?: string | null
          quantity?: number | null
          shipping_cep?: string | null
          shipping_city?: string | null
          shipping_complement?: string | null
          shipping_cost?: number
          shipping_neighborhood?: string | null
          shipping_number?: string | null
          shipping_order_id?: string | null
          shipping_real_cost?: number | null
          shipping_service_name?: string | null
          shipping_state?: string | null
          shipping_street?: string | null
          sku?: string
          status_changed_at?: string | null
          stock_released_at?: string | null
          subtotal_amount?: number | null
          tiktok_capi_sent_at?: string | null
          total_amount?: number
          tracking_code?: string | null
          tracking_notified_at?: string | null
          ttclid?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          page: string
          referrer: string | null
          session_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page: string
          referrer?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page?: string
          referrer?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      partner_access_tokens: {
        Row: {
          active: boolean
          coupon_code: string
          created_at: string
          id: string
          last_accessed_at: string | null
          token: string
        }
        Insert: {
          active?: boolean
          coupon_code: string
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          token: string
        }
        Update: {
          active?: boolean
          coupon_code?: string
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          token?: string
        }
        Relationships: []
      }
      partner_link_events: {
        Row: {
          coupon_code: string
          created_at: string
          id: string
          ip_hash: string | null
          referrer: string | null
          session_id: string | null
          slug: string
          user_agent: string | null
        }
        Insert: {
          coupon_code: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          session_id?: string | null
          slug: string
          user_agent?: string | null
        }
        Update: {
          coupon_code?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          session_id?: string | null
          slug?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      partner_links: {
        Row: {
          clicks: number | null
          coupon_code: string
          created_at: string | null
          id: string
          slug: string
          utm_source: string
        }
        Insert: {
          clicks?: number | null
          coupon_code: string
          created_at?: string | null
          id?: string
          slug: string
          utm_source: string
        }
        Update: {
          clicks?: number | null
          coupon_code?: string
          created_at?: string | null
          id?: string
          slug?: string
          utm_source?: string
        }
        Relationships: []
      }
      partner_payments: {
        Row: {
          bonus_amount: number
          coupon_id: string
          created_at: string
          id: string
          month: string
          paid_at: string | null
          partner_name: string
          pix_key: string | null
          sales_count: number
          status: string
        }
        Insert: {
          bonus_amount?: number
          coupon_id: string
          created_at?: string
          id?: string
          month: string
          paid_at?: string | null
          partner_name: string
          pix_key?: string | null
          sales_count?: number
          status?: string
        }
        Update: {
          bonus_amount?: number
          coupon_id?: string
          created_at?: string
          id?: string
          month?: string
          paid_at?: string | null
          partner_name?: string
          pix_key?: string | null
          sales_count?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_payments_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      product_stock: {
        Row: {
          id: string
          in_stock: boolean
          sku: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          id?: string
          in_stock?: boolean
          sku: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          id?: string
          in_stock?: boolean
          sku?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      qr_scans: {
        Row: {
          converted: boolean
          id: string
          location: string
          qr_id: string
          scanned_at: string
          session_id: string | null
        }
        Insert: {
          converted?: boolean
          id?: string
          location: string
          qr_id: string
          scanned_at?: string
          session_id?: string | null
        }
        Update: {
          converted?: boolean
          id?: string
          location?: string
          qr_id?: string
          scanned_at?: string
          session_id?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number
          created_at: string
          id: string
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          key: string
          window_start?: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      vip_events: {
        Row: {
          active: boolean
          badge_emoji: string
          campaign_key: string
          created_at: string
          event_dates: string
          event_location: string
          event_name: string
          id: string
          instagram_handle: string
          instagram_url: string
          is_default: boolean
          lead_source: string
          offer_extra: string
          offer_price_label: string
          offer_product: string
          social_cause: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          badge_emoji?: string
          campaign_key: string
          created_at?: string
          event_dates: string
          event_location: string
          event_name: string
          id?: string
          instagram_handle?: string
          instagram_url?: string
          is_default?: boolean
          lead_source: string
          offer_extra?: string
          offer_price_label?: string
          offer_product?: string
          social_cause?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          badge_emoji?: string
          campaign_key?: string
          created_at?: string
          event_dates?: string
          event_location?: string
          event_name?: string
          id?: string
          instagram_handle?: string
          instagram_url?: string
          is_default?: boolean
          lead_source?: string
          offer_extra?: string
          offer_price_label?: string
          offer_product?: string
          social_cause?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vip_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          source: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          whatsapp: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          source?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          source?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      warranty_leads: {
        Row: {
          canal_compra: string
          created_at: string
          email: string
          esporte: string
          id: string
          nome: string
          numero_serie: string | null
          produto: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          whatsapp: string
        }
        Insert: {
          canal_compra: string
          created_at?: string
          email: string
          esporte: string
          id?: string
          nome: string
          numero_serie?: string | null
          produto?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp: string
        }
        Update: {
          canal_compra?: string
          created_at?: string
          email?: string
          esporte?: string
          id?: string
          nome?: string
          numero_serie?: string | null
          produto?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          mp_payment_id: string
          processed_at: string
          status: string | null
        }
        Insert: {
          mp_payment_id: string
          processed_at?: string
          status?: string | null
        }
        Update: {
          mp_payment_id?: string
          processed_at?: string
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: { _key: string; _max_requests: number; _window_seconds: number }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      expire_pending_pix_orders: { Args: never; Returns: number }
      get_coupon_by_partner_token: { Args: { _token: string }; Returns: string }
      get_crosstraining_dashboard_stats: { Args: never; Returns: Json }
      get_delivered_orders_count: { Args: never; Returns: number }
      increment_coupon_usage: {
        Args: { coupon_code_param: string }
        Returns: undefined
      }
      increment_partner_clicks: {
        Args: { partner_slug: string }
        Returns: undefined
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      release_coupon_use: { Args: { _code: string }; Returns: undefined }
      release_stock: {
        Args: { _qty: number; _sku: string }
        Returns: undefined
      }
      reserve_coupon_use: {
        Args: { _code: string }
        Returns: {
          code: string
          discount_type: string
          discount_value: number
        }[]
      }
      reserve_stock: { Args: { _qty: number; _sku: string }; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
