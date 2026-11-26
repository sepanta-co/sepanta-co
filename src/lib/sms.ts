export interface InquiryNotificationPayload {
  trackingCode: string;
  customerName: string;
  phone: string;
  city: string;
  estimatedTotalIrr: number;
}

export interface WarrantyServiceNotificationPayload {
  serviceTrackingCode: string;
  serialCode: string;
  customerName: string;
  phone: string;
  city: string;
  requestType: string;
  description: string;
}

async function dispatchSms(
  receptor: string,
  message: string,
  templateCode?: string
): Promise<void> {
  const provider = (process.env.SMS_PROVIDER || "mock").toLowerCase();
  const apiKey = process.env.SMS_API_KEY?.trim();
  const sender = process.env.SMS_SENDER?.trim() || "";

  if (provider === "mock" || !apiKey) {
    return;
  }

  if (provider === "kavenegar") {
    const params = new URLSearchParams({
      receptor,
      message,
    });
    if (sender) params.set("sender", sender);

    await fetch(
      `https://api.kavenegar.com/v1/${encodeURIComponent(apiKey)}/sms/send.json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
        signal: AbortSignal.timeout(4000),
      }
    );
    return;
  }

  if (provider === "smsir") {
    await fetch("https://api.sms.ir/v1/send/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({
        mobile: receptor,
        templateId: Number(process.env.SMSIR_TEMPLATE_ID || 100000),
        parameters: [{ name: "CODE", value: templateCode || message }],
      }),
      signal: AbortSignal.timeout(4000),
    });
  }
}

export async function sendInquiryNotifications(
  payload: InquiryNotificationPayload
): Promise<void> {
  const provider = (process.env.SMS_PROVIDER || "mock").toLowerCase();
  const apiKey = process.env.SMS_API_KEY?.trim();
  const factorySalesPhone = process.env.FACTORY_SALES_PHONE?.trim();

  const customerText = `گروه صنعتی سپنتا: درخواست شما با کد رهگیری ${payload.trackingCode} ثبت شد.`;

  try {
    if (provider === "mock" || !apiKey) {
      console.log(
        "[SMS:MOCK]",
        JSON.stringify({
          type: "inquiry",
          provider,
          trackingCode: payload.trackingCode,
          customerName: payload.customerName,
          phone: payload.phone,
          city: payload.city,
          estimatedTotalIrr: payload.estimatedTotalIrr,
          factorySalesPhone: factorySalesPhone || null,
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    await dispatchSms(payload.phone, customerText, payload.trackingCode);

    if (factorySalesPhone) {
      await dispatchSms(
        factorySalesPhone,
        `استعلام جدید ${payload.trackingCode} - ${payload.customerName} (${payload.city}) - ${payload.phone}`,
        payload.trackingCode
      );
    }
  } catch (error) {
    console.error("[SMS:ERROR]", error);
  }
}

export async function sendWarrantyServiceNotification(
  payload: WarrantyServiceNotificationPayload
): Promise<void> {
  const provider = (process.env.SMS_PROVIDER || "mock").toLowerCase();
  const apiKey = process.env.SMS_API_KEY?.trim();
  const factorySalesPhone = process.env.FACTORY_SALES_PHONE?.trim();

  const customerText = `گروه صنعتی سپنتا: درخواست خدمات ضمانت‌نامه (${payload.serialCode}) با کد ${payload.serviceTrackingCode} ثبت شد.`;

  try {
    if (provider === "mock" || !apiKey) {
      console.log(
        "[SMS:MOCK]",
        JSON.stringify({
          type: "warranty-service",
          provider,
          serviceTrackingCode: payload.serviceTrackingCode,
          serialCode: payload.serialCode,
          customerName: payload.customerName,
          phone: payload.phone,
          city: payload.city,
          requestType: payload.requestType,
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    await dispatchSms(
      payload.phone,
      customerText,
      payload.serviceTrackingCode
    );

    if (factorySalesPhone) {
      await dispatchSms(
        factorySalesPhone,
        `درخواست خدمات گارانتی ${payload.serviceTrackingCode} (${payload.serialCode}) - ${payload.customerName} (${payload.city})`,
        payload.serviceTrackingCode
      );
    }
  } catch (error) {
    console.error("[SMS:ERROR]", error);
  }
}
