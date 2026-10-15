/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as orderConfirmation } from './order-confirmation.tsx'
import { template as exitIntentCoupon } from './exit-intent-coupon.tsx'
import { template as abandonedCheckout } from './abandoned-checkout.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'order-confirmation': orderConfirmation,
  'exit-intent-coupon': exitIntentCoupon,
  'abandoned-checkout': abandonedCheckout,
}

