import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { ShoppingBag, Shield, Truck, Lock, Tag, X, Zap, Minus, Plus, Loader2, CreditCard, ArrowLeft, Package, BadgeCheck, FileCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import SEO from "@/components/shared/SEO";
import Footer from "@/components/layout/Footer";
import logo from "@/assets/meeky-logo.webp";
import { useProductStock } from "@/hooks/useProductStock";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { oaiqTrack, oaiqContents } from "@/lib/openaiPixel";
import { ttqInitiateCheckout } from "@/lib/tiktokPixel";
import { trackEvent, persistUtm, getStoredUtm, getLastTouch, getLandingReferrer, getOppref, getTtclid } from "@/lib/campaignTracking";
import { isAntifraudRejection, ANTIFRAUD_MESSAGE } from "@/lib/paymentRejection";

import CookieConsentBanner from "@/components/shared/CookieConsentBanner";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

const PRODUCT = {
  name: "Headphone Meeky ANC Premium",
  price: 297,
  shipping: 0,
  sku: "f5anc",
};

interface AppliedCouponData {
  code: string;
  partner_name: string;
  discount_type: "fixed" | "percent";
  discount_value: number;
}

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};

const formatCEP = (value: string) => {
  return value.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
};

const formatBRL = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

const ABANDONED_CART_SESSION_KEY = "meeky_abandoned_cart_token";

const getOrCreateAbandonedToken = (): string => {
  if (typeof window === "undefined") return "";
  try {
    const existing = sessionStorage.getItem(ABANDONED_CART_SESSION_KEY);
    if (existing) return existing;
    const token = (crypto as any)?.randomUUID?.() ||
      `abd-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(ABANDONED_CART_SESSION_KEY, token);
    return token;
  } catch {
    return `abd-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};

const CheckoutPage = () => {

  const [searchParams] = useSearchParams();
  const initialQty = Math.min(5, Math.max(1, parseInt(searchParams.get("qty") || "1", 10) || 1));


  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { inStock } = useProductStock("f5anc");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [cepStatus, setCepStatus] = useState<"idle" | "checking" | "valid" | "invalid" | "unavailable">("idle");
  const [cepError, setCepError] = useState("");
  const [checkedCep, setCheckedCep] = useState("");
  const [quantity, setQuantity] = useState(initialQty);
  const [couponCode, setCouponCode] = useState("");
  const [mpPublicKey, setMpPublicKey] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Capture attribution (first-touch preserved, last-touch updated) into
  // localStorage on load. Uses the shared campaignTracking helper so the 30-day
  // TTL and first/last-touch logic stays in one place.
  useEffect(() => {
    persistUtm();
  }, [searchParams]);

  // Track begin_checkout on every checkout page load, regardless of traffic
  // source. Shares the `begin_checkout_fired` sessionStorage key with
  // ProductPage's CTA handler so we don't double-count when the user actually
  // clicked "Comprar" on the product page — whoever fires first wins.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dedupKey = "begin_checkout_fired";
    if (sessionStorage.getItem(dedupKey)) return;

    const items = [{
      item_id: "MEEKY-F5-PRO-BLK",
      item_name: "Headphone Meeky F5 ANC Pro",
      price: 297.0,
      quantity: initialQty,
    }];
    const value = 297.0 * initialQty;

    if ((window as any).gtag) {
      (window as any).gtag("event", "begin_checkout", {
        currency: "BRL",
        value,
        items,
      });
    }
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({ ecommerce: null });
      (window as any).dataLayer.push({
        event: "begin_checkout",
        ecommerce: { currency: "BRL", value, items },
      });
    }
    if ((window as any).fbq) {
      (window as any).fbq("track", "InitiateCheckout", {
        content_ids: ["MEEKY-F5-PRO-BLK"],
        content_type: "product",
        num_items: initialQty,
        value,
        currency: "BRL",
      });
    }
    // OpenAI Ads Pixel — checkout_started
    oaiqTrack("checkout_started", {
      type: "contents",
      amount: Math.round(value * 100),
      currency: "BRL",
      contents: oaiqContents(initialQty),
    });
    // TikTok Pixel — InitiateCheckout
    ttqInitiateCheckout(297.0, initialQty);
    sessionStorage.setItem(dedupKey, "1");
    console.log("[Analytics] begin_checkout fired (CheckoutPage)");

    // Also record in the internal crosstraining/events pipeline when applicable,
    // preserving the original attribution.
    const utm = searchParams.get("utm_campaign");
    const cupom = (searchParams.get("cupom") || searchParams.get("coupon") || "").toUpperCase();
    if (utm === "crosstraining2026" || cupom === "CROSSTRAINING2026") {
      void trackEvent("begin_checkout", "crosstraining", { utm_campaign: utm, cupom });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Auto-apply coupon from URL parameter ?cupom= or sessionStorage
  useEffect(() => {
    const cupomParam = searchParams.get("cupom") || searchParams.get("coupon");
    const cupomStorage = sessionStorage.getItem("cupom_pendente");
    const cupom = cupomParam || cupomStorage;

    if (cupom && !appliedCoupon && !couponLoading) {
      const code = cupom.trim().toUpperCase();
      setCouponCode(code);
      sessionStorage.removeItem("cupom_pendente");
      // Auto-validate
      (async () => {
        setCouponLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke("validate-coupon", {
            body: { code },
          });
          if (error) throw error;
          if (data?.valid) {
            setAppliedCoupon(data as AppliedCouponData);
            const disc = data.discount_type === "fixed"
              ? data.discount_value
              : PRODUCT.price * (data.discount_value / 100);
            toast({ title: "Cupom aplicado! 🎉", description: `Desconto de ${formatBRL(disc)} por unidade` });
          } else {
            setCouponError(data?.error || "Cupom inválido");
          }
        } catch {
          setCouponError("Erro ao validar cupom");
        } finally {
          setCouponLoading(false);
        }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-public-config");
        if (error) throw error;
        if (data?.mpPublicKey) {
          setMpPublicKey(data.mpPublicKey);
        } else {
          console.error("[Checkout] MP_PUBLIC_KEY not configured in backend secrets");
        }
      } catch (err) {
        console.error("[Checkout] Failed to fetch public config:", err);
      }
    };
    fetchKey();
  }, []);

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponData | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [step, setStep] = useState<"info" | "payment">("info");
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [brickReady, setBrickReady] = useState(false);
  const [brickSlow, setBrickSlow] = useState(false);
  const [brickRetryToken, setBrickRetryToken] = useState(0);
  const [antifraudBlocked, setAntifraudBlocked] = useState(false);
  const [pixOnly, setPixOnly] = useState(false);
  const brickControllerRef = useRef<any>(null);


  // 8s timeout — if Brick hasn't rendered, surface retry/support UI
  useEffect(() => {
    if (step !== "payment") return;
    if (brickReady) { setBrickSlow(false); return; }
    setBrickSlow(false);
    const t = window.setTimeout(() => setBrickSlow(true), 8000);
    return () => window.clearTimeout(t);
  }, [step, brickReady, brickRetryToken]);

  const handleRetryBrick = useCallback(() => {
    setBrickReady(false);
    setBrickSlow(false);
    if (brickControllerRef.current) {
      try { brickControllerRef.current.unmount(); } catch { /* noop */ }
      brickControllerRef.current = null;
    }
    const container = document.getElementById("paymentBrick_container");
    if (container) container.innerHTML = "";
    setBrickRetryToken((n) => n + 1);
  }, []);

  // Antifraude bloqueou o cartão: remonta o Brick só com Pix, preservando
  // todos os dados já preenchidos (o formulário de contato/entrega não é tocado).
  const switchToPix = useCallback(() => {
    setPixOnly(true);
    setAntifraudBlocked(false);
    handleRetryBrick();
    setTimeout(() => {
      document.getElementById("paymentBrick_container")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  }, [handleRetryBrick]);



  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  // Prefill from ?resume=<session_token> when the user follows a recovery email link.
  // Only prefills fields that are currently empty and only adopts the resume token
  // when there's no different active session already in progress.
  useEffect(() => {
    const resumeToken = searchParams.get("resume");
    if (!resumeToken) return;
    let cancelled = false;

    const existing = (() => {
      try { return sessionStorage.getItem(ABANDONED_CART_SESSION_KEY); } catch { return null; }
    })();

    // Different active session already in progress — do not disturb it.
    if (existing && existing !== resumeToken) return;

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-abandoned-checkout", {
          body: { token: resumeToken },
        });
        if (cancelled || error || !data?.found || data?.alreadyConverted) return;

        // Adopt this token so subsequent onBlur upserts update the same row.
        try { sessionStorage.setItem(ABANDONED_CART_SESSION_KEY, resumeToken); } catch {}
        abandonedTokenRef.current = resumeToken;

        setForm((prev) => ({
          ...prev,
          name: prev.name || (data.name ?? ""),
          email: prev.email || (data.email ?? ""),
          phone: prev.phone
            ? prev.phone
            : (data.phone ? formatPhone(String(data.phone)) : ""),
        }));

        if (data.quantity && !searchParams.get("qty")) {
          const q = Math.min(5, Math.max(1, Number(data.quantity) || 1));
          setQuantity((prevQ) => (prevQ === 1 ? q : prevQ));
        }
      } catch {
        // silent — recovery prefill must never break the checkout page
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const discountPerUnit = appliedCoupon
    ? appliedCoupon.discount_type === "fixed"
      ? appliedCoupon.discount_value
      : PRODUCT.price * (appliedCoupon.discount_value / 100)
    : 0;
  const unitPrice = Math.max(0, PRODUCT.price - discountPerUnit);
  const activeShipping = PRODUCT.shipping;
  const subtotal = unitPrice * quantity;
  const total = subtotal + activeShipping;

  // Load MP SDK
  useEffect(() => {
    if (document.getElementById("mp-sdk-script")) {
      if (window.MercadoPago) setSdkLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "mp-sdk-script";
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => setSdkLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize payment Brick (card + Pix + others)
  const initBrick = useCallback(async () => {
    if (!sdkLoaded || !window.MercadoPago || !mpPublicKey) return;

    if (brickControllerRef.current) {
      try { brickControllerRef.current.unmount(); } catch {}
      brickControllerRef.current = null;
    }

    const container = document.getElementById("paymentBrick_container");
    if (!container) return;
    container.innerHTML = "";

      const mp = new window.MercadoPago(mpPublicKey, { locale: "pt-BR" });
      const bricksBuilder = mp.bricks();

      const cpfDigits = form.cpf.replace(/\D/g, "");
      const documentType = cpfDigits.length <= 11 ? "CPF" : "CNPJ";
      const entityType = cpfDigits.length <= 11 ? "individual" : "association";

      try {
        const controller = await bricksBuilder.create("payment", "paymentBrick_container", {
          initialization: {
            amount: Number(total),
            payer: {
              email: form.email,
              firstName: form.name.split(" ")[0],
              lastName: form.name.split(" ").slice(1).join(" ") || form.name.split(" ")[0],
              identification: {
                type: documentType,
                number: cpfDigits,
              },
              entityType: entityType,
            },
          },
          customization: {
            paymentMethods: pixOnly
              ? { bankTransfer: "all" }
              : {
                  creditCard: "all",
                  debitCard: "all",
                  bankTransfer: "all",
                  maxInstallments: 6,
                },

            visual: {
              hidePaymentButton: false,
            },
          },
          callbacks: {
            onReady: () => {
              console.log("[Checkout] Payment Brick ready");
              setBrickReady(true);
            },
            onSubmit: ({ selectedPaymentMethod, formData }: any) => {
              console.log("[Checkout] Brick onSubmit —", selectedPaymentMethod, formData);

              // Analytics: GA4 add_payment_info — dedup per method per session
              try {
                const method = selectedPaymentMethod === "bank_transfer" ? "pix" : selectedPaymentMethod;
                const dedupKey = `add_payment_info_fired_${method}`;
                if (typeof window !== "undefined" && !sessionStorage.getItem(dedupKey)) {
                  const items = [{
                    item_id: "MEEKY-F5-PRO-BLK",
                    item_name: "Headphone Meeky F5 ANC Pro",
                    price: 297.0,
                    quantity,
                  }];
                  if ((window as any).gtag) {
                    (window as any).gtag("event", "add_payment_info", {
                      currency: "BRL",
                      value: Number(total),
                      payment_type: method,
                      items,
                    });
                  }
                  if ((window as any).dataLayer) {
                    (window as any).dataLayer.push({ ecommerce: null });
                    (window as any).dataLayer.push({
                      event: "add_payment_info",
                      ecommerce: {
                        currency: "BRL",
                        value: Number(total),
                        payment_type: method,
                        items,
                      },
                    });
                  }
                  sessionStorage.setItem(dedupKey, "1");
                  console.log("[Analytics] add_payment_info fired:", method);
                }
              } catch (e) {
                console.warn("[Analytics] add_payment_info failed:", e);
              }

              setLoading(true);

              // O Brick MP EXIGE que onSubmit retorne uma Promise.
              // Sem isso, em mobile o botão fica travado e o PIX nunca é gerado.
              return new Promise<void>((resolve, reject) => {
                (async () => {
                  try {
                    const { data, error } = await supabase.functions.invoke("process-payment", {
                      body: {
                        ...formData,
                        transaction_amount: total,
                        description: `${PRODUCT.name} x${quantity}`,
                        paymentMethod: selectedPaymentMethod,
                        customer: {
                          name: form.name,
                          email: form.email,
                          phone: form.phone,
                          cpf: cpfDigits,
                          docType: documentType,
                          docNumber: form.cpf,
                        },
                        shipping: {
                          street: form.street,
                          number: form.number,
                          complement: form.complement,
                          neighborhood: form.neighborhood,
                          city: form.city,
                          state: form.state,
                          cep: form.cep.replace(/\D/g, ""),
                        },
                        product: {
                          name: PRODUCT.name,
                          sku: PRODUCT.sku,
                          price: unitPrice,
                          shipping: activeShipping,
                          quantity,
                          coupon: appliedCoupon?.code || undefined,
                        },
                        utm: getStoredUtm(),
                        last_utm: getLastTouch()?.utm ?? null,
                        landing_referrer: getLandingReferrer(),
                        oppref: getOppref(),
                        ttclid: getTtclid(),
                        idempotency_key: `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                        abandoned_session_token: abandonedTokenRef.current || undefined,

                      },
                    });


                    // Estoque insuficiente — backend retorna HTTP 409 com error: "out_of_stock".
                    // supabase.functions.invoke coloca o corpo da resposta em error.context.
                    let outOfStockMessage: string | null = null;
                    if (error) {
                      try {
                        const ctx = (error as any)?.context;
                        if (ctx && typeof ctx.json === "function") {
                          const body = await ctx.json();
                          if (body?.error === "out_of_stock") {
                            outOfStockMessage = body.message || "Produto temporariamente indisponível.";
                          } else if (body?.error) {
                            throw new Error(typeof body.error === "string" ? body.error : "Erro no pagamento");
                          }
                        }
                      } catch (parseErr) {
                        // se falhou ao parsear, propagar erro original abaixo
                        if (!outOfStockMessage) throw error;
                      }
                      if (!outOfStockMessage) throw error;
                    }

                    if (outOfStockMessage) {
                      toast({
                        title: "Produto sem estoque",
                        description: outOfStockMessage,
                        variant: "destructive",
                      });
                      reject(new Error("out_of_stock"));
                      return;
                    }

                    console.log("[Checkout] Payment result:", data);

                    if (data?.status === "approved") {
                      resolve();
                      navigate(`/checkout/sucesso?payment_id=${data.payment_id}&status=approved`);
                    } else if (
                      data?.status === "pending" &&
                      (data?.status_detail === "pending_challenge" || data?.three_ds_url)
                    ) {
                      // 3DS — banco exige autenticação. Brick MP processa internamente
                      // se devolvermos a URL via resolve. Como o backend retornou,
                      // redirecionamos o usuário para concluir a autenticação.
                      console.log("[Checkout] 3DS challenge required, redirecting:", data.three_ds_url);
                      if (data.three_ds_url) {
                        resolve();
                        window.location.href = data.three_ds_url;
                      } else {
                        toast({
                          title: "Autenticação necessária",
                          description: "Seu banco solicitou autenticação adicional. Tente novamente ou use outro cartão.",
                          variant: "destructive",
                        });
                        reject(new Error("3DS challenge sem URL"));
                      }
                    } else if (data?.status === "pending" || data?.status === "in_process") {
                      // Pix or other pending — check for QR code
                      if (data?.pix_qr_code) {
                        // Store QR payload in sessionStorage — base64 image is too large
                        // for URL query string and gets truncated on mobile browsers.
                        try {
                          sessionStorage.setItem(
                            `pix_${data.payment_id}`,
                            JSON.stringify({
                              qr_code: data.pix_qr_code,
                              qr_code_base64: data.pix_qr_code_base64 || "",
                              order_id: data.order_id || "",
                            })
                          );
                        } catch (e) {
                          console.warn("[Checkout] sessionStorage write failed:", e);
                        }
                        resolve();
                        navigate(`/checkout/pendente?payment_id=${data.payment_id}&order_id=${data.order_id || ""}`);
                      } else {
                        resolve();
                        navigate(`/checkout/sucesso?payment_id=${data.payment_id}&status=pending`);
                      }
                    } else if (data?.error === "out_of_stock") {
                      toast({
                        title: "Produto sem estoque",
                        description: data.message || "Produto temporariamente indisponível.",
                        variant: "destructive",
                      });
                      reject(new Error("out_of_stock"));
                    } else if (isAntifraudRejection(data?.status_detail)) {
                      // Bloqueio preventivo do antifraude do MP — cartão do cliente está OK.
                      // Nunca expor o status_detail bruto; oferecer Pix imediatamente.
                      setAntifraudBlocked(true);
                      toast({
                        title: "Cartão bloqueado pela segurança do pagamento",
                        description: ANTIFRAUD_MESSAGE,
                        variant: "destructive",
                      });
                      reject(new Error("antifraud_block"));
                    } else if (data?.error) {
                      toast({
                        title: "Pagamento não aprovado",
                        description: typeof data.error === "string" ? data.error : "Não foi possível concluir o pagamento. Tente novamente.",
                        variant: "destructive",
                      });
                      reject(new Error(data.error));
                    } else {
                      toast({
                        title: "Pagamento não aprovado",
                        description: "O pagamento foi recusado. Confira os dados do cartão ou tente outro meio de pagamento.",
                        variant: "destructive",
                      });
                      reject(new Error(data?.status_detail || "rejected"));
                    }

                  } catch (err: any) {
                    console.error("[Checkout] Payment error:", err);
                    if (err?.message === "out_of_stock") {
                      reject(err);
                    } else {
                      toast({
                        title: "Erro ao processar pagamento",
                        description: err.message || "Tente novamente.",
                        variant: "destructive",
                      });
                      reject(err);
                    }
                  } finally {
                    setLoading(false);
                  }
                })();
              });
            },
            onError: (error: any) => {
              console.error("[Checkout] Brick error:", error);
              toast({
                title: "Erro no formulário de pagamento",
                description: error?.message || "Tente recarregar a página.",
                variant: "destructive",
              });
            },
          },
      });

      brickControllerRef.current = controller;
    } catch (err) {
      console.error("[Checkout] Failed to init Brick:", err);
    }
  }, [sdkLoaded, mpPublicKey, total, form.email, form.name, form.cpf, appliedCoupon, unitPrice, activeShipping, quantity, navigate, toast, form, pixOnly]);

  useEffect(() => {
    if (step !== "payment") return;
    // Não reinicializar se já está montado — evita interromper 3DS/autenticação
    // bancária em mobile quando o estado do form muda durante o pagamento.
    if (brickControllerRef.current) return;
    // Em mobile (devices mais lentos), 100ms pode não ser suficiente para o container
    // do Brick existir no DOM. Fazemos polling até 3s.
    let cancelled = false;
    let attempts = 0;
    const tryInit = () => {
      if (cancelled) return;
      const container = document.getElementById("paymentBrick_container");
      if (container && sdkLoaded && mpPublicKey) {
        initBrick();
      } else if (attempts < 30) {
        attempts++;
        setTimeout(tryInit, 100);
      } else {
        console.error("[Checkout] Failed to init Brick — container or SDK never ready");
      }
    };
    tryInit();
    return () => { cancelled = true; };
  }, [step, sdkLoaded, mpPublicKey, initBrick, brickRetryToken]);

  useEffect(() => {
    return () => {
      if (brickControllerRef.current) {
        try { brickControllerRef.current.unmount(); } catch {}
      }
    };
  }, []);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    setCouponError("");
    if (!code) return;
    setCouponLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-coupon", {
        body: { code },
      });
      if (error) throw error;
      if (data?.valid) {
        setAppliedCoupon(data as AppliedCouponData);
        const disc = data.discount_type === "fixed"
          ? data.discount_value
          : PRODUCT.price * (data.discount_value / 100);
        toast({ title: "Cupom aplicado! 🎉", description: `Desconto de ${formatBRL(disc)} por unidade` });
      } else {
        setCouponError(data?.error || "Cupom inválido");
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError("Erro ao validar cupom");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === "cpf") formatted = formatCPF(value);
    if (name === "phone") formatted = formatPhone(value);
    if (name === "cep") formatted = formatCEP(value);
    setForm((prev) => ({ ...prev, [name]: formatted }));
  };

  // Session token for progressive abandoned-cart capture. Stable per browser tab.
  const abandonedTokenRef = useRef<string>("");
  useEffect(() => {
    abandonedTokenRef.current = getOrCreateAbandonedToken();
  }, []);

  const upsertAbandonedCheckout = useCallback(async () => {
    const token = abandonedTokenRef.current;
    if (!token) return;
    const email = form.email.trim();
    // Only capture once we have at least an email (recovery requires it).
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    // First-touch attribution (same logic used when creating orders).
    const utm = getStoredUtm();
    try {
      await supabase.functions.invoke("upsert-abandoned-checkout", {
        body: {
          session_token: token,
          email,
          phone: form.phone || null,
          name: form.name || null,
          product_id: PRODUCT.sku,
          quantity,
          coupon_code: appliedCoupon?.code || null,
          utm_source: utm.utm_source || null,
          utm_medium: utm.utm_medium || null,
          utm_campaign: utm.utm_campaign || null,
          landing_referrer: getLandingReferrer(),
        },
      });
    } catch (err) {
      // Silent — recovery capture must never block the user.
      console.debug("[abandoned_checkouts] upsert failed", err);
    }
  }, [form.email, form.phone, form.name, quantity, appliedCoupon]);

  const handleContactBlur = () => {
    void upsertAbandonedCheckout();
  };


  // ViaCEP lookup + existence check. Returns:
  //  "valid"       -> CEP exists
  //  "invalid"     -> ViaCEP answered {"erro": true} / 400 => CEP does not exist
  //  "unavailable" -> ViaCEP itself failed (network/5xx) => never block checkout
  const lookupCep = useCallback(async (cepDigits: string): Promise<"valid" | "invalid" | "unavailable"> => {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      if (res.status === 400) return "invalid";
      if (!res.ok) {
        console.warn(`[viacep] indisponível (HTTP ${res.status}) — checkout liberado`);
        return "unavailable";
      }
      const data = await res.json();
      if (data?.erro) return "invalid";
      setForm((prev) => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));
      return "valid";
    } catch (err) {
      console.warn("[viacep] falha na consulta — checkout liberado", err);
      return "unavailable";
    }
  }, []);

  const handleCEPBlur = async () => {
    const cep = form.cep.replace(/\D/g, "");
    if (cep.length !== 8) {
      setCepError(cep.length > 0 ? "CEP incompleto, digite os 8 números." : "");
      setCepStatus("idle");
      return;
    }
    setCepStatus("checking");
    setCepError("");
    const status = await lookupCep(cep);
    setCheckedCep(cep);
    setCepStatus(status);
    setCepError(status === "invalid" ? "CEP não encontrado, verifique o número digitado." : "");
  };

  const handleContinueToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    const cpfDigits = form.cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11 && cpfDigits.length !== 14) {
      toast({ title: "CPF/CNPJ inválido", description: "Informe um CPF ou CNPJ válido.", variant: "destructive" });
      return;
    }

    // CEP existence gate — runs BEFORE payment is ever processed.
    const cepDigits = form.cep.replace(/\D/g, "");
    if (cepDigits.length !== 8) {
      setCepError("CEP não encontrado, verifique o número digitado.");
      toast({ title: "CEP inválido", description: "CEP não encontrado, verifique o número digitado.", variant: "destructive" });
      return;
    }
    let cepOk = cepStatus === "valid" && checkedCep === cepDigits;
    let cepUnavailable = cepStatus === "unavailable" && checkedCep === cepDigits;
    if (!cepOk && !cepUnavailable) {
      setCepStatus("checking");
      const status = await lookupCep(cepDigits);
      setCheckedCep(cepDigits);
      setCepStatus(status);
      cepOk = status === "valid";
      cepUnavailable = status === "unavailable";
    }
    if (!cepOk && !cepUnavailable) {
      setCepError("CEP não encontrado, verifique o número digitado.");
      toast({
        title: "CEP não encontrado",
        description: "CEP não encontrado, verifique o número digitado.",
        variant: "destructive",
      });
      document.getElementById("cep")?.focus();
      return;
    }
    setCepError("");

    if (!acceptedTerms) {
      toast({ title: "Termos obrigatórios", description: "Você precisa aceitar os Termos e a Política de Privacidade.", variant: "destructive" });
      return;
    }
    if (!inStock) {
      toast({ title: "Produto indisponível", description: "Este produto está temporariamente fora de estoque.", variant: "destructive" });
      return;
    }

    setBrickReady(false);
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  // Coupon display logic (URL or sessionStorage)
  const urlCoupon = (searchParams.get("cupom") || searchParams.get("coupon") || "").toUpperCase();
  const storageCoupon = typeof window !== "undefined" ? (sessionStorage.getItem("cupom_pendente") || "").toUpperCase() : "";
  const couponHint = appliedCoupon?.code || urlCoupon || storageCoupon || "";
  const totalDiscount = (PRODUCT.price - unitPrice) * quantity;

  // Pre-hydration skeleton — also what SSG renders to /checkout/index.html
  // so users never see the home page flash before React hydrates.
  if (!mounted) {
    const hasCoupon = false;
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SEO title="Checkout | Meeky Audio" description="Finalize sua compra do Headphone Meeky F5 ANC Pro com segurança." />
        <header className="border-b border-border/50 bg-background">
          <div className="container-wide section-padding h-16 md:h-20 flex items-center justify-center">
            <img src={logo} alt="Meeky" width={120} height={32} className="h-6 md:h-8 w-auto invert dark:invert-0" />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-md w-full text-center space-y-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Carregando seu checkout seguro...
            </h1>
            <div className="bg-secondary rounded-sm border border-border p-6 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Produto</span>
                <span className="text-foreground font-semibold">Meeky F5 ANC Pro</span>
              </div>
              {hasCoupon ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cupom aplicado</span>
                    <span className="text-accent font-semibold">CROSSTRAINING2026 · -R$ 18</span>
                  </div>
                  <div className="flex justify-between text-base pt-3 border-t border-border">
                    <span className="text-foreground font-semibold">Total</span>
                    <span className="text-foreground font-bold">R$ 279</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-base pt-3 border-t border-border">
                  <span className="text-foreground font-semibold">Total</span>
                  <span className="text-foreground font-bold">R$ 297</span>
                </div>
              )}
              <p className="text-xs text-green-500 font-medium pt-2">
                ✓ Frete grátis para todo o Brasil
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              🔒 Pagamento seguro Mercado Pago
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Checkout | Meeky Audio" description="Finalize sua compra do Headphone Meeky ANC Premium com segurança." />

      {/* Minimal checkout header — no menu, no exit intent */}
      <header className="border-b border-border/50 bg-background">
        <div className="container-wide section-padding h-16 md:h-20 flex items-center justify-between gap-4">
          <Link to="/headphone-anc-meeky-f5-pro" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft size={14} /> Voltar para o produto
          </Link>
          <Link to="/" className="flex items-center" aria-label="Meeky">
            <img src={logo} alt="Meeky" width={120} height={32} className="h-6 md:h-8 w-auto invert dark:invert-0" />
          </Link>
          <span className="w-[140px] hidden md:block" aria-hidden="true" />
          <span className="w-4 md:hidden" aria-hidden="true" />
        </div>
      </header>

      <main className="flex-1">
      <section className="bg-background">
        <div className="container-wide section-padding py-8 md:py-14">
          <div className="grid lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
            {/* Form / Payment */}
            <div className="lg:col-span-3">

              {step === "info" ? (
                <>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">Finalizar Compra</h1>
                  <form onSubmit={handleContinueToPayment} className="space-y-6">
                    {/* Dados pessoais */}
                    <div className="space-y-4">
                      <h2 className="font-display text-lg font-semibold text-foreground">Dados pessoais</h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <Label htmlFor="name">Nome completo *</Label>
                          <Input id="name" name="name" value={form.name} onChange={handleChange} onBlur={handleContactBlur} required placeholder="Seu nome completo" className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="email">E-mail *</Label>
                          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleContactBlur} required placeholder="email@exemplo.com" className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="phone">WhatsApp *</Label>
                          <Input id="phone" name="phone" value={form.phone} onChange={handleChange} onBlur={handleContactBlur} required placeholder="(00) 00000-0000" className="mt-1" />

                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="cpf">CPF/CNPJ *</Label>
                          <Input id="cpf" name="cpf" value={form.cpf} onChange={handleChange} required placeholder="000.000.000-00" className="mt-1" />
                          <p className="text-xs text-muted-foreground mt-1">Obrigatório para emissão da nota fiscal</p>
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="space-y-4">
                      <h2 className="font-display text-lg font-semibold text-foreground">Endereço de entrega</h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cep">CEP *</Label>
                          <Input
                            id="cep"
                            name="cep"
                            value={form.cep}
                            onChange={(e) => { setCepError(""); setCepStatus("idle"); handleChange(e); }}
                            onBlur={handleCEPBlur}
                            required
                            placeholder="00000-000"
                            aria-invalid={cepStatus === "invalid"}
                            aria-describedby="cep-feedback"
                            className={`mt-1 ${cepStatus === "invalid" ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          />
                          <p id="cep-feedback" className="text-xs mt-1 min-h-4" aria-live="polite">
                            {cepStatus === "checking" ? (
                              <span className="text-muted-foreground">Verificando CEP...</span>
                            ) : cepError ? (
                              <span className="text-destructive">{cepError}</span>
                            ) : null}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="street">Rua / Avenida *</Label>
                          <Input id="street" name="street" value={form.street} onChange={handleChange} required placeholder="Nome da rua" className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="number">Número *</Label>
                          <Input id="number" name="number" value={form.number} onChange={handleChange} required placeholder="Nº" className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="complement">Complemento</Label>
                          <Input id="complement" name="complement" value={form.complement} onChange={handleChange} placeholder="Apto, bloco..." className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="neighborhood">Bairro *</Label>
                          <Input id="neighborhood" name="neighborhood" value={form.neighborhood} onChange={handleChange} required placeholder="Bairro" className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="city">Cidade *</Label>
                          <Input id="city" name="city" value={form.city} onChange={handleChange} required placeholder="Cidade" className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="state">Estado *</Label>
                          <Input id="state" name="state" value={form.state} onChange={handleChange} required placeholder="UF" maxLength={2} className="mt-1" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 my-4">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                        Li e aceito os <Link to="/termos" className="text-accent underline" target="_blank">Termos de Uso</Link> e a <Link to="/privacidade" className="text-accent underline" target="_blank">Política de Privacidade</Link>.
                      </Label>
                    </div>

                    <button
                      type="submit"
                      disabled={!acceptedTerms}
                      className="w-full bg-accent text-accent-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-gold-light transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CreditCard size={18} />
                      CONTINUAR PARA PAGAMENTO
                    </button>

                    <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Lock size={12} /> Pagamento seguro</span>
                      <span className="flex items-center gap-1"><Shield size={12} /> Dados protegidos</span>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Pagamento</h1>
                    <button
                      type="button"
                      onClick={() => setStep("info")}
                      className="text-sm text-accent hover:underline"
                    >
                      ← Voltar aos dados
                    </button>
                  </div>

                  <div className="bg-secondary rounded-sm border border-border p-4 mb-6 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">{form.name}</strong> · {form.email}</p>
                    <p>{form.street}, {form.number}{form.complement ? ` - ${form.complement}` : ""} · {form.city}/{form.state} · CEP {form.cep}</p>
                  </div>




                  {/* Order summary above Brick */}
                  <div className="bg-secondary border border-border rounded-sm p-4 md:p-5 mb-4">
                    <div className="flex items-start justify-between gap-3 text-sm">
                      <div>
                        <p className="font-semibold text-foreground">Meeky F5 ANC Pro</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Quantidade: {quantity}</p>
                      </div>
                      <p className="text-foreground font-semibold">{formatBRL(PRODUCT.price * quantity)}</p>
                    </div>
                    {totalDiscount > 0 && couponHint && (
                      <div className="flex items-center justify-between mt-2 text-sm text-green-500">
                        <span className="flex items-center gap-1"><Tag size={14} /> Cupom {couponHint} aplicado</span>
                        <span className="font-semibold">-{formatBRL(totalDiscount)}</span>
                      </div>
                    )}
                    <hr className="border-border my-3" />
                    <div className="flex items-center justify-between">
                      <span className="font-display font-semibold text-foreground">Total</span>
                      <span className="font-display text-xl font-bold text-foreground">{formatBRL(total)}</span>
                    </div>
                    <span className="inline-block mt-3 bg-green-500/15 text-green-500 text-xs font-semibold px-2.5 py-1 rounded-sm">
                      Frete grátis para todo o Brasil
                    </span>
                  </div>

                  {/* Trust block — reforço antes do Brick carregar */}
                  <ul className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                    <li className="flex items-center gap-1.5"><Lock size={14} className="text-accent shrink-0" /> Compra segura · Mercado Pago</li>
                    <li className="flex items-center gap-1.5"><Package size={14} className="text-accent shrink-0" /> Frete grátis — Envio FULL SP · 24h</li>
                    <li className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-accent shrink-0" /> Garantia Meeky 12 meses</li>
                    <li className="flex items-center gap-1.5"><FileCheck size={14} className="text-accent shrink-0" /> Homologado Anatel</li>
                  </ul>
                  <p className="text-[11px] text-muted-foreground/80 mb-6 leading-relaxed">
                    Vendido e emitido por <strong className="text-foreground/80">Barganha Mix Ltda</strong> · CNPJ 43.341.597/0001-40
                  </p>

                  {/* Bloqueio de antifraude — mensagem específica + atalho para Pix */}
                  {antifraudBlocked && (
                    <div
                      role="alert"
                      data-testid="antifraud-alert"
                      className="mb-6 border-2 border-accent bg-accent/10 rounded-sm p-4"
                    >
                      <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Shield size={16} className="text-accent shrink-0" />
                        Cartão bloqueado pela segurança do pagamento
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {ANTIFRAUD_MESSAGE}
                      </p>
                      <button
                        type="button"
                        onClick={switchToPix}
                        data-testid="switch-to-pix"
                        className="w-full bg-accent text-accent-foreground px-4 py-3 text-xs font-semibold tracking-wider rounded-sm hover:bg-gold-light transition-all flex items-center justify-center gap-2"
                      >
                        <Zap size={14} /> PAGAR COM PIX AGORA — APROVAÇÃO NA HORA
                      </button>
                      <p className="text-[11px] text-muted-foreground/80 mt-2 text-center">
                        Seus dados continuam preenchidos — você não precisa recomeçar.
                      </p>
                    </div>
                  )}

                  {pixOnly && (
                    <p className="mb-4 text-xs text-muted-foreground" data-testid="pix-only-note">
                      Pagamento por Pix selecionado. Quer tentar o cartão de novo?{" "}
                      <button
                        type="button"
                        onClick={() => { setPixOnly(false); handleRetryBrick(); }}
                        className="underline text-foreground hover:text-accent"
                      >
                        Voltar para todos os meios de pagamento
                      </button>
                    </p>
                  )}

                  {/* MP Payment Brick — wrapper guards against double-click while processing */}

                  <div className="relative">
                    <div
                      id="paymentBrick_container"
                      className={`min-h-[400px] transition-opacity ${loading ? "opacity-60 pointer-events-none" : ""}`}
                      aria-busy={loading || !brickReady}
                    />

                    {/* Skeleton while Brick initializes */}
                    {!brickReady && !loading && (
                      <div className="absolute inset-0 flex flex-col gap-3 p-1" aria-live="polite">
                        <div className="h-12 rounded-sm bg-secondary animate-pulse" />
                        <div className="h-24 rounded-sm bg-secondary animate-pulse" />
                        <div className="h-12 rounded-sm bg-secondary animate-pulse" />
                        <div className="h-12 rounded-sm bg-secondary animate-pulse" />
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          Carregando pagamento seguro Mercado Pago... Isso pode levar alguns segundos no 4G.
                        </p>
                      </div>
                    )}

                    {/* Processing overlay — blocks double-click */}
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm z-10">
                        <div className="flex items-center gap-3 text-foreground">
                          <Loader2 size={20} className="animate-spin" />
                          <span className="text-sm font-semibold">Processando...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Slow-load recovery (>8s) */}
                  {brickSlow && !brickReady && !loading && (
                    <div className="mt-4 bg-secondary border border-border rounded-sm p-4 text-sm">
                      <p className="font-semibold text-foreground mb-3">Pagamento demorando para carregar?</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={handleRetryBrick}
                          className="flex-1 bg-accent text-accent-foreground px-4 py-2.5 text-xs font-semibold tracking-wider rounded-sm hover:bg-gold-light transition-all"
                        >
                          TENTAR NOVAMENTE
                        </button>
                        <a
                          href="https://wa.me/5512991074311?text=Ol%C3%A1%2C%20estou%20com%20problema%20no%20checkout%20Meeky"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 text-xs font-semibold tracking-wider rounded-sm hover:bg-charcoal-light transition-all text-center"
                        >
                          FALAR COM SUPORTE
                        </a>
                      </div>
                    </div>
                  )}


                  <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mt-6">
                    <span className="flex items-center gap-1"><Lock size={12} /> Pagamento seguro</span>
                    <span className="flex items-center gap-1"><Shield size={12} /> Dados criptografados</span>
                  </div>
                </>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">

              <div className="bg-secondary rounded-sm border border-border p-6 lg:p-8 sticky top-8">
                <h2 className="font-display text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <ShoppingBag size={18} /> Resumo do pedido
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-start text-sm">
                    <div>
                      <span className="text-muted-foreground">{PRODUCT.name}</span>
                      {step === "info" && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="w-7 h-7 flex items-center justify-center border border-border rounded-sm hover:bg-background transition-colors"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-foreground">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                            className="w-7 h-7 flex items-center justify-center border border-border rounded-sm hover:bg-background transition-colors"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                      {step === "payment" && (
                        <p className="text-xs text-muted-foreground mt-1">Qtd: {quantity}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground line-through text-xs block">{formatBRL(349 * quantity)}</span>
                      <span className="text-foreground font-semibold">{formatBRL(subtotal)}</span>
                    </div>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-500 flex items-center gap-1"><Tag size={14} /> Cupom {appliedCoupon.code}</span>
                      <span className="text-green-500 font-semibold">-{formatBRL((PRODUCT.price - unitPrice) * quantity)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1"><Truck size={14} /> Frete</span>
                    <span className="text-green-500 font-semibold">Grátis</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-accent font-semibold">
                    <Zap size={14} /> Envio expresso com seguro e rastreio completo
                  </div>

                  {step === "info" && (
                    <div className="pt-2">
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-sm px-3 py-2 text-sm">
                          <span className="text-green-500 flex items-center gap-1"><Tag size={14} /> {appliedCoupon.code}</span>
                          <button type="button" onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Cupom de desconto"
                            value={couponCode}
                            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                            className="text-sm"
                          />
                          <button type="button" onClick={handleApplyCoupon} className="px-4 py-2 text-xs font-semibold bg-accent text-accent-foreground rounded-sm hover:bg-gold-light transition-all whitespace-nowrap">
                            Aplicar
                          </button>
                        </div>
                      )}
                      {couponError && <p className="text-xs text-destructive mt-1">{couponError}</p>}
                    </div>
                  )}

                  <hr className="border-border" />
                  <div className="flex justify-between">
                    <span className="font-display font-semibold text-foreground">Total</span>
                    <span className="font-display text-xl font-bold text-foreground">{formatBRL(total)}</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Shield size={14} className="text-accent shrink-0 mt-0.5" />
                    <span>Pagamento processado via <strong>Mercado Pago</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Truck size={14} className="text-accent shrink-0 mt-0.5" />
                    <span>Envio para todo o Brasil</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lock size={14} className="text-accent shrink-0 mt-0.5" />
                    <span>Seus dados estão protegidos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>
      <Footer />
      <CookieConsentBanner />
    </div>
  );
};


export default CheckoutPage;
